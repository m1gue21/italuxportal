import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const refresh = async (nextUser: User | null) => {
      if (!nextUser) {
        if (!cancelled) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      const { data, error } = await supabase.rpc("is_admin");
      if (!cancelled) {
        setUser(nextUser);
        setIsAdmin(!error && data === true);
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      void refresh(data.session?.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      void refresh(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, isAdmin, loading, userId: user?.id ?? null };
}
