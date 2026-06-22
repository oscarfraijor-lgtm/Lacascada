import Link from "next/link";
import { Building2, ArrowRight, Check, ExternalLink, Lock, AlertTriangle } from "lucide-react";
import { managedBrands, getSelectedBrandSlug } from "@/lib/brand-admin";
import { entrarMarca } from "../actions";

const RANK: Record<string, number> = { activa: 0, configurada: 1, externa: 2, pendiente: 3 };

export default async function AdminMarcasPage() {
  const brands = managedBrands();
  const selected = await getSelectedBrandSlug();

  const rows = brands
    .map((b) => {
      const state = b.slug === selected ? "activa" : b.configured ? "configurada" : b.deployUrl ? "externa" : "pendiente";
      return { ...b, state };
    })
    .sort((a, b) => (RANK[a.state] ?? 9) - (RANK[b.state] ?? 9) || a.name.localeCompare(b.name));

  return (
    <div className="space-y-5">
      <header>
        <h2 className="font-display text-lg font-extrabold text-ink">Marcas que gestionas</h2>
        <p className="text-sm text-ink-soft">
          Elige la marca con la que quieres trabajar. Entrar cambia todo el panel (campañas,
          inscripciones, canjes y creadoras) a la base de esa marca. Los datos de cada marca
          viven en su propia base y nunca se cruzan.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((b) => (
          <div
            key={b.slug}
            className={`flex flex-col rounded-2xl border p-5 ${
              b.state === "activa" ? "border-brand bg-brand/[0.04]" : "border-ink/10 bg-white"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-cream-deep text-brand-deep">
                  <Building2 size={18} />
                </span>
                <span>
                  <p className="font-display font-extrabold leading-tight text-ink">{b.name}</p>
                  <p className="text-xs text-ink-soft">{b.club}</p>
                </span>
              </span>
              <StateBadge state={b.state} />
            </div>

            <p className="mt-1 grow text-xs text-ink-soft">
              {b.state === "activa" && "Esta es la marca activa en tu panel ahora mismo."}
              {b.state === "configurada" && "Base conectada. Lista para gestionar aquí."}
              {b.state === "externa" && "Se gestiona en su propio deploy."}
              {b.state === "pendiente" && "Falta conectar su base de Airtable en este panel."}
            </p>

            {/* Aviso: marca conectada pero usando la mecánica heredada de Color Dreams */}
            {b.configured && !b.ownMechanics && (
              <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-cream-deep/60 px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft">
                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-brand-deep" />
                Usa la mecánica de Color Dreams. Define niveles y recompensas propios antes de aprobar canjes con GMV.
              </p>
            )}

            <div className="mt-4">
              {b.state === "activa" ? (
                <Link
                  href="/admin"
                  className="font-display flex w-full items-center justify-center gap-1.5 rounded-full bg-lime py-2.5 text-sm font-extrabold text-ink"
                >
                  <Check size={15} /> Estás aquí · ir a campañas
                </Link>
              ) : b.configured ? (
                <form action={entrarMarca}>
                  <input type="hidden" name="slug" value={b.slug} />
                  <button
                    type="submit"
                    className="font-display flex w-full items-center justify-center gap-1.5 rounded-full bg-brand py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-deep"
                  >
                    Entrar <ArrowRight size={15} />
                  </button>
                </form>
              ) : b.deployUrl ? (
                <a
                  href={b.deployUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-display flex w-full items-center justify-center gap-1.5 rounded-full border border-ink/15 py-2.5 text-sm font-extrabold text-ink transition hover:border-brand hover:text-brand"
                >
                  Abrir su deploy <ExternalLink size={14} />
                </a>
              ) : (
                <span className="flex w-full items-center justify-center gap-1.5 rounded-full bg-ink/5 py-2.5 text-sm font-semibold text-ink-soft">
                  <Lock size={14} /> Pendiente de configurar
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-xs text-ink-soft">
        Para agregar una marca: define su identidad y mecánica (niveles/recompensas/campañas) en{" "}
        <code className="rounded bg-cream-deep px-1 py-0.5">lib/brands.ts</code> (copia la plantilla) y conecta su base
        con <code className="rounded bg-cream-deep px-1 py-0.5">AIRTABLE_BASE_&lt;SLUG&gt;</code> en el entorno de este
        deploy. Si su base vive en otra cuenta de Airtable, agrega también{" "}
        <code className="rounded bg-cream-deep px-1 py-0.5">AIRTABLE_TOKEN_&lt;SLUG&gt;</code>.
      </p>
    </div>
  );
}

function StateBadge({ state }: { state: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    activa: { label: "Activa", cls: "bg-lime text-ink" },
    configurada: { label: "Configurada", cls: "bg-brand/15 text-brand-deep" },
    externa: { label: "Deploy externo", cls: "bg-cream-deep text-ink-soft" },
    pendiente: { label: "Pendiente", cls: "bg-ink/5 text-ink-soft" },
  };
  const m = map[state] ?? map.pendiente;
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${m.cls}`}>
      {m.label}
    </span>
  );
}
