import { registrar } from "./actions";
import { BRAND } from "@/lib/schema";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-deep">
          {BRAND.club} · {BRAND.name}
        </p>
        <h1 className="font-display mt-1 text-3xl font-extrabold text-ink">Únete al club</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Inscríbete, participa en campañas y gana recompensas.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand-deep">
          Faltan datos. Completa al menos tu nombre y correo.
        </p>
      )}

      <form action={registrar} className="space-y-4 rounded-3xl border border-ink/10 bg-white p-6">
        <Field name="name" label="Nombre completo" placeholder="Tu nombre" required />
        <Field name="handle" label="Usuario de TikTok" placeholder="@tucuenta" />
        <Field name="email" label="Correo" type="email" placeholder="tu@correo.com" required />
        <div className="grid grid-cols-2 gap-3">
          <Field name="followers" label="Seguidores" placeholder="1,000+" />
          <Field name="city" label="Ciudad" placeholder="CDMX" />
        </div>
        <button
          type="submit"
          className="font-display w-full rounded-full bg-lime py-3 text-base font-extrabold text-ink transition hover:brightness-95"
        >
          Quiero unirme
        </button>
        <p className="text-center text-xs text-ink-soft">
          Al unirte aceptas los términos del club.
        </p>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-ink outline-none placeholder:text-ink/30 focus:border-brand focus:bg-white"
      />
    </label>
  );
}
