export type Theme = "light" | "dark";

/** El claro es el tema por defecto; solo una elección guardada lo cambia. */
export const DEFAULT_THEME: Theme = "light";
export const THEME_STORAGE_KEY = "italux-theme";

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
}

export function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // modo privado o storage bloqueado: el tema dura lo que la pestaña
  }
}

/**
 * Se ejecuta en el <head>, antes de pintar, para que un usuario que ya eligió
 * oscuro no vea el claro por un instante. Como el SSR no conoce la elección,
 * el HTML sale siempre en claro y este script lo corrige.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="dark"){document.documentElement.classList.add("dark");document.documentElement.dataset.theme="dark"}else{document.documentElement.dataset.theme="light"}}catch(e){}})();`;
