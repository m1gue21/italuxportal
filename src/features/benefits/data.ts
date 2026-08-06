import { ShieldCheck, Gem, Sparkles, Truck, type LucideIcon } from "lucide-react";

export type Benefit = {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
};

export const BENEFITS: Benefit[] = [
  {
    id: "garantia",
    title: "Garantía de por vida",
    description: "Respaldamos cada pieza para siempre.",
    Icon: ShieldCheck,
  },
  {
    id: "oro",
    title: "Oro Laminado 18K Premium",
    description: "Materiales nobles y acabado impecable.",
    Icon: Gem,
  },
  {
    id: "diseno",
    title: "Diseños exclusivos",
    description: "Colecciones únicas, edición limitada.",
    Icon: Sparkles,
  },
  {
    id: "envios",
    title: "Envíos seguros",
    description: "Llegamos a tu puerta con total tranquilidad.",
    Icon: Truck,
  },
];
