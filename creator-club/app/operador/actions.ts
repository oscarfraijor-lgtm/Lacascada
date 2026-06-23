"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAdmin } from "@/lib/roles";
import { signAccessToken } from "@/lib/token";
import { sendMagicLink } from "@/lib/mailer";
import { isValidEmail } from "@/lib/email";
import { setCreatorCookie } from "@/lib/session";
import { adminPassphraseEnabled, verifyAdminPassphrase } from "@/lib/admin-passphrase";

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

// Acceso de admin con CLAVE del equipo (alternativa al magic link, sin correo).
// Doble requisito: el correo debe estar en el allowlist de admins Y la clave debe
// coincidir con ADMIN_PASSPHRASE. Una clave filtrada NO crea admins nuevos. La
// sesión que se setea es la MISMA cookie firmada que el magic link (lib/session).
// Mensaje genérico: no revela si falló el correo o la clave.
export async function entrarConClave(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const passphrase = String(formData.get("passphrase") || "");
  if (!adminPassphraseEnabled()) redirect("/operador?clave=off");
  if (!isAdmin(email) || !verifyAdminPassphrase(passphrase)) {
    redirect("/operador?clave=bad");
  }
  await setCreatorCookie(email);
  redirect("/console");
}
