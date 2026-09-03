import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  theme: ThemeMode;
  actualTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("gencsosyal_theme") || localStorage.getItem("theme");
  if (saved === "light" || saved === "dark" || saved === "system") {
    return saved;
  }
  return "light";
};

const resolveActualTheme = (theme: ThemeMode): "light" | "dark" => {
  if (theme === "system") {
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }
  return theme;
};

const applyThemeToDOM = (actual: "light" | "dark") => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (actual === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = getInitialTheme();
  const actual = resolveActualTheme(initial);
  applyThemeToDOM(actual);

  // Listen to system preference changes if in system mode
  if (typeof window !== "undefined" && window.matchMedia) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", (e) => {
      const current = get().theme;
      if (current === "system") {
        const newActual = e.matches ? "dark" : "light";
        set({ actualTheme: newActual });
        applyThemeToDOM(newActual);
      }
    });
  }

  return {
    theme: initial,
    actualTheme: actual,
    setTheme: (newTheme: ThemeMode) => {
      const newActual = resolveActualTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      localStorage.setItem("gencsosyal_theme", newTheme);
      applyThemeToDOM(newActual);
      set({ theme: newTheme, actualTheme: newActual });
    },
    toggleTheme: () => {
      const currentActual = get().actualTheme;
      const nextTheme: ThemeMode = currentActual === "dark" ? "light" : "dark";
      get().setTheme(nextTheme);
    },
  };
});
