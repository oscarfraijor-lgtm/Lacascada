import { Building2, ArrowRight, ExternalLink, Lock, AlertTriangle, Dot, Users, Inbox, Gift } from "lucide-react";
import { managedBrands, getSelectedBrandSlug, resolveConn } from "@/lib/brand-admin";
import { listCreators, listParticipations, listCanjes } from "@/lib/store";
import { entrarMarca } from "./actions";

const RANK: Record<string, number> = { gestionable: 0, externa: 1, pendiente: 2 };

interface ClubStats {
  creators: number;
  porRevisar: number; // inscripciones inscrita + entregada
  canjesPendientes: number; // canjes solicitada
  gmvTotal: number;
}

// Mini-stats de un club leyendo SU base (conn). Tolerante: si la base falla
// (token/permiso), devuelve null y la tarjeta sigue mostrándose sin números.
async function clubStats(slug: string): Promise<ClubStats | null> {
  try {
    const conn = resolveConn(slug) ?? undefined;
    const [creators, parts, canjes] = await Promise.all([
      listCreators(conn),
      listParticipations(conn),
      listCanjes(conn),
    ]);
    return {
      creators: creators.length,
      porRevisar: parts.filter((p) => p.status === "inscrita" || p.status === "entregada").length,
      canjesPendientes: canjes.filter((c) => c.status === "solicitada").length,
      gmvTotal: creators.reduce((s, c) => s + (c.gmvMXN ?? 0), 0),
    };
  } catch {
    return null;
  }
}

export default async function ConsolePage() {
  const brands = managedBrands();
  const selected = await getSelectedBrandSlug();

  const rows = brands
    .map((b) => {
      const state = b.configured ? "gestionable" : b.deployUrl ? "externa" : "pendiente";
      return { ...b, state, isCurrent: b.slug === selected };
    })
    .sort((a, b) => (RANK[a.state] ?? 9) - (RANK[b.state] ?? 9) || a.name.localeCompare(b.name));

  const gestionables = rows.filter((b) => b.state === "gestionable").length;

  // Stats SOLO de los clubs gestionables (con base conectada): es el panel de
  // "dónde hay trabajo". En paralelo y tolerante a fallos por marca.
  const statsEntries = await Promise.all(
    rows.filter((b) => b.state === "gestionable").map(async (b) => [b.slug, await clubStats(b.slug)] as const)
  );
  const statsBySlug = new Map<string, ClubStats | null>(statsEntries);

  return (
    <div className="space-y-5">
      <header>
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ink-soft">Operador</p>
        <h1 className="font-display mt-0.5 text-2xl font-extrabold text-ink">Clubs que gestionas</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          Entra a un club para administrarlo: campañas, inscripciones, canjes y creadoras.
        </p>
      </header>

      <p className="text-xs font-semibold text-ink-soft">
        {gestionables} de {rows.length} clubs listos para gestionar
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((b) => (
          <div
            key={b.slug}
            className={`flex flex-col rounded-2xl border bg-white p-5 ${
              b.isCurrent ? "border-brand" : "border-ink/10"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-cream-deep text-brand">
                  <Building2 size={18} />
                </span>
                <span>
                  <p className="font-display font-extrabold leading-tight text-ink">{b.name}</p>
                  <p className="text-xs text-ink-soft">{b.club}</p>
                </span>
              </span>
              <StateBadge state={b.state} isCurrent={b.isCurrent} />
            </div>

            <p className="mt-1 grow text-xs text-ink-soft">
              {b.state === "gestionable" && "Entra para administrar este club."}
              {b.state === "externa" && "Se abre por separado."}
              {b.state === "pendiente" && "Aún no está disponible."}
            </p>

            {/* Aviso: club conectado pero usando la mecánica heredada de Color Dreams */}
            {b.configured && !b.ownMechanics && (
              <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-cream-deep/70 px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft">
                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-brand" />
                Usa la mecánica de Color Dreams. Define niveles y recompensas propios antes de aprobar canjes con GMV.
              </p>
            )}

            {b.state === "gestionable" && (() => {
              const s = statsBySlug.get(b.slug);
              if (!s) {
                return (
                  <p className="mt-3 rounded-lg bg-cream-deep/60 px-2.5 py-1.5 text-[11px] text-ink-soft">
                    No se pudieron leer los datos de este club ahora.
                  </p>
                );
              }
              return (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Stat icon={<Users size={13} />} label="Creadoras" value={s.creators.toLocaleString("es-MX")} />
                  <Stat icon={<Inbox size={13} />} label="Por revisar" value={s.porRevisar.toLocaleString("es-MX")} highlight={s.porRevisar > 0} />
                  <Stat icon={<Gift size={13} />} label="Canjes pend." value={s.canjesPendientes.toLocaleString("es-MX")} highlight={s.canjesPendientes > 0} />
                  <Stat label="GMV total" value={s.gmvTotal > 0 ? `$${s.gmvTotal.toLocaleString("es-MX")}` : "$0"} />
                </div>
              );
            })()}

            <div className="mt-4">
              {b.state === "gestionable" ? (
                <form action={entrarMarca}>
                  <input type="hidden" name="slug" value={b.slug} />
                  <button
                    type="submit"
                    className="font-display flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-deep py-2.5 text-sm font-extrabold text-white transition hover:brightness-110"
                  >
                    {b.isCurrent ? "Continuar administrando" : "Administrar"} <ArrowRight size={15} />
                  </button>
                </form>
              ) : b.deployUrl ? (
                <a
                  href={b.deployUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-display flex w-full items-center justify-center gap-1.5 rounded-full border border-ink/15 py-2.5 text-sm font-extrabold text-ink transition hover:border-brand hover:text-brand"
                >
                  Abrir su deploy <ExternalLink size={14} />
                </a>
              ) : (
                <span className="flex w-full items-center justify-center gap-1.5 rounded-full bg-ink/5 py-2.5 text-sm font-semibold text-ink-soft">
                  <Lock size={14} /> Próximamente
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mini-métrica de un club. `highlight` (donde hay trabajo pendiente) la resalta.
function Stat({
  icon, label, value, highlight,
}: { icon?: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-2.5 py-1.5 ${highlight ? "bg-brand/10" : "bg-cream-deep/50"}`}>
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
        {icon} {label}
      </p>
      <p className={`font-display text-base font-extrabold ${highlight ? "text-ink" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function StateBadge({ state, isCurrent }: { state: string; isCurrent: boolean }) {
  if (isCurrent && state === "gestionable") {
    return (
      <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-lime px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">
        <Dot size={14} className="-mx-1" /> Actual
      </span>
    );
  }
  const map: Record<string, { label: string; cls: string }> = {
    gestionable: { label: "Conectado", cls: "bg-brand/15 text-brand" },
    externa: { label: "Deploy externo", cls: "bg-cream-deep text-ink-soft" },
    pendiente: { label: "Pendiente", cls: "bg-ink/5 text-ink-soft" },
  };
  const m = map[state] ?? map.pendiente;
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${m.cls}`}>
      {m.label}
    </span>
  );
}
