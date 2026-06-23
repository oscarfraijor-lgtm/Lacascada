// Acceso de admin con CLAVE compartida del equipo (alternativa al magic link para
// entrar a /console sin correo). Es opcional: solo se activa si hay ADMIN_PASSPHRASE
// en el entorno. La clave NO crea admins nuevos: el correo debe estar igual en el
// allowlist (lib/roles). La comparación es en tiempo constante (anti timing attack).
//
// Tradeoff (aceptado por Oscar): un secreto compartido es más cómodo pero menos
// seguro que el magic link (prueba-de-correo). Usar una frase LARGA y aleatoria, no
// commitearla (va en .env.local y en Vercel), y rotarla si se filtra.
import { createHmac, timingSafeEqual } from "crypto";

const HMAC_KEY = "cc-admin-passphrase";

// Habilitado solo con una clave de longitud razonable (evita activarlo por accidente
// con un valor vacío/trivial).
export function adminPassphraseEnabled(): boolean {
  return (process.env.ADMIN_PASSPHRASE ?? "").length >= 8;
}

// ¿La clave ingresada coincide con ADMIN_PASSPHRASE? Constante en tiempo: se compara
// el HMAC de ambas (misma longitud siempre, no filtra longitud ni hace early-return).
export function verifyAdminPassphrase(input: string): boolean {
  const secret = process.env.ADMIN_PASSPHRASE ?? "";
  if (secret.length < 8 || !input) return false;
  const a = createHmac("sha256", HMAC_KEY).update(secret).digest();
  const b = createHmac("sha256", HMAC_KEY).update(input).digest();
  return timingSafeEqual(a, b);
}
