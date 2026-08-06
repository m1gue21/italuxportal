ALTER TABLE public.section_texts ADD COLUMN IF NOT EXISTS cta_icon text;
UPDATE public.section_texts SET cta_icon = 'whatsapp' WHERE section_key = 'wholesale' AND cta_icon IS NULL;