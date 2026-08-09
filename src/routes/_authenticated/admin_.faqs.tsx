import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { adminFaqsQuery } from "@/features/faqs/queries";
import type { FaqRow } from "@/features/faqs/types";
import { AdminNav } from "@/features/admin/AdminNav";
import { CmsStaticNotice } from "@/features/admin/CmsStaticNotice";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin_/faqs")({
  component: FaqsAdminPage,
});

function FaqsAdminPage() {
  const navigate = useNavigate();
  const { data: faqs = [], isLoading } = useQuery(adminFaqsQuery);

  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-6 text-foreground">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-2">
          <div>
            <AdminNav current="/admin/faqs" />
            <h1 className="font-display mt-1 text-2xl font-light tracking-wide">
              Preguntas frecuentes
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
              {faqs.map((f) => (
                <FaqPreviewRow key={f.id} faq={f} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function FaqPreviewRow({ faq }: { faq: FaqRow }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-gold/15 bg-white/[0.02] p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{faq.pregunta}</p>
        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{faq.respuesta}</p>
      </div>
      <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
        {faq.activo ? "Activa" : "Inactiva"}
      </span>
    </li>
  );
}
