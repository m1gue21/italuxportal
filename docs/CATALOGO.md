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

| Rol | De dónde sale |
| --- | --- |
| Sugerido | `retailPrice` del producto (precio de venta sugerido, sin tachar) |
| Mayorista | `mayoristaPrice` del pack — tabla de precios del país |
| Empresario | `empresarioPrice` del pack; si falta, `mayorista × (1 − 0.30)` |

Los países con tabla de precios traen mayorista y empresario por producto, así
que no se calcula ningún porcentaje. Los que todavía no la tienen caen en el
fallback: mayorista provisional (`retail × 0.70`) y empresario −30%, y la UI
muestra el porcentaje junto al rol.

### Actualizar precios desde la tabla del país

```bash
npm run prices:apply -- <tabla.xlsx> src/features/catalog/<pais>-products.ts
npm run prices:apply -- <tabla.xlsx> src/features/catalog/<pais>-products.ts -- --apply
```

Sin `--apply` solo imprime el informe: cuántos productos cruzan por SKU, cuáles
quedan dudosos (no se tocan) y cuáles se quedan sin precio real. Para monedas con
decimales (USD/EUR) añade `--round 2`.

La hoja necesita encabezados `NOMBRE PRODUCTO`, `MAYORISTA` (o `MAYORITA`) y
`EMPRESARIO`; `SKU` y `DETAL SUGERIDO` son opcionales pero mejoran el cruce
(el SKU) y actualizan el sugerido.

Hoy solo Colombia tiene tabla: [`precios-inversionistas-colombia.xlsx`](../precios-inversionistas-colombia.xlsx).

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

Desde la raíz del proyecto:

```bash
npm run generate:packs
```

Corre [`scripts/generate-packs-from-shopify.py`](../scripts/generate-packs-from-shopify.py):
agrupa por `Handle`, filtra `Status=active` y junta los `Image Src` en `galleryUrls`.

Solo se incluyen productos con título y `Status === active`.

## Pedido → WhatsApp

Estado del carrito: [`useOrderCart`](../src/features/catalog/useOrderCart.ts) (persistido en `localStorage` por país).

Flujo:

1. Usuario elige rol (Mayorista / Empresario)
2. Agrega productos (card o detalle)
3. Abre **Tu pedido** (panel lateral)
4. Llena los datos del comprador: nombre, ciudad, C.C./NIT y teléfono, los cuatro obligatorios
5. **Enviar pedido por WhatsApp** genera el PDF del pedido y lo comparte

### El PDF

[`buildOrderPdf.ts`](../src/features/catalog/buildOrderPdf.ts) arma una remisión en
A4 con jsPDF: cabecera con número, fecha y rol, datos del comprador, tabla
`Ref · Cant · Descripción · [rol] · Detal · Subtotal`, total del pedido y un
resumen con unidades, total a precio detal y total del rol. `jspdf` entra por
import dinámico, así que solo se descarga cuando alguien abre su pedido.

### Cómo llega a WhatsApp

Un link de `wa.me` solo transporta texto: no existe forma de adjuntar un archivo a
un número concreto desde la web. La hoja de compartir sí adjunta el PDF, pero deja
que el usuario elija el contacto, así que no sirve para que llegue siempre al asesor.

Por eso el pedido viaja **dentro del link**:
[`orderLink.ts`](../src/features/catalog/orderLink.ts) codifica el pedido en base64url
y lo mete en el fragmento de una URL a `/pedido`. El botón principal abre `wa.me` con
el número del asesor y el mensaje ya escrito, incluido ese link. El asesor lo toca,
ve el invoice en [`/pedido`](../src/routes/pedido.tsx) y descarga el PDF desde ahí.

Como va en el fragmento (`#`), el pedido nunca llega al servidor ni queda en logs, y
no hace falta base de datos ni almacenamiento. Un pedido de 20 líneas ocupa ~1.200
caracteres de URL.

El botón secundario **Compartir el PDF** sigue usando
[`shareOrderPdf.ts`](../src/features/catalog/shareOrderPdf.ts) (`navigator.share` con
`files`) para quien prefiera mandar el archivo adjunto eligiendo el contacto; en
escritorio simplemente lo descarga. `navigator.share` exige el gesto del usuario y en
iOS caduca si se espera a generar el archivo, así que el PDF se construye por
adelantado (con debounce) mientras el panel está abierto.

Mensaje de texto armado en [`buildWhatsAppOrder.ts`](../src/features/catalog/buildWhatsAppOrder.ts).
El número sale de `countries.whatsapp_url` o fallback en `SOCIAL_LINKS`.

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
