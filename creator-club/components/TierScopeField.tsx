import type { TierSystem } from "@/lib/tiers";

// Checkboxes para el scope por CATEGORÍA de creadora (nivel/badge de TikTok).
// name="tiers" (las lee parseTierScope en las server actions). Vacío = abierta a
// todas; marcar uno o más niveles = exclusiva para esas categorías (compiten por
// tamaño). Se usa igual en el form de campañas y en el de premios.
export default function TierScopeField({
  system,
  selected = [],
}: {
  system: TierSystem;
  selected?: string[];
}) {
  return (
    <fieldset className="rounded-xl border border-ink/15 bg-cream/40 p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        Exclusiva por categoría · {system.label} de TikTok
      </legend>
      <p className="mb-2 text-[11px] text-ink-soft">
        Déjalo vacío para abrirla a todas. Marca uno o más niveles para que solo esas
        creadoras la vean y compitan entre ellas (por su tamaño en TikTok).
      </p>
      <div className="flex flex-wrap gap-2">
        {system.tiers.map((t) => (
          <label
            key={t.key}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm font-semibold text-ink"
          >
            <input
              type="checkbox"
              name="tiers"
              value={t.key}
              defaultChecked={selected.includes(t.key)}
              className="h-4 w-4 accent-brand"
            />
            {t.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
