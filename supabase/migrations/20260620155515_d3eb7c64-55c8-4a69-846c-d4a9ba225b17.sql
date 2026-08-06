
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bootstrap: allow the very first user to claim admin (only when no admin exists)
CREATE POLICY "Bootstrap first admin" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'admin'
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
  );

-- Countries
CREATE TABLE public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  flag text NOT NULL,
  whatsapp_url text NOT NULL,
  website_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  show_on_map boolean NOT NULL DEFAULT true,
  map_x numeric NOT NULL DEFAULT 50,
  map_y numeric NOT NULL DEFAULT 50,
  label_side text NOT NULL DEFAULT 'right' CHECK (label_side IN ('left','right')),
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.countries TO anon;
GRANT SELECT ON public.countries TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.countries TO authenticated;
GRANT ALL ON public.countries TO service_role;

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active countries" ON public.countries
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Auth reads active countries" ON public.countries
  FOR SELECT TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert countries" ON public.countries
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update countries" ON public.countries
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete countries" ON public.countries
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER countries_set_updated_at
BEFORE UPDATE ON public.countries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed initial countries
INSERT INTO public.countries (code, name, flag, whatsapp_url, website_url, map_x, map_y, label_side, display_order) VALUES
('CO','Colombia','🇨🇴','https://wa.me/573000000000','https://italuxjoyeria.com/co',44,46,'right',1),
('EC','Ecuador','🇪🇨','https://wa.me/593000000000','https://italuxjoyeria.com/ec',38,54,'left',2),
('CL','Chile','🇨🇱','https://wa.me/56000000000','https://italuxjoyeria.com/cl',46,84,'right',3),
('PE','Perú','🇵🇪','https://wa.me/51000000000','https://italuxjoyeria.com/pe',42,64,'right',4),
('MX','México','🇲🇽','https://wa.me/52000000000','https://italuxjoyeria.com/mx',22,18,'left',5),
('GT','Guatemala','🇬🇹','https://wa.me/502000000000','https://italuxjoyeria.com/gt',28,28,'left',6),
('CR','Costa Rica','🇨🇷','https://wa.me/506000000000','https://italuxjoyeria.com/cr',34,36,'left',7),
('DO','República Dominicana','🇩🇴','https://wa.me/1809000000','https://italuxjoyeria.com/do',52,28,'right',8);
