"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createCreator, getCreatorByEmail } from "@/lib/store";
import { isAdmin } from "@/lib/roles";
import { isValidEmail } from "@/lib/email";
import { signAccessToken } from "@/lib/token";
import { sendMagicLink } from "@/lib/mailer";
import { LEGAL_VERSION } from "@/lib/legal";

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
  // El equipo entra por /operador; nadie se auto-registra como admin (evita escalado).
  if (isAdmin(email)) redirect("/operador");

  // Crea la cuenta si es nueva (con la prueba de consentimiento: fecha + versión).
  // NO inicia sesión: registrarse no prueba que el correo es tuyo. Se manda un
  // enlace de confirmación y la sesión se crea al abrirlo (igual que /acceso). Así
  // nadie puede "tomar" el correo de otra creadora registrándolo.
  const existing = await getCreatorByEmail(email);
  if (!existing) {
    await createCreator({
      name,
      handle,
      email,
      followers,
      city,
      portfolio,
      affiliateHandle,
      consentAt: new Date().toISOString(),
      consentVersion: LEGAL_VERSION,
    });
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const url = `${proto}://${host}/acceso/verificar?token=${encodeURIComponent(signAccessToken(email))}`;

  const result = await sendMagicLink(email, url);
  if (result.delivered === "console" && result.devLink) {
    redirect(`/acceso?enviado=1&r=1&dev=${encodeURIComponent(result.devLink)}`);
  }
  redirect("/acceso?enviado=1&r=1");
}
