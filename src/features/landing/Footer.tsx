import { Instagram, Facebook, MessageCircle, Music2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import logo from "@/assets/italux-logo.png";
import { SOCIAL_LINKS } from "@/features/countries/data";
import { sectionTextQuery } from "@/features/section-texts/queries";
import { CTA_ICONS } from "@/features/section-texts/cta-icons";

export function Footer() {
  const { data } = useQuery(sectionTextQuery("footer"));
  const d = data as any;

  const brand = data?.title || "ITALUX JOYERÍA";
  const tagline = data?.eyebrow || "Presencia Internacional";
  const copy = data?.subtitle || "";

  const logoUrl = d?.logo_url || logo;
  const showLogo = d?.show_logo ?? true;

  const socials = [
    {
      name: "Instagram",
      href: d?.social_instagram || SOCIAL_LINKS.instagram,
      iconKey: d?.social_instagram_icon || "Instagram",
      Fallback: Instagram,
      show: d?.show_social_instagram ?? true,
    },
    {
      name: "TikTok",
      href: d?.social_tiktok || SOCIAL_LINKS.tiktok,
      iconKey: d?.social_tiktok_icon || "tiktok",
      Fallback: Music2,
      show: d?.show_social_tiktok ?? true,
    },
    {
      name: "Facebook",
      href: d?.social_facebook || SOCIAL_LINKS.facebook,
      iconKey: d?.social_facebook_icon || "Facebook",
      Fallback: Facebook,
      show: d?.show_social_facebook ?? true,
    },
    {
      name: "WhatsApp",
      href: d?.social_whatsapp || SOCIAL_LINKS.whatsapp,
      iconKey: d?.social_whatsapp_icon || "whatsapp",
      Fallback: MessageCircle,
      show: d?.show_social_whatsapp ?? true,
    },
  ].filter((s) => s.show);

  const link1Label = d?.cta_label as string | undefined;
  const link1Url = d?.cta_url as string | undefined;
  const link2Label = d?.link2_label as string | undefined;
  const link2Url = d?.link2_url as string | undefined;

  const extraLinks = [
    link1Label && link1Url ? { label: link1Label, url: link1Url } : null,
    link2Label && link2Url ? { label: link2Label, url: link2Url } : null,
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <footer className="border-t border-gold/15 bg-background px-6 pb-8 pt-8">
      <div className="mx-auto max-w-md text-center">
        {showLogo && (
          <img
            src={logoUrl}
            alt="ITALUX Joyería"
            width={200}
            height={200}
            loading="lazy"
            className="mx-auto h-auto w-32 object-contain"
          />
        )}

        {showLogo && <div className="mx-auto my-6 h-px w-12 bg-gold/40" />}

        {socials.length > 0 && (
          <div className="flex justify-center gap-3">
            {socials.map(({ name, href, iconKey, Fallback }) => {
              const Icon = (CTA_ICONS[iconKey] as any) || Fallback;
              return (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 text-gold transition-all active:scale-95 hover:bg-gold/5"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </a>
              );
            })}
          </div>
        )}

        {(d?.show_title ?? true) && (
          <>
            <p className="font-display mt-8 text-xl font-normal tracking-[0.22em] text-foreground">
              {brand}
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.35em] text-gold/90">
              {tagline}
            </p>
          </>
        )}

        {(copy || extraLinks.length > 0) && (
          <div className="mt-6 space-y-2 text-[13px] text-muted-foreground">
            {copy && <p>{copy}</p>}
            {extraLinks.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target={l.url.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="block transition hover:text-gold"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
