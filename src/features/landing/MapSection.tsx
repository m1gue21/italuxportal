import { useQuery } from "@tanstack/react-query";
import { publicCountriesQuery } from "@/features/countries/queries";
import {
  AMERICAS_COUNTRY_PATHS,
  AMERICAS_PIN_POSITIONS,
  AMERICAS_VIEWBOX,
} from "./americas-map-data";

export function MapSection() {
  const { data: countries = [] } = useQuery(publicCountriesQuery);
  const visible = countries.filter((c) => c.show_on_map);

  return (
    <section className="relative bg-background px-6 pt-0 pb-2">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-[280px]">
        <svg
          viewBox={AMERICAS_VIEWBOX}
          className="absolute inset-0 h-full w-full"
          fill="none"
          role="img"
          aria-label="Mapa de presencia ITALUX en Latinoamérica"
        >
          <defs>
            <linearGradient id="mapLandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.82 0.13 82)" stopOpacity="0.22" />
              <stop offset="55%" stopColor="oklch(0.7 0.14 75)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="oklch(0.82 0.13 82)" stopOpacity="0.05" />
            </linearGradient>
            <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Soft outer glow of the continent */}
          <g opacity="0.35" filter="url(#mapGlow)">
            {AMERICAS_COUNTRY_PATHS.map((c) => (
              <path
                key={`glow-${c.name}`}
                d={c.d}
                fill="oklch(0.82 0.13 82)"
                fillOpacity="0.08"
              />
            ))}
          </g>

          {/* Real country outlines */}
          <g>
            {AMERICAS_COUNTRY_PATHS.map((c) => (
              <path
                key={c.name}
                d={c.d}
                fill="url(#mapLandGrad)"
                stroke="oklch(0.82 0.13 82)"
                strokeWidth="0.28"
                strokeOpacity="0.55"
                strokeLinejoin="round"
              />
            ))}
          </g>
        </svg>

        {visible.map((c) => {
          const geo = AMERICAS_PIN_POSITIONS[c.code];
          const left = geo?.x ?? c.map_x;
          const top = geo?.y ?? c.map_y;
          const labelSide = geo?.labelSide ?? c.label_side;

          return (
            <div
              key={c.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <span className="absolute inset-0 -m-1.5 animate-ping rounded-full bg-gold/35" />
              <span className="absolute inset-0 -m-2 rounded-full bg-gold/20 blur-[3px]" />
              <span className="relative block h-2 w-2 rounded-full bg-gold shadow-[0_0_12px_2px] shadow-gold/70" />
              <span
                className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.22em] text-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.35)] ${
                  labelSide === "right" ? "left-3" : "right-3"
                }`}
              >
                {c.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
