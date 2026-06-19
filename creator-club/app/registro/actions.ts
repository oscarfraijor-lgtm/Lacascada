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

  if (!name || !email) redirect("/registro?error=faltan");

  await createCreator({ name, handle, email, followers, city });
  await setCreatorCookie(email);
  redirect("/campanas?bienvenida=1");
}
