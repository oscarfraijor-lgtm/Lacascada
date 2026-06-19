import Link from "next/link";
import { Star, Check, ShoppingBag } from "lucide-react";
import { getCreator, getMissions } from "@/lib/data";
import type { MissionCategory } from "@/lib/schema";

const CAT_LABEL: Record<MissionCategory, string> = {
  perfil: "Tu perfil",
  contenido: "Contenido",
  venta: "Ventas (valen más)",
  live: "Lives",
  comunidad: "Comunidad",
};
const ORDER: MissionCategory[] = ["perfil", "contenido", "venta", "live", "comunidad"];

export default async function MisionesPage() {
  const creator = await getCreator();
  if (!creator) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-ink/10 bg-white p-8 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">Misiones</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Entra a tu cuenta para ver tus misiones y estrellas.
        </p>
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
  const missions = await getMissions(creator);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">Misiones</h1>
        <p className="text-sm text-ink-soft">
          Completa misiones, gana estrellas y sube de nivel. Las de venta valen más.
        </p>
      </header>

      {ORDER.map((cat) => {
        const items = missions.filter((m) => m.category === cat);
        if (!items.length) return null;
        return (
          <section key={cat}>
            <h2 className="font-display mb-2 text-sm font-bold uppercase tracking-wider text-brand-deep">
              {CAT_LABEL[cat]}
            </h2>
            <ul className="space-y-2">
              {items.map((m) => (
                <li
                  key={m.id}
                  className={`flex items-center justify-between rounded-2xl border p-4 ${
                    m.done ? "border-lime/60 bg-lime/15" : "border-ink/10 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3 pr-3">
                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                        m.done ? "bg-lime text-ink" : "bg-brand/15 text-brand-deep"
                      }`}
                    >
                      {m.done ? <Check size={15} /> : <Star size={14} />}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">
                        {m.title}
                        {m.requiresSale && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-brand-deep">
                            <ShoppingBag size={10} /> con venta
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-ink-soft">{m.detail}</p>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-sm font-bold text-ink">
                    <Star size={13} className="fill-ink" /> {m.stars}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
