import Link from "next/link";
import { Zap, Gift, Clock, Check, AlertCircle, Image as ImageIcon, ArrowDown } from "lucide-react";
import { getClubViewer } from "@/lib/club-viewer";
import { activacionesFor, type Activacion } from "@/lib/store";
import { ACTIVACIONES, ACTIVACION_TIPOS, getActivacionMeta, type ActivacionMeta, type TutorialStep } from "@/lib/activaciones";
import { BRAND } from "@/lib/schema";
import SubmitButton from "@/components/SubmitButton";
import AdminPreviewBanner from "@/components/AdminPreviewBanner";
import { solicitarActivacion } from "./actions";

const TIPO_ICON = { flash_sale: Zap, giveaway: Gift } as const;

export default async function ActivacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { ok, err } = await searchParams;
  const { creator: me, isAdminPreview } = await getClubViewer();
  const mine = me && !isAdminPreview ? await activacionesFor(me.email) : [];
  // La última solicitud por tipo (para mostrar su estado actual).
  const latestByTipo = new Map<string, Activacion>();
  for (const a of [...mine].sort((x, y) => (x.createdAt ?? "").localeCompare(y.createdAt ?? ""))) {
    latestByTipo.set(a.tipo, a);
  }

  return (
    <div className="space-y-6">
      {isAdminPreview && <AdminPreviewBanner />}

      {ok && me && (
        <p className="rounded-lg bg-lime/40 px-3 py-2 text-center text-sm font-semibold text-ink">
          ¡Listo! El equipo recibió tu solicitud y la activa en tu Live. Te avisamos por correo.
        </p>
      )}
      {err === "usuario" && (
        <p className="rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand-deep">
          Déjanos tu usuario de TikTok (el de tu Live) para poder activarla.
        </p>
      )}

      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">Flash Sales y Giveaways</h1>
        <p className="text-sm text-ink-soft">
          Activaciones para tu Live de {BRAND.name}: una promoción relámpago o un sorteo que el equipo
          prende por ti en TikTok Shop para mover ventas y subir tu audiencia.
        </p>
      </header>

      {/* Solicitar */}
      <section className="rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
        <h2 className="font-display mb-1 text-lg font-extrabold text-ink">Solicita una activación para tu Live</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Elige qué quieres y déjanos tu usuario. El equipo la activa en tu próxima transmisión.
        </p>

        {me && !isAdminPreview ? (
          <form action={solicitarActivacion} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Tipo</span>
              <select
                name="tipo"
                className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-ink outline-none focus:border-brand focus:bg-white"
              >
                {ACTIVACION_TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {ACTIVACIONES[t].emoji} {ACTIVACIONES[t].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Tu usuario de TikTok (el de tu Live)</span>
              <input
                name="usuario"
                defaultValue={me.affiliateHandle || me.handle || ""}
                placeholder="@tu_usuario"
                className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2.5 text-ink outline-none placeholder:text-ink/40 focus:border-brand focus:bg-white"
              />
            </label>
            <SubmitButton
              pendingLabel="Enviando…"
              className="font-display rounded-full bg-brand px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-deep"
            >
              Solicitar
            </SubmitButton>
          </form>
        ) : isAdminPreview ? (
          <p className="rounded-2xl bg-ink/[0.04] px-4 py-3 text-sm font-semibold text-ink-soft">
            Vista de admin. Las creadoras solicitan aquí; tú las otorgas en la consola.
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream-deep/50 px-4 py-3">
            <p className="text-sm text-ink-soft">Inicia sesión para solicitar una activación para tu Live.</p>
            <div className="flex gap-2">
              <Link href="/registro" className="font-display rounded-full bg-lime px-4 py-2 text-sm font-extrabold text-ink">
                Únete
              </Link>
              <Link href="/acceso" className="font-display rounded-full border border-ink/15 px-4 py-2 text-sm font-extrabold text-ink">
                Acceder
              </Link>
            </div>
          </div>
        )}

        {/* Estado de mis solicitudes */}
        {mine.length > 0 && (
          <div className="mt-5 space-y-2 border-t border-ink/5 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Tus solicitudes</p>
            {[...latestByTipo.values()]
              .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
              .map((a) => (
                <RequestRow key={a.id ?? a.tipo} a={a} />
              ))}
          </div>
        )}
      </section>

      {/* Tutoriales (fijos de la plataforma) */}
      <section className="space-y-5">
        <div>
          <h2 className="font-display text-lg font-extrabold text-ink">Cómo se activan en tu Live</h2>
          <p className="text-sm text-ink-soft">
            Guías paso a paso. El equipo te confirma el producto y el descuento; tú lo activas en tu transmisión.
          </p>
        </div>
        {ACTIVACION_TIPOS.map((t) => (
          <TutorialSection key={t} meta={ACTIVACIONES[t]} />
        ))}
      </section>
    </div>
  );
}

// Fila de estado de una solicitud de la creadora.
function RequestRow({ a }: { a: Activacion }) {
  const meta = getActivacionMeta(a.tipo);
  const Icon = TIPO_ICON[a.tipo as keyof typeof TIPO_ICON] ?? Zap;
  const label = meta?.label ?? a.tipo;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink/10 bg-cream/30 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-brand-deep" />
        <span className="text-sm font-semibold text-ink">{label}</span>
        {a.usuario && <span className="text-xs text-ink-soft">· {a.usuario}</span>}
      </div>
      {a.status === "otorgada" ? (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Check size={15} className="text-brand-deep" /> Activada · sigue el tutorial
          <a href={`#${a.tipo}`} className="ml-1 inline-flex items-center gap-0.5 text-brand-deep underline">
            ver <ArrowDown size={12} />
          </a>
        </span>
      ) : a.status === "rechazada" ? (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-deep">
          <AlertCircle size={15} /> No procedió{a.reason ? `: ${a.reason}` : ""}
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
          <Clock size={15} /> En proceso · el equipo la activa en tu Live
        </span>
      )}
    </div>
  );
}

