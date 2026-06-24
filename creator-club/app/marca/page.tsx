import { redirect } from "next/navigation";
import { Users, CheckCircle2, TrendingUp, Megaphone, ExternalLink, LogOut, BarChart3, Clock } from "lucide-react";
import { getBrandContext } from "@/lib/brand-accounts";
import { listCreators, listParticipations, listCampaigns } from "@/lib/store";
import { brandThemeVars } from "@/lib/theme";
import { relativeAge } from "@/lib/time";
import { cerrarSesionMarca } from "./acceso/actions";

// Override del description del root (que menciona "misiones, estrellas y
// recompensas"): el cliente NO debe ver la maquinaria ni en el <head>/source.
export const metadata = {
  title: "Panel de tu programa",
  description: "Resultados de tu programa de creadoras.",
};

// Dashboard de MARCA (cliente), SOLO LECTURA. Muestra RESULTADOS (creadoras,
// contenido aprobado, ventas atribuidas, top performers, campañas activas) y OCULTA
// la maquinaria (estrellas/niveles/misiones/recompensas/anti-fuga, CRUD, consola,
// Indie Pro). Sin botones de acción ni mutación: solo lectura + salir.
export default async function MarcaPage() {
  const ctx = await getBrandContext();
  if (!ctx) redirect("/marca/acceso");

  // Base no conectada (modo Airtable sin base para esta marca): panel en preparación.
  if (!ctx.configured) {
    return (
      <Shell brand={ctx.brand}>
        <div className="rounded-3xl border border-ink/10 bg-white p-8 text-center">
          <h1 className="font-display text-2xl font-extrabold text-ink">Panel en preparación</h1>
          <p className="mt-2 text-sm text-ink-soft">Estamos terminando de conectar tus datos. Vuelve pronto.</p>
        </div>
      </Shell>
    );
  }

  const conn = ctx.conn ?? undefined;
  const [creators, parts, campaigns] = await Promise.all([
    listCreators(conn),
    listParticipations(conn),
    listCampaigns(conn),
  ]);

  const cur = ctx.brand.tierSystem.currency; // MXN / USD
  const fmtMoney = (n: number) =>
    `$${n.toLocaleString(cur === "USD" ? "en-US" : "es-MX")} ${cur}`;

  // Contenido aprobado / en revisión.
  const aprobadas = parts.filter((p) => p.status === "aprobada");
  const enRevision = parts.filter((p) => p.status === "entregada").length;
  const gmvTotal = creators.reduce((s, c) => s + (c.gmvMXN ?? 0), 0);
  const campanasActivas = campaigns.filter((c) => c.open);

  // Aprobadas por creadora (para top performers).
  const aprobadasPorEmail = new Map<string, number>();
  for (const p of aprobadas) {
    const k = p.creatorEmail.toLowerCase();
    aprobadasPorEmail.set(k, (aprobadasPorEmail.get(k) ?? 0) + 1);
  }
  const topCreadoras = [...creators]
    .map((c) => ({ c, gmv: c.gmvMXN ?? 0, aprob: aprobadasPorEmail.get(c.email.toLowerCase()) ?? 0 }))
    .filter((x) => x.gmv > 0 || x.aprob > 0)
    .sort((a, b) => b.gmv - a.gmv || b.aprob - a.aprob)
    .slice(0, 8);

  // Feed de contenido aprobado con link (lo que el equipo ya validó).
  const creatorByEmail = new Map(creators.map((c) => [c.email.toLowerCase(), c]));
  const campaignById = new Map(campaigns.map((c) => [c.id, c]));
  const contenido = aprobadas
    .filter((p) => p.link)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 12);

  // Participación por campaña (para las campañas activas).
  const partsPorCampana = new Map<string, { total: number; aprob: number }>();
  for (const p of parts) {
    const cur = partsPorCampana.get(p.campaignId) ?? { total: 0, aprob: 0 };
    cur.total += 1;
    if (p.status === "aprobada") cur.aprob += 1;
    partsPorCampana.set(p.campaignId, cur);
  }

  return (
    <Shell brand={ctx.brand}>
      {/* KPIs */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Users} label="Creadoras" value={creators.length.toLocaleString("es-MX")} />
        <Kpi icon={CheckCircle2} label="Contenido aprobado" value={aprobadas.length.toLocaleString("es-MX")} hint={enRevision > 0 ? `${enRevision} en revisión` : undefined} />
        <Kpi icon={TrendingUp} label="Ventas atribuidas" value={fmtMoney(gmvTotal)} />
        <Kpi icon={Megaphone} label="Campañas activas" value={campanasActivas.length.toLocaleString("es-MX")} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top creadoras */}
        <section>
          <h2 className="font-display mb-3 text-lg font-extrabold text-ink">Top creadoras</h2>
          {topCreadoras.length === 0 ? (
            <EmptyCard>Aún no hay ventas ni contenido aprobado para mostrar.</EmptyCard>
          ) : (
            <ol className="divide-y divide-ink/5 overflow-hidden rounded-2xl border border-ink/10 bg-white">
              {topCreadoras.map(({ c, gmv, aprob }, i) => (
                <li key={c.id ?? c.email} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="font-display w-5 shrink-0 text-center font-extrabold text-brand-deep">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{c.name}</p>
                      <p className="truncate text-xs text-ink-soft">
                        {c.handle || "—"}
                        <span className="mx-1.5 text-ink/30">·</span>
                        {aprob} {aprob === 1 ? "video" : "videos"}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-ink">{fmtMoney(gmv)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Campañas activas */}
        <section>
          <h2 className="font-display mb-3 text-lg font-extrabold text-ink">Campañas activas</h2>
          {campanasActivas.length === 0 ? (
            <EmptyCard>No hay campañas activas en este momento.</EmptyCard>
          ) : (
            <div className="space-y-3">
              {campanasActivas.map((c) => {
                const stats = partsPorCampana.get(c.id) ?? { total: 0, aprob: 0 };
                return (
                  <div key={c.id} className="rounded-2xl border border-ink/10 bg-white p-4">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <h3 className="font-display font-extrabold text-ink">{c.title}</h3>
                      {c.tag && (
                        <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">
                          {c.tag}
                        </span>
                      )}
                    </div>
                    {c.brief && <p className="text-sm text-ink-soft">{c.brief}</p>}
                    <p className="mt-2 text-xs font-semibold text-ink-soft">
                      {stats.total} {stats.total === 1 ? "creadora participando" : "creadoras participando"}
                      <span className="mx-1.5 text-ink/30">·</span>
                      {stats.aprob} aprobadas
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Contenido reciente */}
      <section>
        <h2 className="font-display mb-3 text-lg font-extrabold text-ink">Contenido aprobado</h2>
        {contenido.length === 0 ? (
          <EmptyCard>Cuando el equipo apruebe el contenido de tus creadoras, aparece aquí con su video.</EmptyCard>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {contenido.map((p) => {
              const creator = creatorByEmail.get(p.creatorEmail.toLowerCase());
              const campaign = campaignById.get(p.campaignId);
              return (
                <div key={p.id ?? `${p.creatorEmail}-${p.campaignId}`} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{creator?.name ?? p.creatorEmail}</p>
                    <p className="truncate text-xs text-ink-soft">
                      {campaign?.title ?? p.campaignId}
                      {p.createdAt && (
                        <>
                          <span className="mx-1.5 text-ink/30">·</span>
                          <Clock size={10} className="inline align-text-bottom" /> {relativeAge(p.createdAt)}
                        </>
                      )}
                    </p>
                  </div>
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand-deep"
                  >
                    Ver video <ExternalLink size={13} />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </Shell>
  );
}

// Marco brand-themed con header (nombre de la marca + salir). Sin nav de club ni
// nada de Indie Pro: es el panel del cliente sobre SU marca.
function Shell({ brand, children }: { brand: { name: string; cream: string; creamDeep: string; violet: string; violetDeep: string; ink: string; inkSoft: string; lime: string }; children: React.ReactNode }) {
  return (
    <div style={brandThemeVars(brand)} className="min-h-screen bg-cream text-ink">
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-brand-deep" />
            <span className="font-display text-base font-black tracking-tight text-ink">{brand.name}</span>
            <span className="hidden text-xs font-semibold uppercase tracking-wide text-ink-soft sm:inline">· Programa de creadoras</span>
          </div>
          <form action={cerrarSesionMarca}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-ink/10"
            >
              <span className="hidden sm:inline">Salir</span> <LogOut size={15} />
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Resultados de tu programa</h1>
          <p className="text-sm text-ink-soft">Lo que tus creadoras están generando, en un vistazo.</p>
        </div>
        {children}
      </main>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, hint }: { icon: typeof Users; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="flex items-center gap-2 text-ink-soft">
        <Icon size={16} className="text-brand-deep" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-display mt-1.5 text-2xl font-extrabold text-ink">{value}</p>
      {hint && <p className="text-[11px] text-ink-soft">{hint}</p>}
    </div>
  );
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
      {children}
    </p>
  );
}
