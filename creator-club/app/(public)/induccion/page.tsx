import Link from "next/link";
import { ArrowLeft, Check, PlayCircle, Star, Eye } from "lucide-react";
import { getMissions } from "@/lib/data";
import { getClubViewer } from "@/lib/club-viewer";
import { BRAND } from "@/lib/schema";
import SubmitButton from "@/components/SubmitButton";
import AdminPreviewBanner from "@/components/AdminPreviewBanner";
import { marcarInduccionVista } from "./actions";

// Cómo funciona el club (inducción escrita; el video es complementario).
const STEPS = [
  { t: "Inscríbete a campañas", d: "Elige las campañas activas que van contigo y participa." },
  { t: "Sube tu video con tu link", d: "Publica mostrando el producto con tu link de afiliado de TikTok Shop y pégalo en tu campaña." },
  { t: "El equipo valida y ganas estrellas", d: "Cuando aprobamos tu entrega, sumas estrellas. Solo lo aprobado cuenta: cero humo." },
  { t: "Sube de nivel y canjea", d: "Tus estrellas son tu estatus. Lo que tiene costo (producto, boosts) se desbloquea con tus ventas reales." },
];

export default async function InduccionPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await searchParams; // ok=1 tras marcar (la card ya refleja el estado real)
  const { creator: me, isAdminPreview } = await getClubViewer();

  if (!me) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-ink/10 bg-white p-8 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">Inducción</h1>
        <p className="mt-1 text-sm text-ink-soft">Entra a tu cuenta para ver la inducción del club.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/registro" className="font-display rounded-full bg-lime px-5 py-2.5 font-extrabold text-ink">Únete</Link>
          <Link href="/acceso" className="font-display rounded-full border border-ink/15 px-5 py-2.5 font-extrabold text-ink">Acceder</Link>
        </div>
      </div>
    );
  }

  const missions = await getMissions();
  const induccion = missions.find((m) => m.action === "watch");
  const done = induccion?.done ?? false;
  const videoUrl = BRAND.inductionVideoUrl;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {isAdminPreview && <AdminPreviewBanner />}
      <div>
        <Link href="/misiones" className="mb-1 flex items-center gap-1 text-xs font-semibold text-brand-deep">
          <ArrowLeft size={13} /> Volver a misiones
        </Link>
        <h1 className="font-display text-2xl font-extrabold text-ink">Cómo funciona {BRAND.club}</h1>
        <p className="text-sm text-ink-soft">3 minutos para entender cómo ganas estrellas y recompensas.</p>
      </div>

      {/* Video (si la marca lo tiene) o placeholder honesto */}
      {videoUrl ? (
        <div className="overflow-hidden rounded-3xl border border-ink/10 bg-ink">
          <div className="relative aspect-video w-full">
            <iframe
              src={videoUrl}
              title={`Inducción ${BRAND.club}`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-3xl border border-dashed border-ink/20 bg-white p-5">
          <PlayCircle size={28} className="shrink-0 text-brand-deep" />
          <div>
            <p className="font-semibold text-ink">Video de inducción próximamente</p>
            <p className="text-xs text-ink-soft">Mientras tanto, esta guía rápida te deja lista para empezar.</p>
          </div>
        </div>
      )}

      {/* Guía escrita */}
      <ol className="space-y-3">
        {STEPS.map((s, i) => (
          <li key={s.t} className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white p-4">
            <span className="font-display grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand font-extrabold text-white">
              {i + 1}
            </span>
            <div>
              <p className="font-semibold text-ink">{s.t}</p>
              <p className="text-sm text-ink-soft">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Marcar como vista (otorga estrellas de estatus) */}
      <div className="rounded-3xl border border-ink/10 bg-white p-5">
        {done ? (
          <p className="flex items-center justify-center gap-2 text-sm font-semibold text-ink">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-lime text-ink">
              <Check size={15} />
            </span>
            ¡Listo! Ya hiciste tu inducción{induccion ? ` (+${induccion.stars} estrellas)` : ""}.
          </p>
        ) : isAdminPreview ? (
          <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-soft">
            <Eye size={15} /> Vista de admin: aquí la creadora marca su inducción.
          </p>
        ) : (
          <form action={marcarInduccionVista} className="flex flex-col items-center gap-2">
            <input type="hidden" name="missionId" value={induccion?.id ?? "induccion"} />
            <p className="text-center text-sm text-ink-soft">
              ¿Ya entendiste cómo funciona? Marca tu inducción y suma
              {induccion ? ` ${induccion.stars}` : ""} estrellas.
            </p>
            <SubmitButton
              pendingLabel="Guardando…"
              className="font-display inline-flex items-center gap-1.5 rounded-full bg-lime px-6 py-3 text-base font-extrabold text-ink transition hover:brightness-95"
            >
              <Star size={16} className="fill-ink" /> Ya lo vi, marcar como hecho
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}
