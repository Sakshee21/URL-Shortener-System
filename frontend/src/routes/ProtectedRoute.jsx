import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function FullPageLoader() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center gap-5
			bg-gradient-to-br from-blue-50 via-white to-purple-100
			dark:from-[#0f172a] dark:via-[#111827] dark:to-black">
			<svg
				className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400"
				viewBox="0 0 24 24"
				fill="none"
			>
				<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
				<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
			</svg>
			<p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">
				Loading LinkSprint...
			</p>
		</div>
	);
}

export default function ProtectedRoute({ children, requireAdmin = false }) {
	const { isAuthenticated, isLoading, user } = useAuth();

	if (isLoading) {
		return <FullPageLoader />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (requireAdmin && !user?.is_admin) {
		return <Navigate to="/dashboard" replace />;
	}

	return children;
}

