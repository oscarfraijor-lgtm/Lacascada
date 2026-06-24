import { Check, X, RotateCcw, Truck, PackageOpen, Clock, Star, Link2, MapPin } from "lucide-react";
import { listMuestras, listCreators } from "@/lib/store";
import { getAdminContext } from "@/lib/brand-admin";
import { tierForGmv } from "@/lib/tiers";
import { profileComplete, looksLikeAffiliate } from "@/lib/missions";
import AdminBrandPending from "@/components/AdminBrandPending";
import AdminFilterList, { type FilterItem } from "@/components/AdminFilterList";
import SubmitButton from "@/components/SubmitButton";
import { relativeAge } from "@/lib/time";
import { cambiarEstadoMuestra } from "../actions";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  solicitada: { label: "Solicitada", cls: "bg-brand/15 text-brand-deep" },
  aprobada: { label: "Aprobada", cls: "bg-lime text-ink" },
  enviada: { label: "Enviada", cls: "bg-ink text-lime" },
  rechazada: { label: "Rechazada", cls: "bg-ink/10 text-ink-soft" },
};
const ORDER: Record<string, number> = { solicitada: 0, aprobada: 1, enviada: 2, rechazada: 3 };

const REASONS = [
  "Conecta tu TikTok afiliado para priorizar tu muestra.",
  "Completa tu perfil para poder enviarte la muestra.",
  "Por ahora no hay stock de muestra de este producto.",
  "Necesitamos validar tu actividad antes de enviarte producto.",
];

export default async function AdminMuestrasPage() {
  const ctx = await getAdminContext();
  if (!ctx.configured) return <AdminBrandPending brand={ctx.brand.name} slug={ctx.slug} />;
  const conn = ctx.conn ?? undefined;
  const [muestras, creators] = await Promise.all([listMuestras(conn), listCreators(conn)]);
  const creatorByEmail = new Map(creators.map((c) => [c.email.toLowerCase(), c]));
  const tierLabel = ctx.brand.tierSystem.label;

  const rows = [...muestras].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9));
  const pendientes = muestras.filter((m) => m.status === "solicitada").length;

  const items: FilterItem[] = rows.map((m) => {
    const creator = creatorByEmail.get(m.creatorEmail.toLowerCase());
    const sMeta = STATUS_META[m.status] ?? STATUS_META.solicitada;
    const gmv = creator?.gmvMXN ?? 0;
    const tier = tierForGmv(gmv, ctx.brand.tierSystem);
    const affOk = looksLikeAffiliate(creator?.affiliateHandle);
    const profOk = creator ? profileComplete(creator) : false;
    return {
      key: m.id ?? `${m.creatorEmail}-${m.productId}`,
      search: [creator?.name, creator?.email ?? m.creatorEmail, m.productName, m.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      status: m.status,
      sort: { age: m.createdAt ?? "" },
      node: (
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-ink">{creator?.name ?? m.creatorEmail}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">
                <PackageOpen size={11} /> {m.productName || m.productId}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sMeta.cls}`}>
                {sMeta.label}
              </span>
              {m.status === "solicitada" && m.createdAt && (
                <span className="inline-flex items-center gap-1 text-[11px] text-ink-soft">
                  <Clock size={11} /> {relativeAge(m.createdAt)}
                </span>
              )}
            </div>
            {/* Contexto de elegibilidad (el equipo decide con esto; no hay gate de GMV) */}
            <p className="mt-0.5 text-xs text-ink-soft">
              <span className={`inline-flex items-center gap-0.5 font-semibold ${affOk ? "text-ink" : "text-brand-deep"}`}>
                <Link2 size={11} /> {affOk ? `afiliado ${creator?.affiliateHandle}` : "sin afiliado"}
              </span>
              <span className="mx-1.5 text-ink/30">·</span>
              <span className="inline-flex items-center gap-0.5 align-middle font-semibold">
                <Star size={11} className="fill-lime text-lime" />
                {gmv > 0 ? `$${gmv.toLocaleString("es-MX")} MXN` : "sin GMV"}
              </span>
              <span className="mx-1.5 text-ink/30">·</span>
              {tierLabel} {tier.name}
              <span className="mx-1.5 text-ink/30">·</span>
              perfil {profOk ? "completo" : "incompleto"}
            </p>
            <p className="mt-1 flex items-start gap-1 text-xs text-ink-soft">
              <MapPin size={12} className="mt-0.5 shrink-0" />
              <span>{m.address || "(sin dirección)"}</span>
            </p>
            {m.note && <p className="mt-0.5 text-xs italic text-ink-soft">Nota: {m.note}</p>}
            {m.status === "rechazada" && m.reason && (
              <p className="mt-0.5 text-xs font-semibold text-brand-deep">Motivo: {m.reason}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {m.status === "solicitada" && (
              <>
                <StatusButton id={m.id!} status="aprobada" className="bg-lime text-ink hover:brightness-95">
                  <Check size={14} /> Aprobar
                </StatusButton>
                <form action={cambiarEstadoMuestra} className="flex items-center gap-1">
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="status" value="rechazada" />
                  <input
                    name="reason"
                    list="motivos-rechazo-muestra"
                    aria-label="Motivo de rechazo"
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
              </>
            )}
            {m.status === "aprobada" && (
              <StatusButton id={m.id!} status="enviada" className="bg-lime text-ink hover:brightness-95">
                <Truck size={14} /> Marcar enviada
              </StatusButton>
            )}
            {/* Reabrir solo desde estados no terminales (aprobada/rechazada). Una
                muestra "enviada" es terminal (el paquete ya salió): no se reabre
                para no re-disparar el correo de envío de un producto ya entregado. */}
            {(m.status === "aprobada" || m.status === "rechazada") && (
              <StatusButton id={m.id!} status="solicitada" className="bg-ink/5 text-ink-soft hover:bg-ink/10">
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
        <h2 className="font-display text-lg font-extrabold text-ink">Muestras ({muestras.length})</h2>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand-deep">
          {pendientes} por revisar
        </span>
      </div>

      <p className="rounded-2xl border border-brand/15 bg-white px-4 py-3 text-xs text-ink-soft">
        <PackageOpen size={12} className="mr-1 inline align-text-bottom text-brand-deep" />
        La creadora pide una muestra de producto para crear contenido. Es una <b>inversión de la marca</b>,
        no un premio por ventas: aprueba con el contexto (afiliado, nivel, perfil) y luego marca "Enviada"
        cuando salga el paquete. No hay candado de GMV; la aprobación manual es el control.
      </p>

      <datalist id="motivos-rechazo-muestra">
        {REASONS.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          Todavía no hay solicitudes de muestra.
        </p>
      ) : (
        <AdminFilterList
          items={items}
          defaultStatus="solicitada"
          statuses={[
            { value: "solicitada", label: "Solicitada (por revisar)" },
            { value: "aprobada", label: "Aprobada (por enviar)" },
            { value: "enviada", label: "Enviada" },
            { value: "rechazada", label: "Rechazada" },
          ]}
          sorts={[
            { value: "age-asc", label: "Más antiguas primero", field: "age", dir: "asc" },
            { value: "age-desc", label: "Más recientes primero", field: "age", dir: "desc" },
          ]}
          searchPlaceholder="Buscar por creadora, correo, producto o dirección…"
          emptyLabel="Ninguna muestra coincide con tu búsqueda."
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
    <form action={cambiarEstadoMuestra}>
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
