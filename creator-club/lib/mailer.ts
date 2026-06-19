// Envío del magic link. Con RESEND_API_KEY usa Resend (https://resend.com);
// sin key, modo dev: imprime el enlace en la terminal y lo devuelve para
// mostrarlo en pantalla (así se puede probar sin cuenta de correo).
import { BRAND } from "@/lib/schema";

export function mailerConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export interface SendResult {
  delivered: "email" | "console";
  devLink?: string; // presente solo en modo dev (sin Resend)
}

export async function sendMagicLink(email: string, url: string): Promise<SendResult> {
  if (!mailerConfigured()) {
    console.log(`\n🔑 [Color Club] Magic link para ${email}:\n${url}\n`);
    return { delivered: "console", devLink: url };
  }

  const from = process.env.RESEND_FROM || "Color Club <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `Tu acceso a ${BRAND.club}`,
      html: magicLinkHtml(url),
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
  return { delivered: "email" };
}

function magicLinkHtml(url: string): string {
  return `<!doctype html><html><body style="margin:0;background:${BRAND.cream};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink}">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${BRAND.violetDeep};font-weight:700">${BRAND.club} · ${BRAND.name}</p>
    <h1 style="font-size:24px;margin:8px 0 4px">Entra a tu cuenta</h1>
    <p style="color:${BRAND.ink};opacity:.8;line-height:1.5">Haz clic en el botón para acceder al ${BRAND.club}. El enlace caduca en 30 minutos y solo se puede usar una vez.</p>
    <p style="margin:28px 0">
      <a href="${url}" style="background:${BRAND.lime};color:${BRAND.ink};text-decoration:none;font-weight:800;padding:14px 28px;border-radius:999px;display:inline-block">Entrar al club</a>
    </p>
    <p style="font-size:12px;color:${BRAND.ink};opacity:.6;line-height:1.5">Si no solicitaste este acceso, ignora este correo.<br>O copia este enlace:<br>${url}</p>
  </div></body></html>`;
}
