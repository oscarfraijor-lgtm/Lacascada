import Link from "next/link";
import { redirect } from "next/navigation";
import { MailCheck, AlertCircle, BarChart3 } from "lucide-react";
import { BRAND } from "@/lib/schema";
import { brandThemeVars } from "@/lib/theme";
import { getBrandContext } from "@/lib/brand-accounts";
import { solicitarAccesoMarca } from "./actions";

export const metadata = {
  title: `Acceso · ${BRAND.name}`,
  description: `Acceso al panel de ${BRAND.name}.`,
};

// Login de la MARCA (cliente). Brand-themed, sin jerga interna. La marca entra con
// su correo y recibe un enlace; al validarlo cae en /marca (dashboard solo lectura).
export default async function MarcaAccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; enviado?: string; dev?: string; email?: string }>;
}) {
  // Si ya está logueada como marca, directo a su panel.
  if (await getBrandContext()) redirect("/marca");
  const { error, enviado, dev, email } = await searchParams;

  return (
    <div style={brandThemeVars(BRAND)} className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-brand/10 text-brand-deep">
            <BarChart3 size={22} />
          </span>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-deep">
            {BRAND.name}
          </p>
          <h1 className="font-display mt-1 text-3xl font-extrabold text-ink">Panel de tu programa</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Entra con tu correo. Te mandamos un enlace de acceso, sin contraseñas.
          </p>
        </div>

        {enviado ? (
          <div className="space-y-4 rounded-3xl border border-ink/10 bg-white p-6 text-center">
            <MailCheck className="mx-auto text-brand" size={36} />
            <div>
              <p className="font-display text-lg font-extrabold text-ink">Revisa tu correo</p>
              <p className="mt-1 text-sm text-ink-soft">
                Si tu correo tiene acceso, te llegó un enlace para entrar. Caduca en 30 minutos.
              </p>
            </div>
            {dev && (
              <div className="rounded-xl border border-dashed border-brand/40 bg-cream p-3 text-left">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-brand-deep">
                  Modo dev (sin Resend) · enlace de prueba
                </p>
                <a href={dev} className="break-all text-xs font-semibold text-brand-deep underline">
                  {dev}
                </a>
              </div>
            )}
            <Link href="/marca/acceso" className="block text-sm font-semibold text-brand-deep">
              Usar otro correo
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <p className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand-deep">
                <AlertCircle size={15} /> Escribe un correo válido.
              </p>
            )}
            <form action={solicitarAccesoMarca} className="space-y-4 rounded-3xl border border-ink/10 bg-white p-6">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Tu correo
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={email}
                  placeholder="tu@correo.com"
                  className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-ink outline-none placeholder:text-ink/30 focus:border-brand focus:bg-white"
                />
              </label>
              <button
                type="submit"
                className="font-display w-full rounded-full bg-brand py-3 text-base font-extrabold text-white transition hover:bg-brand-deep"
              >
                Enviar enlace de acceso
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
