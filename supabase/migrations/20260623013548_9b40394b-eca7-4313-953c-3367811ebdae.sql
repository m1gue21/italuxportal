
-- 1) Remove privilege-escalation policy on user_roles
DROP POLICY IF EXISTS "Bootstrap first admin" ON public.user_roles;

-- 2) Null out any base64/data-URL images stored in section_texts so large
-- binary blobs are no longer served publicly. Users can re-upload via Storage.
UPDATE public.section_texts
SET bg_image_url = NULL
WHERE bg_image_url LIKE 'data:%';
