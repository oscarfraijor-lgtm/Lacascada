import Link from "next/link";
import { Star, Lock, Gift, Clock, Check, PackageCheck } from "lucide-react";
import { getRewardsView, type RewardView } from "@/lib/data";
import { BRAND } from "@/lib/schema";
import RewardStateChip from "@/components/RewardStateChip";
import SubmitButton from "@/components/SubmitButton";
import { solicitarCanje } from "./actions";

const KIND_LABEL: Record<string, string> = {
  estatus: "Estatus",
  producto: "Producto",
  boost: "Comisión",
  cash: "Cash",
  experiencia: "Experiencia",
};

export default async function RecompensasPage() {
  const view = await getRewardsView();

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Recompensas</h1>
          <p className="text-sm text-ink-soft">
            Tu estatus es gratis. Lo que tiene costo (producto, boosts, experiencias) se
            desbloquea con tus ventas atribuibles en TikTok Shop.
          </p>
        </div>
        {view.signedIn && (
          <Link
            href="/canjes"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
          >
            <Gift size={15} /> Mis canjes
          </Link>
        )}
      </header>

      {view.signedIn ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-ink">
            <Star size={15} className="fill-lime text-lime" />
            {view.stars.toLocaleString("es-MX")} estrellas
          </span>
          <span className="text-ink/25">·</span>
          <span className="font-semibold text-ink">
            {view.gmvMXN > 0 ? `$${view.gmvMXN.toLocaleString("es-MX")} MXN en ventas` : "Sin ventas registradas"}
          </span>
          {view.gmvMXN > 0 && view.gmvDate && (
            <span className="text-xs text-ink-soft">· actualizado al {view.gmvDate}</span>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/20 bg-white px-4 py-3">
          <p className="text-sm text-ink-soft">Inicia sesión para ver tu progreso y canjear.</p>
          <div className="flex gap-2">
            <Link href="/registro" className="font-display rounded-full bg-lime px-4 py-2 text-sm font-extrabold text-ink">
              Únete
            </Link>
            <Link href="/acceso" className="font-display rounded-full border border-ink/15 px-4 py-2 text-sm font-extrabold text-ink">
              Acceder
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {view.rewards.map((r) => (
          <RewardCard key={r.id} r={r} signedIn={view.signedIn} />
        ))}
      </div>
    </div>
  );
}

function RewardCard({ r, signedIn }: { r: RewardView; signedIn: boolean }) {
  const dim = signedIn && (r.state === "bloqueada" || r.state === "rechazada");
  return (
    <div className={`flex flex-col rounded-2xl border border-ink/10 bg-white p-5 ${dim ? "opacity-90" : ""}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">
            {KIND_LABEL[r.kind] ?? r.kind}
          </span>
          <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
            Paga: {r.payer === "marca" ? BRAND.name : "Club"}
          </span>
        </div>
        {signedIn && <RewardStateChip state={r.state} />}
      </div>

      <h3 className="font-display text-lg font-extrabold text-ink">{r.title}</h3>
      <p className="mt-1 grow text-sm text-ink-soft">{r.detail}</p>

      <div className="mt-3 border-t border-ink/5 pt-3">
        <RewardFooter r={r} signedIn={signedIn} />
      </div>
    </div>
  );
}

// Pie de la tarjeta: criterio + acción, según el estado real.
function RewardFooter({ r, signedIn }: { r: RewardView; signedIn: boolean }) {
  if (!signedIn) {
    return <p className="text-xs font-semibold text-brand-deep">{r.requirement}</p>;
  }

  switch (r.state) {
    case "disponible":
      return (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
          <Check size={13} className="text-brand-deep" /> Se activa sola al subir de nivel.
        </p>
      );

    case "desbloqueada":
      return (
        <form action={solicitarCanje} className="space-y-2">
          <input type="hidden" name="rewardId" value={r.id} />
          <p className="text-xs font-semibold text-brand-deep">{r.requirement}</p>
          <SubmitButton className="font-display flex w-full items-center justify-center gap-1.5 rounded-full bg-brand py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-deep">
            <Gift size={15} /> Solicitar canje
          </SubmitButton>
        </form>
      );

    case "solicitada":
      return (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-deep">
          <Clock size={13} /> Solicitud enviada. El equipo la revisa y te contacta.
        </p>
      );

    case "aprobada":
      return (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          <Check size={13} className="text-brand-deep" /> Canje aprobado. El equipo te contacta para entregarlo.
        </p>
      );

    case "entregada":
      return (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          <PackageCheck size={13} className="text-brand-deep" /> Entregada. ¡Disfrútala!
        </p>
      );

    case "rechazada":
      return (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-brand-deep">
            Rechazado{r.reason ? `: ${r.reason}` : ""}.
          </p>
          {r.unlocked ? (
            <form action={solicitarCanje}>
              <input type="hidden" name="rewardId" value={r.id} />
              <SubmitButton className="font-display flex w-full items-center justify-center gap-1.5 rounded-full bg-brand py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-deep">
                <Gift size={15} /> Solicitar de nuevo
              </SubmitButton>
            </form>
          ) : (
            <p className="flex items-start gap-1.5 text-xs text-ink-soft">
              <Lock size={13} className="mt-0.5 shrink-0" /> {r.missing}
            </p>
          )}
        </div>
      );

    case "bloqueada":
    default:
      return (
        <p className="flex items-start gap-1.5 text-xs text-ink-soft">
          <Lock size={13} className="mt-0.5 shrink-0" /> {r.missing}
        </p>
      );
  }
}
