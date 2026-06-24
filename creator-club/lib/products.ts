// ── Productos / Briefs + Marketing Tools ─────────────────────────────────
// Catálogo de productos admin-manejable (MISMO patrón que campañas/premios). Cada
// producto FUSIONA la FICHA (info para vender: specs, beneficios, hooks, do's &
// don'ts, precio, link) con los ASSETS descargables ("marketing tools": imagen
// principal + galería + copy/caption sugerido + deep-links) que la creadora usa
// para crear mejor contenido. El acceso a datos vive en lib/store.ts (Airtable si
// está configurado, si no archivo local). El seed por marca está en lib/brands.ts.
//
// SOLO INFORMATIVO (anti-fuga): un producto no toca recompensas/canjes/GMV ni
// gatilla ningún costo. Es una biblioteca de referencia para crear contenido.
//
// CRUVA-PLUGGABLE: hoy la info se captura A MANO (source="manual"); NO hay API de
// CRUVA para info de producto. El modelo y la UI ya están listos para enchufar
// CRUVA después SIN rehacerlos: el día que llegue el API, syncProductsFromCruva
// hace upsert sobre ESTOS mismos campos y marca source="cruva". Cero retrabajo.
import type { Conn } from "@/lib/airtable";
import { getBrand } from "@/lib/brands";

export type ProductSource = "manual" | "cruva";

export interface Product {
  id: string; // slug estable; llave con la que un producto se referencia
  name: string;
  price?: string; // texto libre ("Desde $3,499 MXN"); vacío = no se muestra
  // Ficha / brief (info para vender)
  specs?: string; // ficha técnica
  benefits?: string; // beneficios para el cliente
  hooks?: string; // ganchos de venta, uno por línea
  dos?: string; // qué SÍ hacer, uno por línea
  donts?: string; // qué NO hacer, uno por línea
  link?: string; // link al producto / link de afiliado de TikTok Shop
  // Assets descargables ("marketing tools")
  image?: string; // imagen principal (URL)
  gallery?: string; // galería: una URL por línea
  copy?: string; // copy/caption sugerido (la creadora lo copia con un botón)
  deeplinks?: string; // deep-links útiles: "Etiqueta | https://..." una por línea
  // Enlace opcional a una campaña (para mostrarlo en la campaña relacionada)
  campaignId?: string;
  source: ProductSource; // manual (default) | cruva (cuando lo llene el sync)
  active?: boolean; // el equipo lo prende/apaga en /admin (default true)
  recordId?: string; // id de registro en Airtable (solo presente al leer de Airtable)
}

// Datos editables por el admin = todo menos el recordId.
export type ProductInput = Omit<Product, "recordId">;

// Seed de la marca activa (siembra la tabla Airtable "Productos" y el archivo local en dev).
export const PRODUCT_SEED: Product[] = getBrand().products;

// ── Helpers de presentación (campos multilínea -> listas) ────────────────
// Un campo multilínea (hooks, dos, donts, galería) -> arreglo de líneas no vacías.
export function splitLines(s?: string): string[] {
  return (s ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export interface DeepLink {
  label: string;
  url: string;
}

// "Etiqueta | https://..." -> {label, url}. Sin etiqueta, usa el dominio. Solo http(s).
export function parseDeepLinks(s?: string): DeepLink[] {
  const out: DeepLink[] = [];
  for (const line of splitLines(s)) {
    const i = line.indexOf("|");
    const label = i >= 0 ? line.slice(0, i).trim() : "";
    const url = (i >= 0 ? line.slice(i + 1) : line).trim();
    if (!/^https?:\/\//i.test(url)) continue; // solo enlaces http(s) válidos
    out.push({ label: label || hostOf(url), url });
  }
  return out;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Abrir enlace";
  }
}

// Imágenes descargables de un producto: la principal + la galería (deduplicadas).
export function productImages(p: Product): string[] {
  const urls = [p.image, ...splitLines(p.gallery)].filter((u): u is string => !!u && /^https?:\/\//i.test(u));
  return [...new Set(urls)];
}

// ── CRUVA sync (placeholder, listo para enchufar) ────────────────────────
// HOY no existe API de CRUVA para info de producto: todo es manual. Esta función
// es el ÚNICO punto de extensión: cuando llegue, traerá la info por shop/marca y
// hará upsert sobre la tabla Productos (mismos campos), marcando source="cruva".
// La UI y el modelo NO cambian. Por ahora es no-op explícito (manual-first).
export async function syncProductsFromCruva(conn?: Conn): Promise<{ updated: number; note: string }> {
  void conn; // aquí irá el fetch a CRUVA por marca + upsert en store.ts (createProduct/updateProduct)
  return {
    updated: 0,
    note: "CRUVA aún no expone info de producto; la captura es manual (source=manual).",
  };
}
