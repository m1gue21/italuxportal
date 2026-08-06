
CREATE TABLE public.benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(btrim(title)) > 0),
  description text NOT NULL CHECK (length(btrim(description)) > 0),
  icon text NOT NULL DEFAULT 'Sparkles',
  activo boolean NOT NULL DEFAULT true,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.benefits TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.benefits TO authenticated;
GRANT ALL ON public.benefits TO service_role;

ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active benefits" ON public.benefits
  FOR SELECT TO anon USING (activo = true);
CREATE POLICY "Auth reads benefits" ON public.benefits
  FOR SELECT TO authenticated
  USING (activo = true OR private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins insert benefits" ON public.benefits
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update benefits" ON public.benefits
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete benefits" ON public.benefits
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER benefits_set_updated_at
  BEFORE UPDATE ON public.benefits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX benefits_orden_idx ON public.benefits (orden);

INSERT INTO public.benefits (title, description, icon, orden) VALUES
('Garantía de por vida', 'Respaldamos cada pieza para siempre.', 'ShieldCheck', 1),
('Oro Laminado 18K Premium', 'Materiales nobles y acabado impecable.', 'Gem', 2),
('Diseños exclusivos', 'Colecciones únicas, edición limitada.', 'Sparkles', 3),
('Envíos seguros', 'Llegamos a tu puerta con total tranquilidad.', 'Truck', 4);
