import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Registration failed");
        return;
      }

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError("Something went wrong");
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
              className="w-full p-3 rounded-lg border
              border-gray-300 dark:border-slate-600
              bg-white/70 dark:bg-slate-700
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
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
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:scale-[1.02]
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