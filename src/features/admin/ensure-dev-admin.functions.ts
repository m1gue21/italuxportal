import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import {
  DEV_ADMIN_AUTH_PASSWORD,
  DEV_ADMIN_EMAIL,
  DEV_ADMIN_USERNAME,
} from "./dev-admin.constants";
import type { Database } from "@/integrations/supabase/types";

function adminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el servidor (.env)",
    );
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Asegura admin@italux.local con password Auth válido + rol admin.
 * El login UI sigue siendo usuario/contraseña "admin".
 */
export const ensureDevAdminUser = createServerFn({ method: "POST" }).handler(
  async () => {
    const sb = adminClient();

    const { data: listed, error: listErr } = await sb.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw listErr;

    let user = listed.users.find(
      (u) => u.email?.toLowerCase() === DEV_ADMIN_EMAIL.toLowerCase(),
    );

    if (!user) {
      const { data, error } = await sb.auth.admin.createUser({
        email: DEV_ADMIN_EMAIL,
        password: DEV_ADMIN_AUTH_PASSWORD,
        email_confirm: true,
        user_metadata: { username: DEV_ADMIN_USERNAME },
      });
      if (error) throw error;
      user = data.user;
    } else {
      const { error } = await sb.auth.admin.updateUserById(user.id, {
        password: DEV_ADMIN_AUTH_PASSWORD,
        email_confirm: true,
      });
      if (error) throw error;
    }

    if (!user) throw new Error("No se pudo crear el usuario admin");

    const { error: roleErr } = await sb.from("user_roles").upsert(
      { user_id: user.id, role: "admin" },
      { onConflict: "user_id" },
    );
    if (roleErr) throw roleErr;

    return { email: DEV_ADMIN_EMAIL, ok: true as const };
  },
);
