import { Link } from "react-router-dom";
import { useState } from "react";

export default function SignupPage() {
const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  return (
    <div className="
      min-h-screen flex items-center justify-center
      bg-gradient-to-br
      from-blue-100 via-white to-purple-100
      dark:from-[#0f172a] dark:via-[#111827] dark:to-[#1e293b]
      transition-all duration-700
    ">

      <div className="w-full max-w-5xl flex bg-white/60 dark:bg-slate-800/60
        backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-center p-12
          bg-gradient-to-br from-indigo-600 to-purple-600 text-white w-1/2">

          <h2 className="text-3xl font-bold mb-4">
            Join Us 
          </h2>

          <p className="text-purple-100">
            Create an account and start shortening your
            links in seconds.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 p-10">

          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Create Account
          </h2>

          <form className="space-y-4">

            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 rounded-lg border
              border-gray-300 dark:border-slate-600
              bg-white/70 dark:bg-slate-700
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="email"
              placeholder="Email address"
              className="w-full p-3 rounded-lg border
              border-gray-300 dark:border-slate-600
              bg-white/70 dark:bg-slate-700
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border
            border-gray-300 dark:border-slate-600
            bg-white/70 dark:bg-slate-700
            focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded-lg border
                border-gray-300 dark:border-slate-600
                bg-white/70 dark:bg-slate-700
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

            {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-sm">
                    Passwords do not match
                </p>
                )}
                
            <button
              className="w-full py-3 rounded-xl font-semibold
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-700 hover:to-purple-700
              text-white transition-all duration-300
              shadow-md hover:shadow-xl"
            >
              Sign Up
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