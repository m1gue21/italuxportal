import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/features/landing/Hero";
import { ModalitiesSection } from "@/features/landing/ModalitiesSection";
import { BenefitsSection } from "@/features/landing/BenefitsSection";
import { CategoriesStrip } from "@/features/landing/CategoriesStrip";
import { MapSection } from "@/features/landing/MapSection";
import { CountriesSection } from "@/features/landing/CountriesSection";
import { WholesaleSection } from "@/features/landing/WholesaleSection";
import { FaqSection } from "@/features/landing/FaqSection";
import { Footer } from "@/features/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ITALUX Joyería — Mayoristas y Empresarios" },
      {
        name: "description",
        content:
          "Trabaja con ITALUX: márgenes del 30% al 60%, rotación de inventario, garantía de por vida y catálogo para mayoristas y empresarios en Latinoamérica.",
      },
      { property: "og:title", content: "ITALUX Joyería — Mayoristas y Empresarios" },
      {
        property: "og:description",
        content:
          "Modalidades de inversión con márgenes reales, stock con rotación y oro laminado 18K Premium.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Hero />
      <ModalitiesSection />
      <BenefitsSection />
      <CategoriesStrip />
      <MapSection />
      <CountriesSection />
      <WholesaleSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
