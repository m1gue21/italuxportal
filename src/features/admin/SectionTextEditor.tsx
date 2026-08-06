import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Upload, X } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { sectionTextQuery } from "@/features/section-texts/queries";
import {
  CTA_ICONS,
  CTA_ICON_NAMES,
  CTA_ICON_LABELS,
} from "@/features/section-texts/cta-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const schema = z.object({
  eyebrow: z.string().trim().max(80).optional().or(z.literal("")),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  subtitle: z.string().trim().max(280).optional().or(z.literal("")),
  show_title: z.boolean().optional(),
  cta_label: z.string().trim().max(60).optional().or(z.literal("")),
  cta_url: z.string().trim().max(500).optional().or(z.literal("")),
  cta_icon: z.string().trim().max(40).optional().or(z.literal("")),
  bg_image_url: z.string().optional().or(z.literal("")),
  bg_opacity: z.number().min(0).max(100).optional(),
  link2_label: z.string().trim().max(60).optional().or(z.literal("")),
  link2_url: z.string().trim().max(500).optional().or(z.literal("")),
  social_instagram: z.string().trim().max(500).optional().or(z.literal("")),
  social_tiktok: z.string().trim().max(500).optional().or(z.literal("")),
  social_facebook: z.string().trim().max(500).optional().or(z.literal("")),
  social_whatsapp: z.string().trim().max(500).optional().or(z.literal("")),
  social_instagram_icon: z.string().trim().max(40).optional().or(z.literal("")),
  social_tiktok_icon: z.string().trim().max(40).optional().or(z.literal("")),
  social_facebook_icon: z.string().trim().max(40).optional().or(z.literal("")),
  social_whatsapp_icon: z.string().trim().max(40).optional().or(z.literal("")),
  logo_url: z.string().optional().or(z.literal("")),
  show_logo: z.boolean().optional(),
  show_social_instagram: z.boolean().optional(),
  show_social_tiktok: z.boolean().optional(),
  show_social_facebook: z.boolean().optional(),
  show_social_whatsapp: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

const MAX_IMAGE_BYTES = 1_500_000; // 1.5MB

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {CTA_ICON_NAMES.map((name) => {
        const Ico = CTA_ICONS[name] as any;
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            title={CTA_ICON_LABELS[name] ?? name}
            className={`flex aspect-square items-center justify-center rounded-md border ${
              selected
                ? "border-gold bg-gold/10 text-gold"
                : "border-border text-muted-foreground"
            }`}
          >
            <Ico className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        );
      })}
    </div>
  );
}

