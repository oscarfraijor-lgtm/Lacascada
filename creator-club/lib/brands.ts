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
  // Video de inducción del club (embed: YouTube/Vimeo/TikTok o un .mp4). Opcional:
  // si falta, /induccion muestra la guía escrita "Cómo funciona el club" igual.
  inductionVideoUrl?: string;
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

// Metadatos del panel multimarca (opcionales).
interface BrandMeta {
  deployUrl?: string; // URL del deploy propio de la marca (para "abrir" desde el admin)
}

export type BrandConfig = BrandIdentity & Required<BrandMechanics> & BrandMeta;

// ── Color Dreams (marca de referencia; también es el fallback de mecánica) ──
const CD_LEVELS: Level[] = [
  { key: "durmiente", name: "Durmiente", minStars: 0, minGmvMXN: 0, perk: "Acceso al club, misiones y leaderboard. Comisión base.", badge: "🌙" },
  { key: "sonadora", name: "Soñadora", minStars: 500, minGmvMXN: 0, perk: "Muestra de colchón a resultado + boost de comisión +1%.", badge: "✨" },
  { key: "insomne", name: "Insomne Pro", minStars: 1500, minGmvMXN: 60000, perk: "Colchón propio + early access + boost +2-3% + prioridad en Lives.", badge: "🛌" },
  { key: "embajadora", name: "Embajadora", minStars: 4000, minGmvMXN: 150000, perk: "Fee de campaña + experiencia CDMX + kit de creadora + co-creación.", badge: "👑" },
];

// MISIONES = hitos ATEMPORALES de progresión de la creadora (su "camino"):
// onboarding (perfil/afiliado/inducción), preparación de perfil, hitos de venta
// (bloqueados sin GMV) y comunidad. Las ACTIVACIONES rotativas con brief/cupo/
// producto físico o evento (Prueba 30 Noches, Unboxing, Lives, Reseña, Recámara)
// viven como CAMPAÑAS, NO como misiones (ver CD_CAMPAIGN_SEED).
// CONTRATO: ninguna misión comparte id ni título con una campaña. Si lo hicieran,
// la misma acción pagaría estrellas DOS veces (lib/data.ts suma el ledger de
// campañas + el de misiones sin cruce). catalogCollisions() lo verifica en dev.
const CD_MISSIONS: Mission[] = [
  { id: "perfil", title: "Completa tu perfil", detail: "Cuéntanos de ti y acepta los términos del club.", stars: 50, category: "perfil", action: "auto", requiresSale: false },
  { id: "conectar-tt", title: "Conecta tu TikTok afiliado", detail: "Vincula tu cuenta al shop de Color Dreams (obligatorio para ganar).", stars: 100, category: "perfil", action: "auto", requiresSale: false },
  { id: "induccion", title: "Conoce cómo funciona el club", detail: "Aprende cómo funciona el club en 3 minutos.", stars: 30, category: "perfil", action: "watch", requiresSale: false },
  { id: "showcase", title: "Fija tu mejor video", detail: "Fija tu mejor video y agrega el producto a tu perfil de TikTok Shop.", stars: 100, category: "contenido", action: "submit", requiresSale: false },
  { id: "primera-venta", title: "Tu primera venta", detail: "Genera tu primera venta atribuible en TikTok Shop.", stars: 300, category: "venta", action: "sale", requiresSale: true },
  { id: "gmv-2k", title: "Sigue vendiendo", detail: "Cada venta atribuible que sumas cuenta para tu nivel y tus recompensas.", stars: 100, category: "venta", action: "sale", requiresSale: true },
  { id: "5-ventas", title: "5 ventas en un mes", detail: "Bonus por cerrar 5 ventas atribuibles en un mismo mes.", stars: 250, category: "venta", action: "sale", requiresSale: true },
  { id: "tu-live", title: "Hostea tu Live", detail: "Transmite mostrando Color Dreams (mínimo 30 min). Tus ventas en Live cuentan para tu nivel y tus recompensas.", stars: 250, category: "live", action: "submit", requiresSale: false },
  { id: "referir", title: "Refiere a otra creadora", detail: "Invita a alguien que se active y venda.", stars: 200, category: "comunidad", action: "sale", requiresSale: true },
];

