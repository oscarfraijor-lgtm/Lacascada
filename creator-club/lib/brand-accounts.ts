// ── Cuentas de MARCA (cliente) — acceso de SOLO LECTURA ──────────────────
// 1 cuenta por marca (ej. Yamila por Color Dreams) con acceso de solo lectura a un
// dashboard curado de SU marca (/marca). REGLA DE ORO: muestra RESULTADOS, oculta la
// MAQUINARIA (estrellas/niveles/misiones/anti-fuga, el motor de campañas/premios, el
// CRUD, la consola). El cliente NO puede mutar nada ni ver internals de Indie Pro.
//
// Mapeo correo -> slug de marca por env BRAND_ACCOUNTS (no requiere deploy de código
// para agregar un cliente):
//   BRAND_ACCOUNTS="color-dreams:yamila@correo.com,color-dreams:otra@correo.com,anyeluz:x@y.com"
// Varios correos pueden mapear a la misma marca. Un slug inválido se ignora.
import { currentEmail } from "@/lib/session";
import { envConn, type Conn } from "@/lib/airtable";
import { getAllBrandSlugs, getBrandConfig, type BrandConfig } from "@/lib/brands";
import { resolveConn } from "@/lib/brand-admin";

function accountMap(): Map<string, string> {
  const map = new Map<string, string>(); // email (lower) -> slug
  const valid = new Set(getAllBrandSlugs());
  for (const pair of (process.env.BRAND_ACCOUNTS ?? "").split(",")) {
    const idx = pair.indexOf(":");
    if (idx < 0) continue;
    const slug = pair.slice(0, idx).trim();
    const email = pair.slice(idx + 1).trim().toLowerCase();
    if (slug && email && valid.has(slug)) map.set(email, slug);
  }
  return map;
}

// Slug de la marca a la que pertenece este correo de cliente (o null si no es cuenta de marca).
export function brandForEmail(email?: string | null): string | null {
  if (!email) return null;
  return accountMap().get(email.toLowerCase()) ?? null;
}

export function isBrandAccount(email?: string | null): boolean {
  return brandForEmail(email) !== null;
}

export interface BrandContext {
  email: string;
  slug: string;
  brand: BrandConfig; // identidad + colores de la marca (para el tema y el nombre)
  conn: Conn | null; // base Airtable de esa marca (null => archivo local en dev)
  configured: boolean; // se pueden leer datos de esta marca aquí
  fileStore: boolean; // modo archivo local (dev, sin Airtable)
}

// Contexto de la sesión de MARCA: la marca del correo logueado + su conexión a
// Airtable (de SOLO LECTURA en /marca). null si no hay sesión de marca válida.
// Aísla por marca: nunca lee la base de otra marca (configured=false si su base
// no está conectada en modo Airtable, para no caer a la base del env por error).
export async function getBrandContext(): Promise<BrandContext | null> {
  const email = await currentEmail();
  const slug = brandForEmail(email);
  if (!email || !slug) return null;
  const brand = getBrandConfig(slug);
  if (!brand) return null;
  const conn = resolveConn(slug);
  const fileStore = !envConn();
  return { email, slug, brand, conn, configured: fileStore || conn !== null, fileStore };
}
