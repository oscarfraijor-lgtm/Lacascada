import Link from "next/link";
import { BRAND } from "@/lib/schema";

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
        El responsable es <b>INDIEPRO MUSIC &amp; MARKETING S.C.</b> (&quot;Indie Pro Marketing&quot;),
        que opera el {BRAND.club} para la marca {BRAND.name}.
      </Section>

      <Section title="Qué te pedimos y para qué">
        Recabamos tu nombre, correo, usuario de TikTok y (opcional) tu ciudad, seguidores y
        portafolio. Los usamos solo para inscribirte y gestionar tu participación en campañas,
        contactarte sobre ellas y operar las estrellas y niveles del club.
      </Section>

      <Section title="Lo que NO hacemos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Nunca te pedimos pagar envío ni datos de tu tarjeta.</li>
          <li>No te pedimos RFC ni CURP para participar; solo si llega a haber un pago en efectivo, y eso se maneja por separado.</li>
          <li>No vendemos tus datos ni los compartimos con otras marcas sin tu consentimiento.</li>
        </ul>
      </Section>

      <Section title="Cómo funciona el club">
        La participación es voluntaria. El formato principal es canje (recibes producto a cambio
        de contenido). Las estrellas son un reconocimiento de estatus dentro del club y no tienen
        valor monetario ni son canjeables por dinero.
      </Section>

      <Section title="Uso de tu contenido">
        Cuando entregas contenido en una campaña, autorizas a {BRAND.name} e Indie Pro Marketing a
        usarlo y republicarlo en sus redes y anuncios, dándote crédito cuando sea posible. Tú sigues
        siendo la autora de tu contenido.
      </Section>

      <Section title="Tus derechos">
        Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos (derechos ARCO)
        escribiendo a{" "}
        <a href="mailto:afiliadostiktok@indiepro.com.mx" className="font-semibold text-brand-deep underline">
          afiliadostiktok@indiepro.com.mx
        </a>
        .
      </Section>

      <div className="pt-2">
        <Link href="/registro" className="font-display rounded-full bg-lime px-5 py-2.5 font-extrabold text-ink">
          Volver al registro
        </Link>
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
