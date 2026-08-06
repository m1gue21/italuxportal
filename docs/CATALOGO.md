# Catálogo Inversionistas

Documentación del catálogo público y del gestor demo en admin.

## Objetivo

Permitir a **mayoristas** y **empresarios** explorar productos por país, comparar precios (retail / mayorista / empresario), armar un pedido y enviarlo por WhatsApp con un resumen tipo invoice.

Hoy solo **Chile** tiene pack de productos y ruta pública.

## Ruta pública

| URL | Descripción |
| --- | --- |
| `/chile/catalogo` | Catálogo Chile (activo) |

Entrada desde la landing: tarjeta del país **Chile** → botón **Catálogo Inversionistas** (`CountryCard` con `code === "CL"`).

## Precios

Definidos en [`src/features/catalog/pricing.ts`](../src/features/catalog/pricing.ts):

| Rol | Cálculo (defaults) |
| --- | --- |
| Retail | Precio del producto (tachado en UI) |
| Mayorista | `retail × (1 − 0.30)` → −30% |
| Empresario | `retail × (1 − 0.30 − 0.30)` → −60% |

Los porcentajes del **gestor admin** (demo local) se pueden editar por catálogo, pero la **tienda pública** de Chile usa hoy los defaults del código hasta conectar backend.

## Datos de productos (Chile)

Fuente: export Shopify `products_export_1 CHILE PRODDUCTOS.csv`.

Generados en código como:

- [`src/features/catalog/chile-products.ts`](../src/features/catalog/chile-products.ts) — array estático
- Registro: [`src/features/catalog/product-registry.ts`](../src/features/catalog/product-registry.ts)

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

Mensaje armado en [`buildWhatsAppOrder.ts`](../src/features/catalog/buildWhatsAppOrder.ts). El número sale de `countries.whatsapp_url` (Chile) o fallback en `SOCIAL_LINKS`.

## UI pública (archivos clave)

| Archivo | Rol |
| --- | --- |
| `CatalogPage.tsx` | Página completa: búsqueda, filtros, grid, carrito |
| `ProductCard.tsx` | Card de producto |
| `ProductDetailSheet.tsx` | Modal detalle + galería |
| `OrderSheet.tsx` | Invoice / carrito → WhatsApp |

## Gestor admin (demo local)

Ruta: `/admin/catalogs`

**No usa Supabase.** Estado en `localStorage` (`italux-admin-catalogs-demo`).

Capacidades:

- Listar catálogos por país (Chile con productos; otros como plantilla)
- Activar / desactivar (solo demo)
- Configurar título, slug, descuentos (demo)
- CRUD de productos
- **Edición masiva** tipo hoja de cálculo (selección múltiple)

Ver también [ADMIN.md](./ADMIN.md).

## Extender a otro país

1. Exportar CSV Shopify del país
2. Generar `src/features/catalog/<pais>-products.ts`
3. Registrar en `product-registry.ts` bajo el código ISO
4. En `CountryCard`, mostrar el botón para ese `code` (hoy hardcodeado a `CL`)
5. Crear ruta `src/routes/<slug>.catalogo.tsx` o una ruta dinámica `/$slug/catalogo`

Cuando haya backend, reemplazar el hardcode por tabla tipo `investor_catalogs` + productos en DB.
