"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addParticipation, submitDelivery, getCampaignById, listParticipations } from "@/lib/store";
import { getCurrentCreator } from "@/lib/session";
import { isHttpUrl } from "@/lib/url";

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
  // Cupo: si la campaña tiene límite y ya está lleno, no inscribir (a menos que
  // la creadora YA estuviera inscrita). Guard server-side: la card ya oculta el
  // botón cuando está lleno; esto cubre el POST directo y la carrera de cupo.
  if (campaign.cupo && campaign.cupo > 0) {
    const all = await listParticipations();
    const meEmail = me.email.toLowerCase();
    const alreadyIn = all.some((p) => p.campaignId === campaignId && p.creatorEmail.toLowerCase() === meEmail);
    const taken = all.filter((p) => p.campaignId === campaignId).length;
    if (!alreadyIn && taken >= campaign.cupo) {
      redirect("/campanas?lleno=1");
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
  if (campaignId && isHttpUrl(link)) {
    await submitDelivery(me.email, campaignId, link);
  }
  revalidatePath("/campanas");
  revalidatePath("/");
}
