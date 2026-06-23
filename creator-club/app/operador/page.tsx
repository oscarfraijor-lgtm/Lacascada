import Link from "next/link";
import { MailCheck, AlertCircle, ShieldCheck, KeyRound } from "lucide-react";
import { OPERATOR_THEME } from "@/lib/theme";
import { adminPassphraseEnabled } from "@/lib/admin-passphrase";
import { solicitarAccesoOperador, entrarConClave } from "./actions";

// Título neutral (no el de la marca del deploy) para la puerta del equipo.
export const metadata = { title: "Consola · Indie Pro" };

// Entrada NEUTRAL del equipo (Indie Pro), separada del club público de cualquier
// marca. Aquí entran Mabel/Oscar/Paulina; al validar el enlace caen en /console.
export default async function OperadorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; enviado?: string; dev?: string; email?: string; clave?: string }>;
}) {
  const { error, enviado, dev, email, clave } = await searchParams;
  const claveEnabled = adminPassphraseEnabled();

  return (
    <div style={OPERATOR_THEME} className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-ink/5 text-ink-soft">
            <ShieldCheck size={22} />
          </span>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ink-soft">
            Indie Pro · ESH Creative Lab
          </p>
          <h1 className="font-display mt-1 text-3xl font-extrabold text-ink">Consola del equipo</h1>
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
                Si tu correo es del equipo, te llegó un enlace para entrar. Caduca en 30 minutos.
              </p>
            </div>
            {dev && (
              <div className="rounded-xl border border-dashed border-brand/40 bg-cream p-3 text-left">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-brand">
                  Modo dev (sin Resend) · enlace de prueba
                </p>
                <a href={dev} className="break-all text-xs font-semibold text-brand underline">
                  {dev}
                </a>
              </div>
            )}
            <Link href="/operador" className="block text-sm font-semibold text-brand">
              Usar otro correo
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <p className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand">
                <AlertCircle size={15} /> Escribe un correo válido.
              </p>
            )}
            {clave === "bad" && (
              <p className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand">
                <AlertCircle size={15} /> Correo o clave incorrectos.
              </p>
            )}
            {clave === "off" && (
              <p className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand">
                <AlertCircle size={15} /> El acceso con clave no está configurado.
              </p>
            )}
            <form action={solicitarAccesoOperador} className="space-y-4 rounded-3xl border border-ink/10 bg-white p-6">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Correo del equipo
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
                className="font-display w-full rounded-full bg-brand-deep py-3 text-base font-extrabold text-white transition hover:brightness-110"
              >
                Enviar enlace de acceso
              </button>
            </form>

            {/* Acceso con clave del equipo (sin correo). Solo aparece si está
                configurado (ADMIN_PASSPHRASE). Atajo para el equipo; el correo igual
                debe ser admin. <details> = sin JS de cliente. */}
            {claveEnabled && (
              <details open={clave === "bad"} className="group mt-3 overflow-hidden rounded-2xl border border-ink/10 bg-white">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3 text-sm font-semibold text-ink-soft transition hover:text-ink">
                  <KeyRound size={15} /> Entrar con clave del equipo
                </summary>
                <form action={entrarConClave} className="space-y-3 border-t border-ink/10 px-5 py-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Correo del equipo</span>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/30 focus:border-brand focus:bg-white"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Clave del equipo</span>
                    <input
                      name="passphrase"
                      type="password"
                      required
                      autoComplete="off"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/30 focus:border-brand focus:bg-white"
                    />
                  </label>
                  <button
                    type="submit"
                    className="font-display w-full rounded-full bg-ink py-2.5 text-sm font-extrabold text-white transition hover:brightness-110"
                  >
                    Entrar a la consola
                  </button>
                </form>
              </details>
            )}

            <p className="mt-4 text-center text-xs text-ink-soft">
              ¿Eres creadora?{" "}
              <Link href="/" className="font-semibold text-brand">
                Entra al club
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
