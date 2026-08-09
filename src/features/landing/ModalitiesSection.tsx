import { useQuery } from "@tanstack/react-query";
import { SOCIAL_LINKS } from "@/features/countries/data";
import { sectionTextQuery } from "@/features/section-texts/queries";

const MODALITIES = [
  {
    id: "mayorista",
    label: "Mayorista",
    margins: "30% – 50%",
    description: "Ideal para reventa y puntos de venta. Márgenes de utilidad competitivos desde el primer pedido.",
    cta: "Empezar como mayorista",
  },
  {
    id: "empresario",
    label: "Empresario",
    margins: "40% – 60%",
    description: "Para quienes escalan el negocio con ITALUX. Mayor margen de utilidad y mejores condiciones de compra.",
    cta: "Empezar como empresario",
  },
] as const;

export function ModalitiesSection() {
  const { data: texts } = useQuery(sectionTextQuery("modalities"));
  const eyebrow = texts?.eyebrow ?? "Modalidades de inversión";
  const title = texts?.title ?? "Elige cómo crecer con ITALUX";
  const subtitle =
    texts?.subtitle ??
    "Dos caminos para trabajar con nosotros. Ambos incluyen acceso a stock, rotación de inventario y garantía de por vida.";

  const scrollToCountries = () => {
    document.getElementById("paises")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="modalidades" className="bg-background px-6 py-12">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
        <h2 className="font-display mt-3 text-[2rem] font-normal leading-tight tracking-wide text-foreground">
          {title}
        </h2>
        <div className="mx-auto mt-5 h-px w-14 bg-gold/60" />
        <p className="mt-5 text-[14px] leading-relaxed text-muted-foreground">{subtitle}</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-md gap-5">
        {MODALITIES.map((m) => (
          <article
            key={m.id}
            className="border-b border-gold/20 px-1 pb-8 last:border-b-0 last:pb-0"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-gold/90">
              {m.label}
            </p>
            <p className="font-display mt-3 text-[2.5rem] font-normal leading-none text-foreground">
              {m.margins}
            </p>
            <p className="mt-1 text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
              Márgenes de utilidad
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">{m.description}</p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={scrollToCountries}
                className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-background transition-all active:scale-[0.98]"
              >
                Ver catálogo por país
              </button>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-full border border-gold/35 px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/5 active:scale-[0.98]"
              >
                {m.cta}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
