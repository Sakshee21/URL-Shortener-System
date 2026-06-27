import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../services/api";

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 mr-2 text-white inline-block" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(email, password);

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Something went wrong");
      setIsLoading(false);
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
          bg-indigo-400/40 dark:bg-indigo-600/25
          rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px]
          bg-purple-400/40 dark:bg-purple-600/25
          rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="w-full max-w-5xl flex 
        bg-white/60 dark:bg-slate-800/60
        backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">

        <div className="hidden md:flex flex-col justify-center p-12
          bg-gradient-to-br from-indigo-600 to-purple-600 text-white w-1/2">
          <h2 className="text-3xl font-bold mb-4">
            Join LinkSprint
          </h2>
          <p className="text-purple-100">
            Start shortening smarter. Track every click.
          </p>
        </div>

        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Create Account
          </h2>

          <form className="space-y-4" onSubmit={handleSignup}>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full p-3 rounded-lg border
              border-gray-300 dark:border-slate-600
              bg-white/70 dark:bg-slate-700
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              disabled:opacity-60 disabled:cursor-not-allowed"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full p-3 rounded-lg border
              border-gray-300 dark:border-slate-600
              bg-white/70 dark:bg-slate-700
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              disabled:opacity-60 disabled:cursor-not-allowed"
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="w-full p-3 rounded-lg border
              border-gray-300 dark:border-slate-600
              bg-white/70 dark:bg-slate-700
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              disabled:opacity-60 disabled:cursor-not-allowed"
              required
            />

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:scale-[1.02]
              text-white transition-all duration-300
              shadow-md hover:shadow-xl
              disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Spinner />
                  Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}