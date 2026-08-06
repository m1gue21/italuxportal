CREATE OR REPLACE FUNCTION public.has_any_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE role = 'admin'::public.app_role
  )
$$;

REVOKE ALL ON FUNCTION public.has_any_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_any_admin() TO authenticated;

DROP POLICY IF EXISTS "Bootstrap first admin" ON public.user_roles;

CREATE POLICY "Bootstrap first admin"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'admin'::public.app_role
  AND NOT public.has_any_admin()
);