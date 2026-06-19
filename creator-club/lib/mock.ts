import type { Reward } from "@/lib/types";

// Catálogo de recompensas del programa (estático, diseño del Color Club).
// NO son datos de una persona; el flujo de canje real con candado por GMV es
// una fase posterior. (Antes este archivo tenía un creador/leaderboard mock que
// se mostraban a todas las usuarias; ya se eliminaron.)
export const mockRewards: Reward[] = [
  { id: "r-status", title: "Subir de nivel + insignia", detail: "Estatus, badge y acceso a misiones premium.", cost: "Acumula estrellas", kind: "estatus", payer: "club" },
  { id: "r-muestra", title: "Muestra de colchón", detail: "Pruébalo 30 noches (atado a tu primera venta).", cost: "Nivel Soñadora", kind: "producto", payer: "marca" },
  { id: "r-boost", title: "Boost de comisión +1%", detail: "Más ganancia por cada venta vía Targeted Collab.", cost: "Nivel Soñadora", kind: "boost", payer: "marca" },
  { id: "r-colchon", title: "Colchón propio (regalo)", detail: "Tuyo para siempre.", cost: "Nivel Insomne Pro · $60K GMV", kind: "producto", payer: "marca" },
  { id: "r-cdmx", title: "Experiencia CDMX", detail: "Noche de Sueños + sesión de fotos + kit de creadora.", cost: "Nivel Embajadora · $150K GMV", kind: "experiencia", payer: "marca" },
];
