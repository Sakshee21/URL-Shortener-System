import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children, requireAdmin = false }) {
	const { isAuthenticated, isLoading, user } = useAuth();

	if (isLoading) {
		return null;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (requireAdmin && !user?.is_admin) {
		return <Navigate to="/dashboard" replace />;
	}

	return children;
}

