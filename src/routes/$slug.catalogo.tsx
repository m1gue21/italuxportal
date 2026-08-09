import { createFileRoute, notFound } from "@tanstack/react-router";
import { CatalogPage } from "@/features/catalog/CatalogPage";
import { getCatalogMetaBySlug } from "@/features/catalog/catalog-meta";
import { hasCatalogProducts } from "@/features/catalog/product-registry";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/$slug/catalogo")({
  beforeLoad: async ({ params }) => {
    const staticMeta = getCatalogMetaBySlug(params.slug);
    try {
      const { data } = await supabase
        .from("investor_catalogs")
        .select("code, name, slug, is_active")
        .eq("slug", params.slug)
        .eq("is_active", true)
        .maybeSingle();
      if (data) {
        return {
          catalogMeta: {
            code: data.code,
            name: data.name,
            slug: data.slug,
            flag: staticMeta?.flag ?? "",
            currency: staticMeta?.currency ?? "CLP",
            locale: staticMeta?.locale ?? "es",
          },
        };
      }
    } catch {
      // fallback packs
    }
    if (!staticMeta || !hasCatalogProducts(staticMeta.code)) {
      throw notFound();
    }
    return { catalogMeta: staticMeta };
  },
  head: ({ params }) => {
    const meta = getCatalogMetaBySlug(params.slug);
    const name = meta?.name ?? params.slug;
    return {
      meta: [
        { title: `Catálogo Inversionistas ${name} — ITALUX Joyería` },
        {
          name: "description",
          content: `Catálogo para mayoristas y empresarios ITALUX en ${name}. Precios retail, mayorista y empresario. Arma tu pedido y envíalo por WhatsApp.`,
        },
      ],
    };
  },
  component: CatalogRoute,
});

function CatalogRoute() {
  const { catalogMeta } = Route.useRouteContext();
  return <CatalogPage countryCode={catalogMeta.code} />;
}
