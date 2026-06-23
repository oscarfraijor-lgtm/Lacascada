import { Star, Check, X, RotateCcw, ExternalLink, UserCheck, Download, Clock } from "lucide-react";
import { listParticipations, listCreators, listCampaigns } from "@/lib/store";
import { getAdminContext } from "@/lib/brand-admin";
import AdminBrandPending from "@/components/AdminBrandPending";
import AdminFilterList, { type FilterItem } from "@/components/AdminFilterList";
import SubmitButton from "@/components/SubmitButton";
import { relativeAge } from "@/lib/time";
import { REJECTION_REASONS } from "@/lib/rejection-reasons";
import { cambiarEstadoEntrega } from "../actions";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  inscrita: { label: "Pendiente", cls: "bg-cream-deep text-ink" },
  aceptada: { label: "Aceptada", cls: "bg-brand/15 text-brand-deep" },
  entregada: { label: "Video recibido", cls: "bg-brand/15 text-brand-deep" },
  aprobada: { label: "Aprobada", cls: "bg-lime text-ink" },
  rechazada: { label: "Rechazada", cls: "bg-ink/10 text-ink-soft" },
};

// Orden: lo que necesita acción del equipo primero.
const ORDER: Record<string, number> = { entregada: 0, inscrita: 1, aceptada: 2, aprobada: 3, rechazada: 4 };

export default async function AdminInscripcionesPage() {
  const ctx = await getAdminContext();
  if (!ctx.configured) return <AdminBrandPending brand={ctx.brand.name} slug={ctx.slug} />;
  const conn = ctx.conn ?? undefined;
  const [parts, creators, campaigns] = await Promise.all([
    listParticipations(conn),
    listCreators(conn),
    listCampaigns(conn),
  ]);
  const creatorByEmail = new Map(creators.map((c) => [c.email.toLowerCase(), c]));
  const campaignById = new Map(campaigns.map((c) => [c.id, c]));

  const rows = [...parts].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9));
  const porRevisar = parts.filter((p) => p.status === "inscrita" || p.status === "entregada").length;

  const items: FilterItem[] = rows.map((p) => {
    const creator = creatorByEmail.get(p.creatorEmail.toLowerCase());
    const campaign = campaignById.get(p.campaignId);
    const meta = STATUS_META[p.status] ?? STATUS_META.inscrita;
    const enRevision = p.status === "inscrita" || p.status === "entregada";
    return {
      key: p.id ?? `${p.creatorEmail}-${p.campaignId}`,
      search: [creator?.name, creator?.email ?? p.creatorEmail, creator?.handle, campaign?.title ?? p.campaignId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      status: p.status,
      tags: enRevision ? ["revisar"] : [],
      sort: { age: p.createdAt ?? "" },
      node: (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-ink">{creator?.name ?? p.creatorEmail}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>
                {meta.label}
              </span>
              {enRevision && p.createdAt && (
                <span className="inline-flex items-center gap-1 text-[11px] text-ink-soft">
                  <Clock size={11} /> {relativeAge(p.createdAt)}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-soft">
              {campaign?.title ?? p.campaignId}
              {campaign ? (
                <span className="ml-1 inline-flex items-center gap-0.5 align-middle font-semibold text-brand-deep">
                  <Star size={11} className="fill-lime text-lime" /> {campaign.stars}
                </span>
              ) : null}
              <span className="mx-1.5 text-ink/30">·</span>
              {creator?.handle || p.creatorEmail}
            </p>
            {p.status === "rechazada" && p.reason && (
              <p className="mt-0.5 text-xs font-semibold text-brand-deep">Motivo: {p.reason}</p>
            )}
            {p.link && (
              <a
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-brand underline"
              >
                <ExternalLink size={11} /> Ver entrega
              </a>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {p.status === "inscrita" && (
              <StatusButton id={p.id!} status="aceptada" className="bg-brand/10 text-brand-deep hover:bg-brand/20">
                <UserCheck size={14} /> Aceptar
              </StatusButton>
            )}
            {p.status !== "aprobada" && (
              <StatusButton id={p.id!} status="aprobada" className="bg-lime text-ink hover:brightness-95">
                <Check size={14} /> Aprobar
              </StatusButton>
            )}
            {p.status !== "rechazada" && (
              <form action={cambiarEstadoEntrega} className="flex items-center gap-1">
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="status" value="rechazada" />
                <input
                  name="reason"
                  list="motivos-rechazo-entrega"
                  placeholder="Motivo…"
                  className="w-28 rounded-full border border-ink/15 bg-cream/40 px-2.5 py-1.5 text-xs text-ink outline-none placeholder:text-ink/40 focus:border-brand focus:bg-white"
                />
                <SubmitButton
                  pendingLabel="…"
                  className="flex items-center gap-1 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-ink/10"
                >
                  <X size={14} /> Rechazar
                </SubmitButton>
              </form>
            )}
            {p.status !== "inscrita" && (
              <StatusButton id={p.id!} status="inscrita" className="bg-ink/5 text-ink-soft hover:bg-ink/10">
                <RotateCcw size={14} /> Pendiente
              </StatusButton>
            )}
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-ink">
          Inscripciones ({parts.length})
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand-deep">
            {porRevisar} por revisar
          </span>
          {parts.length > 0 && (
            <a
              href="/admin/creadoras/export?type=inscripciones"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs font-bold text-ink-soft transition hover:border-brand hover:text-brand"
            >
              <Download size={14} /> CSV
            </a>
          )}
        </div>
      </div>

      {/* Plantillas de motivo de rechazo (se sugieren en el input "Motivo…"). */}
      <datalist id="motivos-rechazo-entrega">
        {REJECTION_REASONS.entrega.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          Todavía no hay inscripciones.
        </p>
      ) : (
        <AdminFilterList
          items={items}
          defaultStatus="revisar"
          statuses={[
            { value: "revisar", label: "Por revisar" },
            { value: "inscrita", label: "Pendiente" },
            { value: "aceptada", label: "Aceptada" },
            { value: "entregada", label: "Video recibido" },
            { value: "aprobada", label: "Aprobada" },
            { value: "rechazada", label: "Rechazada" },
          ]}
          sorts={[
            { value: "age-asc", label: "Más antiguas primero", field: "age", dir: "asc" },
            { value: "age-desc", label: "Más recientes primero", field: "age", dir: "desc" },
          ]}
          searchPlaceholder="Buscar por creadora, correo, handle o campaña…"
          emptyLabel="Ninguna inscripción coincide con tu búsqueda."
        />
      )}
    </div>
  );
}

function StatusButton({
  id,
  status,
  className,
  children,
}: {
  id: string;
  status: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <form action={cambiarEstadoEntrega}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton
        pendingLabel="…"
        className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition ${className}`}
      >
        {children}
      </SubmitButton>
    </form>
  );
}
