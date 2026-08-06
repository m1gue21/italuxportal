## Objetivo
Agregar un panel administrativo privado para gestionar dinámicamente los países de ITALUX, sin cambiar el diseño visual actual de la landing.

## Stack
- **Lovable Cloud** (Supabase administrado) para base de datos + autenticación.
- Login email/password para administradores (los visitantes públicos NO necesitan cuenta).
- Roles en tabla `user_roles` (admin) + función `has_role` para evitar escalada de privilegios.

## Base de datos
Tabla `countries` (pública para lectura de filas activas, escritura sólo admins):
- `id` uuid PK
- `code` text único (ISO, ej. "CO")
- `name` text
- `flag` text (emoji)
- `whatsapp_url` text
- `website_url` text
- `is_active` boolean (default true)
- `show_on_map` boolean (default true)
- `map_x` numeric, `map_y` numeric (coordenadas en el mapa)
- `label_side` text ('left' | 'right')
- `display_order` int
- `created_at` timestamptz

Tabla `user_roles` + enum `app_role` ('admin') + función `has_role` (security definer).

RLS:
- `countries`: SELECT público sólo a filas con `is_active = true`; SELECT/INSERT/UPDATE/DELETE completo a admins.
- `user_roles`: SELECT al propio usuario; gestión sólo a admins.

Seed: insertar los 8 países actuales con sus coordenadas existentes.

## Frontend público (sin cambios visuales)
- `MapSection.tsx` y `CountriesSection.tsx` leen los países desde Supabase con TanStack Query (publishable key, SSR-safe).
- Filtran por `is_active` y, para el mapa, también por `show_on_map`.
- Diseño, tipografías, colores y layout idénticos a lo actual.

## Panel administrativo
Rutas bajo `/_authenticated/admin/`:
- `/auth` — login email/password (público).
- `/admin` — listado de países con drag & drop para reordenar (dnd-kit), toggles para `is_active` y `show_on_map`, editar/eliminar.
- Modal/form para crear y editar con validación Zod:
  - WhatsApp: debe ser URL válida `https://wa.me/...`
  - Website: URL válida `https://...`
  - Código ISO: 2 letras mayúsculas
  - Coordenadas mapa 0–100
- Confirmación antes de eliminar (AlertDialog).
- Sólo accesible si el usuario tiene rol `admin` (gate adicional dentro del layout).

## Server functions
- `listPublicCountries` (público, publishable key) — para la landing.
- `listAllCountries`, `createCountry`, `updateCountry`, `deleteCountry`, `reorderCountries` — protegidos con `requireSupabaseAuth` + check `has_role(admin)`.

## Bootstrapping de admin
Después del primer signup, el usuario debe ejecutar una sentencia SQL (o usar un botón "convertirme en admin" si no existe ningún admin todavía) para asignarse el rol. Documentaré el paso.

## Detalles técnicos
- Drag & drop: `@dnd-kit/core` + `@dnd-kit/sortable`.
- Invalidación de queries tras cada mutación para refrescar landing y panel.
- Mantener el componente `Hero` y demás secciones tal cual.

## Entregables
1. Migración SQL (tabla, roles, RLS, grants, seed).
2. Server functions en `src/lib/countries.functions.ts`.
3. Hooks y queries compartidos.
4. Refactor de `MapSection` y `CountriesSection` para leer de Supabase (mismo diseño).
5. Rutas: `/auth`, `/_authenticated/admin` con CRUD + drag & drop.
6. Validaciones Zod y confirmaciones.

¿Apruebas para implementar?