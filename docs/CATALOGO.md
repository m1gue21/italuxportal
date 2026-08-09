# Catálogo Inversionistas

Documentación del catálogo público y de la vista previa en admin.

## Objetivo

Permitir a **mayoristas** y **empresarios** explorar productos por país, comparar precios (retail / mayorista / empresario), armar un pedido y enviarlo por WhatsApp con un resumen tipo invoice.

Países con pack de productos: **Chile**, **Colombia**, **Ecuador** y **España**.

## Rutas públicas

| URL | Moneda | Fuente CSV |
| --- | --- | --- |
| `/chile/catalogo` | CLP | `products_export_1 CHILE PRODDUCTOS.csv` |
| `/colombia/catalogo` | COP | `products_exportCOLOMBIA.csv` |
| `/ecuador/catalogo` | USD | `products_exportECUADOR.csv` |
| `/espana/catalogo` | EUR | `products_exportESPAÑA.csv` |

Entrada desde la landing: tarjeta del país (si existe en CMS) → **Catálogo Inversionistas** cuando hay pack en `product-registry` (`CL`, `CO`, `EC`, `ES`).

## Precios

Definidos en [`src/features/catalog/pricing.ts`](../src/features/catalog/pricing.ts):

| Rol | Cálculo (defaults) |
| --- | --- |
| Retail | Precio del producto (tachado en UI) |
| Mayorista | `retail × (1 − 0.30)` → −30% |
| Empresario | `retail × (1 − 0.30 − 0.30)` → −60% |

La tienda pública y el preview admin usan estos defaults del código.

## Datos de productos

Packs estáticos generados desde exports Shopify:

| Código | Archivo |
| --- | --- |
| CL | [`chile-products.ts`](../src/features/catalog/chile-products.ts) |
| CO | [`colombia-products.ts`](../src/features/catalog/colombia-products.ts) |
| EC | [`ecuador-products.ts`](../src/features/catalog/ecuador-products.ts) |
| ES | [`spain-products.ts`](../src/features/catalog/spain-products.ts) |

Registro: [`product-registry.ts`](../src/features/catalog/product-registry.ts). Meta (slug, moneda, locale): [`catalog-meta.ts`](../src/features/catalog/catalog-meta.ts).

Cada producto incluye:

- `handle`, `title`, `sku`
- `retailPrice`, `compareAtPrice`
- `imageUrl`, `galleryUrls` (URLs CDN Shopify)
- `tags`, `categories` (Cadenas, Pulseras, Dijes, Combos, Hombre, Mujer)

### Regenerar desde CSV

Desde la raíz del proyecto (ejemplo con Python):

```bash
python3 - <<'PY'
# Ver script usado en el historial del repo / adaptar el parseo CSV → chile-products.ts
# Agrupar por Handle, Status=active, Image Src → galleryUrls
PY
```

Solo se incluyen productos con título y `Status === active`.

## Pedido → WhatsApp

Estado del carrito: [`useOrderCart`](../src/features/catalog/useOrderCart.ts) (persistido en `localStorage` por país).

Flujo:

1. Usuario elige rol (Mayorista / Empresario)
2. Agrega productos (card o detalle)
3. Abre **Tu pedido** (panel lateral)
4. Opcionalmente indica nombre / ciudad
5. **Enviar pedido por WhatsApp** abre `wa.me` con mensaje prellenado

Mensaje armado en [`buildWhatsAppOrder.ts`](../src/features/catalog/buildWhatsAppOrder.ts). El número sale de `countries.whatsapp_url` o fallback en `SOCIAL_LINKS`.

## UI pública (archivos clave)

| Archivo | Rol |
| --- | --- |
| `CatalogPage.tsx` | Página completa: búsqueda, filtros, grid, carrito |
| `ProductCard.tsx` | Card de producto |
| `ProductDetailSheet.tsx` | Modal detalle + galería |
| `OrderSheet.tsx` | Invoice / carrito → WhatsApp |

## Admin catálogos (preview)

Ruta: `/admin/catalogs`

Vista de solo lectura de los packs TypeScript. Para cambiar productos, edita el pack correspondiente y redeploya.

Ver también [ADMIN.md](./ADMIN.md).

## Extender a otro país

1. Exportar CSV Shopify del país
2. Generar `src/features/catalog/<pais>-products.ts`
3. Registrar en `product-registry.ts` bajo el código ISO
4. Añadir meta en `catalog-meta.ts` (slug, moneda, locale)
5. La ruta dinámica `/$slug/catalogo` ya resuelve por slug
