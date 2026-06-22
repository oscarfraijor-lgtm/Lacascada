import Link from "next/link";
import { Star, ArrowLeft, Sparkles } from "lucide-react";
import { getCurrentCreator } from "@/lib/session";
import { getStarLedger } from "@/lib/data";

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export default async function HistorialPage() {
  const me = await getCurrentCreator();
  if (!me) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-ink/10 bg-white p-8 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">Historial de estrellas</h1>
        <p className="mt-1 text-sm text-ink-soft">Entra a tu cuenta para ver tu recibo de estrellas.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/registro" className="font-display rounded-full bg-lime px-5 py-2.5 font-extrabold text-ink">
            Únete
          </Link>
          <Link href="/acceso" className="font-display rounded-full border border-ink/15 px-5 py-2.5 font-extrabold text-ink">
            Acceder
          </Link>
        </div>
      </div>
    );
  }

  const ledger = await getStarLedger();
  const total = ledger.reduce((s, e) => s + e.stars, 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="mb-1 flex items-center gap-1 text-xs font-semibold text-brand-deep">
            <ArrowLeft size={13} /> Volver al inicio
          </Link>
          <h1 className="font-display text-2xl font-extrabold text-ink">Historial de estrellas</h1>
          <p className="text-sm text-ink-soft">
            Cada estrella que ganaste, de qué campaña y cuándo. Transparencia total.
          </p>
        </div>
        <div className="rounded-2xl bg-ink px-5 py-3 text-right text-white">
          <div className="flex items-center justify-end gap-1.5">
            <Star size={20} className="fill-lime text-lime" />
            <span className="font-display text-2xl font-black">{total.toLocaleString("es-MX")}</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-white/60">estrellas ganadas</p>
        </div>
      </header>

      {ledger.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
          <Sparkles className="mx-auto text-brand-deep" size={28} />
          <p className="mt-2 text-sm font-semibold text-ink">Aún no ganas estrellas.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Cuando el equipo apruebe tus entregas, aquí verás el recibo línea por línea.
          </p>
          <Link
            href="/campanas"
            className="font-display mt-4 inline-block rounded-full bg-lime px-5 py-2.5 text-sm font-extrabold text-ink"
          >
            Ver campañas
          </Link>
        </div>
      ) : (
        <ol className="divide-y divide-ink/5 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          {ledger.map((e, i) => (
            <li key={`${e.campaignId}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime text-ink">
                  <Star size={16} className="fill-ink" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{e.title}</p>
                  <p className="text-xs text-ink-soft">Entrega aprobada · {fmtDate(e.date)}</p>
                </div>
              </div>
              <span className="font-display shrink-0 text-sm font-extrabold text-brand-deep">
                +{e.stars.toLocaleString("es-MX")}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
