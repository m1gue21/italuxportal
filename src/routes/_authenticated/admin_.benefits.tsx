import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Sparkles } from "lucide-react";

import { adminBenefitsQuery } from "@/features/benefits/queries";
import { BENEFIT_ICONS, type BenefitRow } from "@/features/benefits/types";
import { AdminNav } from "@/features/admin/AdminNav";
import { CmsStaticNotice } from "@/features/admin/CmsStaticNotice";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin_/benefits")({
  component: BenefitsAdminPage,
});

function BenefitsAdminPage() {
  const navigate = useNavigate();
  const { data: benefits = [], isLoading } = useQuery(adminBenefitsQuery);

  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-6 text-foreground">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-2">
          <div>
            <AdminNav current="/admin/benefits" />
            <h1 className="font-display mt-1 text-2xl font-light tracking-wide">
              La promesa de la maison
            </h1>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate({ to: "/" })}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <CmsStaticNotice filePath="src/features/cms/defaults.ts" />

        <section className="mt-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <ul className="grid gap-2">
              {benefits.map((b) => (
                <BenefitPreviewRow key={b.id} benefit={b} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function BenefitPreviewRow({ benefit }: { benefit: BenefitRow }) {
  const Icon = BENEFIT_ICONS[benefit.icon] ?? Sparkles;

  return (
    <li className="flex items-start gap-3 rounded-xl border border-gold/15 bg-white/[0.02] p-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
        <Icon className="h-4 w-4" strokeWidth={1.4} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{benefit.title}</p>
        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{benefit.description}</p>
      </div>
      <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
        {benefit.activo ? "Activo" : "Inactivo"}
      </span>
    </li>
  );
}
