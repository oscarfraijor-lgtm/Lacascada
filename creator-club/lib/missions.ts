// ── Lógica de misiones (pura) ────────────────────────────────────────────
// Deriva el estado de cada misión y cuántas estrellas otorga, combinando:
//   (a) datos que ya existen de la creadora (perfil completo, @afiliado) -> auto
//   (b) registros persistidos (inducción vista, video enviado/aprobado) -> watch/submit
//   (c) GMV atribuible (misiones de venta) -> sale (bloqueadas sin venta)
// Regla maestra anti-fuga: el estatus es gratis (auto/watch); el contenido lo
// valida el equipo antes de dar estrellas (submit); la venta la acredita el equipo
// desde el GMV real (sale). Nada con costo se entrega sin venta atribuible (eso
// vive en lib/rewards.ts, intacto).
import type { Mission } from "@/lib/schema";
import type { MisionCompletion } from "@/lib/store";

// Estado que ve la UI para una misión.
export type MissionUIState =
  | "pendiente" //  sin empezar
  | "completada" //  estatus logrado (auto/watch)
  | "enviada" //  contenido en revisión del equipo
  | "aprobada" //  contenido aprobado (otorgó estrellas)
  | "rechazada" //  contenido rechazado (puede reenviar)
  | "disponible" //  venta: ya hay GMV, el equipo la acredita
  | "bloqueada"; //  venta: sin GMV todavía

// Datos mínimos de la creadora para evaluar las misiones "auto".
export interface MissionContext {
  name?: string;
  handle?: string;
  city?: string;
  portfolio?: string;
  affiliateHandle?: string;
  gmvMXN?: number;
}

// Perfil "completo": nombre + usuario de TikTok + portafolio + ciudad.
export function profileComplete(c: MissionContext): boolean {
  return !!(c.name?.trim() && c.handle?.trim() && c.portfolio?.trim() && c.city?.trim());
}

// ¿La condición "auto" de esta misión está cumplida? (misiones derivadas de datos).
// Solo las dos misiones de onboarding conocidas; cualquier otra "auto" cae a false.
function autoMet(mission: Mission, c: MissionContext): boolean {
  if (mission.id === "perfil") return profileComplete(c);
  if (mission.id === "conectar-tt") return !!c.affiliateHandle?.trim();
  return false;
}

export interface MissionView {
  state: MissionUIState;
  done: boolean; // las estrellas cuentan (estatus logrado o contenido aprobado)
  locked: boolean; // misión de venta sin GMV
}

// Estado de una misión para una creadora, dado su registro persistido (si existe).
export function missionView(mission: Mission, c: MissionContext, completion?: MisionCompletion): MissionView {
  switch (mission.action) {
    case "sale": {
      const gmv = c.gmvMXN ?? 0;
      return gmv > 0
        ? { state: "disponible", done: false, locked: false }
        : { state: "bloqueada", done: false, locked: true };
    }
    case "auto": {
      const ok = autoMet(mission, c);
      return { state: ok ? "completada" : "pendiente", done: ok, locked: false };
    }
    case "watch": {
      const ok = completion?.status === "completada";
      return { state: ok ? "completada" : "pendiente", done: ok, locked: false };
    }
    case "submit":
    default: {
      const s = completion?.status;
      if (s === "aprobada") return { state: "aprobada", done: true, locked: false };
      if (s === "enviada") return { state: "enviada", done: false, locked: false };
      if (s === "rechazada") return { state: "rechazada", done: false, locked: false };
      return { state: "pendiente", done: false, locked: false };
    }
  }
}

// Estrellas ganadas por misiones: auto cumplidas + watch completadas + submit
// aprobadas. Las de venta NUNCA cuentan aquí (su valor es el GMV -> nivel; anti-fuga).
export function starsFromMissions(missions: Mission[], c: MissionContext, completions: MisionCompletion[]): number {
  const byId = new Map(completions.map((x) => [x.missionId, x]));
  let total = 0;
  for (const m of missions) {
    if (missionView(m, c, byId.get(m.id)).done) total += m.stars;
  }
  return total;
}

// Ids de las misiones completadas (estrellas otorgadas).
export function completedMissionIds(missions: Mission[], c: MissionContext, completions: MisionCompletion[]): string[] {
  const byId = new Map(completions.map((x) => [x.missionId, x]));
  return missions.filter((m) => missionView(m, c, byId.get(m.id)).done).map((m) => m.id);
}
