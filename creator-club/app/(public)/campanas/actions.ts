"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addParticipation, submitDelivery, getCampaignById, listParticipations, participationsFor } from "@/lib/store";
import { getCurrentCreator } from "@/lib/session";
import { isHttpUrl } from "@/lib/url";
import { creatorTier } from "@/lib/data";
import { tierInScope } from "@/lib/tiers";

export async function participar(formData: FormData) {
  const campaignId = String(formData.get("campaignId") || "");
  const me = await getCurrentCreator();
  if (!me) redirect("/registro");
  // Solo a campañas reales y ABIERTAS (un form viejo o POST directo no inscribe
  // a una campaña cerrada/inexistente). Patrón: no-op + refresh.
  const campaign = await getCampaignById(campaignId);
  if (!campaign || !campaign.open) {
    revalidatePath("/campanas");
    return;
  }
  // Si ya está inscrita, no re-evaluamos categoría/cupo (ya entró; addParticipation
  // deduplica). Las reglas solo aplican a inscripciones NUEVAS.
  const mine = await participationsFor(me.email);
  const meEmail = me.email.toLowerCase();
  const alreadyIn = mine.some((p) => p.campaignId === campaignId);
  if (!alreadyIn) {
    // Scope por CATEGORÍA (nivel/badge de TikTok): una campaña exclusiva solo admite
    // creadoras de esa categoría. La card ya la oculta; esto cubre el POST directo y
    // que su categoría haya bajado de mes. Guard fail-closed.
    if (campaign.tiers && campaign.tiers.length) {
      const tier = creatorTier(me.gmvMXN ?? 0);
      if (!tierInScope(campaign.tiers, tier.key)) redirect("/campanas?nocat=1");
    }
    // Cupo: si la campaña tiene límite y ya está lleno, no inscribir.
    if (campaign.cupo && campaign.cupo > 0) {
      const all = await listParticipations();
      const taken = all.filter((p) => p.campaignId === campaignId && p.creatorEmail.toLowerCase() !== meEmail).length;
      if (taken >= campaign.cupo) redirect("/campanas?lleno=1");
    }
  }
  await addParticipation({ creatorEmail: me.email, campaignId, status: "inscrita" });
  revalidatePath("/campanas");
}

// La creadora sube/actualiza el link de su video -> entrega pasa a "entregada".
export async function entregarVideo(formData: FormData) {
  const campaignId = String(formData.get("campaignId") || "");
  const link = String(formData.get("link") || "").trim();
  const me = await getCurrentCreator();
  if (!me) redirect("/registro");
  // El link debe ser una URL http(s) (no se guarda texto arbitrario / javascript:).
  if (campaignId) {
    if (!isHttpUrl(link)) redirect("/campanas?err=link");
    await submitDelivery(me.email, campaignId, link);
  }
  revalidatePath("/campanas");
  revalidatePath("/");
}
