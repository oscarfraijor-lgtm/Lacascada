"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { currentEmail } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import {
  createCampaign,
  updateCampaign,
  setCampaignOpen,
  deleteCampaign,
  setParticipationStatus,
  getParticipationById,
  getCampaignById,
  setCreatorGmv,
  getCanjeById,
  getCreatorByEmail,
  setCanjeStatus,
  listParticipations,
  listCanjes,
  getMisionById,
  setMisionStatus,
  getRewardById,
  createReward,
  updateReward,
  setRewardActive,
  deleteReward,
  PARTICIPATION_STATUS,
  CANJE_STATUS,
  MISION_STATUS,
  type ParticipationStatus,
  type CanjeStatus,
  type MisionStatus,
} from "@/lib/store";
import type { CampaignInput } from "@/lib/campaigns";
import type { RewardInput, RewardKind } from "@/lib/types";
import { canApproveCanje } from "@/lib/rewards";
import { sendNotification } from "@/lib/mailer";
import { getAdminContext, type AdminContext } from "@/lib/brand-admin";

// URL base del deploy (para los CTA absolutos de los correos).
async function baseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

// Aviso por correo a la creadora. TOLERANTE: si Resend no está configurado, o el
// dominio no está verificado (modo test entrega solo al dueño de la cuenta), NO
// rompe la acción del equipo. Solo registra el fallo. DEPENDE de verificar el
// dominio para llegar de verdad a las creadoras.
//
// Multimarca: el correo se brandea con la marca SELECCIONADA (ctx.brand), no la
// del env, para no exponerle a la creadora el nombre/colores de OTRA marca. El CTA
// apunta al club correcto: el host actual si es la marca de este deploy, su
// deployUrl si es otra marca gestionada, o se omite si esa marca no tiene deploy.
async function notifyCreator(
  ctx: AdminContext,
  to: string,
  subject: string,
  heading: string,
  body: string,
  ctaPath?: string
): Promise<void> {
  try {
    let url: string | undefined;
    if (ctaPath) {
      if (ctx.isEnvBrand) url = `${await baseUrl()}${ctaPath}`;
      else if (ctx.brand.deployUrl) url = `${ctx.brand.deployUrl}${ctaPath}`;
    }
    const cta = url ? { url, label: "Abrir mi club" } : undefined;
    await sendNotification(to, { subject, heading, body, cta }, ctx.brand);
  } catch (e) {
    console.warn("[notify] no se pudo enviar el aviso a la creadora:", e);
  }
}

// Toda acción de admin verifica autorización en el servidor (no solo en la UI),
// porque las server actions son alcanzables por POST directo. Además resuelve la
// marca seleccionada: las escrituras van a SU base (multimarca).
async function adminCtx(): Promise<AdminContext> {
  const email = await currentEmail();
  if (!isAdmin(email)) throw new Error("No autorizado");
  return getAdminContext();
}

function revalidateCampaigns(): void {
  revalidatePath("/admin");
  revalidatePath("/campanas");
  revalidatePath("/");
}

function parseCampaignForm(formData: FormData, defaultBrand: string): CampaignInput {
  const openRaw = String(formData.get("open") || "");
  return {
    title: String(formData.get("title") || "").trim(),
    brand: String(formData.get("brand") || "").trim() || defaultBrand,
    tag: String(formData.get("tag") || "").trim(),
    stars: Math.max(0, Math.round(Number(formData.get("stars") || 0)) || 0),
    reward: String(formData.get("reward") || "").trim(),
    deadline: String(formData.get("deadline") || "").trim() || "Cupo abierto",
    requirements: String(formData.get("requirements") || "").trim(),
    cupo: Math.max(0, Math.round(Number(formData.get("cupo") || 0)) || 0),
    brief: String(formData.get("brief") || "").trim(),
    open: openRaw === "on" || openRaw === "true",
  };
}

export async function crearCampana(formData: FormData) {
  const ctx = await adminCtx();
  if (!ctx.configured) return;
  const input = parseCampaignForm(formData, ctx.brand.name);
  if (!input.title) return;
  await createCampaign(input, ctx.conn ?? undefined);
  revalidateCampaigns();
}

