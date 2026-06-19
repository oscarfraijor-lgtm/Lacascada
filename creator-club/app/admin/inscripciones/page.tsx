import { Star, Check, X, RotateCcw, ExternalLink } from "lucide-react";
import { listParticipations, listCreators, listCampaigns } from "@/lib/store";
import { cambiarEstadoEntrega } from "../actions";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  inscrita: { label: "Pendiente", cls: "bg-cream-deep text-ink" },
  aprobada: { label: "Aprobada", cls: "bg-lime text-ink" },
  rechazada: { label: "Rechazada", cls: "bg-ink/10 text-ink-soft" },
};

// Orden: pendientes primero (para revisar), luego aprobadas, luego rechazadas.
const ORDER: Record<string, number> = { inscrita: 0, aprobada: 1, rechazada: 2 };

export default async function AdminInscripcionesPage() {
  const [parts, creators, campaigns] = await Promise.all([
    listParticipations(),
    listCreators(),
    listCampaigns(),
  ]);
  const creatorByEmail = new Map(creators.map((c) => [c.email.toLowerCase(), c]));
  const campaignById = new Map(campaigns.map((c) => [c.id, c]));

  const rows = [...parts].sort(
    (a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9)
  );
  const pendientes = parts.filter((p) => p.status === "inscrita").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-ink">
          Inscripciones ({parts.length})
        </h2>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand-deep">
          {pendientes} por revisar
        </span>
      </div>

      {rows.length === 0 && (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          Todavía no hay inscripciones.
        </p>
      )}

      <ul className="space-y-2">
        {rows.map((p) => {
          const creator = creatorByEmail.get(p.creatorEmail.toLowerCase());
          const campaign = campaignById.get(p.campaignId);
          const meta = STATUS_META[p.status] ?? STATUS_META.inscrita;
          return (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink">{creator?.name ?? p.creatorEmail}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>
                    {meta.label}
                  </span>
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

              <div className="flex shrink-0 items-center gap-1.5">
                {p.status !== "aprobada" && (
                  <StatusButton id={p.id!} status="aprobada" className="bg-lime text-ink hover:brightness-95">
                    <Check size={14} /> Aprobar
                  </StatusButton>
                )}
                {p.status !== "rechazada" && (
                  <StatusButton id={p.id!} status="rechazada" className="bg-ink/5 text-ink hover:bg-ink/10">
                    <X size={14} /> Rechazar
                  </StatusButton>
                )}
                {p.status !== "inscrita" && (
                  <StatusButton id={p.id!} status="inscrita" className="bg-ink/5 text-ink-soft hover:bg-ink/10">
                    <RotateCcw size={14} /> Pendiente
                  </StatusButton>
                )}
              </div>
            </li>
          );
        })}
      </ul>
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
      <button
        type="submit"
        className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition ${className}`}
      >
        {children}
      </button>
    </form>
  );
}
