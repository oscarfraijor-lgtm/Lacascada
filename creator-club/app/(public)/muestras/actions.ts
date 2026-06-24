"use server";

import { redirect } from "next/navigation";
import { getCurrentCreator } from "@/lib/session";
import { getProductById, addMuestra, updateCreator } from "@/lib/store";

// La creadora solicita una muestra de un PRODUCTO del catálogo, dejando su dirección
// de envío. Queda "solicitada"; el equipo la aprueba y la envía desde /admin. NO hay
// gate de GMV (es una inversión de la marca para generar contenido; el equipo decide
// con el contexto de la creadora). Se valida SERVER-SIDE (producto activo real +
// dirección), por si se forja el POST.
export async function solicitarMuestra(formData: FormData) {
  const productId = String(formData.get("productId") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const me = await getCurrentCreator();
  if (!me) redirect("/registro");

  // Solo productos activos del catálogo (no ids arbitrarios).
  const product = productId ? await getProductById(productId) : undefined;
  if (!product || product.active === false) redirect("/muestras?err=producto");

  // Sin dirección no se puede enviar; cae a la dirección guardada en su perfil.
  const dir = address || me.shippingAddress?.trim() || "";
  if (!dir) redirect("/muestras?err=direccion");

  await addMuestra({
    creatorEmail: me.email,
    productId: product.id,
    productName: product.name,
    address: dir,
    note: note || undefined,
    status: "solicitada",
  });

  // Si no tenía dirección en su perfil, guárdala para reusarla la próxima vez.
  if (me.id && !me.shippingAddress?.trim() && address) {
    try {
      await updateCreator(me.id, { shippingAddress: dir });
    } catch {
      /* no bloquea la solicitud si falla guardar el perfil */
    }
  }

  redirect("/muestras?ok=1");
}
