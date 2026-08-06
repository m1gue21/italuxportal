
ALTER TABLE public.countries
  ADD COLUMN IF NOT EXISTS subtitle text DEFAULT 'Presencia Oficial',
  ADD COLUMN IF NOT EXISTS show_subtitle boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS whatsapp_label text DEFAULT 'WhatsApp',
  ADD COLUMN IF NOT EXISTS whatsapp_icon text DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS website_label text DEFAULT 'Página Web',
  ADD COLUMN IF NOT EXISTS website_icon text DEFAULT 'Globe',
  ADD COLUMN IF NOT EXISTS addresses jsonb NOT NULL DEFAULT '[]'::jsonb;
