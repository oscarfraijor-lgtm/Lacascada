// Registro de marcas (multimarca). UN solo código sirve a varias marcas; cada
// marca tiene su propia base de Airtable (datos aislados) y su propio deploy con
// NEXT_PUBLIC_BRAND + AIRTABLE_BASE_ID. Las mejoras de código se propagan a todas.
//
// Para una marca nueva: copia el bloque "demo" de abajo, cambia identidad/colores/
// legal, crea su base (scripts/setup-airtable.mjs con su AIRTABLE_BASE_ID) y su
// proyecto Vercel. La mecánica (niveles/misiones/recompensas/campañas) es opcional:
// si no la defines, hereda la de Color Dreams como base hasta que la personalices.
import type { Level, Mission } from "@/lib/schema";
import type { Campaign } from "@/lib/campaigns";
import type { Reward } from "@/lib/types";

// Identidad + colores + legal (obligatorio por marca)
interface BrandIdentity {
  slug: string;
  name: string; // "Color Dreams"
  club: string; // "Color Club"
  tagline: string;
  category: string; // para la banda de confianza: "colchones bed-in-a-box de México"
  operator: string; // razón social responsable (aviso de privacidad)
  operatorShort: string; // nombre comercial del operador
  contactEmail: string; // contacto ARCO / soporte
  // paleta
  cream: string;
  creamDeep: string;
  violet: string; // color de marca principal
  violetDeep: string;
  ink: string;
  inkSoft: string;
  lime: string; // acento / CTA
}

// Mecánica + contenido (opcional por marca; cae a Color Dreams si se omite)
interface BrandMechanics {
  levels?: Level[];
  missions?: Mission[];
  rewards?: Reward[];
  campaignSeed?: Campaign[];
}

export type BrandConfig = BrandIdentity & Required<BrandMechanics>;

// ── Color Dreams (marca de referencia; también es el fallback de mecánica) ──
const CD_LEVELS: Level[] = [
  { key: "durmiente", name: "Durmiente", minStars: 0, minGmvMXN: 0, perk: "Acceso al club, misiones y leaderboard. Comisión base.", badge: "🌙" },
  { key: "sonadora", name: "Soñadora", minStars: 500, minGmvMXN: 0, perk: "Muestra de colchón a resultado + boost de comisión +1%.", badge: "✨" },
  { key: "insomne", name: "Insomne Pro", minStars: 1500, minGmvMXN: 60000, perk: "Colchón propio + early access + boost +2-3% + prioridad en Lives.", badge: "🛌" },
  { key: "embajadora", name: "Embajadora", minStars: 4000, minGmvMXN: 150000, perk: "Fee de campaña + experiencia CDMX + kit de creadora + co-creación.", badge: "👑" },
];

