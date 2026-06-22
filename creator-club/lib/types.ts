import type { LevelKey } from "@/lib/schema";

export interface Creator {
  id: string;
  name: string;
  handle: string; // @tiktok
  affiliateHandle?: string; // @usuario o link de afiliado de TikTok Shop
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
  cost: string; // descripción legible del requisito (estrellas / GMV)
  kind: "estatus" | "producto" | "boost" | "cash" | "experiencia";
  payer: "club" | "marca";
  // Umbrales del candado real (default 0). Las recompensas con costo
  // (kind != "estatus") exigen además GMV atribuible > 0 (anti-fuga).
  minStars?: number;
  minGmvMXN?: number;
}
