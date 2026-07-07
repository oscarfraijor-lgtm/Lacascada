import Link from "next/link";
import { Star, Save, Download, ChevronRight } from "lucide-react";
import { listCreators, listParticipations, listCampaigns, listMisiones, starsFromApproved } from "@/lib/store";
import { levelForStars } from "@/lib/schema";
import { starsFromMissions } from "@/lib/missions";
import { tierForGmv } from "@/lib/tiers";
import { getAdminContext } from "@/lib/brand-admin";
import AdminBrandPending from "@/components/AdminBrandPending";
import AdminFilterList, { type FilterItem } from "@/components/AdminFilterList";
import SubmitButton from "@/components/SubmitButton";
import { capturarGmv } from "../actions";

export default async function AdminCreadorasPage() {
  const ctx = await getAdminContext();
  if (!ctx.configured) return <AdminBrandPending brand={ctx.brand.name} slug={ctx.slug} />;
  const conn = ctx.conn ?? undefined;
  const [creators, parts, campaigns, misiones] = await Promise.all([
    listCreators(conn),
    listParticipations(conn),
    listCampaigns(conn),
    listMisiones(conn),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  const partsByEmail = new Map<string, typeof parts>();
  for (const p of parts) {
    const k = p.creatorEmail.toLowerCase();
    const arr = partsByEmail.get(k);
    if (arr) arr.push(p);
    else partsByEmail.set(k, [p]);
  }
  const misionesByEmail = new Map<string, typeof misiones>();
  for (const m of misiones) {
    const k = m.creatorEmail.toLowerCase();
    const arr = misionesByEmail.get(k);
    if (arr) arr.push(m);
    else misionesByEmail.set(k, [m]);
  }

  const rows = creators
    .map((c) => {
      const mine = partsByEmail.get(c.email.toLowerCase()) ?? [];
      const stars =
        starsFromApproved(mine, campaigns) +
        starsFromMissions(ctx.brand.missions, c, misionesByEmail.get(c.email.toLowerCase()) ?? []);
      const gmv = c.gmvMXN ?? 0;
      return {
        creator: c,
        stars,
        gmv,
        level: levelForStars(stars, gmv, ctx.brand.levels),
        tier: tierForGmv(gmv, ctx.brand.tierSystem),
        aprobadas: mine.filter((p) => p.status === "aprobada").length,
        total: mine.length,
      };
    })
    .sort((a, b) => b.stars - a.stars);

  const tierLabel = ctx.brand.tierSystem.label;
  const levelOptions = ctx.brand.levels.map((l) => ({ value: l.key, label: `${l.badge} ${l.name}` }));
  const items: FilterItem[] = rows.map(({ creator, stars, gmv, level, tier, aprobadas, total }) => ({
    key: creator.id ?? creator.email,
    search: [creator.name, creator.handle, creator.email, creator.affiliateHandle, creator.city, `${tierLabel} ${tier.name}`]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
    status: level.key,
    sort: { stars, gmv, name: creator.name.toLowerCase() },
    node: (
      <div className="rounded-2xl border border-ink/10 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-ink">
              <Link
                href={`/admin/creadoras/${encodeURIComponent(creator.email)}`}
                className="inline-flex items-center gap-0.5 hover:text-brand hover:underline"
              >
                {creator.name} <ChevronRight size={14} className="text-ink-soft" />
              </Link>
              <span className="ml-1 text-xs font-semibold text-ink-soft">
                {level.badge} {level.name}
              </span>
              <span
                className="ml-1.5 inline-flex items-center rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-soft"
                title="Categoría de TikTok (nivel/badge) según su GMV del mes. Eje de las campañas/premios exclusivos."
              >
                {tierLabel} {tier.name}
              </span>
            </p>
            <p className="truncate text-xs text-ink-soft">
              {creator.handle || "Sin handle"}
              <span className="mx-1.5 text-ink/30">·</span>
              {creator.email}
              {creator.city ? <><span className="mx-1.5 text-ink/30">·</span>{creator.city}</> : null}
            </p>
            {creator.portfolio && (
              <p className="mt-0.5 truncate text-xs text-ink-soft">📎 {creator.portfolio}</p>
            )}
            {creator.affiliateHandle ? (
              <p className="mt-0.5 truncate text-xs font-semibold text-brand-deep">
                Afiliado TTS: {creator.affiliateHandle}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-ink-soft/70">Sin afiliado de TikTok Shop registrado</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className="text-xs text-ink-soft">{aprobadas}/{total} campañas</span>
            <span className="flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-sm font-bold text-ink">
              <Star size={13} className="fill-ink" /> {stars.toLocaleString("es-MX")}
            </span>
          </div>
        </div>

        <form action={capturarGmv} className="mt-3 flex flex-wrap items-end gap-2 border-t border-ink/5 pt-3">
          <input type="hidden" name="id" value={creator.id} />
          <label className="block">
            <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-ink-soft">Ventas del mes (MXN)</span>
            <input
              name="gmv"
              type="text"
              inputMode="decimal"
              defaultValue={creator.gmvMXN != null ? creator.gmvMXN.toLocaleString("es-MX") : ""}
              placeholder="Ej. 10,000"
              className="w-32 rounded-lg border border-ink/15 bg-cream/40 px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
            />
          </label>
          <label className="block">
            <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-ink-soft">Actualizado al</span>
            <input
              name="date"
              type="date"
              max={today}
              defaultValue={creator.gmvDate || today}
              className="rounded-lg border border-ink/15 bg-cream/40 px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
            />
          </label>
          <SubmitButton
            pendingLabel="Guardando…"
            className="font-display flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-brand-deep"
          >
            <Save size={13} /> Guardar ventas
          </SubmitButton>
          <span className="ml-auto self-center text-xs text-ink-soft">
            {gmv > 0 ? `$${gmv.toLocaleString("es-MX")} MXN${creator.gmvDate ? ` · al ${creator.gmvDate}` : ""}` : "Sin ventas registradas"}
          </span>
        </form>
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-extrabold text-ink">
          Creadoras ({creators.length})
        </h2>
        {creators.length > 0 && (
          <a
            href="/admin/creadoras/export"
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs font-bold text-ink-soft transition hover:border-brand hover:text-brand"
          >
            <Download size={14} /> Exportar CSV
          </a>
        )}
      </div>

      {/* Guía: qué son las "ventas" y de dónde se sacan (el candado del anti-fuga). */}
      <details className="rounded-2xl border border-brand/20 bg-white px-4 py-3 text-xs text-ink-soft [&_summary]:cursor-pointer">
        <summary className="flex items-center gap-2 font-semibold text-ink">
          <Star size={14} className="fill-lime text-lime" /> ¿Qué pongo en "Ventas del mes" y de dónde lo saco?
        </summary>
        <div className="mt-2 space-y-1.5 pl-6">
          <p>Son las <b>ventas atribuidas a la creadora en TikTok Shop</b> este mes (lo que en TikTok aparece como "GMV"). Es lo que <b>desbloquea sus premios con costo</b>: sin ventas, no se le entrega producto/dinero (así se protege la marca).</p>
          <p className="font-semibold text-ink">Cómo obtenerlo (3 pasos):</p>
          <p>1. Entra a <b>TikTok Shop · Analytics</b> de la creadora (o al export mensual).</p>
          <p>2. Copia su <b>GMV / ventas del mes</b> (el monto en pesos).</p>
          <p>3. Pégalo en "Ventas del mes" de esa creadora y dale <b>Guardar ventas</b>. Puedes pegarlo con coma (10,000).</p>
        </div>
      </details>

      {creators.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          Todavía no hay creadoras inscritas.
        </p>
      ) : (
        <AdminFilterList
          items={items}
          statuses={levelOptions}
          sorts={[
            { value: "stars-desc", label: "Más estrellas", field: "stars", dir: "desc" },
            { value: "gmv-desc", label: "Más ventas", field: "gmv", dir: "desc" },
            { value: "name-asc", label: "Nombre A-Z", field: "name", dir: "asc" },
          ]}
          searchPlaceholder="Buscar por nombre, correo, handle o afiliado…"
          allStatusLabel="Todos los niveles"
          emptyLabel="Ninguna creadora coincide con tu búsqueda."
        />
      )}
    </div>
  );
}