export function SectionTextEditor({
  sectionKey,
  label = "Editar textos",
  includeCta = false,
  includeBackground = false,
  hideTextFields = false,
  includeSecondLink = false,
  includeSocials = false,
  includeShowTitle = false,
  includeLogo = false,
  triggerVariant = "outline",
}: {
  sectionKey: string;
  label?: string;
  includeCta?: boolean;
  includeBackground?: boolean;
  hideTextFields?: boolean;
  includeSecondLink?: boolean;
  includeSocials?: boolean;
  includeShowTitle?: boolean;
  includeLogo?: boolean;
  triggerVariant?: "default" | "outline";
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data } = useQuery(sectionTextQuery(sectionKey));
  const fileRef = useRef<HTMLInputElement | null>(null);
  const logoFileRef = useRef<HTMLInputElement | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      eyebrow: "",
      title: "",
      subtitle: "",
      show_title: true,
      cta_label: "",
      cta_url: "",
      cta_icon: "",
      bg_image_url: "",
      bg_opacity: 30,
      link2_label: "",
      link2_url: "",
      social_instagram: "",
      social_tiktok: "",
      social_facebook: "",
      social_whatsapp: "",
      social_instagram_icon: "Instagram",
      social_tiktok_icon: "tiktok",
      social_facebook_icon: "Facebook",
      social_whatsapp_icon: "whatsapp",
      logo_url: "",
      show_logo: true,
      show_social_instagram: true,
      show_social_tiktok: true,
      show_social_facebook: true,
      show_social_whatsapp: true,
    },
  });

  useEffect(() => {
    if (open) {
      const d = data as any;
      reset({
        eyebrow: data?.eyebrow ?? "",
        title: data?.title ?? "",
        subtitle: data?.subtitle ?? "",
        show_title: data?.show_title ?? true,
        cta_label: d?.cta_label ?? "",
        cta_url: d?.cta_url ?? "",
        cta_icon: d?.cta_icon ?? "whatsapp",
        bg_image_url: d?.bg_image_url ?? "",
        bg_opacity: d?.bg_opacity != null ? Number(d.bg_opacity) : 30,
        link2_label: d?.link2_label ?? "",
        link2_url: d?.link2_url ?? "",
        social_instagram: d?.social_instagram ?? "",
        social_tiktok: d?.social_tiktok ?? "",
        social_facebook: d?.social_facebook ?? "",
        social_whatsapp: d?.social_whatsapp ?? "",
        social_instagram_icon: d?.social_instagram_icon ?? "Instagram",
        social_tiktok_icon: d?.social_tiktok_icon ?? "tiktok",
        social_facebook_icon: d?.social_facebook_icon ?? "Facebook",
        social_whatsapp_icon: d?.social_whatsapp_icon ?? "whatsapp",
        logo_url: d?.logo_url ?? "",
        show_logo: d?.show_logo ?? true,
        show_social_instagram: d?.show_social_instagram ?? true,
        show_social_tiktok: d?.show_social_tiktok ?? true,
        show_social_facebook: d?.show_social_facebook ?? true,
        show_social_whatsapp: d?.show_social_whatsapp ?? true,
      });
    }
  }, [open, data, reset]);

  const selectedIcon = watch("cta_icon") || "whatsapp";
  const bgImage = watch("bg_image_url") || "";
  const bgOpacity = watch("bg_opacity") ?? 30;
  const showTitle = watch("show_title") ?? true;
  const showLogo = watch("show_logo") ?? true;
  const logoUrl = watch("logo_url") || "";
  const igIcon = watch("social_instagram_icon") || "Instagram";
  const ttIcon = watch("social_tiktok_icon") || "tiktok";
  const fbIcon = watch("social_facebook_icon") || "Facebook";
  const waIcon = watch("social_whatsapp_icon") || "whatsapp";
  const showIg = watch("show_social_instagram") ?? true;
  const showTt = watch("show_social_tiktok") ?? true;
  const showFb = watch("show_social_facebook") ?? true;
  const showWa = watch("show_social_whatsapp") ?? true;

  const uploadToBucket = async (file: File, field: "bg_image_url" | "logo_url") => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("La imagen debe pesar menos de 1.5 MB");
      return;
    }
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${sectionKey}/${field}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("section-backgrounds")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (upErr) throw upErr;
      const { data: signed, error: signErr } = await supabase.storage
        .from("section-backgrounds")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signErr) throw signErr;
      setValue(field, signed.signedUrl, { shouldDirty: true });
    } catch (e: any) {
      toast.error(e?.message || "No se pudo subir la imagen");
    }
  };

  const saveMut = useMutation({
    mutationFn: async (v: Values) => {
      const payload: any = {
        section_key: sectionKey,
        eyebrow: v.eyebrow || null,
        title: v.title || null,
        subtitle: v.subtitle || null,
      };
      if (includeShowTitle) {
        payload.show_title = v.show_title ?? true;
      }
      if (includeCta) {
        payload.cta_label = v.cta_label || null;
        payload.cta_url = v.cta_url || null;
        payload.cta_icon = v.cta_icon || null;
      }
      if (includeBackground) {
        payload.bg_image_url = v.bg_image_url || null;
        payload.bg_opacity = v.bg_opacity ?? null;
      }
      if (includeSecondLink) {
        payload.cta_label = v.cta_label || null;
        payload.cta_url = v.cta_url || null;
        payload.link2_label = v.link2_label || null;
        payload.link2_url = v.link2_url || null;
      }
      if (includeSocials) {
        payload.social_instagram = v.social_instagram || null;
        payload.social_tiktok = v.social_tiktok || null;
        payload.social_facebook = v.social_facebook || null;
        payload.social_whatsapp = v.social_whatsapp || null;
        payload.social_instagram_icon = v.social_instagram_icon || null;
        payload.social_tiktok_icon = v.social_tiktok_icon || null;
        payload.social_facebook_icon = v.social_facebook_icon || null;
        payload.social_whatsapp_icon = v.social_whatsapp_icon || null;
        payload.show_social_instagram = v.show_social_instagram ?? true;
        payload.show_social_tiktok = v.show_social_tiktok ?? true;
        payload.show_social_facebook = v.show_social_facebook ?? true;
        payload.show_social_whatsapp = v.show_social_whatsapp ?? true;
      }
      if (includeLogo) {
        payload.logo_url = v.logo_url || null;
        payload.show_logo = v.show_logo ?? true;
      }
      const { error } = await supabase
        .from("section_texts")
        .upsert(payload, { onConflict: "section_key" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sección actualizada");
      qc.invalidateQueries({ queryKey: ["section_texts", sectionKey] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={triggerVariant}>
          <Pencil className="mr-1 h-4 w-4" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar sección</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => saveMut.mutate(v))} className="grid gap-3">
          {!hideTextFields && (
            <>
              {includeShowTitle && (
                <div className="flex items-center justify-between rounded-lg border border-gold/15 px-3 py-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Mostrar título y subtítulo
                  </Label>
                  <Switch
                    checked={showTitle}
                    onCheckedChange={(v) =>
                      setValue("show_title", v, { shouldDirty: true })
                    }
                  />
                </div>
              )}
              <div className="grid gap-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Antetítulo (eyebrow)
                </Label>
                <Input {...register("eyebrow")} placeholder="Venta al por Mayor" />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Título
                </Label>
                <Input {...register("title")} />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="grid gap-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Subtítulo
                </Label>
                <Textarea rows={3} {...register("subtitle")} />
              </div>
            </>
          )}
          {includeLogo && (
            <div className="grid gap-2 rounded-lg border border-gold/15 p-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Mostrar logo
                </Label>
                <Switch
                  checked={showLogo}
                  onCheckedChange={(v) =>
                    setValue("show_logo", v, { shouldDirty: true })
                  }
                />
              </div>
              <div className="relative overflow-hidden rounded-lg border border-border bg-black/40">
                {logoUrl ? (
                  <>
                    <img
                      src={logoUrl}
                      alt=""
                      className="mx-auto h-24 w-auto object-contain py-2"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setValue("logo_url", "", { shouldDirty: true })
                      }
                      className="absolute right-2 top-2 rounded-md bg-background/80 p-1 text-foreground"
                      aria-label="Quitar logo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
                    Sin logo personalizado (se usa el predeterminado)
                  </div>
                )}
              </div>
              <input
                ref={logoFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadToBucket(f, "logo_url");
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => logoFileRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Subir logo
              </Button>
              <p className="text-[10px] text-muted-foreground">
                Máx. 1.5 MB. PNG con fondo transparente recomendado.
              </p>
            </div>
          )}
          {includeCta && (
            <>
              <div className="grid gap-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Texto del botón
                </Label>
                <Input {...register("cta_label")} placeholder="Contactar un asesor" />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Enlace del botón (opcional)
                </Label>
                <Input
                  {...register("cta_url")}
                  placeholder="https://wa.me/... (vacío usa WhatsApp por defecto)"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Icono del botón
                </Label>
                <div className="grid grid-cols-6 gap-2">
                  {CTA_ICON_NAMES.map((name) => {
                    const Ico = CTA_ICONS[name] as any;
                    const selected = selectedIcon === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setValue("cta_icon", name, { shouldDirty: true })}
                        title={CTA_ICON_LABELS[name] ?? name}
                        className={`flex aspect-square items-center justify-center rounded-md border ${
                          selected
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        <Ico className="h-4 w-4" strokeWidth={1.8} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          {includeBackground && (
            <>
              <div className="grid gap-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Imagen de fondo
                </Label>
                <div className="relative overflow-hidden rounded-lg border border-border bg-black/40">
                  {bgImage ? (
                    <>
                      <img
                        src={bgImage}
                        alt=""
                        className="h-32 w-full object-cover"
                        style={{ opacity: (bgOpacity ?? 30) / 100 }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setValue("bg_image_url", "", { shouldDirty: true })
                        }
                        className="absolute right-2 top-2 rounded-md bg-background/80 p-1 text-foreground"
                        aria-label="Quitar imagen"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
                      Sin imagen personalizada (se usa la predeterminada)
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadToBucket(f, "bg_image_url");
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" /> Subir imagen
                </Button>
                <p className="text-[10px] text-muted-foreground">
                  Máx. 1.5 MB. JPG/PNG/WebP.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Opacidad
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(bgOpacity ?? 30)}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[bgOpacity ?? 30]}
                  onValueChange={(v) =>
                    setValue("bg_opacity", v[0], { shouldDirty: true })
                  }
                />
              </div>
            </>
          )}
          {includeSecondLink && (
            <>
              <div className="grid gap-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Enlace 1 — texto
                </Label>
                <Input {...register("cta_label")} placeholder="Política de privacidad" />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Enlace 1 — URL
                </Label>
                <Input {...register("cta_url")} placeholder="https://..." />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Enlace 2 — texto
                </Label>
                <Input {...register("link2_label")} placeholder="Información de contacto" />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Enlace 2 — URL
                </Label>
                <Input {...register("link2_url")} placeholder="https://..." />
              </div>
            </>
          )}
          {includeSocials && (
            <div className="grid gap-3 rounded-lg border border-gold/15 p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold/70">Redes sociales</p>
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Instagram</Label>
                  <Switch checked={showIg} onCheckedChange={(v) => setValue("show_social_instagram", v, { shouldDirty: true })} />
                </div>
                <Input {...register("social_instagram")} placeholder="https://instagram.com/..." />
                <IconPicker value={igIcon} onChange={(v) => setValue("social_instagram_icon", v, { shouldDirty: true })} />
              </div>
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">TikTok</Label>
                  <Switch checked={showTt} onCheckedChange={(v) => setValue("show_social_tiktok", v, { shouldDirty: true })} />
                </div>
                <Input {...register("social_tiktok")} placeholder="https://tiktok.com/@..." />
                <IconPicker value={ttIcon} onChange={(v) => setValue("social_tiktok_icon", v, { shouldDirty: true })} />
              </div>
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Facebook</Label>
                  <Switch checked={showFb} onCheckedChange={(v) => setValue("show_social_facebook", v, { shouldDirty: true })} />
                </div>
                <Input {...register("social_facebook")} placeholder="https://facebook.com/..." />
                <IconPicker value={fbIcon} onChange={(v) => setValue("social_facebook_icon", v, { shouldDirty: true })} />
              </div>
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp</Label>
                  <Switch checked={showWa} onCheckedChange={(v) => setValue("show_social_whatsapp", v, { shouldDirty: true })} />
                </div>
                <Input {...register("social_whatsapp")} placeholder="https://wa.me/..." />
                <IconPicker value={waIcon} onChange={(v) => setValue("social_whatsapp_icon", v, { shouldDirty: true })} />
              </div>
            </div>
          )}
          <Button type="submit" disabled={saveMut.isPending}>
            {saveMut.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