// minStars/minGmvMXN alimentan el candado real (lib/rewards.ts). Las recompensas
// con costo exigen además GMV atribuible > 0 (anti-fuga), aunque su minGmvMXN sea 0.
const CD_REWARDS: Reward[] = [
  { id: "r-status", title: "Subir de nivel + insignia", detail: "Estatus, badge y acceso a misiones premium.", cost: "Acumula estrellas", kind: "estatus", payer: "club", minStars: 0, minGmvMXN: 0 },
  { id: "r-muestra", title: "Muestra de colchón", detail: "Pruébalo 30 noches (atado a tu primera venta).", cost: "Nivel Soñadora + tu primera venta", kind: "producto", payer: "marca", minStars: 500, minGmvMXN: 0 },
  { id: "r-boost", title: "Boost de comisión +1%", detail: "Ganas 1% extra de comisión por cada venta que cierres.", cost: "Nivel Soñadora + tu primera venta", kind: "boost", payer: "marca", minStars: 500, minGmvMXN: 0 },
  { id: "r-colchon", title: "Colchón propio (regalo)", detail: "Tuyo para siempre.", cost: "Nivel Insomne Pro · $60K GMV", kind: "producto", payer: "marca", minStars: 1500, minGmvMXN: 60000 },
  { id: "r-cdmx", title: "Experiencia CDMX", detail: "Noche de Sueños + sesión de fotos + kit de creadora.", cost: "Nivel Embajadora · $150K GMV", kind: "experiencia", payer: "marca", minStars: 4000, minGmvMXN: 150000 },
];

const CD_CAMPAIGN_SEED: Campaign[] = [
  { id: "prueba-30", title: "Prueba 30 Noches", requirements: "Perfil completo + dirección de envío. No necesitas seguidores.", brand: "Color Dreams", brief: "Recibe tu colchón, haz el unboxing y arma en cámara. Documenta tus primeras noches con tu link de afiliado.", reward: "Colchón a prueba + 250 estrellas", stars: 250, deadline: "Cupo abierto", tag: "Producto", open: true },
  { id: "unboxing-express", title: "Unboxing Express", requirements: "Perfil completo + link de afiliado de TikTok Shop.", brand: "Color Dreams", brief: "Tu primer video mostrando cómo llega en caja y se infla en minutos. Pega tu link de TikTok Shop.", reward: "150 estrellas + boost de comisión", stars: 150, deadline: "Cupo abierto", tag: "Contenido", open: true },
  { id: "hot-sale-live", title: "Hot Sale Live", requirements: "Haber publicado al menos 1 video con Color Dreams + link de afiliado.", brand: "Color Dreams", brief: "Co-host en un Live oficial durante Hot Sale. Tus ventas en Live cuentan para tu nivel y tus recompensas.", reward: "Fee de Live + 200 estrellas", stars: 200, deadline: "Próximamente", tag: "Live", open: true },
  { id: "recamara-makeover", title: "Recámara Makeover", requirements: "Perfil completo + dirección de envío. No necesitas seguidores.", brand: "Color Dreams", brief: "Antes y después de tu recámara con tu Color Dreams. Estilo lifestyle, súper compartible.", reward: "200 estrellas", stars: 200, deadline: "Cupo abierto", tag: "Contenido", open: true },
  { id: "resena-real", title: "Reseña Real", requirements: "Haber completado Prueba 30 Noches.", brand: "Color Dreams", brief: "Tras 30 noches, comparte tu opinión honesta en video. La autenticidad vende.", reward: "150 estrellas", stars: 150, deadline: "Cupo abierto", tag: "Reseña", open: true },
];

// ── Registro de marcas ──────────────────────────────────────────────────────
type RawBrand = BrandIdentity & BrandMechanics & BrandMeta;

// Paleta neutra para marcas plantilla (aún sin brandkit). Se ajusta al activar.
// `lime` es el color de CTA/acento: usa un acento saturado (un gris se vuelve
// invisible como botón sobre cream) hasta personalizar el brandkit.
const STUB_PALETTE = {
  cream: "#F4F2EC",
  creamDeep: "#E8E5DC",
  violet: "#5B5B6B",
  violetDeep: "#3E3E4C",
  ink: "#2A2A33",
  inkSoft: "#5A5A66",
  lime: "#E0A33A",
};
// Identidad mínima compartida por las marcas plantilla de Indie Pro.
const STUB_OPERATOR = {
  operator: "INDIEPRO MUSIC & MARKETING S.C.",
  operatorShort: "Indie Pro Marketing",
  contactEmail: "afiliadostiktok@indiepro.com.mx",
};

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
    // TODO Oscar: pega el embed real del video de inducción de Color Dreams
    // (YouTube/Vimeo/TikTok). Sin él, /induccion usa la guía escrita.
    // inductionVideoUrl: "https://www.youtube.com/embed/XXXXXXXXXXX",
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

  // ── PLANTILLAS de marcas gestionadas por Indie Pro ──
  // Identidad/colores PLACEHOLDER y base de Airtable PENDIENTE: aparecen en el
  // selector de /console (la consola de operador) como "Pendiente" hasta que
  // completes su brandkit (copiando el patrón de color-dreams) y configures
  // AIRTABLE_BASE_<SLUG> en el env de la consola. Solo así se vuelven gestionables.
  anyeluz: {
    slug: "anyeluz",
    name: "Anyeluz",
    club: "Anyeluz Club",
    tagline: "Crea y brilla.",
    category: "belleza y skincare",
    ...STUB_OPERATOR,
    ...STUB_PALETTE,
  },
  "origen-botanico": {
    slug: "origen-botanico",
    name: "Origen Botánico",
    club: "Origen Club",
    tagline: "Crea y conecta.",
    category: "bienestar botánico",
    ...STUB_OPERATOR,
    ...STUB_PALETTE,
  },
  ole: {
    slug: "ole",
    name: "Ole",
    club: "Ole Club",
    tagline: "Crea y comparte.",
    category: "categoría por definir", // reemplazar por el rubro real de Ole
    ...STUB_OPERATOR,
    ...STUB_PALETTE,
  },
};

