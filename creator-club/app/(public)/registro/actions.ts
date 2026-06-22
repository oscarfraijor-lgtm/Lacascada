"use server";

import { redirect } from "next/navigation";
import { createCreator } from "@/lib/store";
import { setCreatorCookie } from "@/lib/session";

export async function registrar(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const handle = String(formData.get("handle") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const followers = String(formData.get("followers") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const portfolio = String(formData.get("portfolio") || "").trim();
  const consent = formData.get("consent");

  if (!name || !email) redirect("/registro?error=faltan");
  // Consentimiento explícito (LFPDPPP); también va en el server, no solo en el HTML.
  if (!consent) redirect("/registro?error=consent");

  await createCreator({ name, handle, email, followers, city, portfolio });
  await setCreatorCookie(email);
  redirect("/campanas?bienvenida=1");
}
