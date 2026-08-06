import { useQuery } from "@tanstack/react-query";
import { publicBenefitsQuery } from "@/features/benefits/queries";
import { BENEFIT_ICONS } from "@/features/benefits/types";
import { sectionTextQuery } from "@/features/section-texts/queries";
import { Sparkles } from "lucide-react";

export function BenefitsSection() {
  const { data: benefits = [], isLoading } = useQuery(publicBenefitsQuery);
  const { data: texts } = useQuery(sectionTextQuery("benefits"));

  if (!isLoading && benefits.length === 0) return null;

  const eyebrow = texts?.eyebrow ?? "¿Por qué ITALUX?";
  const title = texts?.title ?? "La promesa de la maison";
  const subtitle = texts?.subtitle;
  const showTitle = texts?.show_title ?? true;

  return (
    <section className="bg-background px-6 py-10">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-gold md:text-base lg:text-lg">
          {eyebrow}
        </p>
        {showTitle && (
          <>
            <h2 className="font-display mt-3 text-[2rem] font-normal leading-tight tracking-wide text-foreground">
              {title}
            </h2>
            <div className="mx-auto mt-5 h-px w-14 bg-gold/60" />
            {subtitle && (
              <p className="mt-5 text-[14px] leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>

      <ul className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-4">
        {benefits.map((b) => {
          const Icon = BENEFIT_ICONS[b.icon] ?? Sparkles;
          const bgImage = (b as any).image_url as string | null | undefined;
          const bgOpacity =
            (b as any).image_opacity != null ? Number((b as any).image_opacity) : 0.2;
          return (
            <li
              key={b.id}
              className="relative isolate flex flex-col items-center overflow-hidden rounded-2xl border border-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent px-4 py-7 text-center transition-colors hover:border-gold/35"
            >
              {bgImage && (
                <img
                  src={bgImage}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
                  style={{ opacity: bgOpacity }}
                />
              )}
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-background/40 text-gold backdrop-blur-sm">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <h3 className="font-display mt-5 text-[17px] font-normal leading-snug text-foreground">
                {b.title}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                {b.description}
              </p>
            </li>
          );
        })}
      </ul>

    </section>
  );
}
