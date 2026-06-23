// Capa de datos del dashboard. Deriva TODO de la sesión real + las tablas
// (Creadoras/Entregas/Campañas). El catálogo de recompensas es estático (diseño
// del programa); su candado (Disponible/Desbloqueada/Bloqueada) se calcula con
// las estrellas + el GMV reales de la creadora.
import { getBrand } from "@/lib/brands";
import type { Creator, LeaderboardRow, Reward } from "@/lib/types";
import { MISSIONS, type Mission, levelForStars } from "@/lib/schema";
import {
  type RewardStatusKey,
  rewardHasCost,
  rewardUnlocked,
  rewardState,
  rewardMissing,
  rewardRequirement,
} from "@/lib/rewards";
import {
  type MissionUIState,
  type MissionContext,
  missionView,
  starsFromMissions,
  completedMissionIds,
} from "@/lib/missions";
import { currentEmail } from "@/lib/session";
import { getClubViewer } from "@/lib/club-viewer";
import type { Campaign } from "@/lib/campaigns";
import {
  type Participation,
  type MisionCompletion,
  participationsFor,
  listParticipations,
  listCampaigns,
  listCreators,
  canjesFor,
  misionesFor,
  listMisiones,
  starsFromApproved,
} from "@/lib/store";

// Estrellas reales de una creadora = entregas de campaña APROBADAS + misiones
// completadas. UNA sola fórmula para que el nivel, el dashboard, el candado de
// recompensas y el ranking nunca se contradigan. El candado de GMV de las
// recompensas con costo es independiente (lib/rewards), así que sumar aquí las
// estrellas de estatus NO abre ninguna fuga.
export function combinedStars(
  parts: Participation[],
  campaigns: Campaign[],
  ctx: MissionContext,
  completions: MisionCompletion[]
): number {
  return starsFromApproved(parts, campaigns) + starsFromMissions(MISSIONS, ctx, completions);
}

export interface MissionWithStatus extends Mission {
  state: MissionUIState;
  done: boolean;
  locked: boolean; // misión de venta sin GMV atribuible aún
  lockReason?: string;
  link?: string; // link enviado (misiones de contenido)
  reason?: string; // motivo de rechazo (misiones de contenido rechazadas)
  hint?: string; // qué falta para cumplirla (ej. campos del perfil)
}

// La creadora actual (de la sesión), con estrellas reales = entregas aprobadas +
// misiones completadas. null si no hay sesión.
export async function getCreator(): Promise<Creator | null> {
  const { creator: session } = await getClubViewer();
  if (!session) return null;
  const [parts, campaigns, completions] = await Promise.all([
    participationsFor(session.email),
    listCampaigns(),
    misionesFor(session.email),
  ]);
  const stars = combinedStars(parts, campaigns, session, completions);
  const gmvMXN = session.gmvMXN ?? 0;
  return {
    id: session.id ?? "",
    name: session.name,
    handle: session.handle || "",
    affiliateHandle: session.affiliateHandle,
    stars,
    gmvMXN,
    level: levelForStars(stars, gmvMXN).key,
    completedMissionIds: completedMissionIds(MISSIONS, session, completions),
  };
}

// Misiones con su estado real para la creadora actual (de la sesión). Combina
// datos derivados (perfil/afiliado), registros persistidos (inducción/contenido)
// y el candado por GMV (venta). Si no hay sesión, devuelve todo "pendiente".
export async function getMissions(): Promise<MissionWithStatus[]> {
  const { creator: session } = await getClubViewer();
  const completions = session ? await misionesFor(session.email) : [];
  const byId = new Map(completions.map((c) => [c.missionId, c]));
  const ctx = session ?? {};
  return MISSIONS.map((m) => {
    const comp = byId.get(m.id);
    const v = missionView(m, ctx, comp);
    return {
      ...m,
      state: v.state,
      done: v.done,
      locked: v.locked,
      lockReason: v.locked ? "Se activa con tu primera venta atribuible en TikTok Shop." : undefined,
      link: comp?.link,
      reason: comp?.status === "rechazada" ? comp.reason : undefined,
      hint: m.id === "perfil" && !v.done && session ? missingProfileHint(session) : undefined,
    };
  });
}

// "Te falta: portafolio, ciudad." para la misión de perfil incompleto.
function missingProfileHint(c: MissionContext): string | undefined {
  const missing: string[] = [];
  if (!c.name?.trim()) missing.push("nombre");
  if (!c.handle?.trim()) missing.push("usuario de TikTok");
  if (!c.portfolio?.trim()) missing.push("portafolio");
  if (!c.city?.trim()) missing.push("ciudad");
  return missing.length ? `Te falta: ${missing.join(", ")}.` : undefined;
}

