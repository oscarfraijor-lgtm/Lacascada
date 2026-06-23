import Link from "next/link";
import { redirect } from "next/navigation";
import { Megaphone, Inbox, Target, Award, Gift, Users, ShieldCheck, ChevronLeft, ExternalLink } from "lucide-react";
import { currentEmail } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import { getAdminContext } from "@/lib/brand-admin";
import { brandThemeVars, OPERATOR_THEME } from "@/lib/theme";

const TABS = [
  { href: "/admin", label: "Campañas", icon: Megaphone },
  { href: "/admin/inscripciones", label: "Inscripciones", icon: Inbox },
  { href: "/admin/misiones", label: "Misiones", icon: Target },
  { href: "/admin/recompensas", label: "Premios", icon: Award },
  { href: "/admin/canjes", label: "Canjes", icon: Gift },
  { href: "/admin/creadoras", label: "Creadoras", icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const email = await currentEmail();
  if (!email) redirect("/acceso");
  if (!isAdmin(email)) {
    return (
      <div style={OPERATOR_THEME} className="min-h-screen bg-cream text-ink">
        <div className="mx-auto max-w-md px-4 py-16">
          <div className="rounded-3xl border border-ink/10 bg-white p-8 text-center">
            <ShieldCheck className="mx-auto text-brand" size={36} />
            <h1 className="font-display mt-3 text-2xl font-extrabold text-ink">Acceso restringido</h1>
            <p className="mt-1 text-sm text-ink-soft">Tu correo ({email}) no tiene permisos de admin.</p>
            <Link href="/" className="font-display mt-5 inline-block rounded-full bg-lime px-5 py-2.5 font-extrabold text-ink">
              Volver al club
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin de la marca SELECCIONADA: se pinta con SU branding.
  const ctx = await getAdminContext();
  // El club público de esta marca: el "/" de este deploy (marca del env) o su
  // propio deploy si lo tiene. Para que el equipo lo vea como las creadoras.
  const clubUrl = ctx.isEnvBrand ? "/" : ctx.brand.deployUrl;

  return (
    <div style={brandThemeVars(ctx.brand)} className="min-h-screen bg-cream text-ink">
      {/* Barra superior: volver a la consola (nivel superior) + club actual */}
      <div className="sticky top-0 z-50 border-b border-ink/10 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Link
              href="/console"
              title="Volver a la consola"
              className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink-soft transition hover:text-brand"
            >
              <ChevronLeft size={14} /> Consola
            </Link>
            <span className="font-display text-base font-black tracking-tight text-brand">{ctx.brand.club}</span>
            {clubUrl && (
              <a
                href={clubUrl}
                target="_blank"
                rel="noreferrer"
                title="Ver el club como lo ven las creadoras"
                className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink-soft transition hover:text-brand"
              >
                Ver el club <ExternalLink size={12} />
              </a>
            )}
          </div>
          <span className="hidden rounded-full bg-cream-deep px-3 py-1 text-xs font-semibold text-ink-soft sm:inline">
            {ctx.fileStore ? "archivo local · " : ""}
            {email}
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <header>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Panel de admin · {ctx.brand.name}
          </p>
          <h1 className="font-display mt-0.5 text-2xl font-extrabold text-ink">{ctx.brand.club}</h1>
        </header>

        <nav className="flex flex-wrap gap-1 rounded-2xl border border-ink/10 bg-white p-1">
          {TABS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-brand/10 hover:text-brand"
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
