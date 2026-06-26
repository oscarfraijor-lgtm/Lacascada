// ── Calendario de fechas (campañas de TikTok Shop + fechas clave) ─────────
// Las fechas comerciales del mercado de la marca (TikTok Shop), para que la
// creadora sepa CUÁNDO crear contenido y aproveche las campañas grandes. Es
// admin-manejable (mismo patrón que campañas/productos) y MARKET-AWARE: cada marca
// tiene su base, así que el seed de México vive en la base de marcas MX y el de
// USA en las de USA (sin filtrar en código; los datos no se cruzan).
import { getBrand } from "@/lib/brands";

// Prioridad de campaña de TikTok Shop: SS (máxima) > S > A. Se usa para resaltar.
export type EventPriority = "SS" | "S" | "A";
// Tipo: campaña de PLATAFORMA (TikTok la corre, fecha fija) o de MARCA (todo el año).
export type EventKind = "plataforma" | "marca";

export interface CalendarEvent {
  id: string; // slug estable
  name: string; // "Hot Sale", "Día de las Madres"
  period: string; // texto legible del cuándo ("Mayo", "Nov (Buen Fin)")
  monthOrder: number; // 1-12 para ordenar; 0 = todo el año (campañas de marca)
  priority: EventPriority; // SS | S | A
  kind: EventKind; // plataforma | marca
  tip?: string; // idea de contenido para la creadora (opcional)
  active?: boolean; // el equipo lo prende/apaga en /admin (default true)
  recordId?: string; // id de registro en Airtable (solo al leer de Airtable)
}

export type CalendarEventInput = Omit<CalendarEvent, "recordId">;

// Seed de la marca activa (siembra la tabla Airtable "Calendario" y el archivo local).
export const CALENDAR_SEED: CalendarEvent[] = getBrand().calendar;

export const QUARTERS: { label: string; months: number[] }[] = [
  { label: "Q1 · Ene-Mar", months: [1, 2, 3] },
  { label: "Q2 · Abr-Jun", months: [4, 5, 6] },
  { label: "Q3 · Jul-Sep", months: [7, 8, 9] },
  { label: "Q4 · Oct-Dic", months: [10, 11, 12] },
];

export const PRIORITY_META: Record<EventPriority, { label: string; cls: string }> = {
  SS: { label: "SS · máxima", cls: "bg-brand text-white" },
  S: { label: "S · alta", cls: "bg-lime text-ink" },
  A: { label: "A", cls: "bg-ink/10 text-ink-soft" },
};
