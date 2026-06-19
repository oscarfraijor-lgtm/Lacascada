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
  PARTICIPATION_STATUS,
  type ParticipationStatus,
} from "@/lib/store";
import type { CampaignInput } from "@/lib/campaigns";

// Toda acción de admin verifica autorización en el servidor (no solo en la UI),
// porque las server actions son alcanzables por POST directo.
async function assertAdmin(): Promise<void> {
  const email = await currentEmail();
  if (!isAdmin(email)) throw new Error("No autorizado");
}

function revalidateCampaigns(): void {
  revalidatePath("/admin");
  revalidatePath("/campanas");
  revalidatePath("/");
}

function parseCampaignForm(formData: FormData): CampaignInput {
  const openRaw = String(formData.get("open") || "");
  return {
    title: String(formData.get("title") || "").trim(),
    brand: String(formData.get("brand") || "").trim() || "Color Dreams",
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
  await assertAdmin();
  const input = parseCampaignForm(formData);
  if (!input.title) return;
  await createCampaign(input);
  revalidateCampaigns();
}

export async function editarCampana(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await updateCampaign(id, parseCampaignForm(formData));
  revalidateCampaigns();
}

export async function alternarCampana(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  const open = String(formData.get("open") || "") === "true";
  if (!id) return;
  await setCampaignOpen(id, open);
  revalidateCampaigns();
}

export async function eliminarCampana(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await deleteCampaign(id);
  revalidateCampaigns();
}

export async function cambiarEstadoEntrega(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as ParticipationStatus;
  const reason = String(formData.get("reason") || "").trim();
  if (!id || !PARTICIPATION_STATUS.includes(status)) return;
  await setParticipationStatus(id, status, status === "rechazada" ? reason : undefined);
  // Aprobar otorga estrellas automáticamente (se derivan de entregas aprobadas).
  revalidatePath("/admin/inscripciones");
  revalidatePath("/admin/creadoras");
  revalidatePath("/campanas");
  revalidatePath("/");
}

// El equipo captura a mano el GMV atribuible de la creadora (export TT Shop
// Analytics). Enciende los niveles que dependen de GMV. NO es tiempo real.
export async function capturarGmv(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  const gmv = Math.max(0, Math.round(Number(formData.get("gmv") || 0)) || 0);
  const date = String(formData.get("date") || "").trim();
  if (!id) return;
  await setCreatorGmv(id, gmv, date);
  revalidatePath("/admin/creadoras");
  revalidatePath("/");
}