// Todas las marcas registradas (para el selector multimarca del admin).
export function getAllBrandSlugs(): string[] {
  return Object.keys(BRANDS);
}

// Contrato del catálogo: misiones (hitos) y campañas (activaciones) deben ser
// DISJUNTAS. Si una misión comparte id o título (normalizado) con una campaña, la
// misma acción pagaría estrellas dos veces (lib/data.ts suma los dos ledgers sin
// cruce). Devuelve la lista de colisiones (vacía = sano).
function normTitle(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
export function catalogCollisions(missions: Mission[], campaigns: Campaign[]): string[] {
  const campIds = new Set(campaigns.map((c) => c.id));
  const campTitles = new Set(campaigns.map((c) => normTitle(c.title)));
  const out: string[] = [];
  for (const m of missions) {
    if (campIds.has(m.id)) out.push(`id '${m.id}'`);
    else if (campTitles.has(normTitle(m.title))) out.push(`título '${m.title}'`);
  }
  return out;
}

// ¿La marca define su PROPIA mecánica (no hereda la de Color Dreams)? Las
// plantillas sin levels/missions/rewards/campaignSeed heredan copy de Color
// Dreams; útil para avisar antes de deployar público o aprobar canjes con GMV.
export function hasOwnMechanics(slug: string): boolean {
  const cfg = BRANDS[slug];
  return !!(cfg && cfg.levels && cfg.missions && cfg.rewards && cfg.campaignSeed);
}

// Config completa de una marca por slug (con fallback de mecánica a Color Dreams).
// null si el slug no existe en el registro.
export function getBrandConfig(slug: string): BrandConfig | null {
  const cfg = BRANDS[slug];
  if (!cfg) return null;
  return {
    ...cfg,
    levels: cfg.levels ?? CD_LEVELS,
    missions: cfg.missions ?? CD_MISSIONS,
    rewards: cfg.rewards ?? CD_REWARDS,
    campaignSeed: cfg.campaignSeed ?? CD_CAMPAIGN_SEED,
  };
}

// ¿La marca pública de ESTE deploy está lista para mostrarse? Color Dreams sí
// (es la base); cualquier otra marca solo si definió su mecánica propia (si no,
// heredaría misiones/recompensas/campañas de Color Dreams, y una creadora vería
// "colchón / 30 Noches" en otra marca). El club público se bloquea hasta que se
// configure. NO afecta la vista previa del admin (que sí usa el fallback a propósito).
export function publicBrandConfigured(): boolean {
  const slug = process.env.NEXT_PUBLIC_BRAND || "color-dreams";
  return slug === "color-dreams" || hasOwnMechanics(slug);
}

// Marca de ESTE deploy (NEXT_PUBLIC_BRAND). Es la que ve el lado público.
export function getBrand(): BrandConfig {
  const slug = process.env.NEXT_PUBLIC_BRAND || "color-dreams";
  // Aviso fuerte si se deploya público una marca plantilla: heredaría las
  // misiones/recompensas/campañas (y su copy) de Color Dreams.
  if (slug !== "color-dreams" && BRANDS[slug] && !hasOwnMechanics(slug)) {
    console.warn(
      `[brands] '${slug}' no tiene mecánica propia: hereda misiones/recompensas/campañas de Color Dreams (copy de otra marca). NO deployar público sin definir levels/missions/rewards/campaignSeed.`
    );
  }
  const cfg = getBrandConfig(slug) ?? getBrandConfig("color-dreams")!;
  // Tripwire en dev: avisa si una misión y una campaña comparten id/título
  // (doble-conteo de estrellas). En prod no corre.
  if (process.env.NODE_ENV !== "production") {
    const cols = catalogCollisions(cfg.missions, cfg.campaignSeed);
    if (cols.length) {
      console.error(
        `[brands] '${cfg.slug}': misión y campaña comparten ${cols.join(", ")} -> la misma acción paga estrellas dos veces. Una actividad debe vivir en UN solo catálogo (misión = hito, campaña = activación).`
      );
    }
  }
  return cfg;
}
