import type { CountryRow } from "@/features/countries/types";
import type { FaqRow } from "@/features/faqs/types";
import type { BenefitRow } from "@/features/benefits/types";
import type { SectionTextRow } from "./types";
import { SOCIAL_LINKS } from "@/features/countries/data";

const NOW = "2026-06-20T00:00:00.000Z";

function country(
  partial: Omit<CountryRow, "created_at" | "updated_at" | "addresses" | "subtitle" | "show_subtitle" | "whatsapp_label" | "whatsapp_icon" | "website_label" | "website_icon" | "button_variant" | "is_active" | "show_on_map"> &
    Partial<CountryRow>,
): CountryRow {
  return {
    is_active: true,
    show_on_map: true,
    subtitle: null,
    show_subtitle: false,
    whatsapp_label: "WhatsApp",
    whatsapp_icon: "whatsapp",
    website_label: "Sitio web",
    website_icon: "Globe",
    button_variant: "gold",
    addresses: [],
    created_at: NOW,
    updated_at: NOW,
    ...partial,
  };
}

/** Datos quemados (antes seed Supabase + España del catálogo). */
export const DEFAULT_COUNTRIES: CountryRow[] = [
  country({
    id: "country-co",
    code: "CO",
    name: "Colombia",
    flag: "🇨🇴",
    whatsapp_url: "https://wa.me/573000000000",
    website_url: "https://italuxjoyeria.com/co",
    map_x: 44,
    map_y: 46,
    label_side: "right",
    display_order: 1,
  }),
  country({
    id: "country-ec",
    code: "EC",
    name: "Ecuador",
    flag: "🇪🇨",
    whatsapp_url: "https://wa.me/593000000000",
    website_url: "https://italuxjoyeria.com/ec",
    map_x: 38,
    map_y: 54,
    label_side: "left",
    display_order: 2,
  }),
  country({
    id: "country-cl",
    code: "CL",
    name: "Chile",
    flag: "🇨🇱",
    whatsapp_url: "https://wa.me/56000000000",
    website_url: "https://italuxjoyeria.com/cl",
    map_x: 46,
    map_y: 84,
    label_side: "right",
    display_order: 3,
  }),
  country({
    id: "country-es",
    code: "ES",
    name: "España",
    flag: "🇪🇸",
    whatsapp_url: "https://wa.me/34000000000",
    website_url: "https://italuxjoyeria.com/es",
    map_x: 48,
    map_y: 12,
    label_side: "right",
    display_order: 4,
    show_on_map: false,
  }),
  country({
    id: "country-pe",
    code: "PE",
    name: "Perú",
    flag: "🇵🇪",
    whatsapp_url: "https://wa.me/51000000000",
    website_url: "https://italuxjoyeria.com/pe",
    map_x: 42,
    map_y: 64,
    label_side: "right",
    display_order: 5,
  }),
  country({
    id: "country-mx",
    code: "MX",
    name: "México",
    flag: "🇲🇽",
    whatsapp_url: "https://wa.me/52000000000",
    website_url: "https://italuxjoyeria.com/mx",
    map_x: 22,
    map_y: 18,
    label_side: "left",
    display_order: 6,
  }),
  country({
    id: "country-gt",
    code: "GT",
    name: "Guatemala",
    flag: "🇬🇹",
    whatsapp_url: "https://wa.me/502000000000",
    website_url: "https://italuxjoyeria.com/gt",
    map_x: 28,
    map_y: 28,
    label_side: "left",
    display_order: 7,
  }),
  country({
    id: "country-cr",
    code: "CR",
    name: "Costa Rica",
    flag: "🇨🇷",
    whatsapp_url: "https://wa.me/506000000000",
    website_url: "https://italuxjoyeria.com/cr",
    map_x: 34,
    map_y: 36,
    label_side: "left",
    display_order: 8,
  }),
  country({
    id: "country-do",
    code: "DO",
    name: "República Dominicana",
    flag: "🇩🇴",
    whatsapp_url: "https://wa.me/1809000000",
    website_url: "https://italuxjoyeria.com/do",
    map_x: 52,
    map_y: 28,
    label_side: "right",
    display_order: 9,
  }),
];

