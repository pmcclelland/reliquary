import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "reliquary-theme";

export const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: "#f3efe6",
  dark: "#14110e",
};

export const themeBootstrapScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});var d=s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=d?"dark":"light";var e=document.documentElement;e.dataset.theme=r;e.classList.toggle("dark",d);e.style.colorScheme=r;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"${THEME_COLORS.dark}":"${THEME_COLORS.light}");}catch(t){}})();`;

type ThemeContextValue = {
  theme: ThemePreference;
  resolved: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

function readStoredTheme(): ThemePreference {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
  } catch {
    // private mode
  }
  return "system";
}

function resolveTheme(theme: ThemePreference): ResolvedTheme {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyResolved(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[resolved]);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");
  const hydrated = useRef(false);

  useLayoutEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      const stored = readStoredTheme();
      if (stored !== theme) {
        setThemeState(stored);
        const next = resolveTheme(stored);
        setResolved(next);
        applyResolved(next);
        return;
      }
    }

    const apply = () => {
      const next = resolveTheme(theme);
      setResolved(next);
      applyResolved(next);
    };
    apply();
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private mode
    }
  }, []);

  const value = useMemo(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
