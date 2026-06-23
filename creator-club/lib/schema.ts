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

// Cómo se COMPLETA una misión (decide qué renderiza la card y cómo se otorgan
// las estrellas). Regla maestra anti-fuga intacta: solo el equipo o una venta real
// acreditan lo que tiene valor; el estatus es gratis.
//   auto   -> se deriva de datos que ya existen (perfil completo, @afiliado
//             conectado). Estatus, costo $0: otorga estrellas en automático.
//   watch  -> ver la inducción y marcarla vista. Estatus, costo $0: otorga
//             estrellas al marcarla (registro explícito persistido).
//   submit -> pegar el link de un video. Queda "enviada" y el EQUIPO la aprueba
//             en /admin antes de otorgar estrellas (espejo de las entregas).
//   sale   -> requiere venta atribuible (GMV). NUNCA se auto-completa: la acredita
//             el equipo desde el GMV real. Sin GMV queda bloqueada (anti-fuga).
export type MissionAction = "auto" | "watch" | "submit" | "sale";

export interface Mission {
  id: string;
  title: string;
  detail: string;
  stars: number;
  category: MissionCategory;
  // Cómo se completa (ver MissionAction). Las de venta llevan además requiresSale.
  action: MissionAction;
  // requiresSale: la misión solo da estrellas con venta atribuible en TTS
  requiresSale: boolean;
  repeatable?: boolean;
}

// Marca activa (identidad + colores + mecánica). Fuente: NEXT_PUBLIC_BRAND.
export const BRAND = getBrand();
export const LEVELS: Level[] = BRAND.levels;
export const MISSIONS: Mission[] = BRAND.missions;

// `levels` por defecto = la marca del env (lado público). El admin multimarca
// pasa los niveles de la marca seleccionada.
export function levelForStars(stars: number, gmvMXN: number, levels: Level[] = LEVELS): Level {
  let current = levels[0];
  for (const lvl of levels) {
    if (stars >= lvl.minStars && gmvMXN >= lvl.minGmvMXN) current = lvl;
  }
  return current;
}

export function nextLevel(current: LevelKey, levels: Level[] = LEVELS): Level | null {
  const i = levels.findIndex((l) => l.key === current);
  return i >= 0 && i < levels.length - 1 ? levels[i + 1] : null;
}
