import { Star, Check, X, RotateCcw, ExternalLink, Clock, Eye } from "lucide-react";
import { listMisiones, listCreators } from "@/lib/store";
import { getAdminContext } from "@/lib/brand-admin";
import AdminBrandPending from "@/components/AdminBrandPending";
import AdminFilterList, { type FilterItem } from "@/components/AdminFilterList";
import SubmitButton from "@/components/SubmitButton";
import { relativeAge } from "@/lib/time";
import { REJECTION_REASONS } from "@/lib/rejection-reasons";
import { cambiarEstadoMision } from "../actions";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  enviada: { label: "Por revisar", cls: "bg-brand/15 text-brand-deep" },
  aprobada: { label: "Aprobada", cls: "bg-lime text-ink" },
  rechazada: { label: "Rechazada", cls: "bg-ink/10 text-ink-soft" },
  completada: { label: "Estatus completado", cls: "bg-cream-deep text-ink" },
};

// Orden: lo que necesita acción del equipo primero.
const ORDER: Record<string, number> = { enviada: 0, rechazada: 1, aprobada: 2, completada: 3 };

export default async function AdminMisionesPage() {
  const ctx = await getAdminContext();
  if (!ctx.configured) return <AdminBrandPending brand={ctx.brand.name} slug={ctx.slug} />;
  const conn = ctx.conn ?? undefined;
  const [misiones, creators] = await Promise.all([listMisiones(conn), listCreators(conn)]);
  const creatorByEmail = new Map(creators.map((c) => [c.email.toLowerCase(), c]));
  const missionById = new Map(ctx.brand.missions.map((m) => [m.id, m]));

  const rows = [...misiones].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9));
  const porRevisar = misiones.filter((m) => m.status === "enviada").length;

  const items: FilterItem[] = rows.map((p) => {
    const creator = creatorByEmail.get(p.creatorEmail.toLowerCase());
    const mission = missionById.get(p.missionId);
    const meta = STATUS_META[p.status] ?? STATUS_META.enviada;
    const isSubmit = mission?.action === "submit";
    const enRevision = p.status === "enviada";
    return {
      key: p.id ?? `${p.creatorEmail}-${p.missionId}`,
      search: [creator?.name, creator?.email ?? p.creatorEmail, creator?.handle, mission?.title ?? p.missionId]
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
              {mission?.title ?? p.missionId}
              {mission ? (
                <span className="ml-1 inline-flex items-center gap-0.5 align-middle font-semibold text-brand-deep">
                  <Star size={11} className="fill-lime text-lime" /> {mission.stars}
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

          {isSubmit ? (
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              {p.status !== "aprobada" && (
                <StatusButton id={p.id!} status="aprobada" className="bg-lime text-ink hover:brightness-95">
                  <Check size={14} /> Aprobar
                </StatusButton>
              )}
              {p.status !== "rechazada" && (
                <form action={cambiarEstadoMision} className="flex items-center gap-1">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value="rechazada" />
                  <input
                    name="reason"
                    list="motivos-rechazo-mision"
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
              {p.status !== "enviada" && (
                <StatusButton id={p.id!} status="enviada" className="bg-ink/5 text-ink-soft hover:bg-ink/10">
                  <RotateCcw size={14} /> Por revisar
                </StatusButton>
              )}
            </div>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-ink-soft">
              <Eye size={12} /> Se completa sola
            </span>
          )}
        </div>
      ),
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-ink">Misiones ({misiones.length})</h2>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand-deep">
          {porRevisar} por revisar
        </span>
      </div>

      {/* Plantillas de motivo de rechazo (se sugieren en el input "Motivo…"). */}
      <datalist id="motivos-rechazo-mision">
        {REJECTION_REASONS.mision.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          Todavía no hay misiones registradas. Las de contenido aparecen aquí cuando una creadora
          envía su video.
        </p>
      ) : (
        <AdminFilterList
          items={items}
          defaultStatus="enviada"
          statuses={[
            { value: "enviada", label: "Por revisar" },
            { value: "aprobada", label: "Aprobada" },
            { value: "rechazada", label: "Rechazada" },
            { value: "completada", label: "Estatus completado" },
          ]}
          sorts={[
            { value: "age-asc", label: "Más antiguas primero", field: "age", dir: "asc" },
            { value: "age-desc", label: "Más recientes primero", field: "age", dir: "desc" },
          ]}
          searchPlaceholder="Buscar por creadora, correo, handle o misión…"
          emptyLabel="Ninguna misión coincide con tu búsqueda."
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
    <form action={cambiarEstadoMision}>
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
