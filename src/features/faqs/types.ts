import { z } from "zod";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type FaqRow = Tables<"faqs">;
export type FaqInsert = TablesInsert<"faqs">;

export const faqSchema = z.object({
  pregunta: z.string().trim().min(1, "La pregunta es obligatoria").max(300),
  respuesta: z.string().trim().min(1, "La respuesta es obligatoria").max(1500),
  activo: z.boolean(),
  orden: z.coerce.number().int().min(0),
});

export type FaqInput = z.infer<typeof faqSchema>;
