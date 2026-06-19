// Capa de datos: usa Airtable si está configurado, si no, datos mock.
// Hoy devuelve mock; el cableado real a Airtable se añade aquí sin tocar la UI.
import { airtableConfigured } from "@/lib/airtable";
import { mockCreator, mockLeaderboard, mockRewards } from "@/lib/mock";
import type { Creator, LeaderboardRow, Reward } from "@/lib/types";
import { MISSIONS, type Mission } from "@/lib/schema";

export interface MissionWithStatus extends Mission {
  done: boolean;
}

export async function getCreator(): Promise<Creator> {
  if (!airtableConfigured()) return mockCreator;
  // TODO: leer de Airtable (tabla Creadoras) cuando el base exista.
  return mockCreator;
}

export async function getMissions(creator: Creator): Promise<MissionWithStatus[]> {
  return MISSIONS.map((m) => ({ ...m, done: creator.completedMissionIds.includes(m.id) }));
}

export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  if (!airtableConfigured()) return mockLeaderboard;
  return mockLeaderboard;
}

export async function getRewards(): Promise<Reward[]> {
  return mockRewards;
}

export function usingMockData(): boolean {
  return !airtableConfigured();
}
