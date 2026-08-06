import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/features/landing/Hero";
import { MapSection } from "@/features/landing/MapSection";
import { CountriesSection } from "@/features/landing/CountriesSection";
import { BenefitsSection } from "@/features/landing/BenefitsSection";
import { WholesaleSection } from "@/features/landing/WholesaleSection";
import { FaqSection } from "@/features/landing/FaqSection";
import { Footer } from "@/features/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ITALUX Joyería — Portal Internacional" },
      {
        name: "description",
        content:
          "ITALUX Joyería · Presencia internacional en Latinoamérica. Oro laminado 18K Premium con garantía de por vida.",
      },
      { property: "og:title", content: "ITALUX Joyería — Portal Internacional" },
      {
        property: "og:description",
        content: "Joyería premium con presencia oficial en 8 países. Encuentra tu país.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Hero />
      <MapSection />
      <CountriesSection />
      <BenefitsSection />
      <WholesaleSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
