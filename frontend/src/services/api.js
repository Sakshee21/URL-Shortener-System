const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const getStoredToken = () => localStorage.getItem("token");

export const setStoredToken = (token) => {
	localStorage.setItem("token", token);
};

export const clearStoredToken = () => {
	localStorage.removeItem("token");
};

const buildHeaders = ({ includeAuth = false, token, headers = {}, isFormData = false }) => {
	const nextHeaders = { ...headers };

	if (!isFormData && !nextHeaders["Content-Type"]) {
		nextHeaders["Content-Type"] = "application/json";
	}

	if (includeAuth) {
		const authToken = token || getStoredToken();
		if (authToken) {
			nextHeaders.Authorization = `Bearer ${authToken}`;
		}
	}

	return nextHeaders;
};

export async function apiRequest(endpoint, options = {}) {
	const {
		method = "GET",
		body,
		headers,
		includeAuth = false,
		token,
	} = options;

	const isFormData = body instanceof FormData || body instanceof URLSearchParams;
	const finalHeaders = buildHeaders({ includeAuth, token, headers, isFormData });

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		method,
		headers: finalHeaders,
		body: body
			? isFormData
				? body
				: JSON.stringify(body)
			: undefined,
	});

	const contentType = response.headers.get("content-type") || "";
	const payload = contentType.includes("application/json") ? await response.json() : null;

	if (!response.ok) {
		const message = payload?.detail || "Request failed";
		const error = new Error(message);
		error.status = response.status;
		throw error;
	}

	return payload;
}

export async function loginUser(email, password) {
	const formData = new URLSearchParams();
	formData.append("username", email);
	formData.append("password", password);

	return apiRequest("/auth/login", {
		method: "POST",
		body: formData,
	});
}

export async function registerUser(email, password) {
	return apiRequest("/auth/register", {
		method: "POST",
		body: { email, password },
	});
}

export async function shortenUrl(originalUrl, options = {}) {
	const { includeAuth = false, token } = options;

	return apiRequest("/urls", {
		method: "POST",
		body: { original_url: originalUrl },
		includeAuth,
		token,
	});
}

export async function getMyUrls(options = {}) {
	const { token, status } = options;
	const query = status ? `?status=${encodeURIComponent(status)}` : "";

	return apiRequest(`/urls/me${query}`, {
		method: "GET",
		includeAuth: true,
		token,
	});
}

export async function deleteUrl(urlId, options = {}) {
	const { token } = options;

	return apiRequest(`/urls/${urlId}`, {
		method: "DELETE",
		includeAuth: true,
		token,
	});
}

export async function updateUrlStatus(urlId, isActive, options = {}) {
	const { token } = options;

	return apiRequest(`/urls/${urlId}/status`, {
		method: "PATCH",
		body: { is_active: isActive },
		includeAuth: true,
		token,
	});
}

export async function getMyAnalytics(options = {}) {
	const { token, range = "30d" } = options;

	return apiRequest(`/urls/me/analytics?range=${encodeURIComponent(range)}`, {
		method: "GET",
		includeAuth: true,
		token,
	});
}

export async function getUrlAnalytics(urlId, options = {}) {
	const { token, range = "30d" } = options;

	return apiRequest(`/urls/${urlId}/analytics?range=${encodeURIComponent(range)}`, {
		method: "GET",
		includeAuth: true,
		token,
	});
}

export async function getUrlPreview(shortCode) {
	return apiRequest(`/urls/preview/${shortCode}`, {
		method: "GET",
	});
}

export function getContinueRedirectUrl(shortCode) {
	return `${API_BASE_URL}/urls/${shortCode}/go`;
}

