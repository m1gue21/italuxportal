import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  DEV_ADMIN_AUTH_PASSWORD,
  DEV_ADMIN_EMAIL,
  DEV_ADMIN_PASSWORD,
  DEV_ADMIN_USERNAME,
} from "@/features/admin/dev-admin.constants";
import { ensureDevAdminUser } from "@/features/admin/ensure-dev-admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(DEV_ADMIN_USERNAME);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const userOk = username.trim().toLowerCase() === DEV_ADMIN_USERNAME;
      const passOk = password === DEV_ADMIN_PASSWORD;
      if (!userOk || !passOk) {
        throw new Error("Usuario o contraseña incorrectos");
      }

      // Crea/actualiza el usuario en Supabase Auth + rol admin
      await ensureDevAdminUser();

      const { error } = await supabase.auth.signInWithPassword({
        email: DEV_ADMIN_EMAIL,
        password: DEV_ADMIN_AUTH_PASSWORD,
      });
      if (error) throw error;

      toast.success("Sesión iniciada");
      navigate({ to: "/admin/catalogs" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-gold/20 bg-white/[0.02] p-6">
        <h1 className="font-display text-2xl font-light">Admin ITALUX</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Usuario <code className="text-gold">admin</code> · contraseña{" "}
          <code className="text-gold">admin</code>
        </p>
        <form onSubmit={submit} className="mt-5 grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={busy} className="mt-1">
            {busy ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
