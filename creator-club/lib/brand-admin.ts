// ── Contexto multimarca del panel de admin ──────────────────────────────
// El admin (Mabel/Oscar/Paulina) puede gestionar VARIAS marcas desde un mismo
// deploy. Cada marca vive en SU base de Airtable; al "entrar" a una marca se
// guarda su slug en una cookie y todas las lecturas/escrituras del admin se
// dirigen a la base de ESA marca (los datos nunca se cruzan). El lado público
// NO usa esta cookie: siempre sirve la marca del env (NEXT_PUBLIC_BRAND).
import { cookies } from "next/headers";
import { type Conn, envConn } from "@/lib/airtable";
import { getAllBrandSlugs, getBrandConfig, getBrand, hasOwnMechanics, type BrandConfig } from "@/lib/brands";

const COOKIE = "cc_admin_brand";

function envBrandSlug(): string {
  return process.env.NEXT_PUBLIC_BRAND || "color-dreams";
}

// slug -> sufijo de variable de entorno (color-dreams -> COLOR_DREAMS).
function envKey(slug: string): string {
  return slug.toUpperCase().replace(/-/g, "_");
}

// Conexión Airtable de una marca, leída del env del deploy de admin:
//   AIRTABLE_BASE_<SLUG> (+ opcional AIRTABLE_TOKEN_<SLUG>).
// La marca del propio deploy usa AIRTABLE_BASE_ID / AIRTABLE_TOKEN.
// El token cae al AIRTABLE_TOKEN del deploy: cómodo si TODAS las bases viven en
// la MISMA cuenta de Airtable. Si la base de una marca está en OTRA cuenta, ese
// token no la puede leer: define AIRTABLE_TOKEN_<SLUG> con un PAT que sí acceda.
// Devuelve null si no hay base+token (marca "pendiente de configurar").
export function resolveConn(slug: string): Conn | null {
  const key = envKey(slug);
  const baseId =
    process.env[`AIRTABLE_BASE_${key}`] ||
    (slug === envBrandSlug() ? process.env.AIRTABLE_BASE_ID : undefined);
  const token = process.env[`AIRTABLE_TOKEN_${key}`] || process.env.AIRTABLE_TOKEN;
  return baseId && token ? { baseId, token } : null;
}

// ¿Este deploy corre contra Airtable? Si no, todo va al archivo local (dev),
// que es compartido por todas las marcas (sin aislamiento) hasta producción.
function airtableMode(): boolean {
  return !!envConn();
}

export interface BrandSummary {
  slug: string;
  name: string;
  club: string;
  isEnvBrand: boolean; // la marca pública de este deploy
  hasBase: boolean; // tiene base Airtable configurada aquí
  configured: boolean; // gestionable desde este admin (base propia, o modo archivo en dev)
  ownMechanics: boolean; // tiene niveles/recompensas propios (no los de Color Dreams)
  deployUrl?: string; // deploy propio de la marca (opcional)
}

// Todas las marcas del registro con su estado de configuración para el selector.
export function managedBrands(): BrandSummary[] {
  const fileStore = !airtableMode();
  const env = envBrandSlug();
  return getAllBrandSlugs().map((slug) => {
    const cfg = getBrandConfig(slug)!;
    const hasBase = resolveConn(slug) !== null;
    return {
      slug,
      name: cfg.name,
      club: cfg.club,
      isEnvBrand: slug === env,
      hasBase,
      configured: fileStore || hasBase,
      ownMechanics: hasOwnMechanics(slug),
      deployUrl: cfg.deployUrl,
    };
  });
}

// Slug de la marca seleccionada en el admin (cookie); cae a la marca del env.
export async function getSelectedBrandSlug(): Promise<string> {
  const c = await cookies();
  const raw = c.get(COOKIE)?.value;
  if (raw && getAllBrandSlugs().includes(raw)) return raw;
  return envBrandSlug();
}

export interface AdminContext {
  slug: string;
  brand: BrandConfig; // identidad + mecánica de la marca seleccionada
  conn: Conn | null; // base de esa marca (null => archivo local en dev)
  configured: boolean; // se puede gestionar data de esta marca aquí
  fileStore: boolean; // modo archivo local (dev, sin Airtable)
  isEnvBrand: boolean; // su club público es el "/" de ESTE deploy
}

// Contexto activo del admin: marca seleccionada + su conexión a Airtable.
export async function getAdminContext(): Promise<AdminContext> {
  const slug = await getSelectedBrandSlug();
  const brand = getBrandConfig(slug) ?? getBrand();
  const conn = resolveConn(slug);
  const fileStore = !airtableMode();
  return {
    slug,
    brand,
    conn,
    configured: fileStore || conn !== null,
    fileStore,
    isEnvBrand: slug === envBrandSlug(),
  };
}

export async function setSelectedBrandCookie(slug: string): Promise<void> {
  const c = await cookies();
  c.set(COOKIE, slug, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
