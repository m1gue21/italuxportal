import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/features/catalog/CatalogPage";

export const Route = createFileRoute("/chile/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo Inversionistas Chile — ITALUX Joyería" },
      {
        name: "description",
        content:
          "Catálogo para mayoristas y empresarios ITALUX en Chile. Precios retail, mayorista y empresario. Arma tu pedido y envíalo por WhatsApp.",
      },
    ],
  }),
  component: CatalogRoute,
});

function CatalogRoute() {
  return <CatalogPage />;
}
