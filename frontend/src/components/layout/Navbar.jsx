import { Link } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../hooks/useAuth";

function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-700 transition">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <h1 className="text-xl font-extrabold tracking-tight">
          <span className="text-blue-600">Link</span>
          <span className="dark:text-white">Sprint</span>
        </h1>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-blue-700 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-blue-700 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;