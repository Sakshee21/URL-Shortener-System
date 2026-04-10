from app.models.user import User


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
