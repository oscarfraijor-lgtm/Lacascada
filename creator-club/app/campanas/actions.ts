"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addParticipation } from "@/lib/store";
import { getCurrentCreator } from "@/lib/session";

export async function participar(formData: FormData) {
  const campaignId = String(formData.get("campaignId") || "");
  const me = await getCurrentCreator();
  if (!me) redirect("/registro");
  await addParticipation({ creatorEmail: me.email, campaignId, status: "inscrita" });
  revalidatePath("/campanas");
}
