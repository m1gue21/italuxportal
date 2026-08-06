
ALTER TABLE public.section_texts
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS cta_url text;

INSERT INTO public.section_texts (section_key, eyebrow, title, subtitle, cta_label, cta_url)
VALUES (
  'wholesale',
  'Venta al por Mayor',
  '¿Quieres ser distribuidor?',
  'Únete a la red oficial ITALUX y lleva la marca a tu ciudad.',
  'Contactar un asesor',
  NULL
)
ON CONFLICT (section_key) DO NOTHING;
