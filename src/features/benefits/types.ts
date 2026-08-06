import { z } from "zod";
import {
  ShieldCheck,
  Gem,
  Sparkles,
  Truck,
  Crown,
  Award,
  Heart,
  Star,
  Diamond,
  Gift,
  Package,
  Headphones,
  CreditCard,
  Globe,
  type LucideIcon,
} from "lucide-react";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type BenefitRow = Tables<"benefits">;
export type BenefitInsert = TablesInsert<"benefits">;

export const BENEFIT_ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Gem,
  Sparkles,
  Truck,
  Crown,
  Award,
  Heart,
  Star,
  Diamond,
  Gift,
  Package,
  Headphones,
  CreditCard,
  Globe,
};

export const BENEFIT_ICON_NAMES = Object.keys(BENEFIT_ICONS);

export const benefitSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(80),
  description: z.string().trim().min(1, "La descripción es obligatoria").max(200),
  icon: z.string().refine((v) => v in BENEFIT_ICONS, "Icono no válido"),
  activo: z.boolean(),
  orden: z.coerce.number().int().min(0),
  image_url: z.string().optional().nullable(),
  image_opacity: z.coerce.number().min(0).max(1).default(0.2),
});

export type BenefitInput = z.infer<typeof benefitSchema>;
