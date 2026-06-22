import { Check, X, RotateCcw, Lock, Star } from "lucide-react";
import { listCanjes, listCreators } from "@/lib/store";
import { getBrand } from "@/lib/brands";
import { rewardHasCost, canApproveCanje } from "@/lib/rewards";
import { cambiarEstadoCanje } from "../actions";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  solicitada: { label: "Solicitada", cls: "bg-brand/15 text-brand-deep" },
  aprobada: { label: "Aprobada", cls: "bg-lime text-ink" },
  rechazada: { label: "Rechazada", cls: "bg-ink/10 text-ink-soft" },
};
// Orden: lo que necesita acción primero.
const ORDER: Record<string, number> = { solicitada: 0, rechazada: 1, aprobada: 2 };

export default async function AdminCanjesPage() {
  const [canjes, creators] = await Promise.all([listCanjes(), listCreators()]);
  const creatorByEmail = new Map(creators.map((c) => [c.email.toLowerCase(), c]));
  const rewardById = new Map(getBrand().rewards.map((r) => [r.id, r]));

  const rows = [...canjes].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9));
  const pendientes = canjes.filter((c) => c.status === "solicitada").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-ink">Canjes ({canjes.length})</h2>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand-deep">
          {pendientes} por revisar
        </span>
      </div>

      <p className="rounded-2xl border border-brand/15 bg-white px-4 py-3 text-xs text-ink-soft">
        <Lock size={12} className="mr-1 inline align-text-bottom" />
        Anti-fuga: una recompensa con costo (producto, boost, cash, experiencia) no se aprueba sin
        GMV atribuible. Captura el GMV de la creadora en la pestaña Creadoras.
      </p>

      {rows.length === 0 && (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          Todavía no hay solicitudes de canje.
        </p>
      )}

      <ul className="space-y-2">
        {rows.map((c) => {
          const creator = creatorByEmail.get(c.creatorEmail.toLowerCase());
          const reward = rewardById.get(c.rewardId);
          const meta = STATUS_META[c.status] ?? STATUS_META.solicitada;
          const gmv = creator?.gmvMXN ?? 0;
          const hasCost = reward ? rewardHasCost(reward) : true;
          const approvable = reward ? canApproveCanje(reward, gmv) : true;
          return (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{creator?.name ?? c.creatorEmail}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>
                    {meta.label}
                  </span>
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
                {c.status !== "aprobada" &&
                  (approvable ? (
                    <StatusButton id={c.id!} status="aprobada" className="bg-lime text-ink hover:brightness-95">
                      <Check size={14} /> Aprobar
                    </StatusButton>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-semibold text-ink-soft">
                      <Lock size={13} /> Sin GMV atribuible
                    </span>
                  ))}
                {c.status !== "rechazada" && (
                  <form action={cambiarEstadoCanje} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value="rechazada" />
                    <input
                      name="reason"
                      placeholder="Motivo…"
                      className="w-24 rounded-full border border-ink/15 bg-cream/40 px-2.5 py-1.5 text-xs text-ink outline-none placeholder:text-ink/40 focus:border-brand focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-ink/10"
                    >
                      <X size={14} /> Rechazar
                    </button>
                  </form>
                )}
                {c.status === "aprobada" && (
                  <StatusButton id={c.id!} status="solicitada" className="bg-ink/5 text-ink-soft hover:bg-ink/10">
                    <RotateCcw size={14} /> Reabrir
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
    <form action={cambiarEstadoCanje}>
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
