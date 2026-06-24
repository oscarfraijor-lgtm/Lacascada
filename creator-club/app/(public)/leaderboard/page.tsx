import Link from "next/link";
import { Star, Users, Globe } from "lucide-react";
import { getLeaderboard, creatorTier } from "@/lib/data";
import { getClubViewer } from "@/lib/club-viewer";
import { BRAND } from "@/lib/schema";
import { tierName } from "@/lib/tiers";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier } = await searchParams;
  const { creator: me } = await getClubViewer();
  const myTier = me ? creatorTier(me.gmvMXN ?? 0) : null;

  // El bracket solicitado solo es válido si existe en el sistema de la marca.
  const validTier = tier && BRAND.tierSystem.tiers.some((t) => t.key === tier) ? tier : undefined;
  const rows = await getLeaderboard(validTier ? { tierKey: validTier } : undefined);
  const bracketName = validTier ? tierName(BRAND.tierSystem, validTier) : null;

  const tabBase = "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition";
  const tabOn = "bg-brand text-white";
  const tabOff = "border border-ink/15 bg-white text-ink-soft hover:border-brand hover:text-brand";

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          {bracketName ? `Ranking · ${BRAND.tierSystem.label} ${bracketName}` : "Ranking del club"}
        </h1>
        <p className="text-sm text-ink-soft">
          {bracketName
            ? "Compites con creadoras de tu tamaño. Mismo nivel, misma cancha."
            : "Las creadoras que más brillan en el club."}
        </p>
      </header>

      {/* Segmentación por categoría: todas vs tu nivel de TikTok. */}
      {myTier && (
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/leaderboard" className={`${tabBase} ${!validTier ? tabOn : tabOff}`}>
            <Globe size={15} /> Todas
          </Link>
          <Link href={`/leaderboard?tier=${myTier.key}`} className={`${tabBase} ${validTier === myTier.key ? tabOn : tabOff}`}>
            <Users size={15} /> Tu categoría · {BRAND.tierSystem.label} {myTier.name}
          </Link>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          {bracketName
            ? "Aún no hay creadoras de tu categoría en el tablero. ¡Sé la primera!"
            : "El ranking se arma con estrellas aprobadas. Aún no hay nadie en el tablero."}
        </p>
      ) : (
        <ol className="divide-y divide-ink/5 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          {rows.map((r) => (
            <li
              key={r.rank}
              className={`flex items-center justify-between px-4 py-3 ${r.isMe ? "bg-lime/30" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`font-display grid h-8 w-8 place-items-center rounded-full font-extrabold ${
                    r.rank <= 3 ? "bg-brand text-white" : "text-brand-deep"
                  }`}
                >
                  {r.rank}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {r.name}
                    {r.isMe && " (tú)"}
                  </p>
                  <p className="text-xs text-ink-soft">{r.handle}</p>
                </div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-sm font-bold text-ink">
                <Star size={13} className="fill-ink" /> {r.stars.toLocaleString("es-MX")}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