export async function editarCampana(formData: FormData) {
  const ctx = await adminCtx();
  if (!ctx.configured) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  await updateCampaign(id, parseCampaignForm(formData, ctx.brand.name), ctx.conn ?? undefined);
  revalidateCampaigns();
}

export async function alternarCampana(formData: FormData) {
  const ctx = await adminCtx();
  if (!ctx.configured) return;
  const id = String(formData.get("id") || "");
  const open = String(formData.get("open") || "") === "true";
  if (!id) return;
  await setCampaignOpen(id, open, ctx.conn ?? undefined);
  revalidateCampaigns();
}

export async function eliminarCampana(formData: FormData) {
  const ctx = await adminCtx();
  if (!ctx.configured) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  // No borrar una campaña que ya tiene inscripciones: dejaría entregas huérfanas
  // y reescribiría las estrellas/nivel de quienes participaron. Para retirarla se
  // usa "Desactivar". (La UI muestra el conteo y oculta el botón si tiene inscripciones.)
  const parts = await listParticipations(ctx.conn ?? undefined);
  if (parts.some((p) => p.campaignId === id)) return;
  await deleteCampaign(id, ctx.conn ?? undefined);
  revalidateCampaigns();
}

export async function cambiarEstadoEntrega(formData: FormData) {
  const ctx = await adminCtx();
  if (!ctx.configured) return;
  const conn = ctx.conn ?? undefined;
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as ParticipationStatus;
  const reason = String(formData.get("reason") || "").trim();
  if (!id || !PARTICIPATION_STATUS.includes(status)) return;
  await setParticipationStatus(id, status, status === "rechazada" ? reason : undefined, conn);
  // Aprobar otorga estrellas automáticamente (se derivan de entregas aprobadas).
  revalidatePath("/admin/inscripciones");
  revalidatePath("/admin/creadoras");
  revalidatePath("/campanas");
  revalidatePath("/");

  // Aviso por correo en las transiciones que le importan a la creadora.
  if (status === "aceptada" || status === "aprobada" || status === "rechazada") {
    const part = await getParticipationById(id, conn);
    if (part) {
      const campaign = await getCampaignById(part.campaignId, conn);
      const title = campaign?.title ?? part.campaignId;
      if (status === "aceptada") {
        await notifyCreator(
          ctx,
          part.creatorEmail,
          `Te aceptamos en ${title}`,
          `¡Te aceptamos en ${title}!`,
          "Ya puedes grabar y subir el link de tu video desde tu club.",
          "/campanas"
        );
      } else if (status === "aprobada") {
        const stars = campaign?.stars ?? 0;
        await notifyCreator(
          ctx,
          part.creatorEmail,
          `Aprobamos tu entrega de ${title}`,
          `¡Entrega aprobada! ${title}`,
          stars > 0
            ? `Sumaste ${stars} estrellas. Revisa tu progreso en tu club.`
            : "Tu entrega quedó aprobada. Revisa tu progreso en tu club.",
          "/"
        );
      } else {
        await notifyCreator(
          ctx,
          part.creatorEmail,
          `Tu entrega de ${title} necesita ajustes`,
          `Revisemos tu entrega de ${title}`,
          reason
            ? `Motivo: ${reason}. Corrige y vuelve a enviar tu video.`
            : "Necesita un ajuste. Corrige y vuelve a enviar tu video.",
          "/campanas"
        );
      }
    }
  }
}

