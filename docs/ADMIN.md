# Panel de administración

## Acceso

No hay login remoto. `/admin` y subrutas abren directamente. `/auth` redirige al admin.

El admin es una **vista previa de solo lectura** del contenido quemado en TypeScript. No guarda cambios en el navegador ni en un backend.

## Rutas del admin

| Ruta | Contenido |
| --- | --- |
| `/admin` | Países (preview) |
| `/admin/catalogs` | Catálogos / productos (preview de packs) |
| `/admin/faqs` | Preguntas frecuentes |
| `/admin/benefits` | Beneficios / “promesa de la maison” |
| `/admin/wholesale` | Preview sección mayoreo |
| `/admin/hero` | Preview portada |
| `/admin/footer` | Preview pie y redes |

Navegación compartida: [`AdminNav`](../src/features/admin/AdminNav.tsx).

## Dónde editar el contenido

| Área | Archivo |
| --- | --- |
| Países, FAQs, benefits, textos de sección | [`src/features/cms/defaults.ts`](../src/features/cms/defaults.ts) |
| Lecturas CMS (API interna) | [`src/features/cms/cms-data.ts`](../src/features/cms/cms-data.ts) |
| Productos por país | `src/features/catalog/*-products.ts` + [`product-registry.ts`](../src/features/catalog/product-registry.ts) |
| Meta catálogo (slug, moneda) | [`catalog-meta.ts`](../src/features/catalog/catalog-meta.ts) |
| Descuentos públicos | [`pricing.ts`](../src/features/catalog/pricing.ts) |

Tras editar el código, reinicia o redeploya para ver los cambios.

## Catálogos

Documentado en [CATALOGO.md](./CATALOGO.md). En `/admin/catalogs` solo se listan packs existentes; no hay CRUD ni `localStorage`.
