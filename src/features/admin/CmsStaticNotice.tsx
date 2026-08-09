type Props = {
  /** Ruta relativa al repo, p. ej. src/features/cms/defaults.ts */
  filePath: string;
  className?: string;
};

/** Aviso de que el contenido se edita en código, no en el admin. */
export function CmsStaticNotice({ filePath, className }: Props) {
  return (
    <p
      className={
        className ??
        "mt-2 rounded-lg border border-gold/20 bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground"
      }
    >
      Vista previa solo lectura. Para cambiar el contenido, edita{" "}
      <code className="text-gold/90">{filePath}</code> y redeploya.
    </p>
  );
}
