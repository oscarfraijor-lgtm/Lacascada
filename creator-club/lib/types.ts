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

export type RewardKind = "estatus" | "producto" | "boost" | "cash" | "experiencia";

export interface Reward {
  id: string;
  title: string;
  detail: string;
  cost: string; // descripción legible del requisito (estrellas / GMV)
  kind: RewardKind;
  payer: "club" | "marca";
  // Umbrales del candado real (default 0). Las recompensas con costo
  // (kind != "estatus") exigen además GMV atribuible > 0 (anti-fuga).
  minStars?: number;
  minGmvMXN?: number;
  // Scope por CATEGORÍA de creadora (nivel/badge de TikTok, lib/tiers). Vacío/ausente
  // = abierto a todas. Si trae llaves ("l2","l3"), solo esas categorías lo ven/canjean.
  tiers?: string[];
  active?: boolean; // el equipo prende/apaga el premio en /admin (default true)
  recordId?: string; // id del registro en Airtable (solo al leer de Airtable)
}

// Datos editables por el admin = todo menos el recordId.
export type RewardInput = Omit<Reward, "recordId">;
