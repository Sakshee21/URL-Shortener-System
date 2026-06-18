import { useTheme } from "../../context/ThemeContext";

function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 transition"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}

export default ThemeToggle;