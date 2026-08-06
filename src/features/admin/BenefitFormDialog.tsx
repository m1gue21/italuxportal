import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import {
  benefitSchema,
  BENEFIT_ICONS,
  BENEFIT_ICON_NAMES,
  type BenefitInput,
  type BenefitRow,
} from "@/features/benefits/types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: BenefitRow | null;
  onSubmit: (values: BenefitInput) => Promise<void>;
};

const MAX_IMAGE_BYTES = 1_500_000; // 1.5MB

export function BenefitFormDialog({ open, onOpenChange, initial, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BenefitInput>({
    resolver: zodResolver(benefitSchema) as any,
    defaultValues: initial
      ? {
          title: initial.title,
          description: initial.description,
          icon: initial.icon,
          activo: initial.activo,
          orden: initial.orden,
          image_url: (initial as any).image_url ?? "",
          image_opacity:
            (initial as any).image_opacity != null ? Number((initial as any).image_opacity) : 0.2,
        }
      : {
          title: "",
          description: "",
          icon: "Sparkles",
          activo: true,
          orden: 0,
          image_url: "",
          image_opacity: 0.2,
        },
  });

  const activo = watch("activo");
  const icon = watch("icon");
  const imageUrl = watch("image_url") || "";
  const imageOpacity = watch("image_opacity") ?? 0.2;

  const handleFile = async (file: File) => {
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
      const path = `benefits/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("benefit-images")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (upErr) throw upErr;
      const { data: signed, error: signErr } = await supabase.storage
        .from("benefit-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signErr) throw signErr;
      setValue("image_url", signed.signedUrl, { shouldDirty: true });
    } catch (e: any) {
      toast.error(e?.message || "No se pudo subir la imagen");
    }
  };

  const submit = async (v: BenefitInput) => {
    setSubmitting(true);
    try {
      await onSubmit(v);
      reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar beneficio" : "Nuevo beneficio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit as any)} className="grid gap-3">
          <div className="grid gap-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Título</Label>
            <Input {...register("title")} placeholder="Garantía de por vida" />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid gap-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Descripción
            </Label>
            <Textarea rows={3} {...register("description")} placeholder="Breve descripción..." />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Icono</Label>
            <div className="grid grid-cols-5 gap-2">
              {BENEFIT_ICON_NAMES.map((name) => {
                const Ico = BENEFIT_ICONS[name];
                const selected = icon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setValue("icon", name, { shouldDirty: true })}
                    title={name}
                    className={`flex aspect-square items-center justify-center rounded-md border ${
                      selected ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground"
                    }`}
                  >
                    <Ico className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Imagen de fondo
            </Label>
            <div className="relative overflow-hidden rounded-lg border border-border bg-black/40">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-32 w-full object-cover"
                    style={{ opacity: imageOpacity }}
                  />
                  <button
                    type="button"
                    onClick={() => setValue("image_url", "", { shouldDirty: true })}
                    className="absolute right-2 top-2 rounded-md bg-background/80 p-1 text-foreground"
                    aria-label="Quitar imagen"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
                  Sin imagen (fondo predeterminado)
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
                if (f) handleFile(f);
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
                Opacidad de la imagen
              </Label>
              <span className="text-xs text-muted-foreground">
                {Math.round((imageOpacity ?? 0.2) * 100)}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[Math.round((imageOpacity ?? 0.2) * 100)]}
              onValueChange={(v) =>
                setValue("image_opacity", v[0] / 100, { shouldDirty: true })
              }
            />
          </div>

          <div className="grid gap-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Orden</Label>
            <Input type="number" {...register("orden")} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label className="text-sm">Activo</Label>
            <Switch
              checked={activo}
              onCheckedChange={(v) => setValue("activo", v, { shouldDirty: true })}
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
