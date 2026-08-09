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
      {/* Fotos de fondo: altura = contenido (sin max-height que recorte CTAs) */}
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

      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/55 to-background/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

      {/* El contenido define la altura del hero; en desktop ocupa más viewport */}
      <div className="relative z-10 flex min-h-[520px] flex-col items-center justify-center px-5 py-10 text-center sm:min-h-[62svh] sm:px-6 sm:py-14 lg:min-h-svh">
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
          className="mt-5 max-w-md animate-fade-in sm:mt-8"
          style={{ animationDuration: "900ms", animationDelay: "120ms", animationFillMode: "both" }}
        >
          <div className="mx-auto h-px w-10 bg-gold/60 sm:w-12" />
          <h1 className="font-display mt-4 text-[1.45rem] font-normal leading-snug tracking-wide text-foreground sm:mt-5 sm:text-[2.1rem]">
            {headline}
          </h1>
          <p className="mt-3 text-[12px] leading-relaxed text-foreground/80 sm:mt-4 sm:text-[13px]">
            {support}
          </p>
        </div>

        <div
          className="mt-6 flex w-full max-w-sm flex-col gap-3 animate-fade-in sm:mt-8"
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
            className="flex w-full items-center justify-center rounded-full border border-gold/50 bg-background/20 px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gold backdrop-blur-sm transition-all hover:bg-gold/10 active:scale-[0.98] sm:px-8 sm:py-3.5 sm:text-xs"
          >
            Ver modalidades
          </button>
        </div>
      </div>
    </section>
  );
}
