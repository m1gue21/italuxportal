import { Link } from "@tanstack/react-router";

const LINKS = [
  { to: "/", label: "← Landing" },
  { to: "/admin", label: "Países" },
  { to: "/admin/catalogs", label: "Catálogos" },
  { to: "/admin/faqs", label: "FAQs" },
  { to: "/admin/benefits", label: "Beneficios" },
  { to: "/admin/wholesale", label: "Mayoreo" },
  { to: "/admin/hero", label: "Portada" },
  { to: "/admin/footer", label: "Pie" },
] as const;

export function AdminNav({ current }: { current?: string }) {
  return (
    <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.2em] text-gold/70">
      {LINKS.map((link) => {
        if (link.to === current) {
          return (
            <span key={link.to} className="text-gold">
              {link.label}
            </span>
          );
        }
        return (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
