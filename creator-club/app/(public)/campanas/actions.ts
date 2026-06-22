"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addParticipation, submitDelivery, getCampaignById } from "@/lib/store";
import { getCurrentCreator } from "@/lib/session";

// ¿Es un link http(s) válido? (rechaza javascript:, relativos, basura).
function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

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
