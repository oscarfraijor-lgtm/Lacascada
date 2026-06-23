"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCreator } from "@/lib/session";
import { participationsFor, listCampaigns, requestCanje, misionesFor, getRewardById } from "@/lib/store";
import { combinedStars } from "@/lib/data";
import { rewardState } from "@/lib/rewards";

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

  const [parts, campaigns, completions] = await Promise.all([
    participationsFor(me.email),
    listCampaigns(),
    misionesFor(me.email),
  ]);
  const stars = combinedStars(parts, campaigns, me, completions);
  const gmv = me.gmvMXN ?? 0;

  // Solo se solicita lo que está desbloqueado. El estatus no se "solicita"
  // (es automático) y lo bloqueado no aplica.
  if (rewardState(reward, stars, gmv) !== "desbloqueada") return;

  await requestCanje(me.email, reward.id, reward.title);
  revalidatePath("/recompensas");
  revalidatePath("/");
}
