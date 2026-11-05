import { createFileRoute } from "@tanstack/react-router";
import { AdminNav } from "@/features/admin/AdminNav";
import { CmsStaticNotice } from "@/features/admin/CmsStaticNotice";
import { Hero } from "@/features/landing/Hero";

export const Route = createFileRoute("/admin_/hero")({
  component: HeroAdminPage,
});

function HeroAdminPage() {
  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-6 text-foreground">
      <div className="mx-auto max-w-3xl">
        <header>
          <AdminNav current="/admin/hero" />
          <h1 className="font-display mt-1 text-2xl font-light tracking-wide">Portada (Hero)</h1>
        </header>

        <CmsStaticNotice filePath="src/features/cms/defaults.ts (section_key: hero)" />

        <div className="mt-5 overflow-hidden rounded-2xl border border-gold/15">
          <Hero />
        </div>
      </div>
    </main>
  );
}
