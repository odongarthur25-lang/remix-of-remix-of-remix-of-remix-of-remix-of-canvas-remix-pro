import { useState, useEffect } from "react";
type Theme = "light" | "dark";
function readTheme(): Theme {
  try { return localStorage.getItem("theme") === "light" ? "light" : "dark"; } catch { return "dark"; }
}
export function useTheme() {
  const [theme, updateTheme] = useState<Theme>("dark");
  useEffect(() => {
    const sync = () => updateTheme(readTheme());
    sync();
    window.addEventListener("theme-change", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("theme-change", sync); window.removeEventListener("storage", sync); };
  }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);
  const setTheme = (value: Theme) => {
    updateTheme(value);
    try { localStorage.setItem("theme", value); } catch {}
    window.dispatchEvent(new Event("theme-change"));
  };
  return { theme, setTheme, toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark") };
}
