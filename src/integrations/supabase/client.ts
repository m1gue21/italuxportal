import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function createSupabaseClient() {
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    (typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined);
  const key =
    import.meta.env.VITE_SUPABASE_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    (typeof process !== "undefined"
      ? process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_KEY
      : undefined);

  if (!url || !key) {
    const missing = [
      ...(!url ? ["VITE_SUPABASE_URL"] : []),
      ...(!key ? ["VITE_SUPABASE_KEY"] : []),
    ];
    throw new Error(`Faltan variables de Supabase: ${missing.join(", ")}`);
  }

  return createClient<Database>(url, key, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: typeof window !== "undefined",
      autoRefreshToken: typeof window !== "undefined",
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_target, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
