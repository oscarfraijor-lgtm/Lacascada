import Link from "next/link";
import { Star, ChevronRight, ArrowRight, History, Gift, UserCog } from "lucide-react";
import { getClubViewer } from "@/lib/club-viewer";
import { participationsFor, listCampaigns, listOpenCampaigns, misionesFor, type Participation } from "@/lib/store";
import { getMissions, getLeaderboard, getRewardsView, combinedStars } from "@/lib/data";
import { levelForStars, nextLevel, BRAND } from "@/lib/schema";
import type { Campaign } from "@/lib/campaigns";
import TrustBar from "@/components/TrustBar";
import RewardStateChip from "@/components/RewardStateChip";
import AdminPreviewBanner from "@/components/AdminPreviewBanner";
import MissionCard from "@/components/MissionCard";

const pct = (v: number, max: number) => (max <= 0 ? 100 : Math.min(100, Math.round((v / max) * 100)));

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  aprobada: { label: "Aprobada", cls: "border-lime/60 bg-lime/15" },
  entregada: { label: "En revisión", cls: "border-brand/40 bg-brand/5" },
  aceptada: { label: "Aceptada · sube tu video", cls: "border-brand/40 bg-brand/5" },
  rechazada: { label: "Rechazada", cls: "border-ink/10 bg-ink/5 opacity-70" },
  inscrita: { label: "Pendiente", cls: "border-brand/30 bg-white" },
};

