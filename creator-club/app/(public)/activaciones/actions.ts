"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addActivacion } from "@/lib/store";
import { getCurrentCreator } from "@/lib/session";
import { ACTIVACION_TIPOS } from "@/lib/activaciones";
import { looksLikeAffiliate } from "@/lib/missions";

// La creadora solicita una activación (flash sale o giveaway) para su Live, dejando
// su usuario. Queda "solicitada"; el equipo la otorga en TikTok Shop desde /admin.
// Se valida SERVER-SIDE (tipo válido + creadora real), por si se forja el POST.
export async function solicitarActivacion(formData: FormData) {
  const tipo = String(formData.get("tipo") || "");
  const usuario = String(formData.get("usuario") || "").trim();
  const me = await getCurrentCreator();
  if (!me) redirect("/registro");

  // Solo los tipos reales (no texto arbitrario).
  if (!(ACTIVACION_TIPOS as string[]).includes(tipo)) {
    revalidatePath("/activaciones");
    return;
  }
  // Usuario del Live: lo que dejó, o su @afiliado / handle como respaldo. Debe
  // parecer un @handle/usuario/URL real (no texto basura), para que el equipo sepa
  // en qué cuenta de TikTok prender la activación.
  const u = usuario || me.affiliateHandle || me.handle || "";
  if (!looksLikeAffiliate(u)) redirect("/activaciones?err=usuario");

  await addActivacion({ creatorEmail: me.email, tipo, usuario: u, status: "solicitada" });
  redirect("/activaciones?ok=1");
}
