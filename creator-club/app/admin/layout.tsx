import Link from "next/link";
import { redirect } from "next/navigation";
import { Megaphone, Package, PackageOpen, Inbox, Target, Award, Gift, Zap, Users, CalendarDays, HelpCircle, ShieldCheck, ChevronLeft, ExternalLink } from "lucide-react";
import { currentEmail } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import { getAdminContext } from "@/lib/brand-admin";
import { brandThemeVars, OPERATOR_THEME } from "@/lib/theme";
import { listParticipations, listMisiones, listCanjes, listActivaciones, listMuestras } from "@/lib/store";

// Conteo de pendientes por bandeja (mismo criterio que la consola): lo que necesita
// la atención de Paulina HOY. Tolerante: si la base falla, no rompe el menú.
async function pendingCounts(conn: Awaited<ReturnType<typeof getAdminContext>>["conn"]): Promise<Record<string, number>> {
  try {
    const c = conn ?? undefined;
    const [parts, misiones, canjes, activaciones, muestras] = await Promise.all([
      listParticipations(c), listMisiones(c), listCanjes(c), listActivaciones(c), listMuestras(c),
    ]);
    return {
      "/admin/inscripciones": parts.filter((p) => p.status === "inscrita" || p.status === "entregada").length,
      "/admin/misiones": misiones.filter((m) => m.status === "enviada").length,
      "/admin/canjes": canjes.filter((c) => c.status === "solicitada").length,
      "/admin/activaciones": activaciones.filter((a) => a.status === "solicitada").length,
      "/admin/muestras": muestras.filter((m) => m.status === "solicitada").length,
    };
  } catch {
    return {};
  }
}

// Menú agrupado (propuesta de Paulina): lo que OFRECES (catálogos), lo que
// APRUEBAS (bandejas) y la COMUNIDAD. Nota: "Misiones" vive en "Por revisar"
// porque /admin/misiones es la bandeja de aprobación de contenido (las misiones
// se definen en código, no se configuran aquí).
const TAB_GROUPS = [
  {
    label: "Configurar",
    tabs: [
      { href: "/admin", label: "Campañas", icon: Megaphone },
      { href: "/admin/productos", label: "Productos", icon: Package },
      { href: "/admin/recompensas", label: "Premios", icon: Award },
      { href: "/admin/calendario", label: "Calendario", icon: CalendarDays },
    ],
  },
  {
    label: "Por revisar",
    tabs: [
      { href: "/admin/inscripciones", label: "Inscripciones", icon: Inbox },
      { href: "/admin/misiones", label: "Misiones", icon: Target },
      { href: "/admin/canjes", label: "Canjes", icon: Gift },
      { href: "/admin/activaciones", label: "Activaciones", icon: Zap },
      { href: "/admin/muestras", label: "Muestras", icon: PackageOpen },
    ],
  },
  {
    label: "Comunidad",
    tabs: [
      { href: "/admin/creadoras", label: "Creadoras", icon: Users },
      { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const email = await currentEmail();
  // El equipo entra por la puerta NEUTRAL (/operador), no por el login de creadora
  // (/acceso, que va branded con la marca); importa en el apex neutral.
  if (!email) redirect("/operador");
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
  // El club público de esta marca. Para la marca del env usar su dominio propio
  // (deployUrl) SOLO en producción (donde el equipo opera desde el apex neutral y
  // "/" rebotaría a /operador); en local/preview usar "/" del mismo deploy para no
  // saltar a producción al hacer QA. Las otras marcas siempre usan su deployUrl.
  const isProd = process.env.VERCEL_ENV === "production";
  const clubUrl = ctx.isEnvBrand
    ? (isProd ? (ctx.brand.deployUrl ?? "/") : "/")
    : ctx.brand.deployUrl;

  // Pendientes por bandeja para pintar badges en el menú (dónde hay trabajo hoy).
  const counts = ctx.configured ? await pendingCounts(ctx.conn) : {};

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

        <nav className="space-y-1.5 rounded-2xl border border-ink/10 bg-white p-2">
          {TAB_GROUPS.map((group) => {
            const groupTotal = group.tabs.reduce((s, t) => s + (counts[t.href] ?? 0), 0);
            return (
              <div key={group.label} className="flex flex-wrap items-center gap-1">
                <span className="px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-soft/70">
                  {group.label}
                  {group.label === "Por revisar" && groupTotal > 0 && (
                    <span className="ml-1 text-brand-deep">({groupTotal})</span>
                  )}
                </span>
                {group.tabs.map(({ href, label, icon: Icon }) => {
                  const n = counts[href] ?? 0;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-brand/10 hover:text-brand"
                    >
                      <Icon size={16} /> {label}
                      {n > 0 && (
                        <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                          {n}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}
