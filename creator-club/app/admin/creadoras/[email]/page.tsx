import Link from "next/link";
import {
  ArrowLeft, Star, Megaphone, Target, Gift, History, ExternalLink, Mail, Sparkles,
} from "lucide-react";
import {
  getCreatorByEmail,
  participationsFor,
  canjesFor,
  listCampaigns,
  misionesFor,
  starsFromApproved,
} from "@/lib/store";
import { levelForStars } from "@/lib/schema";
import { missionView, starsFromMissions } from "@/lib/missions";
import { getAdminContext } from "@/lib/brand-admin";
import AdminBrandPending from "@/components/AdminBrandPending";

function fmtDate(iso?: string): string {
  if (!iso) return "Sin fecha";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Sin fecha";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

const PART_META: Record<string, { label: string; cls: string }> = {
  inscrita: { label: "Pendiente", cls: "bg-cream-deep text-ink" },
  aceptada: { label: "Aceptada", cls: "bg-brand/15 text-brand-deep" },
  entregada: { label: "Video recibido", cls: "bg-brand/15 text-brand-deep" },
  aprobada: { label: "Aprobada", cls: "bg-lime text-ink" },
  rechazada: { label: "Rechazada", cls: "bg-ink/10 text-ink-soft" },
};
const CANJE_META: Record<string, { label: string; cls: string }> = {
  solicitada: { label: "Solicitada", cls: "bg-brand/15 text-brand-deep" },
  aprobada: { label: "Aprobada", cls: "bg-lime text-ink" },
  entregada: { label: "Entregada", cls: "bg-ink text-white" },
  rechazada: { label: "Rechazada", cls: "bg-ink/10 text-ink-soft" },
};
const MISION_STATE_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  completada: "Completada",
  enviada: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  disponible: "Lista (por venta)",
  bloqueada: "Bloqueada (sin venta)",
};

