# Contribuir

## Flujo básico

1. Crea una rama desde `main`
2. Haz cambios pequeños y claros
3. Verifica localmente:

```bash
npm run lint
npm run build
```

4. Abre un PR hacia `main` con descripción de **qué** y **por qué**

## Convenciones

- **Rutas:** solo en `src/routes/` (TanStack file routing). No crear `pages/`.
- **Features:** lógica de dominio en `src/features/<dominio>/`.
- **UI genérica:** `src/components/ui/`.
- **Estilos:** reutilizar tokens gold/oscuro de `src/styles.css`.
- **Secretos:** nunca commitear `.env`.

## Catálogo y CMS

- Productos viven en packs `*-products.ts` (generados desde CSV) y se registran en `product-registry.ts`.
- Contenido CMS (países, FAQs, benefits, secciones) en `src/features/cms/defaults.ts`.
- El admin es solo preview; no hay mutaciones ni backend.
- Documenta cambios de dominio en `docs/CATALOGO.md` / `docs/ADMIN.md`.

## Commits

Mensajes cortos en español o inglés, enfocados en el *porqué*:

```
feat(catalog): edición masiva tipo sheet en admin
fix(map): pines alineados a proyección LatAm
docs: README y guía de catálogo
```
