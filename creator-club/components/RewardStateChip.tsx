import { Lock, Check, Clock, Star, Gift, PackageCheck, type LucideIcon } from "lucide-react";
import type { RewardStatusKey } from "@/lib/rewards";

// Chip de estado de una recompensa. Reutilizado en /recompensas y el dashboard.
const MAP: Record<RewardStatusKey, { label: string; cls: string; Icon: LucideIcon }> = {
  disponible: { label: "Disponible", cls: "bg-lime text-ink", Icon: Star },
  desbloqueada: { label: "Desbloqueada", cls: "bg-brand/15 text-brand-deep", Icon: Gift },
  bloqueada: { label: "Bloqueada", cls: "bg-ink/5 text-ink-soft", Icon: Lock },
  solicitada: { label: "En revisión", cls: "bg-brand/15 text-brand-deep", Icon: Clock },
  aprobada: { label: "Aprobada", cls: "bg-lime text-ink", Icon: Check },
  entregada: { label: "Entregada", cls: "bg-ink text-white", Icon: PackageCheck },
  rechazada: { label: "Rechazada", cls: "bg-ink/10 text-ink-soft", Icon: Lock },
};

export default function RewardStateChip({ state }: { state: RewardStatusKey }) {
  const { label, cls, Icon } = MAP[state];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}>
      <Icon size={11} /> {label}
    </span>
  );
}
