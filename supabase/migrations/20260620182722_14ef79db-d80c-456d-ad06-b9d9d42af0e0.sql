ALTER TABLE public.section_texts
  ADD COLUMN IF NOT EXISTS bg_image_url text,
  ADD COLUMN IF NOT EXISTS bg_opacity numeric;

INSERT INTO public.section_texts (section_key, eyebrow, title, bg_opacity)
VALUES ('hero', NULL, 'Hero', 30)
ON CONFLICT (section_key) DO NOTHING;