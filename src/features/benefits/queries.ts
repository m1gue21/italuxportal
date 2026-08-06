import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BenefitRow } from "./types";

export const publicBenefitsQuery = queryOptions({
  queryKey: ["benefits", "public"],
  queryFn: async (): Promise<BenefitRow[]> => {
    const { data, error } = await supabase
      .from("benefits")
      .select("*")
      .eq("activo", true)
      .order("orden", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 30_000,
});

export const adminBenefitsQuery = queryOptions({
  queryKey: ["benefits", "admin"],
  queryFn: async (): Promise<BenefitRow[]> => {
    const { data, error } = await supabase
      .from("benefits")
      .select("*")
      .order("orden", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 0,
});
