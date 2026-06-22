"use server";

import { revalidatePath } from "next/cache";
import { currentEmail } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import {
  createCampaign,
  updateCampaign,
  setCampaignOpen,
  deleteCampaign,
  setParticipationStatus,
  setCreatorGmv,
  getCanjeById,
  getCreatorByEmail,
  setCanjeStatus,
  listParticipations,
  PARTICIPATION_STATUS,
  CANJE_STATUS,
  type ParticipationStatus,
  type CanjeStatus,
} from "@/lib/store";
import type { CampaignInput } from "@/lib/campaigns";
import { canApproveCanje } from "@/lib/rewards";
import { getAdminContext, type AdminContext } from "@/lib/brand-admin";

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
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as ParticipationStatus;
  const reason = String(formData.get("reason") || "").trim();
  if (!id || !PARTICIPATION_STATUS.includes(status)) return;
  await setParticipationStatus(id, status, status === "rechazada" ? reason : undefined, ctx.conn ?? undefined);
  // Aprobar otorga estrellas automáticamente (se derivan de entregas aprobadas).
  revalidatePath("/admin/inscripciones");
  revalidatePath("/admin/creadoras");
  revalidatePath("/campanas");
  revalidatePath("/");
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

  if (status === "aprobada") {
    const canje = await getCanjeById(id, conn);
    if (!canje) return;
    const reward = ctx.brand.rewards.find((r) => r.id === canje.rewardId);
    const creator = await getCreatorByEmail(canje.creatorEmail, conn);
    const gmv = creator?.gmvMXN ?? 0;
    // Fail-closed: recompensa desconocida (catálogo cambió) o sin GMV suficiente
    // => NO se aprueba (no-op, sin 500). La UI ya esconde el botón; esto cubre el
    // POST directo y los canjes huérfanos.
    if (!reward || !canApproveCanje(reward, gmv)) return;
  }

  await setCanjeStatus(id, status, status === "rechazada" ? reason : undefined, conn);
  revalidatePath("/admin/canjes");
  revalidatePath("/recompensas");
  revalidatePath("/");
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
