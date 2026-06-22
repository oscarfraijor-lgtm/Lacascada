"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCreatorByEmail } from "@/lib/store";
import { isAdmin } from "@/lib/roles";
import { signAccessToken } from "@/lib/token";
import { sendMagicLink } from "@/lib/mailer";
import { isValidEmail } from "@/lib/email";

export async function solicitarAcceso(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!isValidEmail(email)) redirect("/acceso?error=email");

  // Solo enviamos enlace a correos ya registrados o a admins.
  // Decisión deliberada: a una creadora NO registrada sí le decimos "regístrate
  // primero" (onboarding > anti-enumeración; aquí no se revela quién es admin —
  // eso se protege en /operador, que siempre dice "revisa tu correo").
  const creator = await getCreatorByEmail(email);
  const admin = isAdmin(email);
  if (!creator && !admin) {
    redirect(`/acceso?nuevo=1&email=${encodeURIComponent(email)}`);
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const base = `${proto}://${host}`;
  const token = signAccessToken(email);
  const url = `${base}/acceso/verificar?token=${encodeURIComponent(token)}`;

  const result = await sendMagicLink(email, url);
  if (result.delivered === "console" && result.devLink) {
    redirect(`/acceso?enviado=1&dev=${encodeURIComponent(result.devLink)}`);
  }
  redirect("/acceso?enviado=1");
}
