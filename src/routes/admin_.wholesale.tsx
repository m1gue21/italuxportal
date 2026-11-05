import { createFileRoute } from "@tanstack/react-router";
import { AdminNav } from "@/features/admin/AdminNav";
import { CmsStaticNotice } from "@/features/admin/CmsStaticNotice";
import { WholesaleSection } from "@/features/landing/WholesaleSection";

export const Route = createFileRoute("/admin_/wholesale")({
  component: WholesaleAdminPage,
});

function WholesaleAdminPage() {
  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-6 text-foreground">
      <div className="mx-auto max-w-3xl">
        <header>
          <AdminNav current="/admin/wholesale" />
          <h1 className="font-display mt-1 text-2xl font-light tracking-wide">
            Venta al por mayor
          </h1>
        </header>

        <CmsStaticNotice filePath="src/features/cms/defaults.ts (section_key: wholesale)" />

        <div className="mt-5 overflow-hidden rounded-2xl border border-gold/15">
          <WholesaleSection />
        </div>
      </div>
    </main>
  );
}
