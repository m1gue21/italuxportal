ALTER TABLE public.benefits 
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS image_opacity numeric NOT NULL DEFAULT 0.2 CHECK (image_opacity >= 0 AND image_opacity <= 1);

DROP POLICY IF EXISTS "Public can read benefit images" ON storage.objects;
CREATE POLICY "Public can read benefit images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'benefit-images');

DROP POLICY IF EXISTS "Admins can upload benefit images" ON storage.objects;
CREATE POLICY "Admins can upload benefit images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'benefit-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can update benefit images" ON storage.objects;
CREATE POLICY "Admins can update benefit images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'benefit-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete benefit images" ON storage.objects;
CREATE POLICY "Admins can delete benefit images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'benefit-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));
