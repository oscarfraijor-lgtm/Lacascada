import Link from "next/link";
import {
  Star, Check, Lock, ShoppingBag, Clock, Send, ArrowRight, Eye, ExternalLink, AlertCircle,
} from "lucide-react";
import type { MissionWithStatus } from "@/lib/data";
import SubmitButton from "@/components/SubmitButton";
import { entregarMision } from "@/app/(public)/misiones/actions";

// Una misión accionable. Renderiza el CTA correcto según cómo se completa:
//   auto   -> botón que lleva a /cuenta (perfil / afiliado)
//   watch  -> botón que lleva a /induccion
//   submit -> formulario para pegar el link del video (queda "en revisión")
//   sale   -> info bloqueada/por-venta (no se auto-completa nunca)
// readOnly (vista de admin): muestra los estados pero no deja accionar.
export default function MissionCard({
  mission: m,
  readOnly = false,
}: {
  mission: MissionWithStatus;
  readOnly?: boolean;
}) {
  const tone = m.done
    ? "border-lime/60 bg-lime/15"
    : m.locked
      ? "border-ink/10 bg-ink/[0.02]"
      : m.state === "enviada"
        ? "border-brand/40 bg-brand/5"
        : "border-ink/10 bg-white";

  const badge = m.done
    ? "bg-lime text-ink"
    : m.locked
      ? "bg-ink/5 text-ink-soft"
      : "bg-brand/15 text-brand-deep";

  const StatusIcon = m.done ? Check : m.locked ? Lock : m.state === "enviada" ? Clock : Star;

  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 pr-1">
          <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${badge}`}>
            <StatusIcon size={m.done ? 15 : 14} className={m.done ? "" : ""} />
          </span>
          <div>
            <p className="font-semibold text-ink">
              {m.title}
              {m.requiresSale && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-brand-deep">
                  <ShoppingBag size={10} /> con venta
                </span>
              )}
            </p>
            <p className="text-xs text-ink-soft">{m.detail}</p>
          </div>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold ${
            m.locked ? "bg-ink/5 text-ink-soft" : "bg-lime text-ink"
          }`}
        >
          <Star size={13} className={m.locked ? "" : "fill-ink"} /> {m.stars}
        </span>
      </div>

      <ActionRow m={m} readOnly={readOnly} />
    </div>
  );
}

function ActionRow({ m, readOnly }: { m: MissionWithStatus; readOnly: boolean }) {
  // ── Misiones de VENTA ──
  if (m.action === "sale") {
    if (m.locked) {
      return (
        <Note icon={Lock}>
          {m.lockReason ?? "Se activa con tu primera venta atribuible en TikTok Shop."}
        </Note>
      );
    }
    return <Note icon={ShoppingBag}>El equipo acredita estas estrellas al validar tu venta en TikTok Shop.</Note>;
  }

  // ── Misiones AUTO (perfil / afiliado) ──
  if (m.action === "auto") {
    if (m.done) return null;
    const href = m.id === "conectar-tt" ? "/cuenta#afiliado" : "/cuenta";
    const label = m.id === "conectar-tt" ? "Conectar mi afiliado" : "Completar mi perfil";
    if (readOnly) return <PreviewNote />;
    return (
      <div>
        {m.hint && <p className="mt-2 text-xs text-ink-soft">{m.hint}</p>}
        <Cta href={href}>{label}</Cta>
      </div>
    );
  }

  // ── Misión WATCH (inducción) ──
  if (m.action === "watch") {
    if (m.done) return null;
    return readOnly ? <PreviewNote /> : <Cta href="/induccion">Ver la inducción</Cta>;
  }

  // ── Misiones de CONTENIDO (submit) ──
  if (m.done) {
    return m.link ? (
      <LinkOut href={m.link}>Ver tu video aprobado</LinkOut>
    ) : null;
  }
  if (readOnly) return <PreviewNote />;
  return (
    <div className="mt-3 space-y-1.5">
      {m.state === "enviada" && (
        <p className="flex items-center gap-1 text-xs font-semibold text-ink">
          <Check size={13} className="text-brand-deep" /> Video recibido, en revisión.
        </p>
      )}
      {m.state === "rechazada" && (
        <p className="flex items-start gap-1 text-xs font-semibold text-brand-deep">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          <span>Rechazada{m.reason ? `: ${m.reason}` : ""}. Corrige y reenvía.</span>
        </p>
      )}
      <form action={entregarMision} className="flex gap-2">
        <input type="hidden" name="missionId" value={m.id} />
        <input
          name="link"
          type="url"
          required
          defaultValue={m.link}
          placeholder="https://tiktok.com/@tu/video..."
          aria-label={`Link de tu video para ${m.title}`}
          className="w-full rounded-xl border border-ink/15 bg-cream/40 px-3 py-2 text-sm text-ink outline-none placeholder:text-ink/50 focus:border-brand focus:bg-white"
        />
        <SubmitButton
          pendingLabel="…"
          className="font-display flex shrink-0 items-center gap-1 rounded-xl bg-brand px-3 py-2 text-sm font-extrabold text-white transition hover:bg-brand-deep"
        >
          <Send size={14} /> {m.state === "enviada" ? "Actualizar" : "Enviar"}
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

function Cta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-display mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-deep"
    >
      {children} <ArrowRight size={15} />
    </Link>
  );
}

function Note({ icon: Icon, children }: { icon: typeof Lock; children: React.ReactNode }) {
  return (
    <p className="mt-3 flex items-start gap-1.5 text-xs font-semibold text-ink-soft">
      <Icon size={13} className="mt-0.5 shrink-0" /> {children}
    </p>
  );
}

function PreviewNote() {
  return (
    <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
      <Eye size={13} /> Vista de admin: la creadora completa esto desde su cuenta.
    </p>
  );
}

function LinkOut({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand underline"
    >
      <ExternalLink size={12} /> {children}
    </a>
  );
}
