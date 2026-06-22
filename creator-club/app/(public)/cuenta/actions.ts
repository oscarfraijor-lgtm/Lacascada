"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentCreator } from "@/lib/session";
import { updateCreator } from "@/lib/store";

// La creadora edita su perfil. El email NO se edita (es la clave de identidad):
// se ignora cualquier intento de mandarlo. Solo se actualiza sobre SU propio
// registro (el de la sesión), nunca uno arbitrario.
export async function actualizarCuenta(formData: FormData) {
  const me = await getCurrentCreator();
  if (!me?.id) redirect("/acceso");

  const name = String(formData.get("name") || "").trim();
  if (!name) redirect("/cuenta?error=nombre");

  await updateCreator(me.id, {
    name,
    handle: String(formData.get("handle") || "").trim(),
    followers: String(formData.get("followers") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    portfolio: String(formData.get("portfolio") || "").trim(),
  });

  revalidatePath("/cuenta");
  revalidatePath("/");
  redirect("/cuenta?ok=1");
}
