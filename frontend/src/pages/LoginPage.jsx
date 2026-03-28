import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="
      relative min-h-screen flex items-center justify-center overflow-hidden
      bg-gradient-to-br
      from-blue-50 via-white to-purple-100
      dark:from-[#0f172a] dark:via-[#111827] dark:to-black
      transition-all duration-700
    ">

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px]
          bg-blue-400/40 dark:bg-blue-600/25
          rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px]
          bg-purple-400/40 dark:bg-purple-600/25
          rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="w-full max-w-5xl flex 
        bg-white/60 dark:bg-slate-800/60
        backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">

        <div className="hidden md:flex flex-col justify-center p-12
          bg-gradient-to-br from-blue-600 to-indigo-600 text-white w-1/2">
          <h2 className="text-3xl font-bold mb-4">
            Welcome Back to LinkSprint
          </h2>
          <p className="text-blue-100">
            Manage links. Track performance. Grow smarter.
          </p>
        </div>

        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Login to Your Account
          </h2>

          <form className="space-y-4" onSubmit={handleLogin}>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border
              border-gray-300 dark:border-slate-600
              bg-white/70 dark:bg-slate-700
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border
              border-gray-300 dark:border-slate-600
              bg-white/70 dark:bg-slate-700
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition"
              required
            />

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold
              bg-gradient-to-r from-blue-600 to-indigo-600
              hover:scale-[1.02]
              text-white transition-all duration-300
              shadow-md hover:shadow-xl"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}