import { queryOptions } from "@tanstack/react-query";
import { listCountries } from "@/features/cms/cms-data";
import type { CountryRow } from "./types";

export const publicCountriesQuery = queryOptions({
  queryKey: ["countries", "public"],
  queryFn: async (): Promise<CountryRow[]> => listCountries({ activeOnly: true }),
  staleTime: 30_000,
});

export const adminCountriesQuery = queryOptions({
  queryKey: ["countries", "admin"],
  queryFn: async (): Promise<CountryRow[]> => listCountries(),
  staleTime: 0,
});
