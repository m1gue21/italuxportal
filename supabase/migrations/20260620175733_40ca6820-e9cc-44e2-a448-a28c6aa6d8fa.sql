
CREATE TABLE public.section_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  eyebrow text,
  title text,
  subtitle text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.section_texts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.section_texts TO authenticated;
GRANT ALL ON public.section_texts TO service_role;

ALTER TABLE public.section_texts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read section texts"
  ON public.section_texts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert section texts"
  ON public.section_texts FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update section texts"
  ON public.section_texts FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete section texts"
  ON public.section_texts FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER section_texts_set_updated_at
  BEFORE UPDATE ON public.section_texts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.section_texts (section_key, eyebrow, title) VALUES
  ('benefits', '¿Por qué ITALUX?', 'La promesa de la maison');
