from app.models.url import URL
from app.models.user import User
from app.services import url_service
from app.services.url_service import encode_base62


def _register_and_login(client, email, password):
    register_response = client.post(
        "/auth/register",
        json={"email": email, "password": password},
    )
    assert register_response.status_code == 200

    login_response = client.post(
        "/auth/login",
        data={"username": email, "password": password},
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def test_blacklisted_url(client, user_token):
    response = client.post(
        "/urls",
        json={"original_url": "http://example.com"},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 400
    assert "blacklisted" in response.json()["detail"].lower()


def test_url_normalization_deduplicates(client, user_token):
    first = client.post(
        "/urls",
        json={"original_url": "https://dedupe-case.dev/path"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    second = client.post(
        "/urls",
        json={"original_url": "https://dedupe-case.dev/path/"},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert first.status_code == 200
    assert second.status_code == 200

    first_payload = first.json()
    second_payload = second.json()
    assert first_payload["id"] == second_payload["id"]
    assert first_payload["short_code"] == second_payload["short_code"]


def test_short_code_generation_uses_random_tokens_and_retries_collisions(client, user_token, monkeypatch):
    tokens = iter(["random-token-1", "random-token-1", "random-token-2"])
    monkeypatch.setattr(url_service.secrets, "token_urlsafe", lambda _size: next(tokens))

    first = client.post(
        "/urls",
        json={"original_url": "https://random-code-a.dev"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    second = client.post(
        "/urls",
        json={"original_url": "https://random-code-b.dev"},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert first.status_code == 200
    assert second.status_code == 200

    first_payload = first.json()
    second_payload = second.json()
    assert first_payload["short_code"] == "random-token-1"
    assert second_payload["short_code"] == "random-token-2"
    assert first_payload["short_code"] != second_payload["short_code"]


def test_legacy_short_code_is_rotated_on_reuse(client, user_token, db_session):
    create_response = client.post(
        "/urls",
        json={"original_url": "https://legacy-code.dev/path"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert create_response.status_code == 200

    created = create_response.json()
    url_entry = db_session.query(URL).filter(URL.id == created["id"]).first()
    assert url_entry is not None

    legacy_code = encode_base62(url_entry.id)
    url_entry.short_code = legacy_code
    db_session.commit()

    reused_response = client.post(
        "/urls",
        json={"original_url": "https://legacy-code.dev/path"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert reused_response.status_code == 200

    reused = reused_response.json()
    assert reused["id"] == created["id"]
    assert reused["short_code"] != legacy_code


def test_suspended_user_cannot_login(client, db_session):
    email = "suspend@test.com"
    password = "pass123"

    register_response = client.post(
        "/auth/register",
        json={"email": email, "password": password},
    )
    assert register_response.status_code == 200

    user = db_session.query(User).filter(User.email == email).first()
    user.is_active = False
    db_session.commit()

    login_response = client.post(
        "/auth/login",
        data={"username": email, "password": password},
    )
    assert login_response.status_code == 403
    assert "suspended" in login_response.json()["detail"].lower()


def test_soft_delete_hides_url_from_active_listing(client, user_token):
    create_response = client.post(
        "/urls",
        json={"original_url": "https://delete-me.dev"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert create_response.status_code == 200
    created = create_response.json()
    url_id = created["id"]

    delete_response = client.delete(
        f"/urls/{url_id}",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert delete_response.status_code == 200
    assert delete_response.json()["is_active"] is False

    active_response = client.get(
        "/urls/me?status=active",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert active_response.status_code == 200

    active_ids = {row["id"] for row in active_response.json()}
    assert url_id not in active_ids


def test_restore_makes_url_visible_in_active_listing_again(client, user_token):
    create_response = client.post(
        "/urls",
        json={"original_url": "https://restore-me.dev"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert create_response.status_code == 200
    url_id = create_response.json()["id"]

    delete_response = client.delete(
        f"/urls/{url_id}",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert delete_response.status_code == 200

    restore_response = client.patch(
        f"/urls/{url_id}/status",
        json={"is_active": True},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert restore_response.status_code == 200
    assert restore_response.json()["is_active"] is True

    active_response = client.get(
        "/urls/me?status=active",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert active_response.status_code == 200
    active_ids = {row["id"] for row in active_response.json()}
    assert url_id in active_ids


def test_invalid_bearer_token_returns_401_on_protected_route(client):
    response = client.get(
        "/urls/me",
        headers={"Authorization": "Bearer invalid.token.value"},
    )

    assert response.status_code == 401
    assert "invalid token" in response.json()["detail"].lower()


def test_invalid_optional_auth_token_blocks_url_creation(client):
    response = client.post(
        "/urls",
        json={"original_url": "https://optional-auth.dev"},
        headers={"Authorization": "Bearer malformed.token.value"},
    )

    assert response.status_code == 401
    assert "invalid token" in response.json()["detail"].lower()


def test_user_analytics_requires_authentication(client):
    response = client.get("/urls/me/analytics")

    assert response.status_code == 401


def test_admin_cannot_change_another_admin_status(client, admin_token, db_session):
    another_admin_email = "another-admin@test.com"
    another_admin_password = "pass123"

    register_response = client.post(
        "/auth/register",
        json={"email": another_admin_email, "password": another_admin_password},
    )
    assert register_response.status_code == 200

    another_admin = db_session.query(User).filter(User.email == another_admin_email).first()
    another_admin.is_admin = True
    db_session.commit()

    update_response = client.patch(
        f"/admin/users/{another_admin.id}/status",
        json={"is_active": False},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert update_response.status_code == 400
    assert "another admin" in update_response.json()["detail"].lower()


def test_cross_user_cannot_delete_or_toggle_other_users_link(client):
    owner_token = _register_and_login(client, "owner-delete@test.com", "pass123")
    outsider_token = _register_and_login(client, "outsider-delete@test.com", "pass123")

    create_response = client.post(
        "/urls",
        json={"original_url": "https://ownership-delete.dev"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert create_response.status_code == 200
    owner_url_id = create_response.json()["id"]

    outsider_delete = client.delete(
        f"/urls/{owner_url_id}",
        headers={"Authorization": f"Bearer {outsider_token}"},
    )
    assert outsider_delete.status_code == 404

    outsider_toggle = client.patch(
        f"/urls/{owner_url_id}/status",
        json={"is_active": False},
        headers={"Authorization": f"Bearer {outsider_token}"},
    )
    assert outsider_toggle.status_code == 404


def test_inactive_short_code_routes_return_404(client, user_token):
    create_response = client.post(
        "/urls",
        json={"original_url": "https://inactive-short-route.dev"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert create_response.status_code == 200
    created = create_response.json()
    url_id = created["id"]
    short_code = created["short_code"]

    delete_response = client.delete(
        f"/urls/{url_id}",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert delete_response.status_code == 200

    root_redirect_response = client.get(f"/{short_code}", follow_redirects=False)
    assert root_redirect_response.status_code == 404

    go_redirect_response = client.get(f"/urls/{short_code}/go", follow_redirects=False)
    assert go_redirect_response.status_code == 404


def test_default_port_and_fragment_normalization_deduplicates(client, user_token):
    first = client.post(
        "/urls",
        json={"original_url": "https://normalize-port.dev/path#intro"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    second = client.post(
        "/urls",
        json={"original_url": "https://normalize-port.dev:443/path"},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["id"] == second.json()["id"]
    assert first.json()["short_code"] == second.json()["short_code"]
