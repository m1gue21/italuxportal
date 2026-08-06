import { z } from "zod";

export type CountryRow = {
  id: string;
  code: string;
  name: string;
  flag: string;
  whatsapp_url: string;
  website_url: string;
  is_active: boolean;
  show_on_map: boolean;
  map_x: number;
  map_y: number;
  label_side: "left" | "right";
  display_order: number;
  subtitle: string | null;
  show_subtitle: boolean;
  whatsapp_label: string | null;
  whatsapp_icon: string | null;
  website_label: string | null;
  website_icon: string | null;
  button_variant: "gold" | "light";
  addresses: string[];
  created_at: string;
  updated_at: string;
};

export const countrySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[A-Z]{2,3}$/, "Código ISO en mayúsculas (2-3 letras)"),
  name: z.string().trim().min(1, "Nombre requerido").max(80),
  flag: z.string().trim().min(1, "Bandera requerida").max(8),
  whatsapp_url: z
    .string()
    .trim()
    .url("URL inválida")
    .refine((v) => /^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(v), {
      message: "Debe ser un enlace de WhatsApp (wa.me / api.whatsapp.com)",
    }),
  website_url: z.string().trim().url("URL inválida").startsWith("https://", "Usa https://"),
  is_active: z.boolean(),
  show_on_map: z.boolean(),
  map_x: z.coerce.number().min(0).max(100),
  map_y: z.coerce.number().min(0).max(100),
  label_side: z.enum(["left", "right"]),
  display_order: z.coerce.number().int().min(0),
  subtitle: z.string().trim().max(80).optional().or(z.literal("")),
  show_subtitle: z.boolean(),
  whatsapp_label: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp_icon: z.string().trim().max(40).optional().or(z.literal("")),
  website_label: z.string().trim().max(40).optional().or(z.literal("")),
  website_icon: z.string().trim().max(40).optional().or(z.literal("")),
  button_variant: z.enum(["gold", "light"]),
  addresses: z.array(z.string().trim().max(240)).max(10),
});

export type CountryInput = z.infer<typeof countrySchema>;
