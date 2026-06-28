"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCreator } from "@/lib/session";
import { participationsFor, listCampaigns, requestCanje, misionesFor, getRewardById, canjesFor } from "@/lib/store";
import { combinedStars, creatorTier } from "@/lib/data";
import { rewardState } from "@/lib/rewards";
import { tierInScope } from "@/lib/tiers";

// La creadora solicita un canje. Se valida SERVER-SIDE que la recompensa exista
// y esté desbloqueada (estrellas + GMV); el botón solo aparece si toca, pero la
// server action es alcanzable por POST directo. El equipo aún debe aprobarla en
// /admin (segundo candado anti-fuga: no se aprueba con costo sin GMV atribuible).
export async function solicitarCanje(formData: FormData) {
  const rewardId = String(formData.get("rewardId") || "");
  const me = await getCurrentCreator();
  if (!me || !rewardId) return;

  const reward = await getRewardById(rewardId);
  if (!reward || reward.active === false) return;

  const [parts, campaigns, completions, myCanjes] = await Promise.all([
    participationsFor(me.email),
    listCampaigns(),
    misionesFor(me.email),
    canjesFor(me.email),
  ]);

  // Scope por CATEGORÍA: se valida solo la PRIMERA vez. Si ya hay un canje previo
  // para esta recompensa (ej. uno rechazado que la creadora re-solicita), se honra
  // aunque su categoría haya bajado de mes (espejo de getRewardsView, que no re-bloquea
  // si !canje, y de cambiarEstadoCanje, que no re-valida el nivel al aprobar). Sin esto
  // el botón "Solicitar de nuevo" quedaba muerto. El gate de GMV (rewardState) sí sigue.
  const tier = creatorTier(me.gmvMXN ?? 0);
  const priorCanje = myCanjes.some((c) => c.rewardId === reward.id);
  if (!priorCanje && !tierInScope(reward.tiers, tier.key)) return;
  const stars = combinedStars(parts, campaigns, me, completions);
  const gmv = me.gmvMXN ?? 0;

  // Solo se solicita lo que está desbloqueado. El estatus no se "solicita"
  // (es automático) y lo bloqueado no aplica.
  if (rewardState(reward, stars, gmv) !== "desbloqueada") return;

  // Guarda el GMV de la creadora AL solicitar: el gate de aprobación lo respeta para
  // no congelar un canje legítimo si su GMV mensual se resetea antes de aprobarlo.
  await requestCanje(me.email, reward.id, reward.title, gmv);
  revalidatePath("/recompensas");
  revalidatePath("/");
}
