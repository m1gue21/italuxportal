import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { countrySchema, type CountryInput, type CountryRow } from "@/features/countries/types";
import { CTA_ICONS, CTA_ICON_NAMES, CTA_ICON_LABELS } from "@/features/section-texts/cta-icons";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: CountryRow | null;
  onSubmit: (values: CountryInput) => Promise<void>;
};

export function CountryFormDialog({ open, onOpenChange, initial, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CountryInput>({
    resolver: zodResolver(countrySchema),
    defaultValues: initial
      ? {
          code: initial.code,
          name: initial.name,
          flag: initial.flag,
          whatsapp_url: initial.whatsapp_url,
          website_url: initial.website_url,
          is_active: initial.is_active,
          show_on_map: initial.show_on_map,
          map_x: initial.map_x,
          map_y: initial.map_y,
          label_side: initial.label_side,
          display_order: initial.display_order,
          subtitle: initial.subtitle ?? "Presencia Oficial",
          show_subtitle: initial.show_subtitle ?? true,
          whatsapp_label: initial.whatsapp_label ?? "WhatsApp",
          whatsapp_icon: initial.whatsapp_icon ?? "whatsapp",
          website_label: initial.website_label ?? "Página Web",
          website_icon: initial.website_icon ?? "Globe",
          button_variant: initial.button_variant ?? "gold",
          addresses: Array.isArray(initial.addresses) ? initial.addresses : [],
        }
      : {
          code: "",
          name: "",
          flag: "",
          whatsapp_url: "https://wa.me/",
          website_url: "https://",
          is_active: true,
          show_on_map: true,
          map_x: 50,
          map_y: 50,
          label_side: "right",
          display_order: 0,
          subtitle: "Presencia Oficial",
          show_subtitle: true,
          whatsapp_label: "WhatsApp",
          whatsapp_icon: "whatsapp",
          website_label: "Página Web",
          website_icon: "Globe",
          button_variant: "gold",
          addresses: [],
        },
  });

  const addresses = watch("addresses") || [];
  const setAddresses = (next: string[]) =>
    setValue("addresses", next, { shouldDirty: true });

  const is_active = watch("is_active");
  const show_on_map = watch("show_on_map");
  const show_subtitle = watch("show_subtitle");
  const label_side = watch("label_side");
  const button_variant = watch("button_variant") || "gold";
  const whatsapp_icon = watch("whatsapp_icon") || "whatsapp";
  const website_icon = watch("website_icon") || "Globe";

  const submit = async (v: CountryInput) => {
    setSubmitting(true);
    try {
      await onSubmit({
        ...v,
        addresses: (v.addresses || []).map((a) => String(a).trim()).filter(Boolean),
      });
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
          <DialogTitle>{initial ? "Editar país" : "Nuevo país"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="grid gap-3">
          <Field label="Nombre" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Colombia" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Código ISO" error={errors.code?.message}>
              <Input {...register("code")} placeholder="CO" maxLength={3} />
            </Field>
            <Field label="Bandera" error={errors.flag?.message}>
              <Input {...register("flag")} placeholder="🇨🇴" />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label className="text-sm">Mostrar subtítulo</Label>
            <Switch
              checked={show_subtitle}
              onCheckedChange={(v) => setValue("show_subtitle", v, { shouldDirty: true })}
            />
          </div>
          <Field label="Subtítulo" error={errors.subtitle?.message}>
            <Input {...register("subtitle")} placeholder="Presencia Oficial" />
          </Field>

          <Field label="WhatsApp URL" error={errors.whatsapp_url?.message}>
            <Input {...register("whatsapp_url")} placeholder="https://wa.me/57..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Texto botón WhatsApp">
              <Input {...register("whatsapp_label")} placeholder="Comprar por WhatsApp" />
            </Field>
            <Field label="Icono WhatsApp">
              <IconPicker
                value={whatsapp_icon}
                onChange={(n) => setValue("whatsapp_icon", n, { shouldDirty: true })}
              />
            </Field>
          </div>

          <Field label="Sitio web" error={errors.website_url?.message}>
            <Input {...register("website_url")} placeholder="https://..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Texto botón Web">
              <Input {...register("website_label")} placeholder="Comprar en la web" />
            </Field>
            <Field label="Icono Web">
              <IconPicker
                value={website_icon}
                onChange={(n) => setValue("website_icon", n, { shouldDirty: true })}
              />
            </Field>
          </div>

          <Field label="Color de los botones">
            <div className="flex gap-2">
              {(["gold", "light"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setValue("button_variant", v, { shouldDirty: true })}
                  className={`flex-1 rounded-md border px-3 py-2 text-xs uppercase tracking-wider ${
                    button_variant === v
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {v === "gold" ? "Dorado" : "Blanco"}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-2 rounded-md border border-border p-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Direcciones (opcional)
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setAddresses([...addresses, ""])}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Añadir
              </Button>
            </div>
            {addresses.length === 0 && (
              <p className="text-[11px] text-muted-foreground">
                No hay direcciones. Añade una para mostrarla bajo los botones.
              </p>
            )}
            {addresses.map((value, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={value ?? ""}
                  onChange={(e) => {
                    const next = [...addresses];
                    next[i] = e.target.value;
                    setAddresses(next);
                  }}
                  placeholder="Cra 10 # 17 - 55, Pereira"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setAddresses(addresses.filter((_, idx) => idx !== i))}
                  aria-label="Eliminar dirección"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Mapa X (0-100)" error={errors.map_x?.message}>
              <Input type="number" step="0.1" {...register("map_x")} />
            </Field>
            <Field label="Mapa Y (0-100)" error={errors.map_y?.message}>
              <Input type="number" step="0.1" {...register("map_y")} />
            </Field>
          </div>

          <Field label="Lado del nombre">
            <div className="flex gap-2">
              {(["left", "right"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue("label_side", s, { shouldDirty: true })}
                  className={`flex-1 rounded-md border px-3 py-2 text-xs uppercase tracking-wider ${
                    label_side === s ? "border-gold bg-gold/10 text-gold" : "border-border"
                  }`}
                >
                  {s === "left" ? "Izquierda" : "Derecha"}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label className="text-sm">Activo</Label>
            <Switch
              checked={is_active}
              onCheckedChange={(v) => setValue("is_active", v, { shouldDirty: true })}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label className="text-sm">Mostrar en mapa</Label>
            <Switch
              checked={show_on_map}
              onCheckedChange={(v) => setValue("show_on_map", v, { shouldDirty: true })}
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

function IconPicker({ value, onChange }: { value: string; onChange: (n: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {CTA_ICON_NAMES.map((name) => {
        const Ico = CTA_ICONS[name];
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            title={CTA_ICON_LABELS[name] ?? name}
            className={`flex aspect-square items-center justify-center rounded-md border ${
              selected ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground"
            }`}
          >
            <Ico className="h-4 w-4" strokeWidth={1.8} />
          </button>
        );
      })}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
