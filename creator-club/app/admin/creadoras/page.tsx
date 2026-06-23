import Link from "next/link";
import { Star, Save, Download, ChevronRight } from "lucide-react";
import { listCreators, listParticipations, listCampaigns, starsFromApproved } from "@/lib/store";
import { levelForStars } from "@/lib/schema";
import { getAdminContext } from "@/lib/brand-admin";
import AdminBrandPending from "@/components/AdminBrandPending";
import AdminFilterList, { type FilterItem } from "@/components/AdminFilterList";
import SubmitButton from "@/components/SubmitButton";
import { capturarGmv } from "../actions";

export default async function AdminCreadorasPage() {
  const ctx = await getAdminContext();
  if (!ctx.configured) return <AdminBrandPending brand={ctx.brand.name} slug={ctx.slug} />;
  const conn = ctx.conn ?? undefined;
  const [creators, parts, campaigns] = await Promise.all([
    listCreators(conn),
    listParticipations(conn),
    listCampaigns(conn),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  const partsByEmail = new Map<string, typeof parts>();
  for (const p of parts) {
    const k = p.creatorEmail.toLowerCase();
    const arr = partsByEmail.get(k);
    if (arr) arr.push(p);
    else partsByEmail.set(k, [p]);
  }

  const rows = creators
    .map((c) => {
      const mine = partsByEmail.get(c.email.toLowerCase()) ?? [];
      const stars = starsFromApproved(mine, campaigns);
      const gmv = c.gmvMXN ?? 0;
      return {
        creator: c,
        stars,
        gmv,
        level: levelForStars(stars, gmv, ctx.brand.levels),
        aprobadas: mine.filter((p) => p.status === "aprobada").length,
        total: mine.length,
      };
    })
    .sort((a, b) => b.stars - a.stars);

  const levelOptions = ctx.brand.levels.map((l) => ({ value: l.key, label: `${l.badge} ${l.name}` }));
  const items: FilterItem[] = rows.map(({ creator, stars, gmv, level, aprobadas, total }) => ({
    key: creator.id ?? creator.email,
    search: [creator.name, creator.handle, creator.email, creator.affiliateHandle, creator.city]
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
            <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-ink-soft">GMV atribuido (MXN)</span>
            <input
              name="gmv"
              type="number"
              min={0}
              defaultValue={creator.gmvMXN ?? ""}
              placeholder="0"
              className="w-32 rounded-lg border border-ink/15 bg-cream/40 px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
            />
          </label>
          <label className="block">
            <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-ink-soft">Actualizado al</span>
            <input
              name="date"
              type="date"
              defaultValue={creator.gmvDate || today}
              className="rounded-lg border border-ink/15 bg-cream/40 px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand focus:bg-white"
            />
          </label>
          <SubmitButton
            pendingLabel="Guardando…"
            className="font-display flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-brand-deep"
          >
            <Save size={13} /> Guardar GMV
          </SubmitButton>
          <span className="ml-auto self-center text-xs text-ink-soft">
            {gmv > 0 ? `$${gmv.toLocaleString("es-MX")} MXN${creator.gmvDate ? ` · al ${creator.gmvDate}` : ""}` : "Sin GMV registrado"}
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
            { value: "gmv-desc", label: "Mayor GMV", field: "gmv", dir: "desc" },
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
