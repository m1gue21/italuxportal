CREATE TYPE public.country_button_variant AS ENUM ('gold', 'light');

ALTER TABLE public.countries
  ADD COLUMN button_variant public.country_button_variant NOT NULL DEFAULT 'gold';

COMMENT ON COLUMN public.countries.button_variant IS 'Estilo visual de los botones de contacto: dorado o blanco.';
