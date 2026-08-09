import { queryOptions } from "@tanstack/react-query";
import { getSectionText } from "@/features/cms/cms-data";
import type { SectionTextRow } from "@/features/cms/types";

export type { SectionTextRow };

export const sectionTextQuery = (key: string) =>
  queryOptions({
    queryKey: ["section_texts", key],
    queryFn: async (): Promise<SectionTextRow | null> => getSectionText(key),
    staleTime: 30_000,
  });
