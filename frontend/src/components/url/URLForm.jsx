import { useState } from "react";

export default function URLForm({ onShorten, isLoading = false }) {
  const [longUrl, setLongUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading) {
      onShorten(longUrl);
      setLongUrl("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl 
        bg-white dark:bg-slate-800
        rounded-2xl shadow-xl
        border border-slate-200 dark:border-slate-700
        flex items-center p-3 gap-3"
    >
      <input
        type="url"
        value={longUrl}
        disabled={isLoading}
        onChange={(e) => setLongUrl(e.target.value)}
        placeholder="Paste your long URL here..."
        className="flex-1 bg-transparent outline-none 
        px-4 py-3 text-slate-700 dark:text-white"
        required
      />

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-3 
        bg-gradient-to-r from-blue-500 to-purple-600
        text-white font-semibold rounded-xl
        hover:scale-105 transition-all duration-300 shadow-md disabled:opacity-70"
      >
        {isLoading ? "Shortening..." : "Shorten →"}
      </button>
    </form>
  );
}