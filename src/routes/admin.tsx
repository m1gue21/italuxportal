import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { adminCountriesQuery } from "@/features/countries/queries";
import type { CountryRow } from "@/features/countries/types";
import { AdminNav } from "@/features/admin/AdminNav";
import { CmsStaticNotice } from "@/features/admin/CmsStaticNotice";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { data: countries = [], isLoading } = useQuery(adminCountriesQuery);

  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-6 text-foreground">
      <div className="mx-auto max-w-3xl">
        <header>
          <AdminNav current="/admin" />
          <h1 className="font-display mt-1 text-2xl font-light tracking-wide">Países</h1>
        </header>

        <CmsStaticNotice filePath="src/features/cms/defaults.ts" />

        <section className="mt-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando países...</p>
          ) : (
            <ul className="grid gap-2">
              {countries.map((c) => (
                <CountryPreviewRow key={c.id} country={c} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function CountryPreviewRow({ country }: { country: CountryRow }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-gold/15 bg-surface p-3">
      <span className="text-2xl">{country.flag}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{country.name}</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {country.code}
        </p>
      </div>
      <div className="flex gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{country.is_active ? "Activo" : "Inactivo"}</span>
        <span>·</span>
        <span>{country.show_on_map ? "En mapa" : "Sin mapa"}</span>
      </div>
    </li>
  );
}
