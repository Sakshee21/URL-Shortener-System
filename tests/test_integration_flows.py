from app.models.user import User


def _auth_header(token):
    return {"Authorization": f"Bearer {token}"}


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


def test_login_flow(client):
    register_response = client.post(
        "/auth/register",
        json={"email": "test@test.com", "password": "pass123"},
    )
    assert register_response.status_code == 200

    login_response = client.post(
        "/auth/login",
        data={"username": "test@test.com", "password": "pass123"},
    )

    assert login_response.status_code == 200
    payload = login_response.json()
    assert "access_token" in payload
    assert payload["token_type"] == "bearer"


def test_create_url(client, user_token):
    response = client.post(
        "/urls",
        json={"original_url": "https://safe-site.dev"},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    data = response.json()
    assert response.status_code == 200
    assert "short_code" in data
    assert len(data["short_code"]) >= 6


def test_auth_me_returns_current_user(client, user_token):
    response = client.get("/auth/me", headers=_auth_header(user_token))

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "user@test.com"
    assert body["is_active"] is True


def test_create_url_as_guest_has_no_owner(client):
    response = client.post(
        "/urls",
        json={"original_url": "https://guest-link.dev/path"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] is None
    assert body["short_code"]


def test_redirect_flow_and_click_logging(client, user_token):
    create_response = client.post(
        "/urls",
        json={"original_url": "https://safe-redirect.dev/path"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert create_response.status_code == 200
    created = create_response.json()
    code = created["short_code"]
    url_id = created["id"]

    preview_response = client.get(f"/urls/preview/{code}")
    assert preview_response.status_code == 200

    redirect_response = client.get(f"/urls/{code}/go", follow_redirects=False)
    assert redirect_response.status_code in (302, 307)

    list_response = client.get(
        "/urls/me",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert list_response.status_code == 200

    rows = list_response.json()
    match = next((row for row in rows if row["id"] == url_id), None)
    assert match is not None
    assert match["click_count"] == 1
    assert match["unique_click_count"] == 1


def test_admin_access(client, admin_token):
    response = client.get(
        "/admin/dashboard",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "total_users" in body
    assert "total_links" in body


def test_toggle_url_status_and_filter_views(client, user_token):
    create_response = client.post(
        "/urls",
        json={"original_url": "https://toggle-status.dev"},
        headers=_auth_header(user_token),
    )
    assert create_response.status_code == 200
    url_id = create_response.json()["id"]

    deactivate_response = client.patch(
        f"/urls/{url_id}/status",
        json={"is_active": False},
        headers=_auth_header(user_token),
    )
    assert deactivate_response.status_code == 200
    assert deactivate_response.json()["is_active"] is False

    inactive_response = client.get("/urls/me?status=inactive", headers=_auth_header(user_token))
    assert inactive_response.status_code == 200
    inactive_ids = {row["id"] for row in inactive_response.json()}
    assert url_id in inactive_ids

    activate_response = client.patch(
        f"/urls/{url_id}/status",
        json={"is_active": True},
        headers=_auth_header(user_token),
    )
    assert activate_response.status_code == 200
    assert activate_response.json()["is_active"] is True


def test_public_short_link_redirects_to_preview_route(client, user_token):
    create_response = client.post(
        "/urls",
        json={"original_url": "https://public-preview.dev"},
        headers=_auth_header(user_token),
    )
    assert create_response.status_code == 200
    short_code = create_response.json()["short_code"]

    redirect_response = client.get(f"/{short_code}", follow_redirects=False)

    assert redirect_response.status_code in (302, 307)
    assert redirect_response.headers["location"].endswith(f"/preview/{short_code}")


def test_user_analytics_and_export_endpoint(client, user_token):
    create_response = client.post(
        "/urls",
        json={"original_url": "https://analytics-user.dev/path"},
        headers=_auth_header(user_token),
    )
    assert create_response.status_code == 200
    short_code = create_response.json()["short_code"]

    go_response = client.get(f"/urls/{short_code}/go", follow_redirects=False)
    assert go_response.status_code in (302, 307)

    analytics_response = client.get(
        "/urls/me/analytics?range=7d&include_comparison=true",
        headers=_auth_header(user_token),
    )
    assert analytics_response.status_code == 200
    payload = analytics_response.json()
    assert payload["range"] == "7d"
    assert payload["total_clicks"] >= 1
    assert len(payload["clicks_over_time"]) == 7
    assert "comparison" in payload

    export_response = client.get(
        "/urls/me/analytics/export?range=7d",
        headers=_auth_header(user_token),
    )
    assert export_response.status_code == 200
    assert "text/csv" in export_response.headers.get("content-type", "")
    assert "scope,all_links" in export_response.text
    assert "date,label,clicks" in export_response.text


def test_link_analytics_and_export_endpoint(client, user_token):
    create_response = client.post(
        "/urls",
        json={"original_url": "https://analytics-link.dev"},
        headers=_auth_header(user_token),
    )
    assert create_response.status_code == 200
    created = create_response.json()
    short_code = created["short_code"]
    url_id = created["id"]

    go_response = client.get(f"/urls/{short_code}/go", follow_redirects=False)
    assert go_response.status_code in (302, 307)

    analytics_response = client.get(
        f"/urls/{url_id}/analytics?range=7d",
        headers=_auth_header(user_token),
    )
    assert analytics_response.status_code == 200
    payload = analytics_response.json()
    assert payload["url_id"] == url_id
    assert payload["short_code"] == short_code
    assert payload["total_clicks"] >= 1

    export_response = client.get(
        f"/urls/{url_id}/analytics/export?range=7d",
        headers=_auth_header(user_token),
    )
    assert export_response.status_code == 200
    assert "text/csv" in export_response.headers.get("content-type", "")
    assert "scope,single_link" in export_response.text
    assert "date,label,clicks" in export_response.text


def test_non_admin_cannot_access_admin_dashboard(client, user_token):
    response = client.get(
        "/admin/dashboard",
        headers=_auth_header(user_token),
    )
    assert response.status_code == 403


def test_admin_can_list_users_and_suspend_user(client, admin_token, db_session):
    member_token = _register_and_login(client, "member@test.com", "pass123")
    assert member_token

    users_response = client.get(
        "/admin/users?page=1&page_size=10",
        headers=_auth_header(admin_token),
    )
    assert users_response.status_code == 200
    users_payload = users_response.json()
    assert users_payload["total_items"] >= 2

    member = db_session.query(User).filter(User.email == "member@test.com").first()
    assert member is not None

    suspend_response = client.patch(
        f"/admin/users/{member.id}/status",
        json={"is_active": False},
        headers=_auth_header(admin_token),
    )
    assert suspend_response.status_code == 200
    assert suspend_response.json()["is_active"] is False

    relogin_response = client.post(
        "/auth/login",
        data={"username": "member@test.com", "password": "pass123"},
    )
    assert relogin_response.status_code == 403
