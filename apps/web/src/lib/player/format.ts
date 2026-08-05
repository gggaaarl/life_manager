import type { ComentarioTipo } from "./constants";

export function slugifyPersona(persona: string): string {
  return persona
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPersona(persona: string): string {
  return `'${persona}'`;
}

export function formatComentario(contenido: string, tipo: ComentarioTipo): string {
  if (tipo === "pensamiento") {
    return `(${contenido})`;
  }
  return `"${contenido}"`;
}

export function formatFechaCorta(fecha: string): string {
  const date = new Date(fecha);
  const day = date.getUTCDate();
  const month = date.toLocaleString("es-PE", { month: "short", timeZone: "UTC" });
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}
