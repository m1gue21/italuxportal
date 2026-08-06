import { useQuery } from "@tanstack/react-query";
import { SOCIAL_LINKS } from "@/features/countries/data";
import { sectionTextQuery } from "@/features/section-texts/queries";
import { CTA_ICONS } from "@/features/section-texts/cta-icons";

export function WholesaleSection() {
  const { data: texts } = useQuery(sectionTextQuery("wholesale"));

  const eyebrow = texts?.eyebrow ?? "Venta al por Mayor";
  const title = texts?.title ?? "¿Quieres ser distribuidor?";
  const subtitle =
    texts?.subtitle ?? "Únete a la red oficial ITALUX y lleva la marca a tu ciudad.";
  const ctaLabel = (texts as any)?.cta_label ?? "Contactar un asesor";
  const ctaUrl = (texts as any)?.cta_url || SOCIAL_LINKS.whatsapp;
  const iconKey = (texts as any)?.cta_icon ?? "whatsapp";
  const Icon = CTA_ICONS[iconKey] ?? CTA_ICONS.whatsapp;

  return (
    <section className="bg-background px-6 py-8">
      <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[oklch(0.18_0.01_60)] via-background to-[oklch(0.16_0.02_75)] px-7 py-12 text-center shadow-[0_20px_60px_-20px] shadow-gold/20">
        <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-gold-deep/15 blur-3xl" />

        <div className="relative">
          <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-gold">{eyebrow}</p>
          <div className="mx-auto mt-5 h-px w-14 bg-gold/60" />
          <h2 className="font-display mt-6 text-[2rem] font-normal leading-tight text-foreground">
            {title}
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">{subtitle}</p>

          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-8 py-4 text-xs font-medium uppercase tracking-[0.25em] text-background shadow-[0_10px_30px_-10px] shadow-gold/40 transition-all active:scale-[0.98]"
          >
            <Icon className="h-4 w-4" strokeWidth={2.2} />
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
