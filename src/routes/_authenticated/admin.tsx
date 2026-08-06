import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { GripVertical, Pencil, Trash2, LogOut, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { adminCountriesQuery } from "@/features/countries/queries";
import type { CountryRow, CountryInput } from "@/features/countries/types";
import { CountryFormDialog } from "@/features/admin/CountryFormDialog";
import { AdminNav } from "@/features/admin/AdminNav";
import { useIsAdmin } from "@/features/admin/useIsAdmin";
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

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { loading: roleLoading, isAdmin, hasAnyAdmin, userId, refresh } = useIsAdmin();
  const { data: countries = [], isLoading } = useQuery({
    ...adminCountriesQuery,
    enabled: isAdmin,
  });

  const [editing, setEditing] = useState<CountryRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CountryRow | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["countries"] });
  };

  const createMut = useMutation({
    mutationFn: async (values: CountryInput) => {
      const { error } = await supabase.from("countries").insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("País creado");
      invalidateAll();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<CountryInput> }) => {
      const { error } = await supabase.from("countries").update(values).eq("id", id);
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
      const { error } = await supabase.from("countries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("País eliminado");
      invalidateAll();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reorderMut = useMutation({
    mutationFn: async (ordered: CountryRow[]) => {
      // Update display_order one by one
      const updates = ordered.map((c, idx) =>
        supabase.from("countries").update({ display_order: idx + 1 }).eq("id", c.id),
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
    const oldIdx = countries.findIndex((c) => c.id === active.id);
    const newIdx = countries.findIndex((c) => c.id === over.id);
    const next = arrayMove(countries, oldIdx, newIdx);
    qc.setQueryData(adminCountriesQuery.queryKey, next);
    reorderMut.mutate(next);
  };

  const signOut = async () => {
    navigate({ to: "/" });
  };

  const claimAdmin = async () => {
    if (!userId) return;
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Eres administrador");
    refresh();
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
          {!hasAnyAdmin ? (
            <>
              <p className="mt-2 text-xs text-muted-foreground">
                Aún no existe ningún administrador. Conviértete en el primero.
              </p>
              <Button className="mt-4 w-full" onClick={claimAdmin}>
                Convertirme en administrador
              </Button>
            </>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Tu cuenta no tiene permisos de administrador.
            </p>
          )}
          <button onClick={signOut} className="mt-4 text-[11px] uppercase tracking-[0.2em] text-gold/70">
            Cerrar sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-6 text-foreground">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-2">
          <div>
            <AdminNav current="/admin" />
            <h1 className="font-display mt-1 text-2xl font-light tracking-wide">
              Gestión de países
            </h1>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="mr-1 h-4 w-4" /> Nuevo
            </Button>
            <Button size="sm" variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <p className="mt-2 text-xs text-muted-foreground">
          Arrastra para reordenar. Los cambios se reflejan al instante en la landing.
        </p>

        <section className="mt-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando países...</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={countries.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="grid gap-2">
                  {countries.map((c) => (
                    <SortableRow
                      key={c.id}
                      country={c}
                      onToggleActive={(v) =>
                        updateMut.mutate({ id: c.id, values: { is_active: v } })
                      }
                      onToggleMap={(v) =>
                        updateMut.mutate({ id: c.id, values: { show_on_map: v } })
                      }
                      onEdit={() => setEditing(c)}
                      onDelete={() => setDeleting(c)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </section>
      </div>

      {creating && (
        <CountryFormDialog
          open={creating}
          onOpenChange={setCreating}
          onSubmit={async (v) => {
            await createMut.mutateAsync({ ...v, display_order: countries.length + 1 });
          }}
        />
      )}
      {editing && (
        <CountryFormDialog
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
            <AlertDialogTitle>Eliminar país</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar {deleting?.name}? Esta acción no se puede deshacer.
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

function SortableRow({
  country,
  onToggleActive,
  onToggleMap,
  onEdit,
  onDelete,
}: {
  country: CountryRow;
  onToggleActive: (v: boolean) => void;
  onToggleMap: (v: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: country.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-gold/15 bg-white/[0.02] p-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label="Reordenar"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="text-2xl">{country.flag}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{country.name}</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {country.code}
        </p>
      </div>
      <div className="hidden items-center gap-3 sm:flex">
        <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Activo
          <Switch checked={country.is_active} onCheckedChange={onToggleActive} />
        </label>
        <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Mapa
          <Switch checked={country.show_on_map} onCheckedChange={onToggleMap} />
        </label>
      </div>
      <div className="flex items-center gap-1 sm:hidden">
        <button
          type="button"
          onClick={() => onToggleActive(!country.is_active)}
          className="rounded-md p-2 text-muted-foreground hover:text-foreground"
          aria-label="Activo"
        >
          {country.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>
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
