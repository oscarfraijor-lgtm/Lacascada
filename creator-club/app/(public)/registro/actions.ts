"use server";

import { redirect } from "next/navigation";
import { createCreator, getCreatorByEmail } from "@/lib/store";
import { setCreatorCookie } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import { isValidEmail } from "@/lib/email";

export async function registrar(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const handle = String(formData.get("handle") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const followers = String(formData.get("followers") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const portfolio = String(formData.get("portfolio") || "").trim();
  const affiliateHandle = String(formData.get("affiliateHandle") || "").trim();
  const consent = formData.get("consent");

  if (!name || !email) redirect("/registro?error=faltan");
  if (!isValidEmail(email)) redirect("/registro?error=email");
  // Consentimiento explícito (LFPDPPP); también va en el server, no solo en el HTML.
  if (!consent) redirect("/registro?error=consent");
  // El equipo entra por /acceso; nadie se auto-registra como admin (evita escalado).
  if (isAdmin(email)) redirect("/acceso");
  // Si el correo ya tiene cuenta, que entre verificando su correo (no dejar que
  // alguien "registre" un correo ajeno y quede dentro sin probar que es suyo).
  const existing = await getCreatorByEmail(email);
  if (existing) redirect(`/acceso?ya=1&email=${encodeURIComponent(email)}`);

  await createCreator({ name, handle, email, followers, city, portfolio, affiliateHandle });
  await setCreatorCookie(email);
  redirect("/campanas?bienvenida=1");
}
