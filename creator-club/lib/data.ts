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
import { getCurrentCreator, currentEmail } from "@/lib/session";
import {
  participationsFor,
  listParticipations,
  listCampaigns,
  listCreators,
  canjesFor,
  starsFromApproved,
} from "@/lib/store";

export interface MissionWithStatus extends Mission {
  done: boolean;
  locked: boolean; // misión de venta sin GMV atribuible aún
  lockReason?: string;
}

// La creadora actual (de la sesión), con estrellas reales derivadas de sus
// entregas aprobadas. null si no hay sesión.
export async function getCreator(): Promise<Creator | null> {
  const session = await getCurrentCreator();
  if (!session) return null;
  const [parts, campaigns] = await Promise.all([
    participationsFor(session.email),
    listCampaigns(),
  ]);
  const stars = starsFromApproved(parts, campaigns);
  const gmvMXN = session.gmvMXN ?? 0;
  return {
    id: session.id ?? "",
    name: session.name,
    handle: session.handle || "",
    stars,
    gmvMXN,
    level: levelForStars(stars, gmvMXN).key,
    completedMissionIds: [], // el tracking real de misiones llega en una fase posterior
  };
}

export async function getMissions(creator: Creator): Promise<MissionWithStatus[]> {
  const gmv = creator.gmvMXN ?? 0;
  // Candado honesto por GMV: las misiones de venta solo se activan cuando hay
  // venta atribuible (anti-fuga). No fingimos "completada" sin tracking real.
  return MISSIONS.map((m) => {
    const locked = m.requiresSale && gmv <= 0;
    return {
      ...m,
      done: creator.completedMissionIds.includes(m.id),
      locked,
      lockReason: locked ? "Se activa con tu primera venta atribuible en TikTok Shop." : undefined,
    };
  });
}

// Ranking REAL: estrellas aprobadas por creadora (antes era 100% inventado).
export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const [creators, parts, campaigns, meEmail] = await Promise.all([
    listCreators(),
    listParticipations(),
    listCampaigns(),
    currentEmail(),
  ]);
  const partsByEmail = new Map<string, typeof parts>();
  for (const p of parts) {
    const k = p.creatorEmail.toLowerCase();
    const arr = partsByEmail.get(k);
    if (arr) arr.push(p);
    else partsByEmail.set(k, [p]);
  }
  const me = meEmail?.toLowerCase();
  return creators
    .map((c) => ({
      name: c.name,
      handle: c.handle || "",
      stars: starsFromApproved(partsByEmail.get(c.email.toLowerCase()) ?? [], campaigns),
      isMe: !!me && c.email.toLowerCase() === me,
    }))
    .sort((a, b) => b.stars - a.stars)
    .map((row, i) => ({ rank: i + 1, ...row }))
    .slice(0, 20);
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
  const session = await getCurrentCreator();
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
  const [parts, campaigns, canjes] = await Promise.all([
    participationsFor(session.email),
    listCampaigns(),
    canjesFor(session.email),
  ]);
  const stars = starsFromApproved(parts, campaigns);
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
// otorgada. Versión mínima: itera las entregas APROBADAS (datos que ya existen).
export interface LedgerEntry {
  campaignId: string;
  title: string;
  stars: number;
  date?: string; // fecha del registro de la participación (createdAt)
}

export async function getStarLedger(): Promise<LedgerEntry[]> {
  const session = await getCurrentCreator();
  if (!session) return [];
  const [parts, campaigns] = await Promise.all([
    participationsFor(session.email),
    listCampaigns(),
  ]);
  const byId = new Map(campaigns.map((c) => [c.id, c]));
  return parts
    .filter((p) => p.status === "aprobada")
    .map((p) => {
      const c = byId.get(p.campaignId);
      return {
        campaignId: p.campaignId,
        title: c?.title ?? p.campaignId,
        stars: c?.stars ?? 0,
        date: p.createdAt,
      };
    })
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
