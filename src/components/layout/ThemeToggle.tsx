"use client";

import dynamic from "next/dynamic"; // Import dynamic
import { useState } from "react";
import { Sun, Moon } from "lucide-react";

function ThemeToggleBase() {
  // This state is now safe because this component will ONLY render on the client.
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const toggleTheme = () => {
    const nextThemeIsDark = !isDark;
    setIsDark(nextThemeIsDark);

    if (nextThemeIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="inline-flex items-center justify-center h-9 w-9 rounded-md
        text-foreground hover:bg-accent hover:text-accent-foreground
        transition-colors outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {isDark ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}
    </button>
  );
}

// Export a dynamic version with SSR disabled.
// This prevents the "Hydration failed" error and the "Cascading render" warning.
export default dynamic(() => Promise.resolve(ThemeToggleBase), {
  ssr: false,
  loading: () => <div className="h-9 w-9" />, // Placeholder while loading
});
