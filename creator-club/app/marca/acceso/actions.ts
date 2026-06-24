"use server";

import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { signAccessToken } from "@/lib/token";
import { sendMagicLink } from "@/lib/mailer";
import { isValidEmail } from "@/lib/email";
import { isBrandAccount } from "@/lib/brand-accounts";

// Acceso de MARCA (cliente). Solo los correos de marca reciben enlace; para no
// revelar quién es cuenta de marca, SIEMPRE mostramos "revisa tu correo" (solo se
// envía de verdad si el correo es una cuenta de marca). El verificador detecta la
// marca y la manda a /marca (su dashboard de solo lectura).
export async function solicitarAccesoMarca(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!isValidEmail(email)) redirect("/marca/acceso?error=email");

  let devLink: string | undefined;
  if (isBrandAccount(email)) {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto =
      h.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
    const url = `${proto}://${host}/acceso/verificar?token=${encodeURIComponent(signAccessToken(email))}`;
    // Anti-enumeración: si el envío falla (Resend caído / modo test / dominio no
    // verificado / rate-limit), NO debe diferenciarse de un correo cualquiera. Se
    // traga el error y cae igual a "revisa tu correo". El redirect va FUERA del try
    // (es un throw de control que no se debe atrapar).
    try {
      const result = await sendMagicLink(email, url);
      if (result.delivered === "console") devLink = result.devLink;
    } catch (e) {
      console.warn("[marca] no se pudo enviar el enlace de acceso:", e);
    }
  }
  if (devLink) redirect(`/marca/acceso?enviado=1&dev=${encodeURIComponent(devLink)}`);
  redirect("/marca/acceso?enviado=1");
}

// Logout de marca por POST (nunca GET: Next prefetcha los <Link> en prod y
// dispararía el logout solo). Borra la sesión y vuelve al login de marca.
export async function cerrarSesionMarca() {
  const c = await cookies();
  c.delete("cc_creator");
  redirect("/marca/acceso");
}
