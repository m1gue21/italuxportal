import { useQuery } from "@tanstack/react-query";
import logo from "@/assets/italux-logo.png.asset.json";
import heroDefault from "@/assets/hero-jewelry.jpg";
import { sectionTextQuery } from "@/features/section-texts/queries";

export function Hero() {
  const { data } = useQuery(sectionTextQuery("hero"));
  const bgSrc = (data as any)?.bg_image_url || heroDefault;
  const rawOpacity = (data as any)?.bg_opacity;
  const opacity =
    typeof rawOpacity === "number" || typeof rawOpacity === "string"
      ? Math.max(0, Math.min(100, Number(rawOpacity))) / 100
      : 0.3;

  const scrollToCountries = () => {
    document.getElementById("paises")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-background px-6 pt-6 pb-2 gap-2">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={bgSrc}
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover"
          style={{ opacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        {/* Subtle gold glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl" />
      </div>

      <div
        className="relative z-10 flex w-full flex-col items-center animate-fade-in"
        style={{ animationDuration: "700ms" }}
      >
        <img
          src={logo.url}
          alt="ITALUX Joyería"
          width={320}
          height={320}
          fetchPriority="high"
          className="h-auto w-40 max-w-full object-contain sm:w-48"
        />
      </div>

      <div
        className="relative z-10 flex flex-col items-center text-center animate-fade-in"
        style={{ animationDuration: "900ms", animationDelay: "150ms", animationFillMode: "both" }}
      >
        <div className="mx-auto h-px w-12 bg-gold/60" />
        <p className="mt-2 text-gold text-[12px] font-medium uppercase tracking-[0.28em]">ORO LAMINADO 18K PREMIUM</p>
      </div>

      <div
        className="relative z-10 w-full max-w-sm animate-fade-in"
        style={{ animationDuration: "900ms", animationDelay: "350ms", animationFillMode: "both" }}
      >
        <button
          onClick={scrollToCountries}
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-background shadow-[0_10px_40px_-10px] shadow-gold/40 transition-all active:scale-[0.98]"
        >
          Escoge tu país
        </button>
      </div>
    </section>
  );
}
