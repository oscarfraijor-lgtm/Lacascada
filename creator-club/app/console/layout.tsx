import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { currentEmail } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import { OPERATOR_THEME } from "@/lib/theme";

// Consola de operador: nivel SUPERIOR, neutral (Indie Pro), por encima de los
// clubs. Desde aquí Mabel/Oscar/Paulina eligen un club y entran a su admin.
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const email = await currentEmail();
  if (!email) redirect("/acceso");
  if (!isAdmin(email)) {
    return (
      <div style={OPERATOR_THEME} className="min-h-screen bg-cream text-ink">
        <div className="mx-auto max-w-md px-4 py-16">
          <div className="rounded-3xl border border-ink/10 bg-white p-8 text-center">
            <ShieldCheck className="mx-auto text-brand" size={36} />
            <h1 className="font-display mt-3 text-2xl font-extrabold text-ink">Acceso restringido</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Tu correo ({email}) no tiene permisos de operador.
            </p>
            <Link href="/" className="font-display mt-5 inline-block rounded-full bg-lime px-5 py-2.5 font-extrabold text-ink">
              Volver al club
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={OPERATOR_THEME} className="min-h-screen bg-cream text-ink">
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Link href="/console" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-black tracking-tight text-brand">Indie Pro</span>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft sm:inline">
              Consola
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-ink-soft sm:inline">{email}</span>
            <Link
              href="/salir"
              className="flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-ink/10"
            >
              <span className="hidden sm:inline">Salir</span>
              <LogOut size={15} />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
