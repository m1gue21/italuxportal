import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ADMIN_AUTH_BYPASS } from "@/features/admin/auth-bypass";

export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    if (ADMIN_AUTH_BYPASS) {
      throw redirect({ to: "/admin" });
    }
  },
  component: AuthDisabledPage,
});

function AuthDisabledPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-gold/20 bg-white/[0.02] p-6 text-center">
        <h1 className="font-display text-2xl font-light">Login desactivado</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          El acceso con usuario y contraseña está pausado. Entra directo al panel.
        </p>
        <Link
          to="/admin"
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-background"
        >
          Ir al admin
        </Link>
      </div>
    </main>
  );
}
