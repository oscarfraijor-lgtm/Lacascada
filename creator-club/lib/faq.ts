// ── FAQ / Centro de ayuda ────────────────────────────────────────────────
// Preguntas frecuentes (sobre todo de PRODUCTO) que la creadora consulta para
// crear mejor contenido y resolver dudas sin esperar. Admin-manejable (mismo
// patrón que campañas/productos). El "Centro de ayuda" (/ayuda) muestra estas
// preguntas + un botón de WhatsApp para escribirle al equipo (Paulina) cualquier
// duda que no esté aquí.
import { getBrand } from "@/lib/brands";

export interface FaqItem {
  id: string; // slug estable
  question: string;
  answer: string;
  tag?: string; // agrupador opcional ("Producto", "Envíos", "Contenido", "Pagos")
  active?: boolean; // el equipo lo prende/apaga en /admin (default true)
  recordId?: string; // id de registro en Airtable (solo al leer de Airtable)
}

export type FaqInput = Omit<FaqItem, "recordId">;

// Seed de la marca activa (siembra la tabla Airtable "FAQ" y el archivo local).
export const FAQ_SEED: FaqItem[] = getBrand().faq;

// Construye el enlace de WhatsApp al equipo (Paulina) con un mensaje prellenado.
// Devuelve null si la marca no configuró un número de soporte (botón oculto).
export function whatsappLink(number?: string, text?: string): string | null {
  const digits = (number ?? "").replace(/[^0-9]/g, "");
  if (!digits) return null;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${q}`;
}
