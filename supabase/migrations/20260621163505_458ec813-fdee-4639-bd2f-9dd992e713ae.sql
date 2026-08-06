ALTER TABLE public.section_texts
  ADD COLUMN IF NOT EXISTS link2_label text,
  ADD COLUMN IF NOT EXISTS link2_url text,
  ADD COLUMN IF NOT EXISTS social_instagram text,
  ADD COLUMN IF NOT EXISTS social_tiktok text,
  ADD COLUMN IF NOT EXISTS social_facebook text,
  ADD COLUMN IF NOT EXISTS social_whatsapp text;