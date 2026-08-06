import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FaqRow } from "./types";

export const publicFaqsQuery = queryOptions({
  queryKey: ["faqs", "public"],
  queryFn: async (): Promise<FaqRow[]> => {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("activo", true)
      .order("orden", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 30_000,
});

export const adminFaqsQuery = queryOptions({
  queryKey: ["faqs", "admin"],
  queryFn: async (): Promise<FaqRow[]> => {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("orden", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 0,
});
