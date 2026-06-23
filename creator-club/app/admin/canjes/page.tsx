import { Check, X, RotateCcw, Lock, Star, Download, PackageCheck, Clock } from "lucide-react";
import { listCanjes, listCreators, listRewards } from "@/lib/store";
import { getAdminContext } from "@/lib/brand-admin";
import AdminBrandPending from "@/components/AdminBrandPending";
import AdminFilterList, { type FilterItem } from "@/components/AdminFilterList";
import SubmitButton from "@/components/SubmitButton";
import { relativeAge } from "@/lib/time";
import { REJECTION_REASONS } from "@/lib/rejection-reasons";
import { rewardHasCost, canApproveCanje } from "@/lib/rewards";
import { cambiarEstadoCanje } from "../actions";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  solicitada: { label: "Solicitada", cls: "bg-brand/15 text-brand-deep" },
  aprobada: { label: "Aprobada", cls: "bg-lime text-ink" },
  entregada: { label: "Entregada", cls: "bg-ink text-white" },
  rechazada: { label: "Rechazada", cls: "bg-ink/10 text-ink-soft" },
};
// Orden: lo que necesita acción primero; entregada (cerrado) al final.
const ORDER: Record<string, number> = { solicitada: 0, aprobada: 1, rechazada: 2, entregada: 3 };

export default async function AdminCanjesPage() {
  const ctx = await getAdminContext();
  if (!ctx.configured) return <AdminBrandPending brand={ctx.brand.name} slug={ctx.slug} />;
  const conn = ctx.conn ?? undefined;
  const [canjes, creators, rewards] = await Promise.all([listCanjes(conn), listCreators(conn), listRewards(conn)]);
  const creatorByEmail = new Map(creators.map((c) => [c.email.toLowerCase(), c]));
  const rewardById = new Map(rewards.map((r) => [r.id, r]));

  const rows = [...canjes].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9));
  const pendientes = canjes.filter((c) => c.status === "solicitada").length;

  const items: FilterItem[] = rows.map((c) => {
    const creator = creatorByEmail.get(c.creatorEmail.toLowerCase());
    const reward = rewardById.get(c.rewardId);
    const meta = STATUS_META[c.status] ?? STATUS_META.solicitada;
    const gmv = creator?.gmvMXN ?? 0;
    const hasCost = reward ? rewardHasCost(reward) : true;
    // Recompensa fuera del catálogo (retirada) => no aprobable (fail-closed).
    const approvable = reward ? canApproveCanje(reward, gmv) : false;
    return {
      key: c.id ?? `${c.creatorEmail}-${c.rewardId}`,
      search: [creator?.name, creator?.email ?? c.creatorEmail, creator?.handle, c.rewardTitle || reward?.title || c.rewardId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      status: c.status,
      sort: { age: c.createdAt ?? "" },
      node: (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-ink">{creator?.name ?? c.creatorEmail}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>
                {meta.label}
              </span>
              {c.status === "solicitada" && c.createdAt && (
                <span className="inline-flex items-center gap-1 text-[11px] text-ink-soft">
                  <Clock size={11} /> {relativeAge(c.createdAt)}
                </span>
              )}
              {hasCost ? (
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">
                  con costo
                </span>
              ) : (
                <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                  estatus
                </span>
              )}
            </div>
            <p className="text-xs text-ink-soft">
              {c.rewardTitle || reward?.title || c.rewardId}
              <span className="mx-1.5 text-ink/30">·</span>
              <span className="inline-flex items-center gap-0.5 align-middle font-semibold">
                <Star size={11} className="fill-lime text-lime" />
                {gmv > 0 ? `$${gmv.toLocaleString("es-MX")} MXN` : "sin GMV"}
              </span>
              <span className="mx-1.5 text-ink/30">·</span>
              {creator?.handle || c.creatorEmail}
            </p>
            {c.status === "rechazada" && c.reason && (
              <p className="mt-0.5 text-xs font-semibold text-brand-deep">Motivo: {c.reason}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {c.status !== "aprobada" && c.status !== "entregada" &&
              (approvable ? (
                <StatusButton id={c.id!} status="aprobada" className="bg-lime text-ink hover:brightness-95">
                  <Check size={14} /> Aprobar
                </StatusButton>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-semibold text-ink-soft">
                  <Lock size={13} /> Sin GMV atribuible
                </span>
              ))}
            {c.status === "aprobada" && (
              <StatusButton id={c.id!} status="entregada" className="bg-ink text-white hover:brightness-110">
                <PackageCheck size={14} /> Marcar entregada
              </StatusButton>
            )}
            {c.status !== "rechazada" && c.status !== "entregada" && (
              <form action={cambiarEstadoCanje} className="flex items-center gap-1">
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="status" value="rechazada" />
                <input
                  name="reason"
                  list="motivos-rechazo-canje"
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
            {c.status === "aprobada" && (
              <StatusButton id={c.id!} status="solicitada" className="bg-ink/5 text-ink-soft hover:bg-ink/10">
                <RotateCcw size={14} /> Reabrir
              </StatusButton>
            )}
            {c.status === "entregada" && (
              <StatusButton id={c.id!} status="aprobada" className="bg-ink/5 text-ink-soft hover:bg-ink/10">
                <RotateCcw size={14} /> Deshacer entrega
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
        <h2 className="font-display text-lg font-extrabold text-ink">Canjes ({canjes.length})</h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand-deep">
            {pendientes} por revisar
          </span>
          {canjes.length > 0 && (
            <a
              href="/admin/creadoras/export?type=canjes"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs font-bold text-ink-soft transition hover:border-brand hover:text-brand"
            >
              <Download size={14} /> CSV
            </a>
          )}
        </div>
      </div>

      <p className="rounded-2xl border border-brand/15 bg-white px-4 py-3 text-xs text-ink-soft">
        <Lock size={12} className="mr-1 inline align-text-bottom" />
        Anti-fuga: una recompensa con costo (producto, boost, cash, experiencia) no se aprueba sin
        GMV atribuible. Captura el GMV de la creadora en la pestaña Creadoras.
      </p>

      {/* Plantillas de motivo de rechazo (se sugieren en el input "Motivo…"). */}
      <datalist id="motivos-rechazo-canje">
        {REJECTION_REASONS.canje.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          Todavía no hay solicitudes de canje.
        </p>
      ) : (
        <AdminFilterList
          items={items}
          defaultStatus="solicitada"
          statuses={[
            { value: "solicitada", label: "Solicitada (por revisar)" },
            { value: "aprobada", label: "Aprobada" },
            { value: "entregada", label: "Entregada" },
            { value: "rechazada", label: "Rechazada" },
          ]}
          sorts={[
            { value: "age-asc", label: "Más antiguas primero", field: "age", dir: "asc" },
            { value: "age-desc", label: "Más recientes primero", field: "age", dir: "desc" },
          ]}
          searchPlaceholder="Buscar por creadora, correo, handle o recompensa…"
          emptyLabel="Ningún canje coincide con tu búsqueda."
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
    <form action={cambiarEstadoCanje}>
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
