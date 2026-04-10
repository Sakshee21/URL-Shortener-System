import { createContext, createElement, useEffect, useMemo, useState } from "react";

import {
	clearStoredToken,
	getStoredToken,
	getMe,
	loginUser,
	setStoredToken,
} from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [token, setToken] = useState(null);
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const existingToken = getStoredToken();

		const loadUser = async () => {
			if (!existingToken) {
				setIsLoading(false);
				return;
			}

			setToken(existingToken);

			try {
				const currentUser = await getMe({ token: existingToken });
				setUser(currentUser);
			} catch {
				clearStoredToken();
				setToken(null);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		loadUser();
	}, []);

	const login = async (email, password) => {
		const response = await loginUser(email, password);
		setStoredToken(response.access_token);
		setToken(response.access_token);
		const currentUser = await getMe({ token: response.access_token });
		setUser(currentUser);
		return currentUser;
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

