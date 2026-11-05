import { createFileRoute, notFound } from "@tanstack/react-router";
import { CatalogPage } from "@/features/catalog/CatalogPage";
import { getCatalogMetaBySlug } from "@/features/catalog/catalog-meta";
import { hasCatalogProducts } from "@/features/catalog/product-registry";

export const Route = createFileRoute("/$slug/catalogo")({
  beforeLoad: ({ params }) => {
    const catalogMeta = getCatalogMetaBySlug(params.slug);
    if (!catalogMeta || !hasCatalogProducts(catalogMeta.code)) {
      throw notFound();
    }
    return { catalogMeta };
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
