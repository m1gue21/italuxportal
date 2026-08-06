ALTER TABLE public.section_texts
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS show_logo boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS social_instagram_icon text,
  ADD COLUMN IF NOT EXISTS social_tiktok_icon text,
  ADD COLUMN IF NOT EXISTS social_facebook_icon text,
  ADD COLUMN IF NOT EXISTS social_whatsapp_icon text;