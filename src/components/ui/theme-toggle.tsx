"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = "relasy_theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved === "dark" || saved === "light") {
        setThemeState(saved);
        document.documentElement.classList.toggle("dark", saved === "dark");
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignore storage error
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", mode === "dark");
      document.documentElement.setAttribute("data-theme", mode);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      type="button"
      data-testid="theme-toggle"
      whileTap={{ scale: 0.94 }}
      onClick={toggleTheme}
      aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
      className={cn(
        "relative inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border text-xs font-medium transition-colors cursor-pointer select-none",
        "bg-[#FFFFFF] text-[#252927] border-[#E5E4DE] hover:bg-[#E9E8FC]/50 hover:border-[#635BCE]/40",
        "dark:bg-[#1C1F1D] dark:text-[#F7F6F1] dark:border-[#2E3330] dark:hover:bg-[#252927]",
        className
      )}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Terang</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-[#635BCE]" />
          <span className="hidden sm:inline">Gelap</span>
        </>
      )}
    </motion.button>
  );
};
