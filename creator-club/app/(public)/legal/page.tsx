import Link from "next/link";
import { BRAND } from "@/lib/schema";
import { LEGAL_VERSION } from "@/lib/legal";

export const metadata = {
  title: `Aviso de privacidad y términos · ${BRAND.club}`,
};

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-deep">
          {BRAND.club} · {BRAND.name}
        </p>
        <h1 className="font-display mt-1 text-3xl font-extrabold text-ink">
          Aviso de privacidad y términos
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          En corto y sin letras chiquitas. Esto es lo que sí y lo que no hacemos con tus datos.
        </p>
      </header>

      <Section title="Quién maneja tus datos">
        El responsable es <b>{BRAND.operator}</b> (&quot;{BRAND.operatorShort}&quot;),
        que opera el {BRAND.club} para la marca {BRAND.name}.
      </Section>

      <Section title="Qué te pedimos y para qué">
        Recabamos tu nombre, correo, usuario de TikTok y (opcional) tu ciudad, seguidores y
        portafolio. Si participas, también: tu cuenta de afiliado de TikTok Shop (para acreditar
        tus ventas), tus ventas atribuibles en TikTok Shop que registra el equipo (para tu nivel y
        recompensas) y tu dirección de envío (solo si una campaña te manda producto). Usamos todo
        esto para inscribirte, gestionar tu participación, contactarte y operar estrellas y niveles.
      </Section>

      <Section title="Lo que NO hacemos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Nunca te pedimos pagar envío ni datos de tu tarjeta.</li>
          <li>No te pedimos RFC ni CURP para participar (gifting). Solo si recibes un pago en efectivo o un fee, te pediremos los datos fiscales o bancarios necesarios, y eso se maneja por separado.</li>
          <li>No vendemos tus datos ni los compartimos con otras marcas sin tu consentimiento.</li>
        </ul>
      </Section>

      <Section title="Cómo funciona el club">
        La participación es voluntaria. El formato principal es canje (recibes producto a cambio
        de contenido). Las estrellas son un reconocimiento de estatus dentro del club: no tienen
        valor monetario ni se cambian por dinero. Los beneficios económicos (como un boost de
        comisión o un fee de Live) se desbloquean con tus ventas reales en TikTok Shop, no con
        estrellas.
      </Section>

      <Section title="Uso de tu contenido">
        Cuando entregas contenido en una campaña o misión, autorizas a {BRAND.name} y a {BRAND.operatorShort} a
        usarlo y republicarlo en sus redes y anuncios pagados, dándote crédito cuando sea posible. Tú sigues
        siendo la autora de tu contenido.
      </Section>

      <Section title="Tus derechos">
        Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos (derechos ARCO)
        escribiendo a{" "}
        <a href={`mailto:${BRAND.contactEmail}`} className="font-semibold text-brand-deep underline">
          {BRAND.contactEmail}
        </a>
        .
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link href="/registro" className="font-display rounded-full bg-lime px-5 py-2.5 font-extrabold text-ink">
          Volver al registro
        </Link>
        <span className="text-[11px] text-ink-soft/70">Versión {LEGAL_VERSION}</span>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-5">
      <h2 className="font-display mb-2 text-base font-extrabold text-ink">{title}</h2>
      <div className="text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}
