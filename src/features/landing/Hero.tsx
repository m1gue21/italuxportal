import { useQuery } from "@tanstack/react-query";
import logo from "@/assets/italux-logo.png";
import heroMan from "@/assets/hero-model-man.jpg";
import heroWoman from "@/assets/hero-model-woman.jpg";
import { sectionTextQuery } from "@/features/section-texts/queries";

export function Hero() {
  const { data } = useQuery(sectionTextQuery("hero"));

  const headline =
    data?.title && data.title !== "Hero"
      ? data.title
      : "Construye tu negocio de joyería con márgenes reales";
  const support =
    data?.subtitle ||
    "Oro laminado 18K Premium · Red en Latinoamérica · Stock con rotación y garantía de por vida";

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Split siempre 50/50; en móvil más bajo (estilo Shopify) */}
      <div className="relative h-[42svh] min-h-[260px] max-h-[360px] sm:h-[62svh] sm:max-h-none md:min-h-[520px] lg:min-h-svh">
        <div className="absolute inset-0 grid grid-cols-2">
          <img
            src={heroMan}
            alt=""
            fetchPriority="high"
            className="h-full w-full object-cover object-[center_18%]"
          />
          <img
            src={heroWoman}
            alt=""
            fetchPriority="high"
            className="h-full w-full object-cover object-[center_22%]"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-background/65 via-background/50 to-background/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/35" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 py-8 text-center sm:px-6 sm:py-12">
          <div
            className="flex flex-col items-center animate-fade-in"
            style={{ animationDuration: "700ms" }}
          >
            <img
              src={logo}
              alt="ITALUX Joyería"
              width={140}
              height={140}
              fetchPriority="high"
              className="h-auto w-14 object-contain sm:w-[4.5rem]"
            />
            <p className="font-display mt-2 text-xl font-normal tracking-[0.35em] text-foreground sm:mt-3 sm:text-2xl">
              ITALUX
            </p>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.45em] text-gold sm:text-[10px]">
              Joyería
            </p>
          </div>

          <div
            className="mt-4 max-w-md animate-fade-in sm:mt-8"
            style={{ animationDuration: "900ms", animationDelay: "120ms", animationFillMode: "both" }}
          >
            <div className="mx-auto h-px w-10 bg-gold/60 sm:w-12" />
            <h1 className="font-display mt-3 text-[1.35rem] font-normal leading-snug tracking-wide text-foreground sm:mt-5 sm:text-[2.1rem]">
              {headline}
            </h1>
            <p className="mt-2 text-[11px] leading-relaxed text-foreground/80 sm:mt-4 sm:text-[13px]">
              {support}
            </p>
          </div>

          <div
            className="mt-4 flex w-full max-w-sm flex-col gap-2.5 animate-fade-in sm:mt-8 sm:gap-3"
            style={{ animationDuration: "900ms", animationDelay: "280ms", animationFillMode: "both" }}
          >
            <button
              type="button"
              onClick={() => scrollTo("modalidades")}
              className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-background shadow-[0_10px_40px_-10px] shadow-gold/40 transition-all active:scale-[0.98] sm:px-8 sm:py-4 sm:text-xs"
            >
              Quiero ser mayorista
            </button>
            <button
              type="button"
              onClick={() => scrollTo("modalidades")}
              className="flex w-full items-center justify-center rounded-full border border-gold/50 bg-background/20 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-gold backdrop-blur-sm transition-all hover:bg-gold/10 active:scale-[0.98] sm:px-8 sm:py-3.5 sm:text-xs"
            >
              Ver modalidades
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
