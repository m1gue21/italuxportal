# ITALUX Portal

Portal internacional de **ITALUX Joyería**: landing multi-país, mapa de presencia en Latinoamérica, CMS admin y **Catálogo Inversionistas** (Chile) para mayoristas y empresarios.

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
| Backend / CMS | Supabase (países, FAQs, benefits, textos) |
| Catálogo público | Datos estáticos TypeScript (Chile) |
| Gestor catálogos | Demo local (`localStorage`) |

---

## Requisitos

- Node.js 20+ (recomendado)
- npm (o bun; el repo incluye `bun.lock`)
- Cuenta Supabase (opcional para CMS; el catálogo público y el gestor demo funcionan sin ella)

---

## Inicio rápido

```bash
# 1. Clonar
git clone https://github.com/m1gue21/italuxportal.git
cd italuxportal

# 2. Dependencias
npm install

# 3. Variables de entorno
cp .env.example .env
# Edita .env con tu proyecto Supabase (si vas a usar el CMS)

# 4. Desarrollo
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
│   │   ├── admin/           # Panel admin + gestor catálogos demo
│   │   ├── catalog/         # Catálogo público Chile + precios/pedido
│   │   ├── countries/       # Países + CountryCard
│   │   ├── landing/         # Hero, mapa, benefits, FAQ, footer…
│   │   ├── benefits/
│   │   ├── faqs/
│   │   └── section-texts/
│   ├── integrations/supabase/
│   ├── routes/              # File-based routes (TanStack)
│   └── styles.css           # Tokens de marca (gold, fondos)
├── supabase/migrations/     # SQL del CMS
├── products_export_1 CHILE PRODDUCTOS.csv
├── .env.example
└── package.json
```

Convenciones de rutas: ver [`src/routes/README.md`](src/routes/README.md).

---

## Funcionalidades

### Landing (`/`)

1. **Hero** — marca ITALUX + CTA a países  
2. **Mapa** — Latinoamérica geográfica (SVG Natural Earth), pines gold  
3. **Países** — acordeón con WhatsApp, web y (Chile) catálogo  
4. **Beneficios**, **Mayoreo**, **FAQ**, **Footer** — contenidos vía Supabase cuando está configurado  

### Catálogo Inversionistas Chile (`/chile/catalogo`)

- Grid de productos con imágenes Shopify CDN  
- Búsqueda y filtros por categoría  
- Precios retail (tachado), mayorista (−30%) y empresario (−60%)  
- Carrito / invoice → mensaje WhatsApp  

Detalle: **[docs/CATALOGO.md](docs/CATALOGO.md)**

### Admin (`/admin`)

- Gestión de países, FAQs, benefits, textos de secciones  
- **Gestionar catálogos** (demo): productos, configuración, edición masiva tipo sheet  

Detalle: **[docs/ADMIN.md](docs/ADMIN.md)**

> **Auth:** el login Supabase está en bypass (`ADMIN_AUTH_BYPASS = true`). Entra directo a `/admin`. Ver docs/ADMIN.md para reactivarlo.

---

## Variables de entorno

Copia `.env.example` → `.env`. Nunca commitees secretos.

| Variable | Uso |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública (anon) |
| `SUPABASE_*` | Equivalentes server-side |

El archivo `.env` está en `.gitignore`.

---

## Diseño / marca

- Fondo oscuro cálido (`oklch`)  
- Acentos **gold** (`--gold`, `--gold-light`, `--gold-deep`)  
- Display: Cormorant Garamond · Body: Inter  
- Landing mobile-first (`max-w-md` en secciones clave); catálogo más ancho en desktop  

Tokens en [`src/styles.css`](src/styles.css).

---

## Datos del catálogo Chile

Los productos activos del CSV se materializan en `src/features/catalog/chile-products.ts`.

Para actualizar:

1. Reemplazar / actualizar el CSV Shopify  
2. Regenerar el TS (ver [docs/CATALOGO.md](docs/CATALOGO.md))  
3. Verificar `/chile/catalogo`  

El gestor admin edita una **copia local** (localStorage); no modifica el archivo TS ni Supabase.

---

## Roadmap sugerido

- [ ] Conectar catálogos/productos a Supabase (o CMS)  
- [ ] Reactivar auth admin y roles  
- [ ] Catálogos por país (MX, CO, PE, …) con sus CSV  
- [ ] Sincronizar descuentos del admin con la tienda pública  
- [ ] PDF / email de invoice (hoy solo WhatsApp)  

---

## Seguridad

- No subir `.env`, claves de servicio ni `service_role`  
- La clave `publishable`/`anon` es pública por diseño; protege datos sensibles con RLS en Supabase  
- Con `ADMIN_AUTH_BYPASS = true` el panel admin es público: **solo para desarrollo**  

---

## Licencia / uso

Proyecto privado de ITALUX / Monarch. Uso interno salvo indicación contraria.

---

## Documentación adicional

| Doc | Contenido |
| --- | --- |
| [docs/CATALOGO.md](docs/CATALOGO.md) | Catálogo público, precios, WhatsApp, extensión multi-país |
| [docs/ADMIN.md](docs/ADMIN.md) | Panel admin, bypass auth, CMS vs demo |
| [src/routes/README.md](src/routes/README.md) | Convenciones TanStack Router |
