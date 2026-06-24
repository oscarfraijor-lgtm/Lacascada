// Campañas que la marca publica y a las que las creadoras se inscriben.
// El acceso a datos (Airtable si está configurado, si no archivo local) vive en
// lib/store.ts. El seed inicial es por marca (lib/brands.ts -> campaignSeed).
import { getBrand } from "@/lib/brands";

export interface Campaign {
  id: string; // slug estable; es la llave con la que Entregas referencia la campaña
  title: string;
  brand: string;
  brief: string;
  reward: string;
  stars: number;
  deadline: string; // texto legible
  tag: string;
  requirements?: string; // "Para calificar": criterios visibles antes de participar
  cupo?: number; // máximo de inscripciones; 0 o ausente = sin límite
  // Scope por CATEGORÍA de creadora (nivel/badge de TikTok, lib/tiers). Vacío/ausente
  // = abierta a todas. Si trae llaves ("l2","l3"), solo esas categorías la ven/participan.
  tiers?: string[];
  open: boolean;
  recordId?: string; // id de registro en Airtable (solo presente al leer de Airtable)
}

// Datos editables por el admin = todo menos el id (slug) y el recordId.
export type CampaignInput = Omit<Campaign, "id" | "recordId">;

// Seed de la marca activa (siembra la tabla Airtable "Campañas" y el archivo local en dev).
export const CAMPAIGN_SEED: Campaign[] = getBrand().campaignSeed;

// slug a partir del título: minúsculas, sin acentos, guiones.
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
