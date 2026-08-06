ALTER TABLE public.section_texts
  ADD COLUMN IF NOT EXISTS show_social_instagram boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_social_tiktok boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_social_facebook boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_social_whatsapp boolean NOT NULL DEFAULT true;