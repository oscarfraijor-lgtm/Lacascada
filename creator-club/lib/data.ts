// Capa de datos del dashboard. Deriva TODO de la sesión real + las tablas
// (Creadoras/Entregas/Campañas). El catálogo de recompensas es estático (diseño
// del programa), no datos de una persona.
import { getBrand } from "@/lib/brands";
import type { Creator, LeaderboardRow, Reward } from "@/lib/types";
import { MISSIONS, type Mission, levelForStars } from "@/lib/schema";
import { getCurrentCreator, currentEmail } from "@/lib/session";
import {
  participationsFor,
  listParticipations,
  listCampaigns,
  listCreators,
  starsFromApproved,
} from "@/lib/store";

export interface MissionWithStatus extends Mission {
  done: boolean;
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
  return MISSIONS.map((m) => ({ ...m, done: creator.completedMissionIds.includes(m.id) }));
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

// Catálogo de recompensas de la marca activa (estático por ahora; el flujo de
// canje con candado por GMV es una fase posterior).
export async function getRewards(): Promise<Reward[]> {
  return getBrand().rewards;
}
