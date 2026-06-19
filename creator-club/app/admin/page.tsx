import { Star, Plus, Power, Trash2, Save } from "lucide-react";
import { listCampaigns } from "@/lib/store";
import type { Campaign } from "@/lib/campaigns";
import { crearCampana, editarCampana, alternarCampana, eliminarCampana } from "./actions";

export default async function AdminCampanasPage() {
  const campaigns = await listCampaigns();
  const activas = campaigns.filter((c) => c.open).length;

  return (
    <div className="space-y-6">
      {/* Crear */}
      <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
        <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-extrabold text-ink">
          <Plus size={18} className="text-brand-deep" /> Nueva campaña
        </h2>
        <form action={crearCampana} className="space-y-4">
          <CampaignFields />
          <button
            type="submit"
            className="font-display rounded-full bg-lime px-5 py-2.5 text-sm font-extrabold text-ink transition hover:brightness-95"
          >
            Crear campaña
          </button>
        </form>
      </section>

      {/* Lista */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-ink">
            Campañas ({campaigns.length})
          </h2>
          <span className="text-xs text-ink-soft">{activas} activas</span>
        </div>

        {campaigns.length === 0 && (
          <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
            Aún no hay campañas. Crea la primera arriba.
          </p>
        )}

        {campaigns.map((c) => (
          <div
            key={c.id}
            className={`rounded-3xl border p-5 ${c.open ? "border-ink/10 bg-white" : "border-ink/10 bg-ink/[0.03]"}`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${c.open ? "bg-lime text-ink" : "bg-ink/10 text-ink-soft"}`}
                >
                  {c.open ? "Activa" : "Inactiva"}
                </span>
                <code className="text-xs text-ink-soft">{c.id}</code>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-ink">
                <Star size={13} className="fill-lime text-lime" /> {c.stars}
              </span>
            </div>

            <form action={editarCampana} className="space-y-4">
              <input type="hidden" name="id" value={c.id} />
              <CampaignFields c={c} />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="font-display flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-deep"
                >
                  <Save size={15} /> Guardar
                </button>
              </div>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/5 pt-3">
              <form action={alternarCampana}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="open" value={(!c.open).toString()} />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink/10"
                >
                  <Power size={14} /> {c.open ? "Desactivar" : "Activar"}
                </button>
              </form>
              <form action={eliminarCampana}>
                <input type="hidden" name="id" value={c.id} />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-brand-deep transition hover:bg-brand/10"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </form>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// Campos compartidos entre crear y editar. Sin `c` = formulario vacío.
function CampaignFields({ c }: { c?: Campaign }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="title" label="Título" defaultValue={c?.title} placeholder="Prueba 30 Noches" required />
        <Field name="tag" label="Tag" defaultValue={c?.tag} placeholder="Producto / Contenido / Live" />
        <Field name="stars" label="Estrellas" type="number" defaultValue={c?.stars?.toString() ?? "0"} />
        <Field name="deadline" label="Deadline" defaultValue={c?.deadline} placeholder="Cupo abierto" />
        <Field name="reward" label="Recompensa" defaultValue={c?.reward} placeholder="Colchón a prueba + 250 estrellas" />
        <Field name="brand" label="Marca" defaultValue={c?.brand ?? "Color Dreams"} />
      </div>
      <Field
        name="requirements"
        label="Requisitos (Para calificar)"
        defaultValue={c?.requirements}
        placeholder="Perfil completo + link de afiliado. No necesitas seguidores."
      />
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Brief</span>
        <textarea
          name="brief"
          rows={2}
          defaultValue={c?.brief}
          placeholder="Qué tiene que hacer la creadora…"
          className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/30 focus:border-brand focus:bg-white"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" name="open" defaultChecked={c ? c.open : true} className="h-4 w-4 accent-brand" />
        Activa (visible en el portal)
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
        className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/30 focus:border-brand focus:bg-white"
      />
    </label>
  );
}
