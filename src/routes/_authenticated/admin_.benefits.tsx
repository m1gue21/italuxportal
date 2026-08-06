import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, LogOut, Plus, Eye, EyeOff, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { adminBenefitsQuery } from "@/features/benefits/queries";
import { BENEFIT_ICONS, type BenefitRow, type BenefitInput } from "@/features/benefits/types";
import { BenefitFormDialog } from "@/features/admin/BenefitFormDialog";
import { SectionTextEditor } from "@/features/admin/SectionTextEditor";
import { useIsAdmin } from "@/features/admin/useIsAdmin";
import { AdminNav } from "@/features/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/admin_/benefits")({
  component: BenefitsAdminPage,
});

function BenefitsAdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { loading: roleLoading, isAdmin } = useIsAdmin();
  const { data: benefits = [], isLoading } = useQuery({
    ...adminBenefitsQuery,
    enabled: isAdmin,
  });

  const [editing, setEditing] = useState<BenefitRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<BenefitRow | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const invalidateAll = () => qc.invalidateQueries({ queryKey: ["benefits"] });

  const createMut = useMutation({
    mutationFn: async (values: BenefitInput) => {
      const { error } = await supabase.from("benefits").insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Beneficio creado");
      invalidateAll();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<BenefitInput> }) => {
      const { error } = await supabase.from("benefits").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Guardado");
      invalidateAll();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("benefits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Beneficio eliminado");
      invalidateAll();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reorderMut = useMutation({
    mutationFn: async (ordered: BenefitRow[]) => {
      const updates = ordered.map((b, idx) =>
        supabase.from("benefits").update({ orden: idx + 1 }).eq("id", b.id),
      );
      const results = await Promise.all(updates);
      const err = results.find((r) => r.error)?.error;
      if (err) throw err;
    },
    onSuccess: () => invalidateAll(),
    onError: (e: any) => toast.error(e.message),
  });

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = benefits.findIndex((b) => b.id === active.id);
    const newIdx = benefits.findIndex((b) => b.id === over.id);
    const next = arrayMove(benefits, oldIdx, newIdx);
    qc.setQueryData(adminBenefitsQuery.queryKey, next);
    reorderMut.mutate(next);
  };

  const signOut = async () => {
    navigate({ to: "/" });
  };

  if (roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="w-full max-w-sm rounded-2xl border border-gold/20 bg-white/[0.02] p-6 text-center">
          <h1 className="font-display text-xl font-light">Acceso restringido</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Tu cuenta no tiene permisos de administrador.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-6 text-foreground">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-2">
          <div>
            <AdminNav current="/admin/benefits" />
            <h1 className="font-display mt-1 text-2xl font-light tracking-wide">
              La promesa de la maison
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <SectionTextEditor sectionKey="benefits" label="Encabezado" includeShowTitle />
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="mr-1 h-4 w-4" /> Nuevo
            </Button>
            <Button size="sm" variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <p className="mt-2 text-xs text-muted-foreground">
          Arrastra para reordenar. Solo los beneficios activos se muestran en la landing.
        </p>

        <section className="mt-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={benefits.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="grid gap-2">
                  {benefits.map((b) => (
                    <SortableBenefitRow
                      key={b.id}
                      benefit={b}
                      onToggleActive={(v) =>
                        updateMut.mutate({ id: b.id, values: { activo: v } })
                      }
                      onEdit={() => setEditing(b)}
                      onDelete={() => setDeleting(b)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </section>
      </div>

      {creating && (
        <BenefitFormDialog
          open={creating}
          onOpenChange={setCreating}
          onSubmit={async (v) => {
            await createMut.mutateAsync({ ...v, orden: v.orden || benefits.length + 1 });
          }}
        />
      )}
      {editing && (
        <BenefitFormDialog
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          initial={editing}
          onSubmit={async (v) => {
            await updateMut.mutateAsync({ id: editing.id, values: v });
            setEditing(null);
          }}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar beneficio</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar "{deleting?.title}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) deleteMut.mutate(deleting.id);
                setDeleting(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function SortableBenefitRow({
  benefit,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  benefit: BenefitRow;
  onToggleActive: (v: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: benefit.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const Icon = BENEFIT_ICONS[benefit.icon] ?? Sparkles;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 rounded-xl border border-gold/15 bg-white/[0.02] p-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label="Reordenar"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold">
        <Icon className="h-4 w-4" strokeWidth={1.4} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{benefit.title}</p>
        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{benefit.description}</p>
      </div>
      <div className="hidden sm:block">
        <Switch checked={benefit.activo} onCheckedChange={onToggleActive} />
      </div>
      <button
        type="button"
        onClick={() => onToggleActive(!benefit.activo)}
        className="rounded-md p-2 text-muted-foreground hover:text-foreground sm:hidden"
        aria-label="Activo"
      >
        {benefit.activo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="rounded-md p-2 text-muted-foreground hover:text-foreground"
        aria-label="Editar"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-md p-2 text-destructive/80 hover:text-destructive"
        aria-label="Eliminar"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
