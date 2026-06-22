"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addParticipation, submitDelivery } from "@/lib/store";
import { getCurrentCreator } from "@/lib/session";

export async function participar(formData: FormData) {
  const campaignId = String(formData.get("campaignId") || "");
  const me = await getCurrentCreator();
  if (!me) redirect("/registro");
  await addParticipation({ creatorEmail: me.email, campaignId, status: "inscrita" });
  revalidatePath("/campanas");
}

// La creadora sube/actualiza el link de su video -> entrega pasa a "entregada".
export async function entregarVideo(formData: FormData) {
  const campaignId = String(formData.get("campaignId") || "");
  const link = String(formData.get("link") || "").trim();
  const me = await getCurrentCreator();
  if (!me) redirect("/registro");
  if (campaignId && link) {
    await submitDelivery(me.email, campaignId, link);
  }
  revalidatePath("/campanas");
  revalidatePath("/");
}
