/**
 * Un link de wa.me solo acepta texto, así que el PDF se entrega por la hoja
 * de compartir del sistema: el cliente elige WhatsApp y el archivo va adjunto.
 * Donde no exista (escritorio, navegadores viejos) se descarga el PDF y se
 * abre WhatsApp con el resumen en texto para adjuntarlo a mano.
 */

export type ShareOutcome = "shared" | "downloaded" | "cancelled";

export function canShareFile(file: File): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  try {
    return navigator.canShare?.({ files: [file] }) ?? false;
  } catch {
    return false;
  }
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Dale tiempo al navegador a empezar la descarga antes de soltar el blob.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function shareOrderPdf(
  file: File,
  opts: { message: string; whatsappUrl?: string },
): Promise<ShareOutcome> {
  if (canShareFile(file)) {
    try {
      await navigator.share({ files: [file], text: opts.message });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
      // Cualquier otro fallo (permiso, gesto expirado) cae en la descarga.
    }
  }

  downloadFile(file);
  if (opts.whatsappUrl) {
    window.open(opts.whatsappUrl, "_blank", "noopener,noreferrer");
  }
  return "downloaded";
}
