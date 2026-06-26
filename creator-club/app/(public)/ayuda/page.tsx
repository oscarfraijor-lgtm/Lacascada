import { HelpCircle, MessageCircle } from "lucide-react";
import { listActiveFaq } from "@/lib/store";
import { whatsappLink, type FaqItem } from "@/lib/faq";
import { BRAND } from "@/lib/schema";

export default async function AyudaPage() {
  const items = await listActiveFaq();
  const wa = whatsappLink(
    BRAND.supportWhatsapp,
    `Hola${BRAND.supportName ? ` ${BRAND.supportName.split(",")[0]}` : ""}, soy creadora del ${BRAND.club} y tengo una duda: `
  );
  const supportName = BRAND.supportName ?? "tu Affiliate Manager";

  // Agrupa por categoría (tag); las sin tag van en "General".
  const groups = new Map<string, FaqItem[]>();
  for (const q of items) {
    const k = q.tag?.trim() || "General";
    const arr = groups.get(k);
    if (arr) arr.push(q);
    else groups.set(k, [q]);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">Centro de ayuda</h1>
        <p className="text-sm text-ink-soft">
          Dudas frecuentes sobre los productos y el club de {BRAND.name}. ¿No encuentras tu respuesta? Escríbele
          a {supportName} por WhatsApp.
        </p>
      </header>

      {/* WhatsApp al equipo (si está configurado) */}
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-lime/60 bg-lime/20 p-5 transition hover:bg-lime/30"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-lime">
              <MessageCircle size={20} />
            </span>
            <div>
              <p className="font-display text-base font-extrabold text-ink">Pregúntale a {supportName.split(",")[0]}</p>
              <p className="text-sm text-ink-soft">Cualquier duda de producto o de tu contenido, por WhatsApp.</p>
            </div>
          </div>
          <span className="font-display rounded-full bg-ink px-5 py-2.5 text-sm font-extrabold text-white">Abrir WhatsApp</span>
        </a>
      ) : (
        <div className="flex items-center gap-3 rounded-3xl border border-ink/10 bg-white p-5 text-sm text-ink-soft">
          <MessageCircle size={18} className="text-brand-deep" />
          El chat por WhatsApp con el equipo estará disponible muy pronto.
        </div>
      )}

      {/* FAQ */}
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          Aún no hay preguntas publicadas. Escríbenos por WhatsApp y con gusto te ayudamos.
        </p>
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([tag, qs]) => (
            <section key={tag}>
              <h2 className="font-display mb-2 text-sm font-bold uppercase tracking-wide text-ink-soft">{tag}</h2>
              <div className="divide-y divide-ink/5 overflow-hidden rounded-2xl border border-ink/10 bg-white">
                {qs.map((q) => (
                  <details key={q.id} className="group p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-ink">
                      <span className="flex items-center gap-2">
                        <HelpCircle size={15} className="shrink-0 text-brand-deep" /> {q.question}
                      </span>
                      <span className="text-ink-soft transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-2 pl-7 text-sm text-ink-soft">{q.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
