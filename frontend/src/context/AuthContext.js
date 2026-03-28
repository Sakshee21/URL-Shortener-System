import { createContext, createElement, useEffect, useMemo, useState } from "react";

import {
	clearStoredToken,
	getStoredToken,
	loginUser,
	setStoredToken,
} from "../services/api";

export const AuthContext = createContext(null);

const decodeJwtPayload = (token) => {
	try {
		const payload = token.split(".")[1];
		if (!payload) return null;

		const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
		const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
		return JSON.parse(window.atob(padded));
	} catch {
		return null;
	}
};

const mapTokenToUser = (token) => {
	const payload = decodeJwtPayload(token);
	return payload?.sub ? { email: payload.sub } : null;
};

export function AuthProvider({ children }) {
	const [token, setToken] = useState(null);
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const existingToken = getStoredToken();

		if (existingToken) {
			setToken(existingToken);
			setUser(mapTokenToUser(existingToken));
		}

		setIsLoading(false);
	}, []);

	const login = async (email, password) => {
		const response = await loginUser(email, password);
		setStoredToken(response.access_token);
		setToken(response.access_token);
		setUser(mapTokenToUser(response.access_token));
		return response;
	};

	const logout = () => {
		clearStoredToken();
		setToken(null);
		setUser(null);
	};

	const value = useMemo(
		() => ({
			token,
			user,
			isAuthenticated: Boolean(token),
			isLoading,
			login,
			logout,
		}),
		[token, user, isLoading]
	);

	return createElement(AuthContext.Provider, { value }, children);
}

