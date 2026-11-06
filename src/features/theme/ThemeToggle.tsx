import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, readStoredTheme, storeTheme, type Theme } from "./theme";
import { cn } from "@/lib/utils";

type Props = {
  /** Flotante arriba a la derecha, para las páginas sin cabecera. */
  floating?: boolean;
  className?: string;
};

export function ThemeToggle({ floating = false, className }: Props) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = readStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    storeTheme(next);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={isDark ? "Tema claro" : "Tema oscuro"}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-surface text-gold transition-colors hover:bg-gold/10",
        floating && "fixed right-4 top-4 z-50 backdrop-blur-sm",
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4" strokeWidth={1.8} />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={1.8} />
      )}
    </button>
  );
}
