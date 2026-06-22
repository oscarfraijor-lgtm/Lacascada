"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { currentEmail } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import { signAccessToken } from "@/lib/token";

// Genera un enlace de acceso para un miembro del equipo (admin) — se firma en el
// servidor con la llave del deploy, sin exponer secretos. Sirve para entrar sin
// esperar correo (ej. mientras Resend no entrega a todos). Solo un admin puede
// generarlo, y solo para correos que YA son admin (no escala permisos).
export async function generarEnlaceEquipo(formData: FormData) {
  const caller = await currentEmail();
  if (!isAdmin(caller)) redirect("/operador");

  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email || !isAdmin(email)) {
    redirect(`/console/equipo?error=noadmin&email=${encodeURIComponent(email)}`);
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const token = signAccessToken(email, 3 * 24 * 60 * 60 * 1000); // 3 días
  const link = `${proto}://${host}/acceso/verificar?token=${encodeURIComponent(token)}`;
  redirect(`/console/equipo?email=${encodeURIComponent(email)}&link=${encodeURIComponent(link)}`);
}
