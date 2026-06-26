import { HelpCircle, Plus, Power, Trash2, Save } from "lucide-react";
import { listFaq } from "@/lib/store";
import type { FaqItem } from "@/lib/faq";
import { getAdminContext } from "@/lib/brand-admin";
import AdminBrandPending from "@/components/AdminBrandPending";
import SubmitButton from "@/components/SubmitButton";
import { crearFaq, editarFaq, alternarFaq, eliminarFaq } from "../actions";

export default async function AdminFaqPage() {
  const ctx = await getAdminContext();
  if (!ctx.configured) return <AdminBrandPending brand={ctx.brand.name} slug={ctx.slug} />;
  const conn = ctx.conn ?? undefined;
  const items = await listFaq(conn);
  const activos = items.filter((q) => q.active !== false).length;

  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2 rounded-2xl border border-brand/20 bg-white px-4 py-3 text-xs text-ink-soft">
        <HelpCircle size={15} className="mt-0.5 shrink-0 text-brand-deep" />
        Preguntas frecuentes (sobre todo de producto) que la creadora consulta en el Centro de ayuda. Lo que no
        esté aquí, te lo preguntan por WhatsApp. Para configurar el número de WhatsApp de soporte, pídeselo al equipo de Indie Pro.
      </p>

      {/* Crear */}
      <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
        <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-extrabold text-ink">
          <Plus size={18} className="text-brand-deep" /> Nueva pregunta
        </h2>
        <form action={crearFaq} className="space-y-4">
          <FaqFields />
          <SubmitButton
            pendingLabel="Creando…"
            className="font-display rounded-full bg-lime px-5 py-2.5 text-sm font-extrabold text-ink transition hover:brightness-95"
          >
            Agregar pregunta
          </SubmitButton>
        </form>
      </section>

      {/* Lista */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-ink">Preguntas ({items.length})</h2>
          <span className="text-xs text-ink-soft">{activos} activas</span>
        </div>

        {items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
            Aún no hay preguntas. Agrega la primera arriba.
          </p>
        )}

        {items.map((q) => (
          <div
            key={q.id}
            className={`rounded-3xl border p-5 ${q.active !== false ? "border-ink/10 bg-white" : "border-ink/10 bg-ink/[0.03]"}`}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${q.active !== false ? "bg-lime text-ink" : "bg-ink/10 text-ink-soft"}`}>
                {q.active !== false ? "Activa" : "Inactiva"}
              </span>
              {q.tag && <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">{q.tag}</span>}
            </div>

            <form action={editarFaq} className="space-y-4">
              <input type="hidden" name="id" value={q.id} />
              <FaqFields q={q} />
              <SubmitButton
                pendingLabel="Guardando…"
                className="font-display flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-deep"
              >
                <Save size={15} /> Guardar
              </SubmitButton>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/5 pt-3">
              <form action={alternarFaq}>
                <input type="hidden" name="id" value={q.id} />
                <input type="hidden" name="active" value={(q.active === false).toString()} />
                <button type="submit" className="flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink/10">
                  <Power size={14} /> {q.active !== false ? "Desactivar" : "Activar"}
                </button>
              </form>
              <form action={eliminarFaq}>
                <input type="hidden" name="id" value={q.id} />
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

function FaqFields({ q }: { q?: FaqItem }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Pregunta</span>
          <input
            name="question"
            defaultValue={q?.question}
            placeholder="Escribe la pregunta…"
            required
            className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-ink outline-none placeholder:text-ink/50 focus:border-brand focus:bg-white"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Categoría</span>
          <input
            name="tag"
            defaultValue={q?.tag}
            placeholder="Producto"
            className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-ink outline-none placeholder:text-ink/50 focus:border-brand focus:bg-white sm:w-40"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Respuesta</span>
        <textarea
          name="answer"
          rows={3}
          defaultValue={q?.answer}
          placeholder="Respuesta clara y honesta…"
          className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/50 focus:border-brand focus:bg-white"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" name="active" defaultChecked={q ? q.active !== false : true} className="h-4 w-4 accent-brand" />
        Activa (visible para las creadoras)
      </label>
    </>
  );
}
