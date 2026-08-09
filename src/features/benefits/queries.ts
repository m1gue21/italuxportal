import { queryOptions } from "@tanstack/react-query";
import { listBenefits } from "@/features/cms/cms-data";
import type { BenefitRow } from "./types";

export const publicBenefitsQuery = queryOptions({
  queryKey: ["benefits", "public"],
  queryFn: async (): Promise<BenefitRow[]> => listBenefits({ activeOnly: true }),
  staleTime: 30_000,
});

export const adminBenefitsQuery = queryOptions({
  queryKey: ["benefits", "admin"],
  queryFn: async (): Promise<BenefitRow[]> => listBenefits(),
  staleTime: 0,
});
