const CATEGORIES = [
  "Cadenas",
  "Pulseras",
  "Dijes",
  "Aretes",
  "Pulseras balinería",
] as const;

export function CategoriesStrip() {
  return (
    <section className="relative overflow-hidden bg-background px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gold/[0.04] via-transparent to-transparent" />

      <div className="relative mx-auto max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-gold">Colección</p>
        <h2 className="font-display mt-3 text-[2rem] font-normal leading-tight tracking-wide text-foreground">
          Gran variedad de diseños
        </h2>
        <div className="mx-auto mt-5 h-px w-14 bg-gold/60" />
        <p className="mt-5 text-[14px] leading-relaxed text-muted-foreground">
          Piezas listas para reventa, con estilos que rotan y se renuevan desde el stock ITALUX.
        </p>
      </div>

      <ul className="relative mx-auto mt-10 flex max-w-md flex-col items-center gap-0">
        {CATEGORIES.map((name, i) => (
          <li
            key={name}
            className="w-full border-t border-gold/15 py-5 text-center last:border-b last:border-gold/15"
            style={{
              animationDelay: `${i * 60}ms`,
            }}
          >
            <span className="font-display text-[1.65rem] font-normal tracking-[0.12em] text-foreground">
              {name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
