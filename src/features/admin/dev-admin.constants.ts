/** Credenciales fijas del panel (lo que escribe el usuario). */
export const DEV_ADMIN_USERNAME = "admin";
export const DEV_ADMIN_PASSWORD = "admin";

/**
 * Password real en Supabase Auth (≥6 chars; el proyecto exige mínimo 6).
 * El formulario sigue aceptando solo "admin"; este valor no se muestra en UI.
 */
export const DEV_ADMIN_AUTH_PASSWORD = "admin01";

/** Email interno en Supabase Auth (el form usa solo "admin"). */
export const DEV_ADMIN_EMAIL = "admin@italux.local";
