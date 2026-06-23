"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { markMisionDone } from "@/lib/store";
import { getCurrentCreator } from "@/lib/session";
import { MISSIONS } from "@/lib/schema";

// Marca la inducción como vista (misión de estatus, costo $0). Solo acepta una
// misión de tipo "watch": un POST forjado con otro id no otorga estrellas.
// Escribe sobre la creadora REAL de la sesión (un admin en vista previa no puede).
export async function marcarInduccionVista(formData: FormData) {
  const missionId = String(formData.get("missionId") || "");
  const me = await getCurrentCreator();
  if (!me) redirect("/registro");

  const mission = MISSIONS.find((m) => m.id === missionId);
  if (mission && mission.action === "watch") {
    await markMisionDone(me.email, missionId);
  }
  revalidatePath("/induccion");
  revalidatePath("/misiones");
  revalidatePath("/");
  redirect("/induccion?ok=1");
}
