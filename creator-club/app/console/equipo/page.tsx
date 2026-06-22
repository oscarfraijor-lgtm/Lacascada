import Link from "next/link";
import { ArrowLeft, Link2, AlertCircle, Send } from "lucide-react";
import { ADMIN_EMAILS } from "@/lib/roles";
import { generarEnlaceEquipo } from "./actions";

export default async function EquipoPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; link?: string; error?: string }>;
}) {
  const { email, link, error } = await searchParams;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <Link href="/console" className="mb-1 flex items-center gap-1 text-xs font-semibold text-ink-soft transition hover:text-ink">
          <ArrowLeft size={13} /> Volver a la consola
        </Link>
        <h1 className="font-display text-2xl font-extrabold text-ink">Acceso del equipo</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Genera un enlace para que tu compañera entre sin esperar correo. Caduca en 3 días;
          al usarlo queda dentro 6 meses (no tiene que volver a pedir acceso).
        </p>
      </div>

      {link && (
        <div className="space-y-3 rounded-2xl border border-ink/15 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-ink">
            <Send size={16} className="text-brand" /> Enlace para {email}
          </div>
          <p className="break-all rounded-xl border border-ink/10 bg-cream px-3 py-2.5 text-xs text-ink">
            {link}
          </p>
          <p className="text-xs text-ink-soft">
            Cópialo y mándaselo por WhatsApp. Al abrirlo entra directo a la consola.
          </p>
        </div>
      )}

      {error === "noadmin" && (
        <p className="flex items-center gap-2 rounded-lg bg-ink/5 px-3 py-2 text-sm font-semibold text-ink-soft">
          <AlertCircle size={15} /> {email || "Ese correo"} no está en el equipo. Agrégalo primero a la lista de admins.
        </p>
      )}

      <div className="rounded-2xl border border-ink/10 bg-white p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Tu equipo</p>
        <ul className="space-y-2">
          {ADMIN_EMAILS.map((e) => (
            <li key={e} className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 px-3 py-2">
              <span className="truncate text-sm text-ink">{e}</span>
              <form action={generarEnlaceEquipo}>
                <input type="hidden" name="email" value={e} />
                <button
                  type="submit"
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-deep px-3 py-1.5 text-xs font-bold text-white transition hover:brightness-110"
                >
                  <Link2 size={13} /> Generar enlace
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