export const DEFAULT_FAQS: FaqRow[] = [
  {
    id: "faq-1",
    pregunta: "¿Qué diferencia hay entre mayorista y empresario?",
    respuesta:
      "Son dos modalidades de inversión. El mayorista trabaja con márgenes de utilidad del 30% al 50%. El empresario escala con márgenes del 40% al 60% y mejores condiciones de compra. Ambas incluyen acceso a catálogo, rotación de inventario y garantía de por vida.",
    activo: true,
    orden: 1,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "faq-2",
    pregunta: "¿Qué es la rotación de inventario?",
    respuesta:
      "Si tienes joyas con rotación lenta, puedes cambiarlas por estilos disponibles en el stock de ITALUX. Así tu inventario se mantiene fresco y vendible.",
    activo: true,
    orden: 2,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "faq-3",
    pregunta: "¿Cómo funciona la garantía de por vida?",
    respuesta:
      "Todas las piezas cuentan con garantía de por vida. Cuando aplica, se cambia por una joya totalmente nueva. Menos riesgo para tu negocio y más confianza para tus clientes.",
    activo: true,
    orden: 3,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "faq-4",
    pregunta: "¿Cómo empiezo a trabajar con ITALUX?",
    respuesta:
      "Elige tu modalidad (mayorista o empresario), selecciona tu país para revisar el catálogo de inversionistas o contacta a un asesor por WhatsApp. Te guiamos en el primer pedido.",
    activo: true,
    orden: 4,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "faq-5",
    pregunta: "¿El Oro Laminado 18K pierde el color?",
    respuesta:
      "No. Nuestra capa de Oro Laminado 18K Premium conserva su brillo y color con el cuidado básico recomendado. Evita químicos fuertes y perfumes directos.",
    activo: true,
    orden: 5,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "faq-6",
    pregunta: "¿Realizan envíos seguros?",
    respuesta:
      "Sí. Todos los envíos son asegurados, empacados discretamente y con número de seguimiento desde el momento del despacho.",
    activo: true,
    orden: 6,
    created_at: NOW,
    updated_at: NOW,
  },
];

export const DEFAULT_BENEFITS: BenefitRow[] = [
  {
    id: "benefit-1",
    title: "Rotación de inventario",
    description:
      "Joyas de rotación lenta se cambian por estilos disponibles en stock ITALUX.",
    icon: "RefreshCw",
    activo: true,
    orden: 1,
    image_url: null,
    image_opacity: 0.2,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "benefit-2",
    title: "Garantía de por vida",
    description: "Si aplica, se cambia por una joya totalmente nueva.",
    icon: "ShieldCheck",
    activo: true,
    orden: 2,
    image_url: null,
    image_opacity: 0.2,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "benefit-3",
    title: "Oro Laminado 18K Premium",
    description: "Materiales nobles y acabado impecable para reventa.",
    icon: "Gem",
    activo: true,
    orden: 3,
    image_url: null,
    image_opacity: 0.2,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "benefit-4",
    title: "Diseños exclusivos",
    description: "Cadenas, pulseras, dijes, aretes y balinería.",
    icon: "Sparkles",
    activo: true,
    orden: 4,
    image_url: null,
    image_opacity: 0.2,
    created_at: NOW,
    updated_at: NOW,
  },
];

function sectionText(
  partial: Pick<SectionTextRow, "id" | "section_key"> & Partial<SectionTextRow>,
): SectionTextRow {
  return {
    eyebrow: null,
    title: null,
    subtitle: null,
    show_title: true,
    cta_label: null,
    cta_url: null,
    cta_icon: null,
    bg_image_url: null,
    bg_opacity: null,
    link2_label: null,
    link2_url: null,
    logo_url: null,
    show_logo: true,
    social_instagram: null,
    social_tiktok: null,
    social_facebook: null,
    social_whatsapp: null,
    social_instagram_icon: "Instagram",
    social_tiktok_icon: "tiktok",
    social_facebook_icon: "Facebook",
    social_whatsapp_icon: "whatsapp",
    show_social_instagram: true,
    show_social_tiktok: true,
    show_social_facebook: true,
    show_social_whatsapp: true,
    created_at: NOW,
    updated_at: NOW,
    ...partial,
  };
}

export const DEFAULT_SECTION_TEXTS: SectionTextRow[] = [
  sectionText({
    id: "section-hero",
    section_key: "hero",
    title: "Construye tu negocio de joyería con márgenes reales",
    subtitle:
      "Oro laminado 18K Premium · Red en Latinoamérica · Stock con rotación y garantía de por vida",
    bg_opacity: 35,
  }),
  sectionText({
    id: "section-modalities",
    section_key: "modalities",
    eyebrow: "Modalidades de inversión",
    title: "Elige cómo crecer con ITALUX",
    subtitle:
      "Dos caminos para trabajar con nosotros. Ambos incluyen acceso a stock, rotación de inventario y garantía de por vida.",
  }),
  sectionText({
    id: "section-benefits",
    section_key: "benefits",
    eyebrow: "Ventajas del modelo",
    title: "Menos riesgo, más rotación",
    subtitle:
      "Protegemos tu inventario y tu reputación con rotación, garantía y calidad premium.",
  }),
  sectionText({
    id: "section-wholesale",
    section_key: "wholesale",
    eyebrow: "Asesoría personalizada",
    title: "¿Listo para empezar?",
    subtitle:
      "Habla con un asesor ITALUX y te orientamos en la modalidad ideal para tu negocio.",
    cta_label: "Contactar un asesor",
    cta_url: SOCIAL_LINKS.whatsapp,
    cta_icon: "whatsapp",
  }),
  sectionText({
    id: "section-footer",
    section_key: "footer",
    title: "ITALUX JOYERÍA",
    eyebrow: "Presencia Internacional",
    social_instagram: SOCIAL_LINKS.instagram,
    social_tiktok: SOCIAL_LINKS.tiktok,
    social_facebook: SOCIAL_LINKS.facebook,
    social_whatsapp: SOCIAL_LINKS.whatsapp,
  }),
];
