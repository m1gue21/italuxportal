# Panel de administración

## Acceso actual (bypass)

Por ahora el login con usuario/contraseña de Supabase está **desactivado**.

Flag: [`src/features/admin/auth-bypass.ts`](../src/features/admin/auth-bypass.ts)

```ts
export const ADMIN_AUTH_BYPASS = true;
```

Con `true`:

- `/admin` y subrutas abren sin sesión
- `/auth` redirige al admin

Para reactivar autenticación Supabase: poner `ADMIN_AUTH_BYPASS = false`.

## Rutas del admin

| Ruta | Contenido |
| --- | --- |
| `/admin` | Países (CRUD + orden + mapa) |
| `/admin/catalogs` | Gestor de catálogos (demo local) |
| `/admin/faqs` | Preguntas frecuentes |
| `/admin/benefits` | Beneficios / “promesa de la maison” |
| `/admin/wholesale` | Textos sección mayoreo |
| `/admin/hero` | Portada |
| `/admin/footer` | Pie y redes |

Navegación compartida: [`AdminNav`](../src/features/admin/AdminNav.tsx).

## Qué usa Supabase vs qué es local

| Área | Persistencia |
| --- | --- |
| Países, FAQs, benefits, section texts | Supabase (requiere `.env` válido) |
| Catálogos / productos del gestor | `localStorage` (demo) |
| Catálogo público Chile | Código estático (`chile-products.ts`) |

Sin acceso a Supabase, las secciones CMS pueden fallar al cargar/guardar; el **gestor de catálogos** sigue usable en local.

## Gestor de catálogos

Documentado en detalle en [CATALOGO.md](./CATALOGO.md).

Resumen de UX:

1. Lista de países / catálogos
2. **Gestionar** → tabs Productos / Configuración
3. Seleccionar productos → **Edición masiva** (tabla editable)
4. Botón ↻ restablece la demo local

## Auth histórica (cuando se reactive)

1. Ir a `/auth`
2. Crear cuenta o iniciar sesión (Supabase Auth)
3. Rol `admin` en tabla `user_roles`
4. Si no hay admin, bootstrap “Convertirme en administrador” (según políticas RLS del proyecto)

Migraciones en `supabase/migrations/`.
