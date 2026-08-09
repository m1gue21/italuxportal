import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/** Cliente con service role — solo scripts/server. Nunca importar en el browser. */
function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    const missing = [
      ...(!url ? ["SUPABASE_URL"] : []),
      ...(!key ? ["SUPABASE_SERVICE_ROLE_KEY"] : []),
    ];
    throw new Error(`Faltan variables de Supabase admin: ${missing.join(", ")}`);
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _admin: ReturnType<typeof createSupabaseAdminClient> | undefined;

export const supabaseAdmin = new Proxy(
  {} as ReturnType<typeof createSupabaseAdminClient>,
  {
    get(_target, prop, receiver) {
      if (!_admin) _admin = createSupabaseAdminClient();
      return Reflect.get(_admin, prop, receiver);
    },
  },
);
