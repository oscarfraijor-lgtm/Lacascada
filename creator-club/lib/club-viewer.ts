// Quién está viendo el club público. Normalmente una creadora registrada; pero un
// ADMIN (equipo) puede PREVISUALIZAR el club sin registrarse: ve la experiencia de
// una creadora nueva (cero progreso) con un banner, SIN poder participar/canjear
// (eso lo cubren las server actions, que exigen una creadora real → anti-fuga).
//
// Lo usan las páginas y la capa de datos (lib/data) para que el admin vea el club
// poblado. Las ESCRITURAS siguen usando getCurrentCreator (creadora real), así que
// el admin nunca genera datos ni se auto-otorga recompensas.
import { getCurrentCreator, currentEmail } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import type { CreatorRecord } from "@/lib/store";

export interface ClubViewer {
  creator: CreatorRecord | null; // la "miembro" a renderizar (real, o sintética en preview)
  isMember: boolean; // creadora registrada de verdad
  isAdminPreview: boolean; // admin viendo el club sin cuenta de creadora
}

// Creadora sintética de cero progreso para la vista de admin. NO se persiste; su
// email es el del admin (sin entregas/canjes), así la capa de datos devuelve ceros.
function previewCreator(email: string): CreatorRecord {
  return { name: "Admin", handle: "", email, gmvMXN: 0 };
}

export async function getClubViewer(): Promise<ClubViewer> {
  const creator = await getCurrentCreator();
  if (creator) return { creator, isMember: true, isAdminPreview: false };
  const email = await currentEmail();
  if (email && isAdmin(email)) {
    return { creator: previewCreator(email), isMember: false, isAdminPreview: true };
  }
  return { creator: null, isMember: false, isAdminPreview: false };
}