// Canjes: aprobar/rechazar una solicitud de recompensa. Gate anti-fuga: una
// recompensa con costo NO se aprueba sin GMV atribuible suficiente. La UI ya
// lo bloquea; esto cubre el POST directo (defensa en profundidad, server-side).
// El catálogo y el GMV se leen de la MARCA seleccionada (su base).
export async function cambiarEstadoCanje(formData: FormData) {
  const ctx = await adminCtx();
  if (!ctx.configured) return;
  const conn = ctx.conn ?? undefined;
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as CanjeStatus;
  const reason = String(formData.get("reason") || "").trim();
  if (!id || !CANJE_STATUS.includes(status)) return;

  // Se carga una vez: sirve para el gate (aprobada/entregada) y para el aviso.
  const canje =
    status === "aprobada" || status === "rechazada" || status === "entregada"
      ? await getCanjeById(id, conn)
      : undefined;

  // El gate anti-fuga aplica a APROBAR y a ENTREGAR (ambas "conceden" la
  // recompensa con costo): sin GMV atribuible suficiente => NO procede. Cubre el
  // POST directo que intente saltar de solicitada a entregada sin aprobar.
  if (status === "aprobada" || status === "entregada") {
    if (!canje) return;
    const reward = await getRewardById(canje.rewardId, conn);
    const creator = await getCreatorByEmail(canje.creatorEmail, conn);
    const gmv = creator?.gmvMXN ?? 0;
    // Fail-closed: recompensa desconocida (catálogo cambió) o sin GMV suficiente
    // => no procede (no-op, sin 500). La UI ya esconde el botón; esto cubre el
    // POST directo y los canjes huérfanos.
    if (!reward || !canApproveCanje(reward, gmv)) return;
  }

  await setCanjeStatus(id, status, status === "rechazada" ? reason : undefined, conn);
  revalidatePath("/admin/canjes");
  revalidatePath("/recompensas");
  revalidatePath("/");

  // Aviso por correo a la creadora (tolerante). Solo si el cambio sucedió: en
  // aprobada el gate puede haber hecho return antes (no se manda "aprobada" sin GMV).
  if (canje) {
    const title = canje.rewardTitle || canje.rewardId;
    if (status === "aprobada") {
      await notifyCreator(
        ctx,
        canje.creatorEmail,
        `Aprobamos tu canje: ${title}`,
        `¡Canje aprobado! ${title}`,
        "El equipo te contacta para coordinar la entrega de tu recompensa.",
        "/canjes"
      );
    } else if (status === "entregada") {
      await notifyCreator(
        ctx,
        canje.creatorEmail,
        `Entregamos tu recompensa: ${title}`,
        `¡Recompensa entregada! ${title}`,
        "Tu recompensa ya fue entregada. ¡Disfrútala!",
        "/canjes"
      );
    } else if (status === "rechazada") {
      await notifyCreator(
        ctx,
        canje.creatorEmail,
        `Tu solicitud de ${title} no procedió`,
        `Sobre tu solicitud de ${title}`,
        reason
          ? `Motivo: ${reason}. Cuando cumplas el requisito puedes solicitarla de nuevo.`
          : "No procedió esta vez. Cuando cumplas el requisito puedes solicitarla de nuevo.",
        "/recompensas"
      );
    }
  }
}

// Misiones de CONTENIDO: aprobar/rechazar lo que envió la creadora (espejo de
// las entregas de campaña). Solo aplica a misiones "submit": las de estatus
// (perfil/afiliado/inducción) no se revisan aquí, y las de venta se acreditan
// desde el GMV (anti-fuga). Aprobar NO tiene gate de GMV: la misión otorga solo
// estrellas de estatus (costo $0); el equipo valida que el contenido sea real.
export async function cambiarEstadoMision(formData: FormData) {
  const ctx = await adminCtx();
  if (!ctx.configured) return;
  const conn = ctx.conn ?? undefined;
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as MisionStatus;
  const reason = String(formData.get("reason") || "").trim();
  if (!id || !MISION_STATUS.includes(status)) return;

  // Solo se revisan misiones de contenido. Bloquea forja sobre misiones de
  // estatus (watch/auto) que romperían su estado, y las transiciones inválidas.
  const mision = await getMisionById(id, conn);
  if (!mision) return;
  const mission = ctx.brand.missions.find((m) => m.id === mision.missionId);
  if (!mission || mission.action !== "submit") return;
  if (status !== "enviada" && status !== "aprobada" && status !== "rechazada") return;

  await setMisionStatus(id, status, status === "rechazada" ? reason : undefined, conn);
  revalidatePath("/admin/misiones");
  revalidatePath("/misiones");
  revalidatePath("/");

  // Aviso por correo a la creadora (tolerante) en las transiciones que le importan.
  const title = mission.title;
  if (status === "aprobada") {
    const stars = mission.stars;
    await notifyCreator(
      ctx,
      mision.creatorEmail,
      `Aprobamos tu misión: ${title}`,
      `¡Misión aprobada! ${title}`,
      stars > 0
        ? `Sumaste ${stars} estrellas. Revisa tu progreso en tu club.`
        : "Tu misión quedó aprobada. Revisa tu progreso en tu club.",
      "/"
    );
  } else if (status === "rechazada") {
    await notifyCreator(
      ctx,
      mision.creatorEmail,
      `Tu misión ${title} necesita ajustes`,
      `Revisemos tu misión ${title}`,
      reason
        ? `Motivo: ${reason}. Corrige y vuelve a enviar tu video.`
        : "Necesita un ajuste. Corrige y vuelve a enviar tu video.",
      "/misiones"
    );
  }
}

