
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta text NOT NULL CHECK (length(btrim(pregunta)) > 0),
  respuesta text NOT NULL CHECK (length(btrim(respuesta)) > 0),
  activo boolean NOT NULL DEFAULT true,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active faqs" ON public.faqs
  FOR SELECT TO anon USING (activo = true);

CREATE POLICY "Auth reads faqs" ON public.faqs
  FOR SELECT TO authenticated
  USING (activo = true OR private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins insert faqs" ON public.faqs
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins update faqs" ON public.faqs
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins delete faqs" ON public.faqs
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER faqs_set_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX faqs_orden_idx ON public.faqs (orden);

INSERT INTO public.faqs (pregunta, respuesta, orden) VALUES
('¿Cuánto tarda en llegar mi pedido?', 'Los envíos nacionales llegan entre 2 y 5 días hábiles. Los envíos internacionales se coordinan por WhatsApp con el distribuidor oficial de tu país.', 1),
('¿Las joyas tienen garantía?', 'Sí. Todas nuestras piezas cuentan con garantía de por vida sobre el Oro Laminado 18K Premium contra defectos de fabricación.', 2),
('¿El Oro Laminado 18K pierde el color?', 'No. Nuestra capa de Oro Laminado 18K Premium conserva su brillo y color con el cuidado básico recomendado. Evita químicos fuertes y perfumes directos.', 3),
('¿Puedo comprar por WhatsApp?', 'Sí. Cada país cuenta con atención personalizada por WhatsApp con su distribuidor oficial. Selecciona tu país en la sección de países.', 4),
('¿Realizan envíos seguros?', 'Sí. Todos los envíos son asegurados, empacados discretamente y con número de seguimiento desde el momento del despacho.', 5),
('¿Puedo comprar al por mayor?', 'Sí. Contamos con un programa exclusivo para mayoristas y revendedores. Solicita información en la sección "Venta al por mayor".', 6);