// Ranking REAL: estrellas por creadora = entregas aprobadas + misiones completadas.
export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const [creators, parts, campaigns, misiones, meEmail] = await Promise.all([
    listCreators(),
    listParticipations(),
    listCampaigns(),
    listMisiones(),
    currentEmail(),
  ]);
  const partsByEmail = new Map<string, typeof parts>();
  for (const p of parts) {
    const k = p.creatorEmail.toLowerCase();
    const arr = partsByEmail.get(k);
    if (arr) arr.push(p);
    else partsByEmail.set(k, [p]);
  }
  const misionesByEmail = new Map<string, typeof misiones>();
  for (const m of misiones) {
    const k = m.creatorEmail.toLowerCase();
    const arr = misionesByEmail.get(k);
    if (arr) arr.push(m);
    else misionesByEmail.set(k, [m]);
  }
  const me = meEmail?.toLowerCase();
  return creators
    .map((c) => {
      const isMe = !!me && c.email.toLowerCase() === me;
      const key = c.email.toLowerCase();
      return {
        // Privacidad: en el ranking público solo va el nombre completo + handle de
        // una misma; a las demás se les muestra nombre corto y sin handle (LFPDPPP).
        name: isMe ? c.name : shortName(c.name),
        handle: isMe ? c.handle || "" : "",
        stars:
          starsFromApproved(partsByEmail.get(key) ?? [], campaigns) +
          starsFromMissions(MISSIONS, c, misionesByEmail.get(key) ?? []),
        isMe,
      };
    })
    .filter((r) => r.stars > 0) // el ranking solo lista a quien ya ganó estrellas
    .sort((a, b) => b.stars - a.stars)
    .map((row, i) => ({ rank: i + 1, ...row }))
    .slice(0, 20);
}

// "María Fernanda García" -> "María G." para el ranking público.
function shortName(full: string): string {
  const parts = (full || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] || "Creadora";
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

// Catálogo de recompensas con su estado real para la creadora actual: Disponible
// (estatus, $0) / Desbloqueada (cumple estrellas + GMV) / Bloqueada (con criterio
// exacto) y el estado del canje (solicitada/aprobada/rechazada) si existe.
export interface RewardView extends Reward {
  hasCost: boolean;
  unlocked: boolean; // cumple el criterio (sin contar el canje)
  state: RewardStatusKey;
  missing: string; // qué falta para desbloquear / "Lista para canjear"
  requirement: string; // requisito legible siempre
  reason?: string; // motivo de rechazo del canje (si aplica)
}

export interface RewardsView {
  signedIn: boolean;
  stars: number;
  gmvMXN: number;
  gmvDate?: string;
  rewards: RewardView[];
}

export async function getRewardsView(): Promise<RewardsView> {
  const rewards = getBrand().rewards;
  const { creator: session } = await getClubViewer();
  if (!session) {
    // Catálogo para visitantes: solo el requisito, sin estado personal.
    return {
      signedIn: false,
      stars: 0,
      gmvMXN: 0,
      rewards: rewards.map((r) => ({
        ...r,
        hasCost: rewardHasCost(r),
        unlocked: false,
        state: "bloqueada",
        missing: rewardRequirement(r),
        requirement: rewardRequirement(r),
      })),
    };
  }
  const [parts, campaigns, canjes, completions] = await Promise.all([
    participationsFor(session.email),
    listCampaigns(),
    canjesFor(session.email),
    misionesFor(session.email),
  ]);
  // Mismo total que el nivel/dashboard (combinedStars): el candado de recompensas
  // no debe contradecir el nivel mostrado. El gate de GMV (rewards) sigue aparte.
  const stars = combinedStars(parts, campaigns, session, completions);
  const gmv = session.gmvMXN ?? 0;
  const canjeByReward = new Map(canjes.map((c) => [c.rewardId, c]));
  return {
    signedIn: true,
    stars,
    gmvMXN: gmv,
    gmvDate: session.gmvDate,
    rewards: rewards.map((r) => {
      const canje = canjeByReward.get(r.id);
      return {
        ...r,
        hasCost: rewardHasCost(r),
        unlocked: rewardUnlocked(r, stars, gmv),
        state: rewardState(r, stars, gmv, canje?.status),
        missing: rewardMissing(r, stars, gmv),
        requirement: rewardRequirement(r),
        reason: canje?.reason,
      };
    }),
  };
}

// Historial de estrellas (ledger): recibo línea por línea de cada estrella
// otorgada. Combina entregas de campaña APROBADAS + misiones completadas.
export interface LedgerEntry {
  id: string; // llave única de la línea
  title: string;
  stars: number;
  date?: string; // createdAt del registro (las misiones "auto" no tienen fecha)
  source: "campana" | "mision";
}

export async function getStarLedger(): Promise<LedgerEntry[]> {
  const { creator: session } = await getClubViewer();
  if (!session) return [];
  const [parts, campaigns, completions] = await Promise.all([
    participationsFor(session.email),
    listCampaigns(),
    misionesFor(session.email),
  ]);
  const byId = new Map(campaigns.map((c) => [c.id, c]));
  const rows: LedgerEntry[] = [];

  // Campañas: una línea por campaña aprobada (dedupe por si hubiera 2 de la misma).
  const seen = new Set<string>();
  for (const p of parts) {
    if (p.status !== "aprobada" || seen.has(p.campaignId)) continue;
    seen.add(p.campaignId);
    const c = byId.get(p.campaignId);
    rows.push({
      id: `campana-${p.campaignId}`,
      title: c?.title ?? p.campaignId,
      stars: c?.stars ?? 0,
      date: p.createdAt,
      source: "campana",
    });
  }

  // Misiones: una línea por misión que otorgó estrellas (auto cumplida, inducción
  // vista o contenido aprobado). Las de venta no aparecen (no otorgan aquí).
  const compById = new Map(completions.map((c) => [c.missionId, c]));
  for (const m of MISSIONS) {
    const comp = compById.get(m.id);
    if (!missionView(m, session, comp).done) continue;
    rows.push({
      id: `mision-${m.id}`,
      title: m.title,
      stars: m.stars,
      date: comp?.createdAt,
      source: "mision",
    });
  }

  return rows.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
