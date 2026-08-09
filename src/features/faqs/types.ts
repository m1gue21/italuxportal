import { z } from "zod";

export type FaqRow = {
  id: string;
  pregunta: string;
  respuesta: string;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
};

export const faqSchema = z.object({
  pregunta: z.string().trim().min(1, "La pregunta es obligatoria").max(300),
  respuesta: z.string().trim().min(1, "La respuesta es obligatoria").max(1500),
  activo: z.boolean(),
  orden: z.coerce.number().int().min(0),
});

export type FaqInput = z.infer<typeof faqSchema>;
