// Campañas que la marca publica y a las que las creadoras se inscriben.
// El acceso a datos (Airtable si está configurado, si no archivo local) vive en
// lib/store.ts. Aquí queda solo el tipo + el seed inicial (con el que se siembra
// tanto la tabla Airtable "Campañas" como el archivo local en dev).

export interface Campaign {
  id: string; // slug estable; es la llave con la que Entregas referencia la campaña
  title: string;
  brand: string;
  brief: string;
  reward: string;
  stars: number;
  deadline: string; // texto legible
  tag: string;
  open: boolean;
  recordId?: string; // id de registro en Airtable (solo presente al leer de Airtable)
}

// Datos editables por el admin = todo menos el id (slug) y el recordId.
export type CampaignInput = Omit<Campaign, "id" | "recordId">;

export const CAMPAIGN_SEED: Campaign[] = [
  {
    id: "prueba-30",
    title: "Prueba 30 Noches",
    brand: "Color Dreams",
    brief: "Recibe tu colchón, haz el unboxing y arma en cámara. Documenta tus primeras noches con tu link de afiliado.",
    reward: "Colchón a prueba + 250 estrellas",
    stars: 250,
    deadline: "Cupo abierto",
    tag: "Producto",
    open: true,
  },
  {
    id: "unboxing-express",
    title: "Unboxing Express",
    brand: "Color Dreams",
    brief: "Tu primer video mostrando cómo llega en caja y se infla en minutos. Pega tu link de TikTok Shop.",
    reward: "150 estrellas + boost de comisión",
    stars: 150,
    deadline: "Cupo abierto",
    tag: "Contenido",
    open: true,
  },
  {
    id: "hot-sale-live",
    title: "Hot Sale Live",
    brand: "Color Dreams",
    brief: "Co-host en un Live oficial durante Hot Sale. Las ventas en Live cuentan doble.",
    reward: "Fee de Live + 200 estrellas",
    stars: 200,
    deadline: "Próximamente",
    tag: "Live",
    open: true,
  },
  {
    id: "recamara-makeover",
    title: "Recámara Makeover",
    brand: "Color Dreams",
    brief: "Antes y después de tu recámara con tu Color Dreams. Estilo lifestyle, súper compartible.",
    reward: "200 estrellas",
    stars: 200,
    deadline: "Cupo abierto",
    tag: "Contenido",
    open: true,
  },
  {
    id: "resena-real",
    title: "Reseña Real",
    brand: "Color Dreams",
    brief: "Tras 30 noches, comparte tu opinión honesta en video. La autenticidad vende.",
    reward: "150 estrellas",
    stars: 150,
    deadline: "Cupo abierto",
    tag: "Reseña",
    open: true,
  },
];

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
