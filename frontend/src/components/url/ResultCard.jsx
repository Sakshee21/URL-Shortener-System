import { useState } from "react";

function ResultCard({ shortUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md flex justify-between items-center">
      <span className="text-blue-600 dark:text-blue-400 font-medium">
        {shortUrl}
      </span>

      <button
        onClick={handleCopy}
        className="text-sm bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export default ResultCard;