import { useQuery } from "@tanstack/react-query";
import { publicCountriesQuery } from "@/features/countries/queries";
import { CountryCard } from "@/features/countries/CountryCard";

export function CountriesSection() {
  const { data: countries = [] } = useQuery(publicCountriesQuery);

  return (
    <section id="paises" className="relative bg-background px-6 pt-4 pb-8">
      <div className="mx-auto mb-8 max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-gold">Presencia</p>
        <h2 className="font-display mt-3 text-[2rem] font-normal leading-tight tracking-wide text-foreground">
          Elige tu país y revisa precios
        </h2>
        <div className="mx-auto mt-5 h-px w-14 bg-gold/60" />
        <p className="mt-5 text-[14px] leading-relaxed text-muted-foreground">
          Accede al catálogo de inversionistas o contacta al equipo oficial de tu país.
        </p>
      </div>

      <div className="mx-auto grid max-w-md gap-2.5">
        {countries.map((country) => (
          <CountryCard key={country.id} country={country} />
        ))}
      </div>
    </section>
  );
}