export default async function Home() {
  const { creator: session, isAdminPreview } = await getClubViewer();
  if (!session) return <Welcome />;

  const [parts, campaigns, completions] = await Promise.all([
    participationsFor(session.email),
    listCampaigns(),
    misionesFor(session.email),
  ]);
  const byId = new Map(campaigns.map((c) => [c.id, c]));
  // Estrellas reales = entregas aprobadas + misiones completadas (mismo cálculo que getCreator).
  const stars = combinedStars(parts, campaigns, session, completions);
  const myCampaigns = parts
    .map((p) => ({ part: p, c: byId.get(p.campaignId) }))
    .filter((x): x is { part: Participation; c: Campaign } => !!x.c);

  const gmv = session.gmvMXN ?? 0;
  const creatorName = session.name;
  const creatorHandle = session.handle || "";

  const level = levelForStars(stars, gmv);
  const next = nextLevel(level.key);
  const missions = (await getMissions()).filter((m) => !m.done).slice(0, 4);
  const leaderboard = await getLeaderboard();
  const rewardsView = await getRewardsView();

  return (
    <div className="space-y-6">
      {isAdminPreview && <AdminPreviewBanner />}
      {/* Hero personalizado */}
      <section className="overflow-hidden rounded-3xl bg-ink text-white">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-lime">
              {level.badge} {level.name}
            </p>
            <h1 className="font-display mt-1 text-2xl font-extrabold sm:text-3xl">
              Hola, {creatorName.split(" ")[0]}
            </h1>
            {creatorHandle && <p className="text-sm text-white/70">{creatorHandle}</p>}
            <Link href="/cuenta" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-white/70 underline transition hover:text-lime">
              <UserCog size={12} /> Editar perfil
            </Link>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <Star className="fill-lime text-lime" size={28} />
              <span className="font-display text-4xl font-black">{stars.toLocaleString("es-MX")}</span>
            </div>
            <p className="text-xs uppercase tracking-widest text-white/60">estrellas</p>
            <div className="mt-1 flex items-center justify-end gap-3 text-xs font-semibold">
              <Link href="/historial" className="inline-flex items-center gap-1 text-lime underline">
                <History size={12} /> Ver cómo las ganaste
              </Link>
              <Link href="/canjes" className="inline-flex items-center gap-1 text-lime underline">
                <Gift size={12} /> Mis canjes
              </Link>
            </div>
          </div>
        </div>
        {next ? (
          <div className="space-y-3 bg-white/5 px-6 py-5 sm:px-8">
            <p className="text-sm text-white/80">
              Para llegar a <b className="text-lime">{next.badge} {next.name}</b>:
            </p>
            <Bar label="Estrellas" value={stars} max={next.minStars} />
            {next.minGmvMXN > 0 && <Bar label="Ventas atribuibles (MXN)" value={gmv} max={next.minGmvMXN} />}
            <p className="text-xs text-white/50">
              {gmv > 0
                ? `Ventas atribuibles: $${gmv.toLocaleString("es-MX")} MXN${session.gmvDate ? ` · actualizado al ${session.gmvDate}` : ""}`
                : "Tus ventas atribuibles aparecen aquí en cuanto el equipo las registre."}
            </p>
          </div>
        ) : (
          <div className="bg-white/5 px-6 py-5 sm:px-8">
            <p className="text-sm text-white/80">
              ¡Eres <b className="text-lime">{level.badge} {level.name}</b>, el nivel máximo!
            </p>
          </div>
        )}
      </section>

      {/* Mis campañas */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-ink">Mis campañas</h2>
          <Link href="/campanas" className="flex items-center text-sm font-semibold text-brand-deep">
            Ver todas <ChevronRight size={16} />
          </Link>
        </div>
        {myCampaigns.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {myCampaigns.map(({ part, c }) => {
              const chip = STATUS_CHIP[part.status] ?? STATUS_CHIP.inscrita;
              return (
                <div key={c.id} className={`flex items-center justify-between rounded-2xl border p-4 ${chip.cls}`}>
                  <div>
                    <p className="font-semibold text-ink">{c.title}</p>
                    <p className="text-xs text-ink-soft">{chip.label} · {c.tag}</p>
                  </div>
                  <StarChip n={c.stars} />
                </div>
              );
            })}
          </div>
        ) : (
          <Link href="/campanas" className="flex items-center justify-between rounded-2xl border border-dashed border-brand/40 bg-white p-4 text-brand-deep">
            <span className="font-semibold">Aún no te inscribes a ninguna campaña. ¡Empieza aquí!</span>
            <ArrowRight size={18} />
          </Link>
        )}
      </section>

      {/* Misiones + ranking */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-ink">Misiones para ti</h2>
          <Link href="/misiones" className="flex items-center text-sm font-semibold text-brand-deep">
            Ver todas <ChevronRight size={16} />
          </Link>
        </div>
        {missions.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {missions.map((m) => (
              <MissionCard key={m.id} mission={m} readOnly={isAdminPreview} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-4 text-center text-sm text-ink-soft">
            ¡Completaste tus misiones disponibles! Vuelve cuando publiquemos más.
          </p>
        )}
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-ink">Ranking</h2>
            <Link href="/leaderboard" className="flex items-center text-sm font-semibold text-brand-deep">
              Completo <ChevronRight size={16} />
            </Link>
          </div>
          {leaderboard.length ? (
            <ol className="divide-y divide-ink/5 overflow-hidden rounded-2xl border border-ink/10 bg-white">
              {leaderboard.map((r) => (
                <li key={r.rank} className={`flex items-center justify-between px-4 py-3 ${r.isMe ? "bg-lime/20" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-display w-6 text-center font-extrabold text-brand-deep">{r.rank}</span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{r.name}{r.isMe && " (tú)"}</p>
                      <p className="text-xs text-ink-soft">{r.handle}</p>
                    </div>
                  </div>
                  <StarChip n={r.stars} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-4 text-center text-sm text-ink-soft">
              El ranking se arma con estrellas aprobadas. ¡Aún no hay nadie, sé la primera!
            </p>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-ink">Recompensas</h2>
            <Link href="/recompensas" className="flex items-center text-sm font-semibold text-brand-deep">
              Catálogo <ChevronRight size={16} />
            </Link>
          </div>
          <ul className="space-y-3">
            {rewardsView.rewards.slice(0, 4).map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{r.title}</p>
                  <p className="text-xs text-ink-soft">
                    {r.state === "bloqueada" ? r.missing : r.requirement}
                  </p>
                </div>
                <RewardStateChip state={r.state} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

async function Welcome() {
  const campaigns = (await listOpenCampaigns()).slice(0, 3);
  // Tagline de la marca con la última palabra resaltada.
  const taglineWords = BRAND.tagline.replace(/\.$/, "").split(" ");
  const taglineLast = taglineWords.pop() ?? "";
  const taglineHead = taglineWords.join(" ");
  const steps = [
    { n: 1, t: "Regístrate", d: "Cuéntanos de ti en 1 minuto." },
    { n: 2, t: "Participa en campañas", d: "Elige las que van contigo." },
    { n: 3, t: "Gana recompensas", d: "Producto, estrellas y experiencias." },
  ];
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-ink p-8 text-center text-white sm:p-12">
        <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-lime">{BRAND.club} · {BRAND.name}</p>
        <h1 className="font-display mx-auto mt-3 max-w-xl text-3xl font-black sm:text-5xl">
          {taglineHead} <span className="text-lime">{taglineLast}</span>.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-white/80">
          La comunidad de creadoras de {BRAND.name}. Inscríbete, participa en campañas y gana recompensas.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/registro" className="font-display rounded-full bg-lime px-6 py-3 font-extrabold text-ink">
            Quiero unirme
          </Link>
          <Link href="/campanas" className="font-display rounded-full border border-white/40 px-6 py-3 font-extrabold text-white">
            Ver campañas
          </Link>
        </div>
        <p className="mt-4 text-sm text-white/70">
          ¿Ya eres parte?{" "}
          <Link href="/acceso" className="font-semibold text-lime underline">
            Entra con tu correo
          </Link>
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-ink/10 bg-white p-5">
            <span className="font-display grid h-9 w-9 place-items-center rounded-full bg-brand font-extrabold text-white">{s.n}</span>
            <h3 className="font-display mt-3 text-lg font-extrabold text-ink">{s.t}</h3>
            <p className="text-sm text-ink-soft">{s.d}</p>
          </div>
        ))}
      </section>

      <TrustBar />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-ink">Campañas activas</h2>
          <Link href="/campanas" className="flex items-center text-sm font-semibold text-brand-deep">
            Ver todas <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-2xl border border-ink/10 bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">{c.tag}</span>
                <StarChip n={c.stars} />
              </div>
              <h3 className="font-display text-lg font-extrabold text-ink">{c.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{c.brief}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-white/60">
        <span>{label}</span>
        <span>{value.toLocaleString("es-MX")} / {max.toLocaleString("es-MX")}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-lime" style={{ width: pct(value, max) + "%" }} />
      </div>
    </div>
  );
}

function StarChip({ n }: { n: number }) {
  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-sm font-bold text-ink">
      <Star size={13} className="fill-ink" /> {n}
    </span>
  );
}
