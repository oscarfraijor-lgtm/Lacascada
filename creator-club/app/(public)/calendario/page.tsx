import { CalendarDays, Sparkles, Star } from "lucide-react";
import { listActiveCalendar } from "@/lib/store";
import { QUARTERS, PRIORITY_META, type CalendarEvent } from "@/lib/calendar";
import { BRAND } from "@/lib/schema";

// Mes actual (servidor) para resaltar "este mes". Tolerante: si algo falla, 0.
function currentMonth(): number {
  try {
    return new Date().getMonth() + 1;
  } catch {
    return 0;
  }
}

export default async function CalendarioPage() {
  const events = await listActiveCalendar();
  const month = currentMonth();
  const plataforma = events.filter((e) => e.kind === "plataforma" && e.monthOrder >= 1 && e.monthOrder <= 12);
  const recurrentes = events.filter((e) => e.kind === "plataforma" && e.monthOrder === 0);
  const marca = events.filter((e) => e.kind === "marca");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">Calendario de contenido</h1>
        <p className="text-sm text-ink-soft">
          Las fechas grandes de TikTok Shop para {BRAND.name}. Planea tu contenido con tiempo: las campañas
          <b className="text-ink"> SS</b> son las más fuertes del año.
        </p>
      </header>

      {events.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          Aún no hay fechas publicadas. ¡Vuelve pronto!
        </p>
      ) : (
        <>
          {/* Por trimestre */}
          <div className="space-y-5">
            {QUARTERS.map((q) => {
              const inQ = plataforma
                .filter((e) => q.months.includes(e.monthOrder))
                .sort((a, b) => a.monthOrder - b.monthOrder);
              if (inQ.length === 0) return null;
              return (
                <section key={q.label}>
                  <h2 className="font-display mb-2 text-sm font-bold uppercase tracking-wide text-ink-soft">{q.label}</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {inQ.map((e) => (
                      <EventCard key={e.id} e={e} thisMonth={e.monthOrder === month} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Campañas de marca (todo el año) + recurrentes */}
          {(marca.length > 0 || recurrentes.length > 0) && (
            <section>
              <h2 className="font-display mb-2 text-sm font-bold uppercase tracking-wide text-ink-soft">Todo el año</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[...recurrentes, ...marca].map((e) => (
                  <EventCard key={e.id} e={e} thisMonth={false} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ e, thisMonth }: { e: CalendarEvent; thisMonth: boolean }) {
  const pri = PRIORITY_META[e.priority] ?? PRIORITY_META.S;
  return (
    <div className={`flex flex-col rounded-2xl border bg-white p-4 ${thisMonth ? "border-brand/50 ring-1 ring-brand/30" : "border-ink/10"}`}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays size={15} className="text-brand-deep" />
          <span className="text-xs font-semibold text-ink-soft">{e.period}</span>
          {thisMonth && (
            <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Este mes</span>
          )}
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${pri.cls}`}
          title={`Prioridad de campaña: ${pri.label}`}
        >
          {e.priority === "SS" && <Star size={9} className="fill-white" />}
          {e.priority}
        </span>
      </div>
      <h3 className="font-display text-lg font-extrabold text-ink">{e.name}</h3>
      {e.tip && (
        <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-soft">
          <Sparkles size={13} className="mt-0.5 shrink-0 text-brand-deep" /> {e.tip}
        </p>
      )}
    </div>
  );
}
