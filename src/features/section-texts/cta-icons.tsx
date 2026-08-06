import * as React from "react";
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  ShoppingBag,
  Sparkles,
  Crown,
  Gem,
  Heart,
  ArrowRight,
  Globe,
  ShoppingCart,
  Store,
  Link as LinkIcon,
  ExternalLink,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Music2,
  Music,
  Camera,
  Video,
  type LucideIcon,
} from "lucide-react";

type IconCmp = (props: { className?: string; strokeWidth?: number }) => React.ReactElement;

const WhatsApp: IconCmp = ({ className, strokeWidth = 0 }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
    strokeWidth={strokeWidth}
  >
    <path d="M19.11 4.91A10.05 10.05 0 0 0 12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.76.46 3.48 1.34 5L2 22l5.13-1.34A9.96 9.96 0 0 0 12.02 22c5.52 0 10-4.48 10-10 0-2.67-1.04-5.18-2.91-7.09zM12.02 20.2c-1.55 0-3.07-.42-4.4-1.2l-.31-.18-3.04.8.81-2.96-.2-.32a8.16 8.16 0 0 1-1.26-4.34c0-4.52 3.68-8.2 8.2-8.2 2.19 0 4.25.85 5.8 2.4a8.14 8.14 0 0 1 2.4 5.8c0 4.52-3.68 8.2-8.2 8.2zm4.49-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.78.96-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.04 0 1.2.88 2.37 1 2.53.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.16-.47-.28z" />
  </svg>
);

const TikTok: IconCmp = ({ className, strokeWidth = 0 }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
    strokeWidth={strokeWidth}
  >
    <path d="M19.6 6.32a5.4 5.4 0 0 1-3.4-1.29 5.4 5.4 0 0 1-1.85-3.03h-3.16v13.16a2.79 2.79 0 1 1-2.79-2.79c.29 0 .57.04.83.13v-3.24a6.02 6.02 0 0 0-.83-.06 6.03 6.03 0 1 0 6.03 6.03V8.9a8.55 8.55 0 0 0 5.17 1.74V7.48z" />
  </svg>
);

export const CTA_ICONS: Record<string, IconCmp | LucideIcon> = {
  whatsapp: WhatsApp,
  tiktok: TikTok,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  MessageCircle,
  Send,
  Phone,
  Mail,
  ShoppingBag,
  Sparkles,
  Crown,
  Gem,
  Heart,
  ArrowRight,
  Globe,
  ShoppingCart,
  Store,
  Link: LinkIcon,
  ExternalLink,
  Music2,
  Music,
  Camera,
  Video,
};

export const CTA_ICON_NAMES = Object.keys(CTA_ICONS);

export const CTA_ICON_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  Instagram: "Instagram",
  Facebook: "Facebook",
  Youtube: "YouTube",
  Twitter: "X / Twitter",
  MessageCircle: "Mensaje",
  Send: "Enviar",
  Phone: "Teléfono",
  Mail: "Correo",
  ShoppingBag: "Bolsa",
  Sparkles: "Brillo",
  Crown: "Corona",
  Gem: "Gema",
  Heart: "Corazón",
  ArrowRight: "Flecha",
  Globe: "Globo",
  ShoppingCart: "Carrito",
  Store: "Tienda",
  Link: "Enlace",
  ExternalLink: "Externo",
  Music2: "Nota musical",
  Music: "Música",
  Camera: "Cámara",
  Video: "Video",
};
