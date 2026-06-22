// Inyección de tema por área. El tema NO va en <html> (root neutro): cada capa
// lo aplica en su propio wrapper para que coexistan tres niveles con look propio:
//   1) club público  -> tema de la marca del env (NEXT_PUBLIC_BRAND)
//   2) consola operador (Indie Pro) -> tema NEUTRO de agencia
//   3) admin por marca -> tema de la marca seleccionada
import type { CSSProperties } from "react";

interface Palette {
  cream: string;
  creamDeep: string;
  violet: string;
  violetDeep: string;
  ink: string;
  inkSoft: string;
  lime: string;
}

// CSS variables de una paleta (espejo de globals.css / layout viejo).
export function brandThemeVars(p: Palette): CSSProperties {
  return {
    "--color-cream": p.cream,
    "--color-cream-deep": p.creamDeep,
    "--color-brand": p.violet,
    "--color-brand-deep": p.violetDeep,
    "--color-ink": p.ink,
    "--color-ink-soft": p.inkSoft,
    "--color-lime": p.lime,
  } as CSSProperties;
}

// Tema NEUTRO de la consola de operador (agencia: Indie Pro + ESH). Muy neutro:
// grises/carbón, sin color de marca, look limpio tipo herramienta interna. Los
// botones primarios son carbón oscuro (no rojo); el acento es solo gris.
export const OPERATOR_THEME: CSSProperties = brandThemeVars({
  cream: "#F7F7F8", // fondo casi blanco neutro
  creamDeep: "#ECECEF",
  violet: "#3F3F46", // acento neutro (slate) — bordes, detalles
  violetDeep: "#27272A", // carbón — botones primarios
  ink: "#18181B",
  inkSoft: "#52525B",
  lime: "#E4E4E7", // badge muy neutro (texto ink encima)
});
