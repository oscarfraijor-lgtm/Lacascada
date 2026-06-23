// Envío del magic link. Con RESEND_API_KEY usa Resend (https://resend.com);
// sin key, modo dev: imprime el enlace en la terminal y lo devuelve para
// mostrarlo en pantalla (así se puede probar sin cuenta de correo).
import { BRAND } from "@/lib/schema";
import type { BrandConfig } from "@/lib/brands";

// Marca con la que se brandea el correo. Por defecto la del env (magic link, lado
// público), pero el admin multimarca pasa ctx.brand de la marca SELECCIONADA para
// no exponerle a la creadora el nombre/colores de OTRA marca.
type MailBrand = Pick<BrandConfig, "name" | "club" | "cream" | "ink" | "violetDeep" | "lime">;

export function mailerConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

// Remitente del correo. MULTIMARCA con UNA sola cuenta + UN solo dominio Resend:
//   RESEND_FROM_ADDRESS = la dirección compartida (ej. "no-reply@club.indiepro.com.mx").
//   El NOMBRE visible se arma solo con la marca ("Color Club", "Anyeluz Club", ...),
//   así el MISMO valor del env sirve para TODOS los deploys de marca. El dominio se
//   verifica una vez en Resend (el plan gratis permite 1 dominio, que es lo que se
//   necesita). `RESEND_FROM` (string completo) sigue funcionando como override total.
function fromHeader(club: string): string {
  const addr = process.env.RESEND_FROM_ADDRESS?.trim();
  if (addr) return `${club} <${addr}>`;
  if (process.env.RESEND_FROM?.trim()) return process.env.RESEND_FROM.trim();
  return `${club} <onboarding@resend.dev>`; // sandbox (solo entrega al dueño de la cuenta)
}

export interface SendResult {
  delivered: "email" | "console";
  devLink?: string; // presente solo en modo dev (sin Resend)
}

export async function sendMagicLink(email: string, url: string): Promise<SendResult> {
  if (!mailerConfigured()) {
    console.log(`\n🔑 [${BRAND.club}] Magic link para ${email}:\n${url}\n`);
    return { delivered: "console", devLink: url };
  }

  const from = fromHeader(BRAND.club);
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

// Aviso transaccional a la creadora (entrega aceptada/aprobada/rechazada, canje
// resuelto). Mismo patrón que sendMagicLink: sin RESEND_API_KEY imprime en consola
// (dev); con key, envía por Resend. OJO PROD: con Resend en modo test solo entrega
// al correo dueño de la cuenta; para llegar a las creadoras hay que verificar el
// dominio (reco club.indiepro.com.mx con DKIM+SPF) y poner RESEND_FROM en él.
export interface Notification {
  subject: string;
  heading: string;
  body: string;
  cta?: { url: string; label: string };
}

export async function sendNotification(
  to: string,
  n: Notification,
  brand: MailBrand = BRAND
): Promise<SendResult> {
  if (!mailerConfigured()) {
    console.log(`\n📧 [${brand.club}] Para ${to}: ${n.subject}\n${n.heading}: ${n.body}\n`);
    return { delivered: "console" };
  }
  const from = fromHeader(brand.club);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject: n.subject, html: notificationHtml(n, brand) }),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
  return { delivered: "email" };
}

function notificationHtml(n: Notification, brand: MailBrand): string {
  const cta = n.cta
    ? `<p style="margin:24px 0"><a href="${n.cta.url}" style="background:${brand.lime};color:${brand.ink};text-decoration:none;font-weight:800;padding:13px 26px;border-radius:999px;display:inline-block">${n.cta.label}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:${brand.cream};font-family:Arial,Helvetica,sans-serif;color:${brand.ink}">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${brand.violetDeep};font-weight:700">${brand.club} · ${brand.name}</p>
    <h1 style="font-size:22px;margin:8px 0 6px">${n.heading}</h1>
    <p style="color:${brand.ink};opacity:.85;line-height:1.5">${n.body}</p>
    ${cta}
    <p style="font-size:12px;color:${brand.ink};opacity:.55;line-height:1.5">Recibes este correo porque eres parte del ${brand.club}.</p>
  </div></body></html>`;
}

function magicLinkHtml(url: string): string {
  return `<!doctype html><html><body style="margin:0;background:${BRAND.cream};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink}">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${BRAND.violetDeep};font-weight:700">${BRAND.club} · ${BRAND.name}</p>
    <h1 style="font-size:24px;margin:8px 0 4px">Entra a tu cuenta</h1>
    <p style="color:${BRAND.ink};opacity:.8;line-height:1.5">Haz clic en el botón para acceder al ${BRAND.club}. El enlace caduca en 30 minutos. Por seguridad, no lo compartas.</p>
    <p style="margin:28px 0">
      <a href="${url}" style="background:${BRAND.lime};color:${BRAND.ink};text-decoration:none;font-weight:800;padding:14px 28px;border-radius:999px;display:inline-block">Entrar al club</a>
    </p>
    <p style="font-size:12px;color:${BRAND.ink};opacity:.6;line-height:1.5">Si no solicitaste este acceso, ignora este correo.<br>O copia este enlace:<br>${url}</p>
  </div></body></html>`;
}
