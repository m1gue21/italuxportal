GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT ON public.admin_bootstrap TO authenticated;
GRANT ALL ON public.admin_bootstrap TO service_role;