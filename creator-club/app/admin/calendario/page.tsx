import { CalendarDays, Plus, Power, Trash2, Save } from "lucide-react";
import { listCalendar } from "@/lib/store";
import type { CalendarEvent } from "@/lib/calendar";
import { getAdminContext } from "@/lib/brand-admin";
import AdminBrandPending from "@/components/AdminBrandPending";
import SubmitButton from "@/components/SubmitButton";
import { crearEvento, editarEvento, alternarEvento, eliminarEvento } from "../actions";

const MONTHS = ["Todo el año", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default async function AdminCalendarioPage() {
  const ctx = await getAdminContext();
  if (!ctx.configured) return <AdminBrandPending brand={ctx.brand.name} slug={ctx.slug} />;
  const conn = ctx.conn ?? undefined;
  const events = (await listCalendar(conn)).sort((a, b) => a.monthOrder - b.monthOrder);
  const activos = events.filter((e) => e.active !== false).length;

  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2 rounded-2xl border border-brand/20 bg-white px-4 py-3 text-xs text-ink-soft">
        <CalendarDays size={15} className="mt-0.5 shrink-0 text-brand-deep" />
        Fechas clave de TikTok Shop. Prendes/apagas las que apliquen a tu temporada; las creadoras las ven en
        su Calendario para saber cuándo crear contenido. Prioridad SS (máxima) &gt; S &gt; A.
      </p>

      {/* Crear */}
      <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
        <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-extrabold text-ink">
          <Plus size={18} className="text-brand-deep" /> Nueva fecha
        </h2>
        <form action={crearEvento} className="space-y-4">
          <EventFields />
          <SubmitButton
            pendingLabel="Creando…"
            className="font-display rounded-full bg-lime px-5 py-2.5 text-sm font-extrabold text-ink transition hover:brightness-95"
          >
            Agregar fecha
          </SubmitButton>
        </form>
      </section>

      {/* Lista */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-ink">Fechas ({events.length})</h2>
          <span className="text-xs text-ink-soft">{activos} activas</span>
        </div>

        {events.length === 0 && (
          <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
            Aún no hay fechas. Agrega la primera arriba.
          </p>
        )}

        {events.map((e) => (
          <div
            key={e.id}
            className={`rounded-3xl border p-5 ${e.active !== false ? "border-ink/10 bg-white" : "border-ink/10 bg-ink/[0.03]"}`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${e.active !== false ? "bg-lime text-ink" : "bg-ink/10 text-ink-soft"}`}>
                  {e.active !== false ? "Activa" : "Inactiva"}
                </span>
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">
                  {e.priority}
                </span>
                <span className="text-xs text-ink-soft">{e.period}</span>
              </div>
            </div>

            <form action={editarEvento} className="space-y-4">
              <input type="hidden" name="id" value={e.id} />
              <EventFields e={e} />
              <SubmitButton
                pendingLabel="Guardando…"
                className="font-display flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-deep"
              >
                <Save size={15} /> Guardar
              </SubmitButton>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/5 pt-3">
              <form action={alternarEvento}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="active" value={(e.active === false).toString()} />
                <button type="submit" className="flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink/10">
                  <Power size={14} /> {e.active !== false ? "Desactivar" : "Activar"}
                </button>
              </form>
              <form action={eliminarEvento}>
                <input type="hidden" name="id" value={e.id} />
                <button type="submit" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-brand-deep transition hover:bg-brand/10">
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

function EventFields({ e }: { e?: CalendarEvent }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="name" label="Nombre" defaultValue={e?.name} placeholder="Ej. Hot Sale" required />
        <Field name="period" label="Cuándo (texto)" defaultValue={e?.period} placeholder="Ej. Mayo" />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Mes (para ordenar)</span>
          <select
            name="monthOrder"
            defaultValue={(e?.monthOrder ?? 0).toString()}
            className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Prioridad</span>
          <select
            name="priority"
            defaultValue={e?.priority ?? "S"}
            className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
          >
            <option value="SS">SS · máxima</option>
            <option value="S">S · alta</option>
            <option value="A">A</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Tipo</span>
          <select
            name="kind"
            defaultValue={e?.kind ?? "plataforma"}
            className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
          >
            <option value="plataforma">Campaña de plataforma (TikTok)</option>
            <option value="marca">Campaña de marca (todo el año)</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Idea de contenido (opcional)</span>
        <textarea
          name="tip"
          rows={2}
          defaultValue={e?.tip}
          placeholder="Qué tipo de video va con esta fecha…"
          className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/50 focus:border-brand focus:bg-white"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" name="active" defaultChecked={e ? e.active !== false : true} className="h-4 w-4 accent-brand" />
        Activa (visible para las creadoras)
      </label>
    </>
  );
}

function Field({ name, label, type = "text", defaultValue, placeholder, required }: { name: string; label: string; type?: string; defaultValue?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-ink outline-none placeholder:text-ink/50 focus:border-brand focus:bg-white"
      />
    </label>
  );
}
