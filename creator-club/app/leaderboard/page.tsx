import { Star } from "lucide-react";
import { getLeaderboard } from "@/lib/data";

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">Ranking del club</h1>
        <p className="text-sm text-ink-soft">Las creadoras que más brillan este mes.</p>
      </header>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          El ranking se arma con estrellas aprobadas. Aún no hay nadie en el tablero.
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
