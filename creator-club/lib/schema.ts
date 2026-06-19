// ── Mecánica "Color Club" como código ───────────────────────────────
// Fuente única de verdad de niveles, misiones y reglas de puntos.
// Calibrado a Color Dreams (colchones). Regla maestra anti-fuga:
// nada con costo real se gatilla sin venta atribuible en TikTok Shop.

export type LevelKey = "durmiente" | "sonadora" | "insomne" | "embajadora";

export interface Level {
  key: LevelKey;
  name: string;
  minStars: number;
  minGmvMXN: number;
  perk: string;
  badge: string; // emoji/etiqueta visual
}

export const LEVELS: Level[] = [
  {
    key: "durmiente",
    name: "Durmiente",
    minStars: 0,
    minGmvMXN: 0,
    perk: "Acceso al club, misiones y leaderboard. Comisión base.",
    badge: "🌙",
  },
  {
    key: "sonadora",
    name: "Soñadora",
    minStars: 500,
    minGmvMXN: 0,
    perk: "Muestra de colchón a resultado + boost de comisión +1%.",
    badge: "✨",
  },
  {
    key: "insomne",
    name: "Insomne Pro",
    minStars: 1500,
    minGmvMXN: 60000,
    perk: "Colchón propio + early access + boost +2-3% + prioridad en Lives.",
    badge: "🛌",
  },
  {
    key: "embajadora",
    name: "Embajadora",
    minStars: 4000,
    minGmvMXN: 150000,
    perk: "Fee de campaña + experiencia CDMX + kit de creadora + co-creación.",
    badge: "👑",
  },
];

export function levelForStars(stars: number, gmvMXN: number): Level {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (stars >= lvl.minStars && gmvMXN >= lvl.minGmvMXN) current = lvl;
  }
  return current;
}

export function nextLevel(current: LevelKey): Level | null {
  const i = LEVELS.findIndex((l) => l.key === current);
  return i >= 0 && i < LEVELS.length - 1 ? LEVELS[i + 1] : null;
}

export type MissionCategory = "perfil" | "contenido" | "venta" | "live" | "comunidad";

export interface Mission {
  id: string;
  title: string;
  detail: string;
  stars: number;
  category: MissionCategory;
  // requiresSale: la misión solo da estrellas con venta atribuible en TTS
  requiresSale: boolean;
  repeatable?: boolean;
}

export const MISSIONS: Mission[] = [
  { id: "perfil", title: "Completa tu perfil", detail: "Cuéntanos de ti y acepta los términos del club.", stars: 50, category: "perfil", requiresSale: false },
  { id: "conectar-tt", title: "Conecta tu TikTok afiliado", detail: "Vincula tu cuenta al shop de Color Dreams (obligatorio para ganar).", stars: 100, category: "perfil", requiresSale: false },
  { id: "induccion", title: "Ve el video de inducción", detail: "Aprende cómo funciona el club en 3 minutos.", stars: 30, category: "perfil", requiresSale: false },
  { id: "primer-video", title: "Tu primer video con link", detail: "Publica un video con producto y tu link de afiliado de TTS.", stars: 150, category: "contenido", requiresSale: false },
  { id: "prueba-30", title: "Prueba 30 Noches", detail: "Unboxing + armado en cámara de tu colchón Color Dreams.", stars: 250, category: "contenido", requiresSale: false },
  { id: "showcase", title: "Pinned + showcase", detail: "Fija tu mejor video y agrega el producto a tu perfil de TTS.", stars: 100, category: "contenido", requiresSale: false },
  { id: "primera-venta", title: "Tu primera venta", detail: "Genera tu primera venta atribuible en TikTok Shop.", stars: 300, category: "venta", requiresSale: true },
  { id: "gmv-2k", title: "Cada $2,000 MXN de GMV", detail: "Ganas estrellas por cada AOV vendido (se valida por TTS).", stars: 100, category: "venta", requiresSale: true, repeatable: true },
  { id: "5-ventas", title: "5 ventas en el mes", detail: "Bonus por cerrar 5 ventas atribuibles en el mes.", stars: 250, category: "venta", requiresSale: true },
  { id: "cohost-live", title: "Co-host en Live de marca", detail: "Acompaña un Live oficial de Color Dreams.", stars: 200, category: "live", requiresSale: false },
  { id: "tu-live", title: "Hostea tu Live", detail: "Transmite mostrando Color Dreams (mínimo 30 min). GMV en Live cuenta doble.", stars: 250, category: "live", requiresSale: false },
  { id: "resena", title: "Reseña tras 30 noches", detail: "Comparte tu experiencia real en video.", stars: 150, category: "contenido", requiresSale: false },
  { id: "referir", title: "Refiere a otra creadora", detail: "Invita a alguien que se active y venda.", stars: 200, category: "comunidad", requiresSale: true },
];

// Color Dreams (marca activa por defecto). Multimarca-ready.
export const BRAND = {
  slug: "color-dreams",
  name: "Color Dreams",
  club: "Color Club",
  tagline: "Crea, descansa y brilla.",
  // paleta (espejo de la landing)
  cream: "#EFEDDF",
  violet: "#7979EC",
  violetDeep: "#5B5DD0",
  ink: "#2A2553",
  lime: "#C7EC4D",
};
