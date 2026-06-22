import Link from "next/link";
import { registrar } from "./actions";
import { BRAND } from "@/lib/schema";
import TrustBar from "@/components/TrustBar";
import SubmitButton from "@/components/SubmitButton";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-deep">
          {BRAND.club} · {BRAND.name}
        </p>
        <h1 className="font-display mt-1 text-3xl font-extrabold text-ink">Únete al club</h1>
        <p className="mt-1 text-sm text-ink-soft">
          No necesitas seguidores para empezar. Solo tus ganas de crear.
        </p>
      </div>

      <TrustBar />

      {error && (
        <p className="rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand-deep">
          {error === "consent"
            ? "Para unirte necesitas aceptar el aviso de privacidad y los términos."
            : error === "email"
              ? "Escribe un correo válido, por ejemplo tu@correo.com."
              : "Faltan datos. Completa al menos tu nombre y correo."}
        </p>
      )}

      <form action={registrar} className="space-y-4 rounded-3xl border border-ink/10 bg-white p-6">
        <Field name="name" label="Nombre completo" placeholder="Tu nombre" required />
        <Field name="handle" label="Usuario de TikTok" placeholder="@tucuenta" />
        <Field name="email" label="Correo" type="email" placeholder="tu@correo.com" required />
        <Field name="affiliateHandle" label="Afiliado de TikTok Shop (opcional)" placeholder="@tu_cuenta_afiliada o link" />

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Tu portafolio
          </span>
          <textarea
            name="portfolio"
            rows={2}
            placeholder="Pega 1-3 links de videos tuyos… o escribe 'voy empezando'. ¡Ambos sirven!"
            className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/30 focus:border-brand focus:bg-white"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Field name="followers" label="Seguidores (opcional)" placeholder="1,000+" />
          <Field name="city" label="Ciudad (opcional)" placeholder="CDMX" />
        </div>

        <label className="flex items-start gap-2 text-xs text-ink-soft">
          <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
          <span>
            He leído y acepto el{" "}
            <Link href="/legal" target="_blank" className="font-semibold text-brand-deep underline">
              aviso de privacidad y los términos
            </Link>{" "}
            del club.
          </span>
        </label>

        <SubmitButton
          pendingLabel="Creando tu cuenta…"
          className="font-display w-full rounded-full bg-lime py-3 text-base font-extrabold text-ink transition hover:brightness-95"
        >
          Quiero unirme
        </SubmitButton>
        <p className="text-center text-xs text-ink-soft">
          ¿Ya tienes cuenta?{" "}
          <Link href="/acceso" className="font-semibold text-brand-deep">
            Entra con tu correo
          </Link>
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
