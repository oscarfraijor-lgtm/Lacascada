import { Check, X, RotateCcw, Zap, Gift, Clock, Star } from "lucide-react";
import { listActivaciones, listCreators } from "@/lib/store";
import { getAdminContext } from "@/lib/brand-admin";
import { tierForGmv } from "@/lib/tiers";
import { getActivacionMeta } from "@/lib/activaciones";
import AdminBrandPending from "@/components/AdminBrandPending";
import AdminFilterList, { type FilterItem } from "@/components/AdminFilterList";
import SubmitButton from "@/components/SubmitButton";
import { relativeAge } from "@/lib/time";
import { REJECTION_REASONS } from "@/lib/rejection-reasons";
import { cambiarEstadoActivacion } from "../actions";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  solicitada: { label: "Solicitada", cls: "bg-brand/15 text-brand-deep" },
  otorgada: { label: "Otorgada", cls: "bg-lime text-ink" },
  rechazada: { label: "Rechazada", cls: "bg-ink/10 text-ink-soft" },
};
const ORDER: Record<string, number> = { solicitada: 0, otorgada: 1, rechazada: 2 };
const TIPO_ICON = { flash_sale: Zap, giveaway: Gift } as const;

export default async function AdminActivacionesPage() {
  const ctx = await getAdminContext();
  if (!ctx.configured) return <AdminBrandPending brand={ctx.brand.name} slug={ctx.slug} />;
  const conn = ctx.conn ?? undefined;
  const [activaciones, creators] = await Promise.all([listActivaciones(conn), listCreators(conn)]);
  const creatorByEmail = new Map(creators.map((c) => [c.email.toLowerCase(), c]));
  const tierLabel = ctx.brand.tierSystem.label;

  const rows = [...activaciones].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9));
  const pendientes = activaciones.filter((a) => a.status === "solicitada").length;

  const items: FilterItem[] = rows.map((a) => {
    const creator = creatorByEmail.get(a.creatorEmail.toLowerCase());
    const meta = getActivacionMeta(a.tipo);
    const sMeta = STATUS_META[a.status] ?? STATUS_META.solicitada;
    const Icon = TIPO_ICON[a.tipo as keyof typeof TIPO_ICON] ?? Zap;
    const gmv = creator?.gmvMXN ?? 0;
    const tier = tierForGmv(gmv, ctx.brand.tierSystem);
    return {
      key: a.id ?? `${a.creatorEmail}-${a.tipo}`,
      search: [creator?.name, creator?.email ?? a.creatorEmail, a.usuario, meta?.label ?? a.tipo]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      status: a.status,
      sort: { age: a.createdAt ?? "" },
      node: (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-ink">{creator?.name ?? a.creatorEmail}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">
                <Icon size={11} /> {meta?.label ?? a.tipo}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sMeta.cls}`}>
                {sMeta.label}
              </span>
              {a.status === "solicitada" && a.createdAt && (
                <span className="inline-flex items-center gap-1 text-[11px] text-ink-soft">
                  <Clock size={11} /> {relativeAge(a.createdAt)}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-soft">
              Usuario del Live: <span className="font-semibold text-ink">{a.usuario || "(no dejó usuario)"}</span>
              <span className="mx-1.5 text-ink/30">·</span>
              <span className="inline-flex items-center gap-0.5 align-middle font-semibold">
                <Star size={11} className="fill-lime text-lime" />
                {gmv > 0 ? `$${gmv.toLocaleString("es-MX")} MXN` : "sin GMV"}
              </span>
              <span className="mx-1.5 text-ink/30">·</span>
              {tierLabel} {tier.name}
            </p>
            {a.status === "rechazada" && a.reason && (
              <p className="mt-0.5 text-xs font-semibold text-brand-deep">Motivo: {a.reason}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {a.status !== "otorgada" && (
              <StatusButton id={a.id!} status="otorgada" className="bg-lime text-ink hover:brightness-95">
                <Check size={14} /> Otorgar
              </StatusButton>
            )}
            {a.status !== "rechazada" && a.status !== "otorgada" && (
              <form action={cambiarEstadoActivacion} className="flex items-center gap-1">
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="status" value="rechazada" />
                <input
                  name="reason"
                  list="motivos-rechazo-activacion"
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
            {a.status === "otorgada" && (
              <StatusButton id={a.id!} status="solicitada" className="bg-ink/5 text-ink-soft hover:bg-ink/10">
                <RotateCcw size={14} /> Reabrir
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
        <h2 className="font-display text-lg font-extrabold text-ink">Activaciones ({activaciones.length})</h2>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand-deep">
          {pendientes} por otorgar
        </span>
      </div>

      <p className="rounded-2xl border border-brand/15 bg-white px-4 py-3 text-xs text-ink-soft">
        <Zap size={12} className="mr-1 inline align-text-bottom text-brand-deep" />
        La creadora pide un Flash Sale o un Giveaway para su Live y deja su usuario. Tú lo activas en
        TikTok Shop y marcas "Otorgar"; ella ve el estado y el tutorial en su club.
      </p>

      <datalist id="motivos-rechazo-activacion">
        {REJECTION_REASONS.canje.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          Todavía no hay solicitudes de activación.
        </p>
      ) : (
        <AdminFilterList
          items={items}
          defaultStatus="solicitada"
          statuses={[
            { value: "solicitada", label: "Solicitada (por otorgar)" },
            { value: "otorgada", label: "Otorgada" },
            { value: "rechazada", label: "Rechazada" },
          ]}
          sorts={[
            { value: "age-asc", label: "Más antiguas primero", field: "age", dir: "asc" },
            { value: "age-desc", label: "Más recientes primero", field: "age", dir: "desc" },
          ]}
          searchPlaceholder="Buscar por creadora, correo, usuario o tipo…"
          emptyLabel="Ninguna activación coincide con tu búsqueda."
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
    <form action={cambiarEstadoActivacion}>
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
