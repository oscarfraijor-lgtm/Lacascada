"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { submitMision } from "@/lib/store";
import { getCurrentCreator } from "@/lib/session";
import { MISSIONS } from "@/lib/schema";
import { isHttpUrl } from "@/lib/url";

// La creadora pega el link de su video para una misión de CONTENIDO -> "enviada"
// (el equipo la aprueba en /admin antes de otorgar estrellas). Solo aplica a
// misiones de tipo "submit": un POST forjado a una misión auto/watch/sale no
// otorga estrellas (anti-fuga). Escribe sobre la creadora REAL de la sesión.
export async function entregarMision(formData: FormData) {
  const missionId = String(formData.get("missionId") || "");
  const link = String(formData.get("link") || "").trim();
  const me = await getCurrentCreator();
  if (!me) redirect("/registro");

  const mission = MISSIONS.find((m) => m.id === missionId);
  if (mission && mission.action === "submit") {
    // Link inválido: avisar (no fallar en silencio) en vez de descartar la entrega.
    if (!isHttpUrl(link)) redirect("/misiones?err=link");
    await submitMision(me.email, missionId, link);
  }
  revalidatePath("/misiones");
  revalidatePath("/");
}
