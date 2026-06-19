import { Star } from "lucide-react";
import { listCreators, listParticipations, listCampaigns, starsFromApproved } from "@/lib/store";
import { levelForStars } from "@/lib/schema";

export default async function AdminCreadorasPage() {
  const [creators, parts, campaigns] = await Promise.all([
    listCreators(),
    listParticipations(),
    listCampaigns(),
  ]);

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
      return {
        creator: c,
        stars,
        level: levelForStars(stars, 0),
        aprobadas: mine.filter((p) => p.status === "aprobada").length,
        total: mine.length,
      };
    })
    .sort((a, b) => b.stars - a.stars);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-extrabold text-ink">
        Creadoras ({creators.length})
      </h2>

      {creators.length === 0 && (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          Todavía no hay creadoras inscritas.
        </p>
      )}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <ul className="divide-y divide-ink/5">
            {rows.map(({ creator, stars, level, aprobadas, total }) => (
              <li key={creator.id ?? creator.email} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {creator.name}{" "}
                    <span className="ml-1 text-xs font-semibold text-ink-soft">
                      {level.badge} {level.name}
                    </span>
                  </p>
                  <p className="truncate text-xs text-ink-soft">
                    {creator.handle || "—"}
                    <span className="mx-1.5 text-ink/30">·</span>
                    {creator.email}
                    {creator.city ? (
                      <>
                        <span className="mx-1.5 text-ink/30">·</span>
                        {creator.city}
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-xs text-ink-soft">
                    {aprobadas}/{total} campañas
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-sm font-bold text-ink">
                    <Star size={13} className="fill-ink" /> {stars.toLocaleString("es-MX")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
