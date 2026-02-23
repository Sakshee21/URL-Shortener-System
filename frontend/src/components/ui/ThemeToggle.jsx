import { useEffect, useState } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 transition"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}

export default ThemeToggle;