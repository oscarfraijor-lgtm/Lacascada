// ── Categoría de creadora por mercado (nivel/badge de TikTok) ────────────
// Eje OPCIONAL de segmentación: además de los niveles "cute" del club (que se
// ganan con estrellas y desbloquean recompensas), cada creadora tiene una
// CATEGORÍA = su nivel/badge de TikTok, DERIVADO de su GMV del mes (campo
// gmvMXN). Es lo que TikTok le muestra en su app, así que es legible y motivante.
//
// Se usa para que SOLO algunas campañas/premios sean "exclusivos para [categoría]"
// y las creadoras compitan dentro de su tamaño. Por default, una campaña/premio es
// "abierta a todas" (sin scope) y nada cambia.
//
// Es CONFIG por mercado (sistema + nombres + bandas), NO hardcode: TikTok recalibra.
// MX usa niveles numerados (Level 1-6) en MXN; USA usa gemas (Bronze-Diamond) en USD.
// Cada marca/deploy usa el sistema de su país (lib/brands.ts -> tierSystem).
// Las bandas son el GMV MENSUAL para alcanzar el nivel (fuente: Creator Center).
// Cuando se conecte CRUVA, llenará el mismo campo gmvMXN con data real por creadora
// y la categoría se deriva sola: cero rework.

export interface MarketTier {
  key: string; // id estable: "l1".."l6" / "bronze".."diamond" (no cambiar: es la llave de scope)
  name: string; // etiqueta que ve la creadora ("Level 1", "Bronze")
  minGmv: number; // piso de GMV mensual (moneda local) para alcanzar este nivel
}

export interface TierSystem {
  market: "MX" | "USA";
  currency: "MXN" | "USD";
  label: string; // cómo le llama TikTok en ese mercado: "Nivel" (MX) / "Badge" (USA)
  tiers: MarketTier[]; // ascendente por minGmv (el primero es el piso, minGmv 0)
}

// 🇲🇽 MÉXICO (MXN) — sistema "Creator Level" numerado (Creator Center, jun 2026).
export const MX_TIERS: TierSystem = {
  market: "MX",
  currency: "MXN",
  label: "Nivel",
  tiers: [
    { key: "l1", name: "Level 1", minGmv: 0 },
    { key: "l2", name: "Level 2", minGmv: 20000 },
    { key: "l3", name: "Level 3", minGmv: 60000 },
    { key: "l4", name: "Level 4", minGmv: 200000 },
    { key: "l5", name: "Level 5", minGmv: 600000 },
    { key: "l6", name: "Level 6", minGmv: 2000000 },
  ],
};

// 🇺🇸 USA (USD) — sistema "Creator Badges" de gema (Creator Center, jun 2026).
export const USA_TIERS: TierSystem = {
  market: "USA",
  currency: "USD",
  label: "Badge",
  tiers: [
    { key: "bronze", name: "Bronze", minGmv: 0 },
    { key: "silver", name: "Silver", minGmv: 1000 },
    { key: "gold", name: "Gold", minGmv: 5000 },
    { key: "platinum", name: "Platinum", minGmv: 25000 },
    { key: "ruby", name: "Ruby", minGmv: 60000 },
    { key: "emerald", name: "Emerald", minGmv: 150000 },
    { key: "sapphire", name: "Sapphire", minGmv: 400000 },
    { key: "diamond", name: "Diamond", minGmv: 1500000 },
  ],
};

// Categoría de una creadora dado su GMV del mes. Devuelve el nivel más alto cuyo
// piso alcanza (gmv 0 => el primer nivel). Siempre regresa un nivel válido.
export function tierForGmv(gmv: number, system: TierSystem): MarketTier {
  const g = Number.isFinite(gmv) && gmv > 0 ? gmv : 0;
  let current = system.tiers[0];
  for (const t of system.tiers) {
    if (g >= t.minGmv) current = t;
  }
  return current;
}

// Nombre legible de una categoría por su llave (para mostrar el scope en la UI).
export function tierName(system: TierSystem, key: string): string {
  return system.tiers.find((t) => t.key === key)?.name ?? key;
}

// Banda legible "$0 – $20,000" de un nivel (de su piso al piso del siguiente).
export function tierBand(system: TierSystem, key: string): string {
  const i = system.tiers.findIndex((t) => t.key === key);
  if (i < 0) return "";
  const t = system.tiers[i];
  const next = system.tiers[i + 1];
  const fmt = (n: number) => `$${n.toLocaleString(system.currency === "USD" ? "en-US" : "es-MX")}`;
  return next ? `${fmt(t.minGmv)} – ${fmt(next.minGmv)}` : `${fmt(t.minGmv)}+`;
}

// ── Scope de campañas/premios por categoría ──────────────────────────────
// El scope se guarda como CSV de llaves de nivel ("l2,l3"). Vacío/ausente =
// "abierta a todas" (sin segmentar). Helpers para Airtable (texto) <-> array.
export function parseTiers(csv?: string | null): string[] {
  if (!csv) return [];
  return String(csv)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function serializeTiers(keys?: string[]): string {
  return (keys ?? []).map((s) => s.trim()).filter(Boolean).join(",");
}

// ¿Una creadora de categoría `tierKey` puede ver/participar algo con este scope?
// Sin scope (vacío) => abierto a todas. Un visitante sin categoría (tierKey null)
// solo ve lo abierto a todas (las exclusivas quedan ocultas, no puede competir).
export function tierInScope(scope: string[] | undefined, tierKey: string | null): boolean {
  if (!scope || scope.length === 0) return true; // abierta a todas
  if (!tierKey) return false; // exclusiva + sin categoría conocida => oculta
  return scope.includes(tierKey);
}
