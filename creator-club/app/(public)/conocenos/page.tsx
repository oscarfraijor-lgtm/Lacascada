import Link from "next/link";
import { ArrowRight, Sparkles, Heart, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/schema";
import { getClubViewer } from "@/lib/club-viewer";

// "Conócenos / Sobre nosotros": la historia de la marca, en su voz. El contenido
// sale de la marca activa (brand.story); si falta, se arma un texto base con la
// identidad para que la página nunca quede vacía. Sirve para que una creadora nueva
// confíe y entienda de quién es el club (profesionalismo de marca).
export default async function ConocenosPage() {
  const { creator } = await getClubViewer();
  const paragraphs = (BRAND.story ?? "")
    .split(/\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  // Texto base si la marca aún no escribió su historia (deriva de la identidad).
  const fallback = [
    `${BRAND.name} es ${BRAND.category}.`,
    `${BRAND.club} es nuestra comunidad de creadoras: gente real que crea contenido y crece con la marca.`,
  ];
  const body = paragraphs.length ? paragraphs : fallback;

  return (
    <div className="space-y-8">
      {/* Hero editorial */}
      <section className="overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-12">
        <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-lime">
          {BRAND.club} · {BRAND.name}
        </p>
        <h1 className="font-display mt-3 max-w-2xl text-3xl font-black sm:text-4xl">Conócenos</h1>
        <p className="mt-3 max-w-xl text-white/80">{BRAND.tagline}</p>
      </section>

      {/* Historia */}
      <section className="space-y-4 rounded-3xl border border-ink/10 bg-white p-6 sm:p-8">
        {body.map((p, i) => (
          <p key={i} className={i === 0 ? "text-lg font-semibold text-ink" : "text-ink-soft"}>
            {p}
          </p>
        ))}

        {/* Video de bienvenida de la marca (si lo subieron) */}
        {BRAND.welcomeVideoUrl && (
          <div className="mt-2 aspect-video w-full overflow-hidden rounded-2xl border border-ink/10">
            <iframe
              src={BRAND.welcomeVideoUrl}
              title={`Bienvenida de ${BRAND.name}`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </section>

      {/* Lo que valoramos (genérico, on-brand y honesto) */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Value icon={Heart} title="Creadoras reales">
          No necesitas miles de seguidores. Valoramos el contenido auténtico, no los números.
        </Value>
        <Value icon={ShieldCheck} title="Transparencia">
          Te decimos claro qué ganas y cómo. Lo que tiene costo se desbloquea con tus ventas reales.
        </Value>
        <Value icon={Sparkles} title="Crecemos juntas">
          Te damos producto, campañas y herramientas para que crees mejor y crezcas con la marca.
        </Value>
      </section>

      {/* CTA según la sesión */}
      {!creator ? (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-ink p-6 text-white sm:p-8">
          <div>
            <h2 className="font-display text-xl font-extrabold">¿Lista para crear con {BRAND.name}?</h2>
            <p className="text-sm text-white/70">Únete al {BRAND.club} en un minuto.</p>
          </div>
          <Link
            href="/registro"
            className="font-display inline-flex items-center gap-1.5 rounded-full bg-lime px-6 py-3 font-extrabold text-ink"
          >
            Quiero unirme <ArrowRight size={16} />
          </Link>
        </section>
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-ink/10 bg-white p-6 sm:p-8">
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink">Empieza a crear</h2>
            <p className="text-sm text-ink-soft">Explora las campañas activas y elige la que va contigo.</p>
          </div>
          <Link
            href="/campanas"
            className="font-display inline-flex items-center gap-1.5 rounded-full bg-brand px-6 py-3 font-extrabold text-white transition hover:bg-brand-deep"
          >
            Ver campañas <ArrowRight size={16} />
          </Link>
        </section>
      )}
    </div>
  );
}

function Value({ icon: Icon, title, children }: { icon: typeof Heart; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand-deep">
        <Icon size={18} />
      </span>
      <h3 className="font-display mt-3 text-base font-extrabold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-ink-soft">{children}</p>
    </div>
  );
}
