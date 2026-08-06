DROP POLICY IF EXISTS "Authenticated reads admin bootstrap" ON public.admin_bootstrap;

CREATE POLICY "Admins read admin bootstrap"
ON public.admin_bootstrap
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.admin_bootstrap_claimed()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_bootstrap WHERE id = true)
$$;

REVOKE ALL ON FUNCTION public.admin_bootstrap_claimed() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_bootstrap_claimed() TO anon, authenticated;