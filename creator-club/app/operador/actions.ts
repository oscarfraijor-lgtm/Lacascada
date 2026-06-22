"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAdmin } from "@/lib/roles";
import { signAccessToken } from "@/lib/token";
import { sendMagicLink } from "@/lib/mailer";
import { isValidEmail } from "@/lib/email";

// Acceso de OPERADOR (equipo Indie Pro): entrada neutral, no pasa por ninguna
// marca. Solo los admins reciben enlace; para no revelar quién es admin, SIEMPRE
// mostramos "revisa tu correo" (solo se envía de verdad si el correo es admin).
export async function solicitarAccesoOperador(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!isValidEmail(email)) redirect("/operador?error=email");

  if (isAdmin(email)) {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto =
      h.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
    const base = `${proto}://${host}`;
    const token = signAccessToken(email);
    // El verificador ya manda a los admins a /console (no a una marca).
    const url = `${base}/acceso/verificar?token=${encodeURIComponent(token)}`;
    const result = await sendMagicLink(email, url);
    if (result.delivered === "console" && result.devLink) {
      redirect(`/operador?enviado=1&dev=${encodeURIComponent(result.devLink)}`);
    }
  }
  redirect("/operador?enviado=1");
}
