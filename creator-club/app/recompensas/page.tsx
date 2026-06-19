import { getRewards } from "@/lib/data";

const KIND_LABEL: Record<string, string> = {
  estatus: "Estatus",
  producto: "Producto",
  boost: "Comisión",
  cash: "Cash",
  experiencia: "Experiencia",
};

export default async function RecompensasPage() {
  const rewards = await getRewards();
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">Recompensas</h1>
        <p className="text-sm text-ink-soft">
          Canjea tus estrellas y tu GMV por producto, boosts y experiencias.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {rewards.map((r) => (
          <div key={r.id} className="flex flex-col rounded-2xl border border-ink/10 bg-white p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">
                {KIND_LABEL[r.kind] ?? r.kind}
              </span>
              <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                Paga: {r.payer === "marca" ? "Color Dreams" : "Club"}
              </span>
            </div>
            <h3 className="font-display text-lg font-extrabold text-ink">{r.title}</h3>
            <p className="mt-1 text-sm text-ink-soft">{r.detail}</p>
            <p className="mt-3 text-xs font-semibold text-brand-deep">{r.cost}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
