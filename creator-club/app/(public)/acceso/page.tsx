import Link from "next/link";
import { MailCheck, AlertCircle } from "lucide-react";
import { solicitarAcceso } from "./actions";
import { BRAND } from "@/lib/schema";

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    nuevo?: string;
    ya?: string;
    email?: string;
    enviado?: string;
    dev?: string;
    r?: string;
  }>;
}) {
  const { error, nuevo, ya, email, enviado, dev, r } = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-deep">
          {BRAND.club} · {BRAND.name}
        </p>
        <h1 className="font-display mt-1 text-3xl font-extrabold text-ink">Entra a tu cuenta</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Te enviamos un enlace de acceso a tu correo. Sin contraseñas.
        </p>
      </div>

      {enviado ? (
        <div className="space-y-4 rounded-3xl border border-lime/60 bg-lime/15 p-6 text-center">
          <MailCheck className="mx-auto text-brand-deep" size={36} />
          <div>
            <p className="font-display text-lg font-extrabold text-ink">
              {r ? "¡Casi listo! Revisa tu correo" : "Revisa tu correo"}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {r
                ? "Te enviamos un enlace para confirmar tu correo y entrar al club. Caduca en 30 minutos."
                : "Si tu correo está registrado, te llegó un enlace para entrar. Caduca en 30 minutos."}
            </p>
          </div>
          {dev && (
            <div className="rounded-xl border border-dashed border-brand/40 bg-white p-3 text-left">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-brand-deep">
                Modo dev (sin Resend) · enlace de prueba
              </p>
              <a href={dev} className="break-all text-xs font-semibold text-brand underline">
                {dev}
              </a>
            </div>
          )}
          <Link href="/acceso" className="block text-sm font-semibold text-brand-deep">
            Usar otro correo
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <p className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand-deep">
              <AlertCircle size={15} />
              {error === "expired"
                ? "El enlace caducó. Pide uno nuevo."
                : error === "invalid"
                  ? "El enlace no es válido. Pide uno nuevo."
                  : "Escribe un correo válido."}
            </p>
          )}
          {nuevo && (
            <p className="mb-4 rounded-lg bg-cream-deep px-3 py-2 text-center text-sm font-semibold text-ink">
              No encontramos ese correo.{" "}
              <Link href="/registro" className="text-brand-deep underline">
                Regístrate primero
              </Link>
              .
            </p>
          )}
          {ya && (
            <p className="mb-4 rounded-lg bg-cream-deep px-3 py-2 text-center text-sm font-semibold text-ink">
              Ya tienes cuenta con ese correo. Te mandamos un enlace para entrar.
            </p>
          )}

          <form action={solicitarAcceso} className="space-y-4 rounded-3xl border border-ink/10 bg-white p-6">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Correo
              </span>
              <input
                name="email"
                type="email"
                required
                defaultValue={email}
                placeholder="tu@correo.com"
                className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-ink outline-none placeholder:text-ink/50 focus:border-brand focus:bg-white"
              />
            </label>
            <button
              type="submit"
              className="font-display w-full rounded-full bg-lime py-3 text-base font-extrabold text-ink transition hover:brightness-95"
            >
              Enviar enlace de acceso
            </button>
            <p className="text-center text-xs text-ink-soft">
              ¿Aún no tienes cuenta?{" "}
              <Link href="/registro" className="font-semibold text-brand-deep">
                Únete al club
              </Link>
            </p>
          </form>
          {/* Acceso del equipo: discreto y SIN exponer a la agencia a las creadoras. */}
          <p className="mt-8 text-center">
            <Link
              href="/operador"
              className="text-[11px] text-ink-soft/40 underline-offset-2 transition hover:text-ink-soft hover:underline"
            >
              Consola admin
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