// El equipo captura a mano el GMV atribuible de la creadora (export TT Shop
// Analytics). Enciende los niveles que dependen de GMV. NO es tiempo real.
export async function capturarGmv(formData: FormData) {
  const ctx = await adminCtx();
  if (!ctx.configured) return;
  const id = String(formData.get("id") || "");
  const gmv = Math.max(0, Math.round(Number(formData.get("gmv") || 0)) || 0);
  const date = String(formData.get("date") || "").trim();
  if (!id) return;
  await setCreatorGmv(id, gmv, date, ctx.conn ?? undefined);
  revalidatePath("/admin/creadoras");
  revalidatePath("/");
}

// ── Recompensas (premios; el equipo las prende/apaga y edita en /admin) ────
// Anti-fuga: aunque el equipo capture kind/umbrales, el candado de costo (premio
// con costo exige GMV atribuible, lib/rewards.canApproveCanje) se aplica SIEMPRE
// al aprobar/entregar un canje. Editar el catálogo NO puede saltarse esa regla.
const REWARD_KINDS: RewardKind[] = ["estatus", "producto", "boost", "cash", "experiencia"];

function revalidateRewards(): void {
  revalidatePath("/admin/recompensas");
  revalidatePath("/recompensas");
  revalidatePath("/");
}

function parseRewardForm(formData: FormData): Omit<RewardInput, "id"> {
  const kindRaw = String(formData.get("kind") || "producto");
  const activeRaw = String(formData.get("active") || "");
  return {
    title: String(formData.get("title") || "").trim(),
    detail: String(formData.get("detail") || "").trim(),
    cost: String(formData.get("cost") || "").trim(),
    kind: REWARD_KINDS.includes(kindRaw as RewardKind) ? (kindRaw as RewardKind) : "producto",
    payer: String(formData.get("payer") || "marca") === "club" ? "club" : "marca",
    minStars: Math.max(0, Math.round(Number(formData.get("minStars") || 0)) || 0),
    minGmvMXN: Math.max(0, Math.round(Number(formData.get("minGmvMXN") || 0)) || 0),
    active: activeRaw === "on" || activeRaw === "true",
  };
}

export async function crearRecompensa(formData: FormData) {
  const ctx = await adminCtx();
  if (!ctx.configured) return;
  const input = parseRewardForm(formData);
  if (!input.title) return;
  await createReward({ id: "", ...input }, ctx.conn ?? undefined);
  revalidateRewards();
}

export async function editarRecompensa(formData: FormData) {
  const ctx = await adminCtx();
  if (!ctx.configured) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  await updateReward(id, parseRewardForm(formData), ctx.conn ?? undefined);
  revalidateRewards();
}

export async function alternarRecompensa(formData: FormData) {
  const ctx = await adminCtx();
  if (!ctx.configured) return;
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  if (!id) return;
  await setRewardActive(id, active, ctx.conn ?? undefined);
  revalidateRewards();
}

export async function eliminarRecompensa(formData: FormData) {
  const ctx = await adminCtx();
  if (!ctx.configured) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  // No borrar un premio con canjes (dejaría canjes huérfanos). Para retirarlo se
  // usa "Desactivar" (la UI muestra el conteo y oculta el botón si tiene canjes).
  const canjes = await listCanjes(ctx.conn ?? undefined);
  if (canjes.some((c) => c.rewardId === id)) return;
  await deleteReward(id, ctx.conn ?? undefined);
  revalidateRewards();
}
