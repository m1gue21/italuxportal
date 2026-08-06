import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { publicFaqsQuery } from "@/features/faqs/queries";

export function FaqSection() {
  const { data: faqs = [], isLoading } = useQuery(publicFaqsQuery);

  if (!isLoading && faqs.length === 0) return null;

  return (
    <section id="faq" className="bg-background px-6 py-10">
      <div className="mx-auto max-w-md text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-gold">
          Resolvemos tus dudas
        </p>
        <h2 className="font-display mt-3 text-[2rem] font-normal leading-tight tracking-wide text-foreground">
          Preguntas frecuentes
        </h2>
        <div className="mx-auto mt-5 h-px w-14 bg-gold/60" />
      </div>

      <div className="mx-auto mt-6 max-w-md">
        {isLoading ? (
          <p className="text-center text-xs text-muted-foreground">Cargando...</p>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="rounded-xl border border-gold/15 bg-white/[0.02] px-4 transition-colors hover:border-gold/35 data-[state=open]:border-gold/40"
              >
                <AccordionTrigger className="text-left font-display text-base font-normal tracking-wide text-foreground hover:no-underline [&[data-state=open]>svg]:text-gold">
                  {faq.pregunta}
                </AccordionTrigger>
                <AccordionContent className="text-[13px] leading-relaxed text-muted-foreground">
                  {faq.respuesta}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  );
}