export default async function FichaCreadoraPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const ctx = await getAdminContext();
  if (!ctx.configured) return <AdminBrandPending brand={ctx.brand.name} slug={ctx.slug} />;
  const conn = ctx.conn ?? undefined;

  const email = decodeURIComponent((await params).email).toLowerCase();
  const creator = await getCreatorByEmail(email, conn);

  if (!creator) {
    return (
      <div className="rounded-3xl border border-dashed border-ink/20 bg-white p-8 text-center">
        <h2 className="font-display text-xl font-extrabold text-ink">Creadora no encontrada</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
          No hay ninguna creadora con el correo <b>{email}</b> en este club.
        </p>
        <Link
          href="/admin/creadoras"
          className="font-display mt-5 inline-flex items-center gap-1.5 rounded-full bg-lime px-5 py-2.5 text-sm font-extrabold text-ink"
        >
          <ArrowLeft size={15} /> Volver a creadoras
        </Link>
      </div>
    );
  }

  const [parts, canjes, campaigns, misiones] = await Promise.all([
    participationsFor(email, conn),
    canjesFor(email, conn),
    listCampaigns(conn),
    misionesFor(email, conn),
  ]);
  const campaignById = new Map(campaigns.map((c) => [c.id, c]));
  const stars = starsFromApproved(parts, campaigns) + starsFromMissions(ctx.brand.missions, creator, misiones);
  const gmv = creator.gmvMXN ?? 0;
  const level = levelForStars(stars, gmv, ctx.brand.levels);

  // Misiones de la creadora con su estado (catálogo de la marca + registros).
  const misionById = new Map(misiones.map((m) => [m.missionId, m]));
  const misionRows = ctx.brand.missions
    .map((m) => ({ mission: m, view: missionView(m, creator, misionById.get(m.id)), comp: misionById.get(m.id) }))
    // Solo las que tienen avance real (registro o condición cumplida); el resto es ruido.
    .filter((r) => r.comp || r.view.done);

  // Ledger: campañas aprobadas + misiones que otorgaron estrellas (dedupe), reciente->viejo.
  const seen = new Set<string>();
  const ledger = [
    ...parts
      .filter((p) => p.status === "aprobada" && !seen.has(p.campaignId) && seen.add(p.campaignId))
      .map((p) => ({
        title: campaignById.get(p.campaignId)?.title ?? p.campaignId,
        stars: campaignById.get(p.campaignId)?.stars ?? 0,
        date: p.createdAt,
        source: "campana" as const,
      })),
    ...ctx.brand.missions
      .filter((m) => missionView(m, creator, misionById.get(m.id)).done)
      .map((m) => ({ title: m.title, stars: m.stars, date: misionById.get(m.id)?.createdAt, source: "mision" as const })),
  ].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  const partsSorted = [...parts].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  const canjesSorted = [...canjes].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  return (
    <div className="space-y-5">
      <Link href="/admin/creadoras" className="flex items-center gap-1 text-xs font-semibold text-brand-deep">
        <ArrowLeft size={13} /> Volver a creadoras
      </Link>

      {/* Encabezado: identidad + métricas */}
      <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-extrabold text-ink">{creator.name}</h1>
              <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-xs font-bold text-ink-soft">
                {level.badge} {level.name}
              </span>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-ink-soft">
              <span>{creator.handle || "Sin handle"}</span>
              <span className="text-ink/30">·</span>
              <span className="inline-flex items-center gap-1"><Mail size={11} /> {creator.email}</span>
              {creator.city && <><span className="text-ink/30">·</span><span>{creator.city}</span></>}
              {creator.followers && <><span className="text-ink/30">·</span><span>{creator.followers} seguidores</span></>}
            </p>
            {creator.affiliateHandle ? (
              <p className="mt-1 text-xs font-semibold text-brand-deep">Afiliado TTS: {creator.affiliateHandle}</p>
            ) : (
              <p className="mt-1 text-xs text-ink-soft/70">Sin afiliado de TikTok Shop registrado</p>
            )}
            {creator.portfolio && (
              <p className="mt-1 truncate text-xs text-ink-soft">📎 {creator.portfolio}</p>
            )}
            {creator.shippingAddress && (
              <p className="mt-1 text-xs text-ink-soft">📦 Envío: {creator.shippingAddress}</p>
            )}
            {creator.consentAt && (
              <p className="mt-1 text-[11px] text-ink-soft/70">
                Aceptó el aviso el {fmtDate(creator.consentAt)}
                {creator.consentVersion ? ` (v${creator.consentVersion})` : ""}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Metric label="Estrellas" value={stars.toLocaleString("es-MX")} icon={<Star size={14} className="fill-lime text-lime" />} />
            <Metric
              label="GMV atribuido"
              value={gmv > 0 ? `$${gmv.toLocaleString("es-MX")}` : "Sin GMV"}
              sub={gmv > 0 && creator.gmvDate ? `al ${creator.gmvDate}` : undefined}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Inscripciones */}
        <section>
          <h2 className="font-display mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-brand-deep">
            <Megaphone size={15} /> Inscripciones ({parts.length})
          </h2>
          {partsSorted.length === 0 ? (
            <Empty>No se ha inscrito a ninguna campaña.</Empty>
          ) : (
            <ul className="space-y-2">
              {partsSorted.map((p) => {
                const meta = PART_META[p.status] ?? PART_META.inscrita;
                return (
                  <li key={p.id ?? p.campaignId} className="rounded-2xl border border-ink/10 bg-white p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-ink">
                        {campaignById.get(p.campaignId)?.title ?? p.campaignId}
                      </p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                    {p.status === "rechazada" && p.reason && (
                      <p className="mt-1 text-xs font-semibold text-brand-deep">Motivo: {p.reason}</p>
                    )}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand underline">
                        <ExternalLink size={11} /> Ver entrega
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Canjes */}
        <section>
          <h2 className="font-display mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-brand-deep">
            <Gift size={15} /> Canjes ({canjes.length})
          </h2>
          {canjesSorted.length === 0 ? (
            <Empty>No ha solicitado ningún canje.</Empty>
          ) : (
            <ul className="space-y-2">
              {canjesSorted.map((c) => {
                const meta = CANJE_META[c.status] ?? CANJE_META.solicitada;
                return (
                  <li key={c.id ?? c.rewardId} className="rounded-2xl border border-ink/10 bg-white p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-ink">{c.rewardTitle || c.rewardId}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                    {c.status === "rechazada" && c.reason && (
                      <p className="mt-1 text-xs font-semibold text-brand-deep">Motivo: {c.reason}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Misiones */}
      <section>
        <h2 className="font-display mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-brand-deep">
          <Target size={15} /> Misiones ({misionRows.length})
        </h2>
        {misionRows.length === 0 ? (
          <Empty>Aún no avanza ninguna misión.</Empty>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {misionRows.map(({ mission, view }) => (
              <li key={mission.id} className="flex items-center justify-between gap-2 rounded-2xl border border-ink/10 bg-white p-3.5">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{mission.title}</p>
                  <p className="text-xs text-ink-soft">{MISION_STATE_LABEL[view.state] ?? view.state}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${view.done ? "bg-lime text-ink" : "bg-cream-deep text-ink-soft"}`}>
                  {view.done ? `+${mission.stars}` : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Ledger de estrellas */}
      <section>
        <h2 className="font-display mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-brand-deep">
          <History size={15} /> Historial de estrellas
        </h2>
        {ledger.length === 0 ? (
          <Empty>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={14} className="text-brand-deep" /> Aún no tiene estrellas (las estrellas salen de entregas aprobadas).
            </span>
          </Empty>
        ) : (
          <ol className="divide-y divide-ink/5 overflow-hidden rounded-2xl border border-ink/10 bg-white">
            {ledger.map((e, i) => (
              <li key={`${e.title}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime text-ink">
                    <Star size={14} className="fill-ink" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{e.title}</p>
                    <p className="text-xs text-ink-soft">
                      {e.source === "mision" ? "Misión completada" : "Entrega aprobada"}
                      {e.date ? ` · ${fmtDate(e.date)}` : ""}
                    </p>
                  </div>
                </div>
                <span className="font-display shrink-0 text-sm font-extrabold text-brand-deep">
                  +{e.stars.toLocaleString("es-MX")}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-cream-deep/50 px-4 py-2.5 text-right">
      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="font-display flex items-center justify-end gap-1 text-lg font-extrabold text-ink">
        {icon} {value}
      </p>
      {sub && <p className="text-[10px] text-ink-soft">{sub}</p>}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-4 text-center text-sm text-ink-soft">
      {children}
    </p>
  );
}
