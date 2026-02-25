import { FiCopy } from "react-icons/fi";

export default function ResultCard({ shortUrl }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
  };

  return (
    <div className="mt-6 w-full max-w-3xl 
      bg-white dark:bg-slate-800
      rounded-2xl shadow-md
      border border-slate-200 dark:border-slate-700
      flex items-center justify-between p-4">

      <a
        href={shortUrl}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 dark:text-blue-400 font-medium"
      >
        {shortUrl}
      </a>

      <button
        onClick={handleCopy}
        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
      >
        <FiCopy size={18} />
      </button>
    </div>
  );
}