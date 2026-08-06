import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { faqSchema, type FaqInput, type FaqRow } from "@/features/faqs/types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: FaqRow | null;
  onSubmit: (values: FaqInput) => Promise<void>;
};

export function FaqFormDialog({ open, onOpenChange, initial, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FaqInput>({
    resolver: zodResolver(faqSchema),
    defaultValues: initial
      ? {
          pregunta: initial.pregunta,
          respuesta: initial.respuesta,
          activo: initial.activo,
          orden: initial.orden,
        }
      : { pregunta: "", respuesta: "", activo: true, orden: 0 },
  });

  const activo = watch("activo");

  const submit = async (v: FaqInput) => {
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
          <DialogTitle>{initial ? "Editar pregunta" : "Nueva pregunta"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="grid gap-3">
          <div className="grid gap-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Pregunta
            </Label>
            <Input {...register("pregunta")} placeholder="¿..." />
            {errors.pregunta && (
              <p className="text-xs text-destructive">{errors.pregunta.message}</p>
            )}
          </div>
          <div className="grid gap-1">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Respuesta
            </Label>
            <Textarea rows={5} {...register("respuesta")} placeholder="Respuesta breve..." />
            {errors.respuesta && (
              <p className="text-xs text-destructive">{errors.respuesta.message}</p>
            )}
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
