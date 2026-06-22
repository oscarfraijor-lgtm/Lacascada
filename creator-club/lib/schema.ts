// ── Mecánica del club como código ───────────────────────────────────
// Tipos + funciones de niveles/misiones. Los DATOS (niveles, misiones, marca,
// colores) vienen de la marca activa (NEXT_PUBLIC_BRAND) vía lib/brands.ts.
// Regla maestra anti-fuga: nada con costo real se gatilla sin venta atribuible.
import { getBrand } from "@/lib/brands";

// Las llaves de nivel son por marca (string), no un union fijo.
export type LevelKey = string;

export interface Level {
  key: LevelKey;
  name: string;
  minStars: number;
  minGmvMXN: number;
  perk: string;
  badge: string; // emoji/etiqueta visual
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

// Marca activa (identidad + colores + mecánica). Fuente: NEXT_PUBLIC_BRAND.
export const BRAND = getBrand();
export const LEVELS: Level[] = BRAND.levels;
export const MISSIONS: Mission[] = BRAND.missions;

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
