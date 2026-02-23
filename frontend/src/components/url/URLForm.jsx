import { useState } from "react";
import axios from "axios";

function URLForm({ setShortUrl }) {
  const [longUrl, setLongUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/shorten", {
        url: longUrl,
      });

      setShortUrl(response.data.short_url);
    } catch (error) {
      alert("Error shortening URL");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-md">
      <input
        type="url"
        placeholder="Enter your long URL..."
        value={longUrl}
        onChange={(e) => setLongUrl(e.target.value)}
        required
        className="p-3 border rounded mb-4"
      />

      <button
        type="submit"
        disabled={loading}
        className="
          w-full py-3 rounded-xl font-semibold
          bg-gradient-to-r from-blue-600 to-indigo-600
          hover:from-blue-700 hover:to-indigo-700
          text-white
          transition-all duration-300
          shadow-md hover:shadow-xl
          hover:-translate-y-1
        "
      >
        {loading ? "Shortening..." : "Shorten URL"}
      </button>
    </form>
  );
}

export default URLForm;