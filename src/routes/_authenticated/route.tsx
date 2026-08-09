import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;
    if (!user) {
      throw redirect({ to: "/auth" });
    }
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (!isAdmin) {
      throw redirect({ to: "/auth" });
    }
    return { user };
  },
  component: () => <Outlet />,
});
