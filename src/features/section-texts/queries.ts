import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type SectionTextRow = Tables<"section_texts">;

export const sectionTextQuery = (key: string) =>
  queryOptions({
    queryKey: ["section_texts", key],
    queryFn: async (): Promise<SectionTextRow | null> => {
      const { data, error } = await supabase
        .from("section_texts")
        .select("*")
        .eq("section_key", key)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
