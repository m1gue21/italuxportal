import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useIsAdmin } from "@/features/admin/useIsAdmin";
import { AdminNav } from "@/features/admin/AdminNav";
import { SectionTextEditor } from "@/features/admin/SectionTextEditor";
import { Footer } from "@/features/landing/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin_/footer")({
  component: FooterAdminPage,
});

function FooterAdminPage() {
  const navigate = useNavigate();
  const { loading, isAdmin } = useIsAdmin();

  const signOut = async () => {
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="w-full max-w-sm rounded-2xl border border-gold/20 bg-white/[0.02] p-6 text-center">
          <h1 className="font-display text-xl font-light">Acceso restringido</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Tu cuenta no tiene permisos de administrador.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-6 text-foreground">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-2">
          <div>
            <AdminNav current="/admin/footer" />
            <h1 className="font-display mt-1 text-2xl font-light tracking-wide">
              Pie de página
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <SectionTextEditor
              sectionKey="footer"
              label="Editar pie"
              includeSecondLink
              includeSocials
              includeLogo
              includeShowTitle
              triggerVariant="default"
            />

            <Button size="sm" variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <p className="mt-2 text-xs text-muted-foreground">
          Edita el nombre, lema, copyright, redes sociales y dos enlaces personalizables.
        </p>

        <div className="mt-5 overflow-hidden rounded-2xl border border-gold/15">
          <Footer />
        </div>
      </div>
    </main>
  );
}
