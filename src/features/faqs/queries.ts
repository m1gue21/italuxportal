import { queryOptions } from "@tanstack/react-query";
import { listFaqs } from "@/features/cms/cms-data";
import type { FaqRow } from "./types";

export const publicFaqsQuery = queryOptions({
  queryKey: ["faqs", "public"],
  queryFn: async (): Promise<FaqRow[]> => listFaqs({ activeOnly: true }),
  staleTime: 30_000,
});

export const adminFaqsQuery = queryOptions({
  queryKey: ["faqs", "admin"],
  queryFn: async (): Promise<FaqRow[]> => listFaqs(),
  staleTime: 0,
});
