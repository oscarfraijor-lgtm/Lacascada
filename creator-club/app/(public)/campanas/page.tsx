import Link from "next/link";
import { Star, Clock, Check, Send, AlertCircle, ListChecks, Users, Eye, Lock, CalendarDays, ArrowRight } from "lucide-react";
import { getClubViewer } from "@/lib/club-viewer";
import { participationsFor, listOpenCampaigns, listParticipations, type Participation } from "@/lib/store";
import SubmitButton from "@/components/SubmitButton";
import { participar, entregarVideo } from "./actions";
import TrustBar from "@/components/TrustBar";
import AdminPreviewBanner from "@/components/AdminPreviewBanner";
import { BRAND } from "@/lib/schema";
import { creatorTier } from "@/lib/data";
import { tierInScope, tierName } from "@/lib/tiers";

export default async function CampanasPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenida?: string; lleno?: string; err?: string; nocat?: string }>;
}) {
  const { bienvenida, lleno, err, nocat } = await searchParams;
  const { creator: me, isAdminPreview } = await getClubViewer();
  const [campaigns, mine, allParts] = await Promise.all([
    listOpenCampaigns(),
    me ? participationsFor(me.email) : Promise.resolve([]),
    listParticipations(),
  ]);
  const byCampaign = new Map(mine.map((p) => [p.campaignId, p]));
  // Conteo de inscripciones por campaña (para el cupo).
  const countByCampaign = new Map<string, number>();
  for (const p of allParts) countByCampaign.set(p.campaignId, (countByCampaign.get(p.campaignId) ?? 0) + 1);

  // CATEGORÍA del viewer (nivel/badge de TikTok según su GMV del mes). TODAS las
  // campañas se muestran (las de otros niveles son aspiracionales); pero solo se
  // PARTICIPA en las de la categoría propia (o abiertas). El gate es por nivel exacto.
  const myTier = me ? creatorTier(me.gmvMXN ?? 0) : null;
  const viewerTierKey = myTier?.key ?? null;

  return (
    <div className="space-y-6">
      {isAdminPreview && <AdminPreviewBanner />}
      {bienvenida && me && (
        <p className="rounded-lg bg-lime/40 px-3 py-2 text-center text-sm font-semibold text-ink">
          ¡Bienvenida, {me.name.split(" ")[0]}! Elige una campaña para empezar.
        </p>
      )}
      {lleno && (
        <p className="rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand-deep">
          Esa campaña ya llegó a su cupo. ¡Explora las demás!
        </p>
      )}
      {nocat && (
        <p className="rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand-deep">
          Esa campaña es exclusiva para otra categoría de creadora. ¡Tienes otras disponibles para tu nivel!
        </p>
      )}
      {err === "link" && (
        <p className="rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand-deep">
          Pega un link completo que empiece con https:// para enviar tu video.
        </p>
      )}

      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Campañas</h1>
          <p className="text-sm text-ink-soft">
            Inscríbete a las campañas activas de {BRAND.name} y gana recompensas.
          </p>
        </div>
        {!me && (
          <Link
            href="/registro"
            className="font-display rounded-full bg-lime px-4 py-2 text-sm font-extrabold text-ink"
          >
            Regístrate para participar
          </Link>
        )}
      </header>

      {/* Contenido: calendario de fechas clave (cuándo crear) */}
      <Link
        href="/calendario"
        className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 transition hover:border-brand/40"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-ink">
          <CalendarDays size={18} className="text-brand-deep" />
          Calendario de contenido: las fechas grandes de TikTok Shop para planear tus videos
        </span>
        <ArrowRight size={16} className="shrink-0 text-brand-deep" />
      </Link>

      <TrustBar />

      {campaigns.length === 0 && (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          No hay campañas activas por ahora. ¡Vuelve pronto!
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {campaigns.map((c) => {
          const part = byCampaign.get(c.id);
          const hasCupo = !!c.cupo && c.cupo > 0;
          const taken = countByCampaign.get(c.id) ?? 0;
          const full = hasCupo && taken >= (c.cupo ?? 0);
          const exclusive = !!c.tiers && c.tiers.length > 0;
          // Creadora logueada fuera del nivel de una campaña exclusiva (y no inscrita
          // ya): la ve, pero no puede participar. Gate por nivel exacto.
          const tierLockedForMe = !!me && !part && !tierInScope(c.tiers, viewerTierKey);
          return (
            <div key={c.id} className="flex flex-col rounded-3xl border border-ink/10 bg-white p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">
                    {c.tag}
                  </span>
                  {exclusive && (
                    <span
                      className="flex items-center gap-1 rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-lime"
                      title={`Compite solo entre creadoras nivel ${c.tiers!.map((k) => tierName(BRAND.tierSystem, k)).join(", ")}`}
                    >
                      <Lock size={10} /> Exclusiva · {c.tiers!.map((k) => tierName(BRAND.tierSystem, k)).join(", ")}
                    </span>
                  )}
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-sm font-bold text-ink">
                  <Star size={13} className="fill-ink" /> {c.stars}
                </span>
              </div>
              <h3 className="font-display text-xl font-extrabold text-ink">{c.title}</h3>
              <p className="mt-1 grow text-sm text-ink-soft">{c.brief}</p>
              <div className="mt-3 space-y-1 text-xs text-ink-soft">
                <p>
                  🎁 <b className="text-ink">{c.reward}</b>
                </p>
                <p className="flex items-center gap-1">
                  <Clock size={12} /> {c.deadline}
                </p>
                {hasCupo && (
                  <p className={`flex items-center gap-1 font-semibold ${full ? "text-brand-deep" : "text-ink-soft"}`}>
                    <Users size={12} /> {full ? "Cupo lleno" : `${taken}/${c.cupo} lugares`}
                  </p>
                )}
                {c.requirements && (
                  <p className="flex items-start gap-1">
                    <ListChecks size={12} className="mt-0.5 shrink-0" />
                    <span>Para calificar: {c.requirements}</span>
                  </p>
                )}
              </div>
              <div className="mt-4">
                {part ? (
                  <JoinedBlock part={part} campaignId={c.id} stars={c.stars} />
                ) : isAdminPreview ? (
                  <span className="font-display flex w-full items-center justify-center gap-1.5 rounded-full bg-ink/5 py-2.5 text-sm font-extrabold text-ink-soft">
                    <Eye size={15} /> Vista de admin
                  </span>
                ) : tierLockedForMe ? (
                  <LockedTierBlock tiers={c.tiers ?? []} myTierName={myTier?.name} />
                ) : full ? (
                  <span className="font-display flex w-full items-center justify-center gap-1.5 rounded-full bg-ink/5 py-2.5 text-sm font-extrabold text-ink-soft">
                    <Users size={15} /> Cupo lleno
                  </span>
                ) : me ? (
                  <form action={participar}>
                    <input type="hidden" name="campaignId" value={c.id} />
                    <SubmitButton className="font-display w-full rounded-full bg-brand py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-deep">
                      Participar
                    </SubmitButton>
                  </form>
                ) : (
                  <Link
                    href="/registro"
                    className="font-display block rounded-full bg-brand/10 py-2.5 text-center text-sm font-extrabold text-brand-deep"
                  >
                    Regístrate para participar
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Campaña exclusiva de OTRO nivel: visible (aspiracional) pero no participable.
// Mensaje neutral (sirve igual para una creadora más chica o más grande que el nivel).
function LockedTierBlock({ tiers, myTierName }: { tiers: string[]; myTierName?: string }) {
  const names = tiers.map((k) => tierName(BRAND.tierSystem, k)).join(", ");
  return (
    <div className="rounded-2xl bg-ink/[0.04] px-3 py-2.5 text-center">
      <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-soft">
        <Lock size={14} /> Exclusiva para {names}
      </p>
      {myTierName && (
        <p className="mt-0.5 text-[11px] text-ink-soft">
          Tu categoría es {myTierName}. Compite en las campañas de tu nivel.
        </p>
      )}
    </div>
  );
}

// Bloque según el estado de la inscripción de la creadora.
function JoinedBlock({
  part,
  campaignId,
  stars,
}: {
  part: Participation;
  campaignId: string;
  stars: number;
}) {
  if (part.status === "aprobada") {
    return (
      <span className="flex items-center justify-center gap-1.5 rounded-full bg-lime py-2.5 text-sm font-bold text-ink">
        <Check size={16} /> Aprobada · +{stars} estrellas
      </span>
    );
  }

  if (part.status === "inscrita") {
    return (
      <div className="rounded-2xl bg-cream-deep/60 px-3 py-2.5 text-center text-sm font-semibold text-ink">
        <Clock size={14} className="mr-1 inline" /> En revisión
        <p className="mt-0.5 text-xs font-normal text-ink-soft">Te avisamos cuando te aceptemos.</p>
      </div>
    );
  }

  // aceptada | entregada | rechazada -> puede subir / actualizar su link
  return (
    <div className="space-y-2">
      {part.status === "aceptada" && (
        <p className="text-sm font-semibold text-brand-deep">
          🎉 ¡Te aceptamos! Sube el link de tu video.
        </p>
      )}
      {part.status === "entregada" && (
        <p className="flex items-center gap-1 text-sm font-semibold text-ink">
          <Check size={14} className="text-brand-deep" /> Video recibido, en revisión.
        </p>
      )}
      {part.status === "rechazada" && (
        <p className="flex items-start gap-1 text-sm font-semibold text-brand-deep">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>Rechazada{part.reason ? `: ${part.reason}` : ""}. Corrige y reenvía.</span>
        </p>
      )}
      <form action={entregarVideo} className="flex gap-2">
        <input type="hidden" name="campaignId" value={campaignId} />
        <input
          name="link"
          type="url"
          required
          defaultValue={part.link}
          aria-label="Link de tu video"
          placeholder="https://tiktok.com/@tu/video..."
          className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2 text-sm text-ink outline-none placeholder:text-ink/50 focus:border-brand focus:bg-white"
        />
        <SubmitButton
          pendingLabel="…"
          className="font-display flex shrink-0 items-center gap-1 rounded-xl bg-brand px-3 py-2 text-sm font-extrabold text-white transition hover:bg-brand-deep"
        >
          <Send size={14} /> {part.status === "entregada" ? "Actualizar" : "Enviar"}
        </SubmitButton>
      </form>
      <p className="text-[11px] text-ink-soft/80">
        Al enviar autorizas el uso de tu video en redes y anuncios de la marca (
        <Link href="/legal" target="_blank" className="underline">
          términos
        </Link>
        ).
      </p>
    </div>
  );
}
