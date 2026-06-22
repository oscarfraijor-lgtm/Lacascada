import Link from "next/link";
import { ArrowLeft, Check, Mail } from "lucide-react";
import { getCurrentCreator } from "@/lib/session";
import SubmitButton from "@/components/SubmitButton";
import { actualizarCuenta } from "./actions";

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const me = await getCurrentCreator();

  if (!me) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-ink/10 bg-white p-8 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">Mi cuenta</h1>
        <p className="mt-1 text-sm text-ink-soft">Entra a tu cuenta para editar tu perfil.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/registro" className="font-display rounded-full bg-lime px-5 py-2.5 font-extrabold text-ink">
            Únete
          </Link>
          <Link href="/acceso" className="font-display rounded-full border border-ink/15 px-5 py-2.5 font-extrabold text-ink">
            Acceder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <Link href="/" className="mb-1 flex items-center gap-1 text-xs font-semibold text-brand-deep">
          <ArrowLeft size={13} /> Volver al inicio
        </Link>
        <h1 className="font-display text-2xl font-extrabold text-ink">Mi cuenta</h1>
        <p className="text-sm text-ink-soft">Actualiza tus datos cuando quieras.</p>
      </div>

      {ok && (
        <p className="flex items-center justify-center gap-1.5 rounded-lg bg-lime/40 px-3 py-2 text-center text-sm font-semibold text-ink">
          <Check size={15} /> Guardado. Tus datos quedaron actualizados.
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand-deep">
          Escribe al menos tu nombre.
        </p>
      )}

      <form action={actualizarCuenta} className="space-y-4 rounded-3xl border border-ink/10 bg-white p-6">
        <Field name="name" label="Nombre completo" defaultValue={me.name} placeholder="Tu nombre" required />
        <Field name="handle" label="Usuario de TikTok" defaultValue={me.handle} placeholder="@tucuenta" />

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Tu portafolio
          </span>
          <textarea
            name="portfolio"
            rows={2}
            defaultValue={me.portfolio}
            placeholder="Pega 1-3 links de videos tuyos… o escribe 'voy empezando'."
            className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/30 focus:border-brand focus:bg-white"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Field name="followers" label="Seguidores" defaultValue={me.followers} placeholder="1,000+" />
          <Field name="city" label="Ciudad" defaultValue={me.city} placeholder="CDMX" />
        </div>

        {/* El email es la llave de identidad: se muestra pero no se edita. */}
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Correo</span>
          <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-cream-deep/40 px-3 py-2.5 text-sm text-ink-soft">
            <Mail size={15} className="shrink-0" />
            <span className="truncate">{me.email}</span>
          </div>
          <p className="mt-1 text-[11px] text-ink-soft">
            Tu correo identifica tu cuenta y no se puede cambiar aquí.
          </p>
        </div>

        <SubmitButton
          pendingLabel="Guardando…"
          className="font-display w-full rounded-full bg-lime py-3 text-base font-extrabold text-ink transition hover:brightness-95"
        >
          Guardar cambios
        </SubmitButton>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      <input
        name={name}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-ink outline-none placeholder:text-ink/30 focus:border-brand focus:bg-white"
      />
    </label>
  );
}
