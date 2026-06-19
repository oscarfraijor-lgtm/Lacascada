import type { Creator, LeaderboardRow, Reward } from "@/lib/types";

// Datos demo para ver el portal sin Airtable. Se reemplazan al cablear datos reales.
export const mockCreator: Creator = {
  id: "rec_demo",
  name: "Mariela Gaxiola",
  handle: "@maye.creates",
  stars: 820,
  gmvMXN: 18400,
  level: "sonadora",
  completedMissionIds: ["perfil", "conectar-tt", "induccion", "primer-video", "prueba-30", "primera-venta"],
};

export const mockLeaderboard: LeaderboardRow[] = [
  { rank: 1, name: "Sofía Rentería", handle: "@sofi.sleeps", stars: 2640 },
  { rank: 2, name: "Daniela Cruz", handle: "@danidreams", stars: 1980 },
  { rank: 3, name: "Mariela Gaxiola", handle: "@maye.creates", stars: 820, isMe: true },
  { rank: 4, name: "Andrea López", handle: "@andy.home", stars: 760 },
  { rank: 5, name: "Karla Mendoza", handle: "@karlamzz", stars: 540 },
];

export const mockRewards: Reward[] = [
  { id: "r-status", title: "Subir de nivel + insignia", detail: "Estatus, badge y acceso a misiones premium.", cost: "Acumula estrellas", kind: "estatus", payer: "club" },
  { id: "r-muestra", title: "Muestra de colchón", detail: "Pruébalo 30 noches (atado a tu primera venta).", cost: "Nivel Soñadora", kind: "producto", payer: "marca" },
  { id: "r-boost", title: "Boost de comisión +1%", detail: "Más ganancia por cada venta vía Targeted Collab.", cost: "Nivel Soñadora", kind: "boost", payer: "marca" },
  { id: "r-colchon", title: "Colchón propio (regalo)", detail: "Tuyo para siempre.", cost: "Nivel Insomne Pro · $60K GMV", kind: "producto", payer: "marca" },
  { id: "r-cdmx", title: "Experiencia CDMX", detail: "Noche de Sueños + sesión de fotos + kit de creadora.", cost: "Nivel Embajadora · $150K GMV", kind: "experiencia", payer: "marca" },
];
