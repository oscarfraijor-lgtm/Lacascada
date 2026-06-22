"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentEmail } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import { setSelectedBrandCookie, managedBrands } from "@/lib/brand-admin";

// Entrar a un club desde la consola: guarda la marca seleccionada (cookie) y abre
// su panel de admin, ya con el branding de esa marca.
export async function entrarMarca(formData: FormData) {
  const email = await currentEmail();
  // Sesión perdida o sin permisos: a login (no un 500). Antes tiraba "No
  // autorizado" y, si el prefetch te había deslogueado, salía error de servidor.
  if (!isAdmin(email)) redirect("/acceso");
  const slug = String(formData.get("slug") || "");
  // Solo se entra a un club GESTIONABLE (con base conectada); pendientes/externos
  // no se "entran" desde aquí (la consola los muestra bloqueados o como link).
  if (!managedBrands().some((b) => b.slug === slug && b.configured)) return;
  await setSelectedBrandCookie(slug);
  revalidatePath("/admin", "layout");
  redirect("/admin");
}
