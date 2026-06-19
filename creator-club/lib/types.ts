import type { LevelKey } from "@/lib/schema";

export interface Creator {
  id: string;
  name: string;
  handle: string; // @tiktok
  avatar?: string;
  stars: number;
  gmvMXN: number;
  level: LevelKey;
  completedMissionIds: string[];
}

export interface LeaderboardRow {
  rank: number;
  name: string;
  handle: string;
  stars: number;
  isMe?: boolean;
}

export interface Reward {
  id: string;
  title: string;
  detail: string;
  cost: string; // descripción del requisito (estrellas / GMV)
  kind: "estatus" | "producto" | "boost" | "cash" | "experiencia";
  payer: "club" | "marca";
}
