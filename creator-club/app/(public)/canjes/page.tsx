import Link from "next/link";
import { Gift, ArrowLeft, Clock, Check, X, Inbox, PackageCheck } from "lucide-react";
import { getCurrentCreator } from "@/lib/session";
import { canjesFor, type Canje } from "@/lib/store";

function fmtDate(iso?: string): string {
  if (!iso) return "Sin fecha";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Sin fecha";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

// Estado de la solicitud de canje, en lenguaje de la creadora (no el del equipo).
const STATUS_META: Record<
  string,
  { label: string; cls: string; Icon: typeof Clock; note: string }
> = {
  solicitada: {
    label: "En revisión",
    cls: "bg-brand/15 text-brand-deep",
    Icon: Clock,
    note: "El equipo está revisando tu solicitud y te contacta para coordinar la entrega.",
  },
  aprobada: {
    label: "Aprobada",
    cls: "bg-lime text-ink",
    Icon: Check,
    note: "¡Aprobada! El equipo te contacta para entregarte tu recompensa.",
  },
  entregada: {
    label: "Entregada",
    cls: "bg-ink text-white",
    Icon: PackageCheck,
    note: "Tu recompensa ya fue entregada. ¡Disfrútala!",
  },
  rechazada: {
    label: "Rechazada",
    cls: "bg-ink/10 text-ink-soft",
    Icon: X,
    note: "No procedió esta vez. Si vuelves a cumplir el requisito, puedes solicitarla de nuevo desde Recompensas.",
  },
};

export default async function CanjesPage() {
  const me = await getCurrentCreator();
  if (!me) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-ink/10 bg-white p-8 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">Mis canjes</h1>
        <p className="mt-1 text-sm text-ink-soft">Entra a tu cuenta para ver tus solicitudes de canje.</p>
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

  const canjes = await canjesFor(me.email);
  // Lo que necesita seguimiento primero (solicitada), luego aprobadas, luego rechazadas.
  const ORDER: Record<string, number> = { solicitada: 0, aprobada: 1, entregada: 2, rechazada: 3 };
  const rows = [...canjes].sort(
    (a, b) =>
      (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9) ||
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
  );
  const enRevision = canjes.filter((c) => c.status === "solicitada").length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="mb-1 flex items-center gap-1 text-xs font-semibold text-brand-deep">
            <ArrowLeft size={13} /> Volver al inicio
          </Link>
          <h1 className="font-display text-2xl font-extrabold text-ink">Mis canjes</h1>
          <p className="text-sm text-ink-soft">
            Las recompensas que has solicitado y en qué va cada una.
          </p>
        </div>
        <Link
          href="/recompensas"
          className="font-display inline-flex items-center gap-1.5 rounded-full bg-lime px-4 py-2 text-sm font-extrabold text-ink"
        >
          <Gift size={15} /> Ver recompensas
        </Link>
      </header>

      {enRevision > 0 && (
        <p className="rounded-2xl border border-brand/15 bg-white px-4 py-3 text-sm text-ink-soft">
          <Clock size={13} className="mr-1 inline align-text-bottom text-brand-deep" />
          Tienes <b className="text-ink">{enRevision}</b> {enRevision === 1 ? "solicitud" : "solicitudes"} en revisión.
        </p>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
          <Inbox className="mx-auto text-brand-deep" size={28} />
          <p className="mt-2 text-sm font-semibold text-ink">Aún no has solicitado canjes.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Cuando una recompensa esté desbloqueada, podrás solicitarla desde el catálogo.
          </p>
          <Link
            href="/recompensas"
            className="font-display mt-4 inline-block rounded-full bg-lime px-5 py-2.5 text-sm font-extrabold text-ink"
          >
            Ver recompensas
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((c) => (
            <CanjeCard key={c.id ?? `${c.rewardId}-${c.createdAt}`} c={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CanjeCard({ c }: { c: Canje }) {
  const meta = STATUS_META[c.status] ?? STATUS_META.solicitada;
  const Icon = meta.Icon;
  return (
    <li className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand-deep">
            <Gift size={16} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink">{c.rewardTitle || c.rewardId}</p>
            <p className="text-xs text-ink-soft">Solicitado el {fmtDate(c.createdAt)}</p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}
        >
          <Icon size={11} /> {meta.label}
        </span>
      </div>
      <p className="mt-2 border-t border-ink/5 pt-2 text-xs text-ink-soft">{meta.note}</p>
      {c.status === "rechazada" && c.reason && (
        <p className="mt-1 text-xs font-semibold text-brand-deep">Motivo: {c.reason}</p>
      )}
    </li>
  );
}
