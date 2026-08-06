import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CountryRow } from "./types";

export const publicCountriesQuery = queryOptions({
  queryKey: ["countries", "public"],
  queryFn: async (): Promise<CountryRow[]> => {
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as CountryRow[];
  },
  staleTime: 30_000,
});

export const adminCountriesQuery = queryOptions({
  queryKey: ["countries", "admin"],
  queryFn: async (): Promise<CountryRow[]> => {
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as CountryRow[];
  },
  staleTime: 0,
});
