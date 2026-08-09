# ITALUX Portal

Portal internacional de **ITALUX Joyería**: landing multi-país, mapa de presencia en Latinoamérica, CMS en TypeScript y **Catálogo Inversionistas** (multi-país) para mayoristas y empresarios.

Repositorio: [github.com/m1gue21/italuxportal](https://github.com/m1gue21/italuxportal)

---

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) + React 19 |
| Routing | TanStack Router (file-based en `src/routes/`) |
| Data fetching | TanStack Query |
| Estilos | Tailwind CSS 4 + design tokens gold/oscuro |
| UI | Radix / shadcn-style (`src/components/ui/`) |
| CMS / contenido | TypeScript estático (`src/features/cms/defaults.ts`) |
| Catálogo público | Packs TypeScript por país (`*-products.ts`) |
| Admin | Vista previa de solo lectura |

---

## Requisitos

- Node.js 20+ (recomendado)
- npm (o bun; el repo incluye `bun.lock`)

No se requiere backend ni cuenta externa para CMS o catálogo.

---

## Inicio rápido

```bash
# 1. Clonar
git clone https://github.com/m1gue21/italuxportal.git
cd italuxportal

# 2. Dependencias
npm install

# 3. Desarrollo
npm run dev
```

App en **http://localhost:8080** (puerto según Vite/config del proyecto).

### Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## Estructura del proyecto

```
italuxportal/
├── docs/                    # Documentación de dominio
│   ├── ADMIN.md
│   └── CATALOGO.md
├── src/
│   ├── components/ui/       # Primitivos UI
│   ├── features/
│   │   ├── admin/           # Panel admin (preview)
│   │   ├── catalog/         # Catálogo público + precios/pedido
│   │   ├── cms/             # defaults.ts + cms-data.ts
│   │   ├── countries/       # Países + CountryCard
│   │   ├── landing/         # Hero, mapa, benefits, FAQ, footer…
│   │   ├── benefits/
│   │   ├── faqs/
│   │   └── section-texts/
│   ├── routes/              # File-based routes (TanStack)
│   └── styles.css           # Tokens de marca (gold, fondos)
├── .env.example
└── package.json
```

Convenciones de rutas: ver [`src/routes/README.md`](src/routes/README.md).

---

## Funcionalidades

### Landing (`/`)

1. **Hero** — marca ITALUX + CTA a países  
2. **Mapa** — Latinoamérica geográfica (SVG Natural Earth), pines gold  
3. **Países** — acordeón con WhatsApp, web y catálogo cuando hay pack  
4. **Beneficios**, **Mayoreo**, **FAQ**, **Footer** — desde `defaults.ts`  

### Catálogo Inversionistas (`/$slug/catalogo`)

Países con pack: Chile, Colombia, Ecuador, España (`/chile/catalogo`, `/colombia/catalogo`, `/ecuador/catalogo`, `/espana/catalogo`).

- Grid de productos con imágenes Shopify CDN  
- Búsqueda y filtros por categoría  
- Precios retail (tachado), mayorista (−30%) y empresario (−60%)  
- Carrito / invoice → mensaje WhatsApp  

Detalle: **[docs/CATALOGO.md](docs/CATALOGO.md)**

### Admin (`/admin`)

Vista previa del contenido estático (países, FAQs, benefits, secciones, catálogos). Para cambiar datos, edita los archivos TS indicados en la UI / docs.

Detalle: **[docs/ADMIN.md](docs/ADMIN.md)**

---

## Variables de entorno

No hay variables obligatorias. `.env.example` es un placeholder; no subas secretos a git.

---

## Diseño / marca

- Fondo oscuro cálido (`oklch`)  
- Acentos **gold** (`--gold`, `--gold-light`, `--gold-deep`)  
- Display: Cormorant Garamond · Body: Inter  
- Landing mobile-first (`max-w-md` en secciones clave); catálogo más ancho en desktop  

Tokens en [`src/styles.css`](src/styles.css).

---

## Datos del catálogo

Los productos activos del CSV se materializan en packs bajo `src/features/catalog/*-products.ts`.

Para actualizar:

1. Reemplazar / actualizar el CSV Shopify  
2. Regenerar el TS (ver [docs/CATALOGO.md](docs/CATALOGO.md))  
3. Verificar las rutas `/$slug/catalogo`  

---

## Roadmap sugerido

- [ ] Auth admin si el panel deja de ser solo preview  
- [ ] Más países (MX, PE, …) con sus CSV  
- [ ] PDF / email de invoice (hoy solo WhatsApp)  

---

## Seguridad

- No subir `.env` ni claves de servicio  
- El panel `/admin` es público (solo lectura del seed); no expone mutaciones remotas  

---

## Licencia / uso

Proyecto privado de ITALUX / Monarch. Uso interno salvo indicación contraria.

---

## Documentación adicional

| Doc | Contenido |
| --- | --- |
| [docs/CATALOGO.md](docs/CATALOGO.md) | Catálogo público, precios, WhatsApp, extensión multi-país |
| [docs/ADMIN.md](docs/ADMIN.md) | Panel admin preview y dónde editar en código |
| [src/routes/README.md](src/routes/README.md) | Convenciones TanStack Router |
