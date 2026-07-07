import { Star, Plus, Power, Trash2, Save, ShieldCheck } from "lucide-react";
import { listRewards, listCanjes } from "@/lib/store";
import type { Reward } from "@/lib/types";
import { getAdminContext } from "@/lib/brand-admin";
import type { TierSystem } from "@/lib/tiers";
import AdminBrandPending from "@/components/AdminBrandPending";
import SubmitButton from "@/components/SubmitButton";
import ConfirmButton from "@/components/ConfirmButton";
import TierScopeField from "@/components/TierScopeField";
import { crearRecompensa, editarRecompensa, alternarRecompensa, eliminarRecompensa } from "../actions";

const KIND_OPTS: { value: Reward["kind"]; label: string }[] = [
  { value: "estatus", label: "Estatus (gratis, sin venta)" },
  { value: "producto", label: "Producto" },
  { value: "boost", label: "Boost de comisión" },
  { value: "cash", label: "Cash / fee" },
  { value: "experiencia", label: "Experiencia" },
];

export default async function AdminRecompensasPage() {
  const ctx = await getAdminContext();
  if (!ctx.configured) return <AdminBrandPending brand={ctx.brand.name} slug={ctx.slug} />;
  const conn = ctx.conn ?? undefined;
  const [rewards, canjes] = await Promise.all([listRewards(conn), listCanjes(conn)]);
  const activos = rewards.filter((r) => r.active !== false).length;
  const canjesPorPremio = new Map<string, number>();
  for (const c of canjes) canjesPorPremio.set(c.rewardId, (canjesPorPremio.get(c.rewardId) ?? 0) + 1);

  return (
    <div className="space-y-6">
      {/* Recordatorio anti-fuga */}
      <p className="flex items-start gap-2 rounded-2xl border border-brand/20 bg-white px-4 py-3 text-xs text-ink-soft">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-brand-deep" />
        Los premios con costo (todo lo que no sea "Estatus") <b>siempre</b> exigen una venta atribuible
        antes de entregarse, aunque cambies sus umbrales. Eso protege contra regalar sin venta.
      </p>

      {/* Crear */}
      <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
        <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-extrabold text-ink">
          <Plus size={18} className="text-brand-deep" /> Nuevo premio
        </h2>
        <form action={crearRecompensa} className="space-y-4">
          <RewardFields tierSystem={ctx.brand.tierSystem} />
          <SubmitButton
            pendingLabel="Creando…"
            className="font-display rounded-full bg-lime px-5 py-2.5 text-sm font-extrabold text-ink transition hover:brightness-95"
          >
            Crear premio
          </SubmitButton>
        </form>
      </section>

      {/* Lista */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-ink">Premios ({rewards.length})</h2>
          <span className="text-xs text-ink-soft">{activos} activos</span>
        </div>

        {rewards.length === 0 && (
          <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
            Aún no hay premios. Crea el primero arriba.
          </p>
        )}

        {rewards.map((r) => (
          <div
            key={r.id}
            className={`rounded-3xl border p-5 ${r.active !== false ? "border-ink/10 bg-white" : "border-ink/10 bg-ink/[0.03]"}`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${r.active !== false ? "bg-lime text-ink" : "bg-ink/10 text-ink-soft"}`}>
                  {r.active !== false ? "Activo" : "Inactivo"}
                </span>
                <code className="text-xs text-ink-soft">{r.id}</code>
              </div>
            </div>

            <form action={editarRecompensa} className="space-y-4">
              <input type="hidden" name="id" value={r.id} />
              <RewardFields r={r} tierSystem={ctx.brand.tierSystem} />
              <SubmitButton
                pendingLabel="Guardando…"
                className="font-display flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-deep"
              >
                <Save size={15} /> Guardar
              </SubmitButton>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/5 pt-3">
              <form action={alternarRecompensa}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="active" value={(r.active === false).toString()} />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink/10"
                >
                  <Power size={14} /> {r.active !== false ? "Desactivar" : "Activar"}
                </button>
              </form>
              {(canjesPorPremio.get(r.id) ?? 0) > 0 ? (
                <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft">
                  {canjesPorPremio.get(r.id)} canjes · usa Desactivar para retirarlo
                </span>
              ) : (
                <form action={eliminarRecompensa}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmButton
                    message={`¿Eliminar el premio "${r.title}"? No se puede deshacer.`}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-brand-deep transition hover:bg-brand/10"
                  >
                    <Trash2 size={14} /> Eliminar
                  </ConfirmButton>
                </form>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function RewardFields({ r, tierSystem }: { r?: Reward; tierSystem: TierSystem }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="title" label="Título" defaultValue={r?.title} placeholder="Nombre del premio" required />
        <Field name="cost" label="Costo (texto visible)" defaultValue={r?.cost} placeholder="Ej. Nivel Soñadora + tu primera venta" />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Tipo</span>
          <select
            name="kind"
            defaultValue={r?.kind ?? "producto"}
            className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
          >
            {KIND_OPTS.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Quién paga</span>
          <select
            name="payer"
            defaultValue={r?.payer ?? "marca"}
            className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
          >
            <option value="marca">Marca</option>
            <option value="club">Club</option>
          </select>
        </label>
        <Field name="minStars" label="Estrellas mínimas" type="number" defaultValue={r?.minStars?.toString() ?? "0"} />
        <Field name="minGmvMXN" label="Ventas mín. (MXN)" type="number" defaultValue={r?.minGmvMXN?.toString() ?? "0"} />
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Detalle</span>
        <textarea
          name="detail"
          rows={2}
          defaultValue={r?.detail}
          placeholder="Qué recibe la creadora…"
          className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/50 focus:border-brand focus:bg-white"
        />
      </label>
      <TierScopeField system={tierSystem} selected={r?.tiers ?? []} />
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" name="active" defaultChecked={r ? r.active !== false : true} className="h-4 w-4 accent-brand" />
        Activo (visible para las creadoras)
      </label>
    </>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      <input
        name={name}
        type={type}
        min={type === "number" ? 0 : undefined}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-ink outline-none placeholder:text-ink/50 focus:border-brand focus:bg-white"
      />
    </label>
  );
}
