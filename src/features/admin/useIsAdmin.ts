import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_AUTH_BYPASS } from "./auth-bypass";

export function useIsAdmin() {
  const [loading, setLoading] = useState(!ADMIN_AUTH_BYPASS);
  const [isAdmin, setIsAdmin] = useState(ADMIN_AUTH_BYPASS);
  const [hasAnyAdmin, setHasAnyAdmin] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const refresh = async () => {
    if (ADMIN_AUTH_BYPASS) {
      setIsAdmin(true);
      setHasAnyAdmin(true);
      setUserId("local-bypass");
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id ?? null;
    setUserId(uid);
    if (!uid) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);
    setIsAdmin((roles ?? []).some((r) => r.role === "admin"));

    const { data: claimed } = await supabase.rpc("admin_bootstrap_claimed");
    setHasAnyAdmin(Boolean(claimed));
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { loading, isAdmin, hasAnyAdmin, userId, refresh };
}
