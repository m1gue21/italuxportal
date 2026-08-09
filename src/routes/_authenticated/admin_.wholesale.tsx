import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { AdminNav } from "@/features/admin/AdminNav";
import { CmsStaticNotice } from "@/features/admin/CmsStaticNotice";
import { WholesaleSection } from "@/features/landing/WholesaleSection";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin_/wholesale")({
  component: WholesaleAdminPage,
});

function WholesaleAdminPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-6 text-foreground">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-2">
          <div>
            <AdminNav current="/admin/wholesale" />
            <h1 className="font-display mt-1 text-2xl font-light tracking-wide">
              Venta al por mayor
            </h1>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate({ to: "/" })}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <CmsStaticNotice filePath="src/features/cms/defaults.ts (section_key: wholesale)" />

        <div className="mt-5 overflow-hidden rounded-2xl border border-gold/15">
          <WholesaleSection />
        </div>
      </div>
    </main>
  );
}
