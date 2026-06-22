import Link from "next/link";
import { Star, Clock, Check, Send, AlertCircle, ListChecks } from "lucide-react";
import { getCurrentCreator } from "@/lib/session";
import { participationsFor, listOpenCampaigns, type Participation } from "@/lib/store";
import { participar, entregarVideo } from "./actions";
import TrustBar from "@/components/TrustBar";
import { BRAND } from "@/lib/schema";

export default async function CampanasPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenida?: string }>;
}) {
  const { bienvenida } = await searchParams;
  const me = await getCurrentCreator();
  const [campaigns, mine] = await Promise.all([
    listOpenCampaigns(),
    me ? participationsFor(me.email) : Promise.resolve([]),
  ]);
  const byCampaign = new Map(mine.map((p) => [p.campaignId, p]));

  return (
    <div className="space-y-6">
      {bienvenida && me && (
        <p className="rounded-lg bg-lime/40 px-3 py-2 text-center text-sm font-semibold text-ink">
          ¡Bienvenida, {me.name.split(" ")[0]}! Elige una campaña para empezar.
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

      <TrustBar />

      {campaigns.length === 0 && (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink-soft">
          No hay campañas activas por ahora. ¡Vuelve pronto!
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {campaigns.map((c) => {
          const part = byCampaign.get(c.id);
          return (
            <div key={c.id} className="flex flex-col rounded-3xl border border-ink/10 bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">
                  {c.tag}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-sm font-bold text-ink">
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
                ) : me ? (
                  <form action={participar}>
                    <input type="hidden" name="campaignId" value={c.id} />
                    <button
                      type="submit"
                      className="font-display w-full rounded-full bg-brand py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-deep"
                    >
                      Participar
                    </button>
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
          placeholder="https://tiktok.com/@tu/video..."
          className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2 text-sm text-ink outline-none placeholder:text-ink/30 focus:border-brand focus:bg-white"
        />
        <button
          type="submit"
          title="Enviar mi video"
          className="font-display flex shrink-0 items-center gap-1 rounded-xl bg-brand px-3 py-2 text-sm font-extrabold text-white transition hover:bg-brand-deep"
        >
          <Send size={14} /> {part.status === "entregada" ? "Actualizar" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