const CD_MISSIONS: Mission[] = [
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

const CD_REWARDS: Reward[] = [
  { id: "r-status", title: "Subir de nivel + insignia", detail: "Estatus, badge y acceso a misiones premium.", cost: "Acumula estrellas", kind: "estatus", payer: "club" },
  { id: "r-muestra", title: "Muestra de colchón", detail: "Pruébalo 30 noches (atado a tu primera venta).", cost: "Nivel Soñadora", kind: "producto", payer: "marca" },
  { id: "r-boost", title: "Boost de comisión +1%", detail: "Más ganancia por cada venta vía Targeted Collab.", cost: "Nivel Soñadora", kind: "boost", payer: "marca" },
  { id: "r-colchon", title: "Colchón propio (regalo)", detail: "Tuyo para siempre.", cost: "Nivel Insomne Pro · $60K GMV", kind: "producto", payer: "marca" },
  { id: "r-cdmx", title: "Experiencia CDMX", detail: "Noche de Sueños + sesión de fotos + kit de creadora.", cost: "Nivel Embajadora · $150K GMV", kind: "experiencia", payer: "marca" },
];

const CD_CAMPAIGN_SEED: Campaign[] = [
  { id: "prueba-30", title: "Prueba 30 Noches", requirements: "Perfil completo + dirección de envío. No necesitas seguidores.", brand: "Color Dreams", brief: "Recibe tu colchón, haz el unboxing y arma en cámara. Documenta tus primeras noches con tu link de afiliado.", reward: "Colchón a prueba + 250 estrellas", stars: 250, deadline: "Cupo abierto", tag: "Producto", open: true },
  { id: "unboxing-express", title: "Unboxing Express", requirements: "Perfil completo + link de afiliado de TikTok Shop.", brand: "Color Dreams", brief: "Tu primer video mostrando cómo llega en caja y se infla en minutos. Pega tu link de TikTok Shop.", reward: "150 estrellas + boost de comisión", stars: 150, deadline: "Cupo abierto", tag: "Contenido", open: true },
  { id: "hot-sale-live", title: "Hot Sale Live", requirements: "Haber publicado al menos 1 video con Color Dreams + link de afiliado.", brand: "Color Dreams", brief: "Co-host en un Live oficial durante Hot Sale. Las ventas en Live cuentan doble.", reward: "Fee de Live + 200 estrellas", stars: 200, deadline: "Próximamente", tag: "Live", open: true },
  { id: "recamara-makeover", title: "Recámara Makeover", requirements: "Perfil completo + dirección de envío. No necesitas seguidores.", brand: "Color Dreams", brief: "Antes y después de tu recámara con tu Color Dreams. Estilo lifestyle, súper compartible.", reward: "200 estrellas", stars: 200, deadline: "Cupo abierto", tag: "Contenido", open: true },
  { id: "resena-real", title: "Reseña Real", requirements: "Haber completado Prueba 30 Noches.", brand: "Color Dreams", brief: "Tras 30 noches, comparte tu opinión honesta en video. La autenticidad vende.", reward: "150 estrellas", stars: 150, deadline: "Cupo abierto", tag: "Reseña", open: true },
];

// ── Registro de marcas ──────────────────────────────────────────────────────
type RawBrand = BrandIdentity & BrandMechanics;

const BRANDS: Record<string, RawBrand> = {
  "color-dreams": {
    slug: "color-dreams",
    name: "Color Dreams",
    club: "Color Club",
    tagline: "Crea, descansa y brilla.",
    category: "colchones bed-in-a-box de México",
    operator: "INDIEPRO MUSIC & MARKETING S.C.",
    operatorShort: "Indie Pro Marketing",
    contactEmail: "afiliadostiktok@indiepro.com.mx",
    cream: "#EFEDDF",
    creamDeep: "#E4E1CF",
    violet: "#7979EC",
    violetDeep: "#5B5DD0",
    ink: "#2A2553",
    inkSoft: "#4A4570",
    lime: "#C7EC4D",
    levels: CD_LEVELS,
    missions: CD_MISSIONS,
    rewards: CD_REWARDS,
    campaignSeed: CD_CAMPAIGN_SEED,
  },

  // ── PLANTILLA: copia y ajusta para una marca nueva ──
  // Solo identidad + colores + legal son obligatorios; la mecánica se hereda de
  // Color Dreams hasta que definas levels/missions/rewards/campaignSeed propios.
  demo: {
    slug: "demo",
    name: "Demo Beauty",
    club: "Glow Club",
    tagline: "Crea, brilla y conecta.",
    category: "skincare coreano",
    operator: "INDIEPRO MUSIC & MARKETING S.C.",
    operatorShort: "Indie Pro Marketing",
    contactEmail: "afiliadostiktok@indiepro.com.mx",
    cream: "#FFF4EC",
    creamDeep: "#FCE3D2",
    violet: "#E0533D",
    violetDeep: "#B83C2A",
    ink: "#3A2A24",
    inkSoft: "#6B5248",
    lime: "#F4B740",
  },
};

export function getBrand(): BrandConfig {
  const slug = process.env.NEXT_PUBLIC_BRAND || "color-dreams";
  const cfg = BRANDS[slug] ?? BRANDS["color-dreams"];
  return {
    ...cfg,
    levels: cfg.levels ?? CD_LEVELS,
    missions: cfg.missions ?? CD_MISSIONS,
    rewards: cfg.rewards ?? CD_REWARDS,
    campaignSeed: cfg.campaignSeed ?? CD_CAMPAIGN_SEED,
  };
}
