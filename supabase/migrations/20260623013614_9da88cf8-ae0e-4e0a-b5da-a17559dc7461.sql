
CREATE POLICY "Public read section backgrounds"
ON storage.objects FOR SELECT
USING (bucket_id = 'section-backgrounds');

CREATE POLICY "Admins upload section backgrounds"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'section-backgrounds' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins update section backgrounds"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'section-backgrounds' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins delete section backgrounds"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'section-backgrounds' AND private.has_role(auth.uid(), 'admin'::public.app_role));
