import { useQuery } from "@tanstack/react-query";
import { publicCountriesQuery } from "@/features/countries/queries";
import { CountryCard } from "@/features/countries/CountryCard";

export function CountriesSection() {
  const { data: countries = [] } = useQuery(publicCountriesQuery);

  return (
    <section id="paises" className="relative bg-background px-6 pt-2 pb-8">
      <div className="mx-auto grid max-w-md gap-2.5">
        {countries.map((country) => (
          <CountryCard key={country.id} country={country} />
        ))}
      </div>
    </section>
  );
}
