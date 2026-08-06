CREATE TABLE IF NOT EXISTS public.admin_bootstrap (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  claimed_at timestamp with time zone NOT NULL DEFAULT now(),
  claimed_by uuid NOT NULL
);

GRANT SELECT ON public.admin_bootstrap TO authenticated;
GRANT ALL ON public.admin_bootstrap TO service_role;

ALTER TABLE public.admin_bootstrap ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated reads admin bootstrap" ON public.admin_bootstrap;
CREATE POLICY "Authenticated reads admin bootstrap"
ON public.admin_bootstrap
FOR SELECT
TO authenticated
USING (true);

INSERT INTO public.admin_bootstrap (id, claimed_at, claimed_by)
SELECT true, now(), user_id
FROM public.user_roles
WHERE role = 'admin'::public.app_role
LIMIT 1
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.lock_admin_bootstrap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin'::public.app_role THEN
    INSERT INTO public.admin_bootstrap (id, claimed_at, claimed_by)
    VALUES (true, now(), NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.lock_admin_bootstrap() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS lock_admin_bootstrap_after_role_insert ON public.user_roles;
CREATE TRIGGER lock_admin_bootstrap_after_role_insert
AFTER INSERT ON public.user_roles
FOR EACH ROW
WHEN (NEW.role = 'admin'::public.app_role)
EXECUTE FUNCTION public.lock_admin_bootstrap();

DROP POLICY IF EXISTS "Bootstrap first admin" ON public.user_roles;
CREATE POLICY "Bootstrap first admin"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'admin'::public.app_role
  AND NOT EXISTS (SELECT 1 FROM public.admin_bootstrap WHERE id = true)
);

DROP FUNCTION IF EXISTS public.has_any_admin();