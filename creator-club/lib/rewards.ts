// ── Candado de recompensas (lógica pura) ────────────────────────────────
// Decide si una recompensa está Disponible / Desbloqueada / Bloqueada según
// estrellas + GMV atribuible, y si un canje se puede aprobar (gate anti-fuga).
// Regla maestra: nada con costo real se entrega sin venta atribuible en TTS.
import type { Reward } from "@/lib/types";

export type RewardStatusKey =
  | "disponible" //  recompensa de estatus (costo $0), ya alcanzada
  | "desbloqueada" //  cumple estrellas Y GMV: puede solicitar el canje
  | "bloqueada" //  aún no cumple el criterio
  | "solicitada" //  ya pidió el canje, en revisión del equipo
  | "aprobada" //  el equipo aprobó el canje
  | "rechazada"; //  el equipo lo rechazó (puede volver a solicitar)

// Una recompensa con costo real (producto/boost/cash/experiencia) NO se entrega
// sin venta atribuible. Solo "estatus" es gratis (costo $0).
export function rewardHasCost(r: Reward): boolean {
  return r.kind !== "estatus";
}

// ¿La creadora cumple el criterio de desbloqueo? (sin contar el canje vigente)
// Anti-fuga: cualquier recompensa con costo exige GMV atribuible > 0.
export function rewardUnlocked(r: Reward, stars: number, gmv: number): boolean {
  const meetsStars = stars >= (r.minStars ?? 0);
  const meetsGmv = gmv >= (r.minGmvMXN ?? 0) && (!rewardHasCost(r) || gmv > 0);
  return meetsStars && meetsGmv;
}

// Estado completo combinando el criterio + el canje vigente (si existe).
export function rewardState(
  r: Reward,
  stars: number,
  gmv: number,
  canjeStatus?: string
): RewardStatusKey {
  if (canjeStatus === "solicitada") return "solicitada";
  if (canjeStatus === "aprobada") return "aprobada";
  if (canjeStatus === "rechazada") return "rechazada";
  if (!rewardHasCost(r)) return rewardUnlocked(r, stars, gmv) ? "disponible" : "bloqueada";
  return rewardUnlocked(r, stars, gmv) ? "desbloqueada" : "bloqueada";
}

// Frase exacta de lo que falta para desbloquear (criterio honesto y específico).
export function rewardMissing(r: Reward, stars: number, gmv: number): string {
  const needStars = Math.max(0, (r.minStars ?? 0) - stars);
  const needGmv = Math.max(0, (r.minGmvMXN ?? 0) - gmv);
  const parts: string[] = [];
  if (needStars > 0) parts.push(`${needStars.toLocaleString("es-MX")} estrellas`);
  if (needGmv > 0) parts.push(`$${needGmv.toLocaleString("es-MX")} MXN en ventas`);
  // Caso anti-fuga: recompensa con costo, sin umbral de GMV propio, pero sin ventas.
  if (!parts.length && rewardHasCost(r) && gmv <= 0) {
    return "Necesitas tu primera venta atribuible en TikTok Shop.";
  }
  if (!parts.length) return "Lista para canjear.";
  return `Te faltan ${parts.join(" y ")}.`;
}

// Requisito legible para mostrar siempre (esté o no desbloqueada).
export function rewardRequirement(r: Reward): string {
  const bits: string[] = [];
  if ((r.minStars ?? 0) > 0) bits.push(`${(r.minStars ?? 0).toLocaleString("es-MX")} estrellas`);
  if ((r.minGmvMXN ?? 0) > 0) bits.push(`$${(r.minGmvMXN ?? 0).toLocaleString("es-MX")} MXN en ventas`);
  else if (rewardHasCost(r)) bits.push("venta atribuible");
  return bits.length ? `Requiere ${bits.join(" + ")}` : "Sin requisito";
}

// Gate de servidor para aprobar un canje: una recompensa con costo exige GMV
// atribuible suficiente. Independiente de la UI (defensa en profundidad).
export function canApproveCanje(r: Reward, creatorGmv: number): boolean {
  if (!rewardHasCost(r)) return true;
  return creatorGmv > 0 && creatorGmv >= (r.minGmvMXN ?? 0);
}
