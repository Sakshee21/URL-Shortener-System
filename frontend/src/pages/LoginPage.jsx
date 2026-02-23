import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="
      min-h-screen flex items-center justify-center
      bg-gradient-to-br
      from-blue-100 via-white to-purple-100
      dark:from-[#0f172a] dark:via-[#111827] dark:to-[#1e293b]
      transition-all duration-700
    ">

      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px]
          bg-blue-500/30 dark:bg-blue-600/25
          rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl flex bg-white/60 dark:bg-slate-800/60
        backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-center p-12
          bg-gradient-to-br from-blue-600 to-indigo-600 text-white w-1/2">

          <h2 className="text-3xl font-bold mb-4">
            Welcome Back 
          </h2>

          <p className="text-blue-100">
            Log in to manage your links, track analytics and
            keep everything organized.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 p-10">

          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Login to Your Account
          </h2>

          <form className="space-y-4">

            <input
              type="email"
              placeholder="Email address"
              className="w-full p-3 rounded-lg border
              border-gray-300 dark:border-slate-600
              bg-white/70 dark:bg-slate-700
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-lg border
              border-gray-300 dark:border-slate-600
              bg-white/70 dark:bg-slate-700
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              className="w-full py-3 rounded-xl font-semibold
              bg-gradient-to-r from-blue-600 to-indigo-600
              hover:from-blue-700 hover:to-indigo-700
              text-white transition-all duration-300
              shadow-md hover:shadow-xl"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}