// Tutorial de un tipo de activación (pasos + pantallazos placeholder).
function TutorialSection({ meta }: { meta: ActivacionMeta }) {
  return (
    <div id={meta.tipo} className="scroll-mt-20 overflow-hidden rounded-3xl border border-ink/10 bg-white">
      <div className="flex items-start gap-3 border-b border-ink/5 bg-cream/40 p-5">
        <span className="text-2xl" aria-hidden>{meta.emoji}</span>
        <div>
          <h3 className="font-display text-xl font-extrabold text-ink">Cómo activar un {meta.label} en tu Live</h3>
          <p className="text-sm text-ink-soft">{meta.tagline}</p>
        </div>
      </div>
      <ol className="divide-y divide-ink/5">
        {meta.steps.map((s) => (
          <li key={s.n} className="grid gap-3 p-5 sm:grid-cols-[auto_1fr_240px] sm:items-center">
            <span className="font-display grid h-8 w-8 place-items-center rounded-full bg-brand font-extrabold text-white">
              {s.n}
            </span>
            <div>
              <p className="font-semibold text-ink">{s.title}</p>
              <p className="text-sm text-ink-soft">{s.detail}</p>
            </div>
            <StepImage step={s} />
          </li>
        ))}
      </ol>
    </div>
  );
}

// Pantallazo del paso: <img> si Oscar ya lo subió (step.image), si no un placeholder
// con la descripción de lo que va a ir ahí. Cero retrabajo al enchufar la imagen.
function StepImage({ step }: { step: TutorialStep }) {
  if (step.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={step.image}
        alt={step.imageAlt ?? step.title}
        className="w-full rounded-xl border border-ink/10 object-cover"
      />
    );
  }
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink/20 bg-cream/40 px-3 py-4 text-center">
      <ImageIcon size={20} className="text-ink-soft/60" />
      <p className="text-[11px] font-semibold text-ink-soft">Pantallazo pendiente</p>
      {step.imageAlt && <p className="text-[10px] text-ink-soft/70">{step.imageAlt}</p>}
    </div>
  );
}
