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

// Tema NEUTRO de la consola de operador: es Indie Pro (agencia), no una marca
// cliente. Claro (regla de diseño: nunca fondos oscuros), acento rojo Indie Pro.
export const OPERATOR_THEME: CSSProperties = brandThemeVars({
  cream: "#F6F6F7",
  creamDeep: "#EAEAEE",
  violet: "#ED2450", // rojo Indie Pro (acento principal)
  violetDeep: "#C71D40",
  ink: "#1B1B20",
  inkSoft: "#56565F",
  lime: "#F0B429", // CTA cálido legible con texto ink
});
