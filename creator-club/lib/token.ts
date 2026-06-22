// Magic link: token firmado (HMAC-SHA256) y temporal. Sin estado en servidor.
// Formato:  base64url(email:exp) . hmac(payload)
import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  // AUTH_SECRET es obligatorio para firmar de forma segura. En dev, si falta,
  // caemos a un valor fijo (con aviso) para no romper el flujo local.
  const s = process.env.AUTH_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("AUTH_SECRET no configurado en producción");
  }
  console.warn("[token] AUTH_SECRET no configurado: usando secreto de dev inseguro.");
  return "dev-insecure-secret-change-me";
}

const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutos

export function signAccessToken(email: string, ttlMs: number = DEFAULT_TTL_MS): string {
  const exp = Date.now() + ttlMs;
  const payload = Buffer.from(`${email.toLowerCase()}:${exp}`).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

// ── Token de SESIÓN (cookie cc_creator) ────────────────────────────────
// La cookie NO debe guardar el email en claro: cualquiera podría fijarla a un
// correo de admin y escalar. Guardamos un token firmado (HMAC) con TTL largo y
// prefijo "s:" para que un magic link (30 min) no se pueda reusar como sesión.
const SESSION_TTL_MS = 180 * 24 * 60 * 60 * 1000; // 180 días (igual que la cookie)

export function signSession(email: string): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = Buffer.from(`s:${email.toLowerCase()}:${exp}`).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

// Devuelve el email solo si la firma valida y no caducó; null si no.
export function verifySession(token: string | null | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const decoded = Buffer.from(payload, "base64url").toString("utf8");
  if (!decoded.startsWith("s:")) return null; // no es token de sesión
  const rest = decoded.slice(2);
  const idx = rest.lastIndexOf(":");
  if (idx < 0) return null;
  const email = rest.slice(0, idx);
  const exp = Number(rest.slice(idx + 1));
  if (!email || !Number.isFinite(exp) || Date.now() > exp) return null;
  return email;
}

export type VerifyResult =
  | { ok: true; email: string }
  | { ok: false; reason: "invalid" | "expired" };

export function verifyAccessToken(token: string | null | undefined): VerifyResult {
  if (!token) return { ok: false, reason: "invalid" };
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return { ok: false, reason: "invalid" };

  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "invalid" };

  const decoded = Buffer.from(payload, "base64url").toString("utf8");
  const idx = decoded.lastIndexOf(":");
  if (idx < 0) return { ok: false, reason: "invalid" };
  const email = decoded.slice(0, idx);
  const exp = Number(decoded.slice(idx + 1));
  if (!email || !Number.isFinite(exp)) return { ok: false, reason: "invalid" };
  if (Date.now() > exp) return { ok: false, reason: "expired" };
  return { ok: true, email };
}
