// Persistencia: Airtable si está configurado; si no, archivo local JSON (.data/store.json)
// para que el flujo funcione en dev sin cuentas externas. La UI no cambia al migrar.
//
// Multimarca: cada función acepta una conexión opcional `conn` (base de otra marca).
// El lado público NO la pasa (usa la marca del env de este deploy). El panel de admin
// multimarca pasa la conexión de la marca seleccionada, así sus datos viven en SU base
// y nunca se cruzan. En modo archivo local (dev) `conn` se ignora (archivo compartido).
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  type Conn,
  airtableConfigured,
  airtableCreate,
  airtableUpdate,
  airtableDelete,
  fetchAll,
  escFormula,
  TABLES,
} from "@/lib/airtable";
import {
  type Campaign,
  type CampaignInput,
  CAMPAIGN_SEED,
  slugify,
} from "@/lib/campaigns";
import type { Reward, RewardInput, RewardKind } from "@/lib/types";
import type { Product, ProductInput, ProductSource } from "@/lib/products";
import type { CalendarEvent, CalendarEventInput, EventPriority, EventKind } from "@/lib/calendar";
import type { FaqItem, FaqInput } from "@/lib/faq";
import { BRAND } from "@/lib/schema";
import { parseTiers, serializeTiers } from "@/lib/tiers";

export interface CreatorRecord {
  id?: string;
  name: string;
  handle: string;
  email: string;
  followers?: string;
  city?: string;
  portfolio?: string;
  affiliateHandle?: string; // @usuario o link de afiliado de TikTok Shop (a qué cuenta atribuir GMV)
  shippingAddress?: string; // dirección de envío (solo para campañas de producto físico)
  gmvMXN?: number; // GMV atribuible capturado a mano por el equipo
  gmvDate?: string; // "actualizado al" (nunca tiempo real)
  consentAt?: string; // ISO: cuándo aceptó el aviso de privacidad (prueba LFPDPPP)
  consentVersion?: string; // versión del aviso que aceptó
  createdAt?: string;
}

// Ciclo de una inscripción/entrega. Solo "aprobada" otorga estrellas (anti-fuga).
// inscrita  -> la creadora se inscribió (esperando que el equipo la acepte)
// aceptada  -> el equipo la aceptó (puede grabar; se le envía producto si aplica)
// entregada -> subió el link de su video (lista para revisión final)
// aprobada  -> el equipo aprobó la entrega (otorga estrellas)
// rechazada -> el equipo la rechazó con motivo (puede corregir y reenviar)
export const PARTICIPATION_STATUS = ["inscrita", "aceptada", "entregada", "aprobada", "rechazada"] as const;
export type ParticipationStatus = (typeof PARTICIPATION_STATUS)[number];

export interface Participation {
  id?: string;
  creatorEmail: string;
  campaignId: string;
  status: string; // ParticipationStatus
  link?: string;
  reason?: string; // motivo de rechazo (visible para la creadora)
  createdAt?: string;
}

const FILE = path.join(process.cwd(), ".data", "store.json");
interface DB {
  creators: CreatorRecord[];
  participations: Participation[];
  campaigns?: Campaign[];
  canjes?: Canje[];
  misiones?: MisionCompletion[];
  rewards?: Reward[];
  activaciones?: Activacion[];
  products?: Product[];
  muestras?: Muestra[];
  calendar?: CalendarEvent[];
  faq?: FaqItem[];
}

async function readDB(): Promise<DB> {
  try {
    const db = JSON.parse(await fs.readFile(FILE, "utf8")) as DB;
    return {
      creators: db.creators ?? [],
      participations: db.participations ?? [],
      campaigns: db.campaigns,
      canjes: db.canjes ?? [],
      misiones: db.misiones ?? [],
      rewards: db.rewards,
      activaciones: db.activaciones ?? [],
      products: db.products,
      muestras: db.muestras ?? [],
      calendar: db.calendar,
      faq: db.faq,
    };
  } catch {
    return { creators: [], participations: [], canjes: [], misiones: [], activaciones: [], muestras: [] };
  }
}
async function writeDB(db: DB): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2));
}

// ── Creadoras ──────────────────────────────────────────────────────────
export async function createCreator(c: CreatorRecord, conn?: Conn): Promise<CreatorRecord> {
  if (airtableConfigured(conn)) {
    // Dedupe por email también en Airtable (antes solo deduplicaba el archivo
    // local): re-registrarse no debe crear una creadora duplicada.
    const existing = await getCreatorByEmail(c.email, conn);
    if (existing) return existing;
    const r = await airtableCreate(TABLES.Creadoras, {
      Nombre: c.name,
      Handle: c.handle,
      Email: c.email,
      Seguidores: c.followers ?? "",
      Ciudad: c.city ?? "",
      Portafolio: c.portfolio ?? "",
      AfiliadoHandle: c.affiliateHandle ?? "",
      Direccion: c.shippingAddress ?? "",
      ...(c.consentAt ? { Consentimiento: true, ConsentimientoFecha: c.consentAt, ConsentimientoVersion: c.consentVersion ?? "" } : {}),
    }, conn);
    return { ...c, id: r.id };
  }
  const db = await readDB();
  const existing = db.creators.find((x) => x.email === c.email);
  if (existing) return existing;
  const rec: CreatorRecord = { ...c, id: "loc_" + randomUUID(), createdAt: new Date().toISOString() };
  db.creators.push(rec);
  await writeDB(db);
  return rec;
}

interface CreadoraFields {
  Nombre: string;
  Handle: string;
  Email: string;
  Seguidores?: string;
  Ciudad?: string;
  Portafolio?: string;
  AfiliadoHandle?: string;
  Direccion?: string;
  GMV_MXN?: number;
  GMV_Fecha?: string;
  Consentimiento?: boolean;
  ConsentimientoFecha?: string;
  ConsentimientoVersion?: string;
}

// Campos editables por la creadora desde su perfil. NO incluye email (es la clave
// de identidad), GMV (lo captura el equipo) ni el consentimiento (se fija al
// registrarse). El email se omite a propósito.
export type CreatorPatch = Partial<
  Pick<CreatorRecord, "name" | "handle" | "followers" | "city" | "portfolio" | "affiliateHandle" | "shippingAddress">
>;

// Edita el perfil de una creadora (por id). Solo los campos presentes en el patch.
export async function updateCreator(id: string, patch: CreatorPatch, conn?: Conn): Promise<void> {
  if (airtableConfigured(conn)) {
    const fields: Record<string, unknown> = {};
    if (patch.name !== undefined) fields.Nombre = patch.name;
    if (patch.handle !== undefined) fields.Handle = patch.handle;
    if (patch.followers !== undefined) fields.Seguidores = patch.followers;
    if (patch.city !== undefined) fields.Ciudad = patch.city;
    if (patch.portfolio !== undefined) fields.Portafolio = patch.portfolio;
    if (patch.affiliateHandle !== undefined) fields.AfiliadoHandle = patch.affiliateHandle;
    if (patch.shippingAddress !== undefined) fields.Direccion = patch.shippingAddress;
    if (Object.keys(fields).length) await airtableUpdate(TABLES.Creadoras, id, fields, conn);
    return;
  }
  const db = await readDB();
  const c = db.creators.find((x) => x.id === id);
  if (c) {
    Object.assign(c, patch);
    await writeDB(db);
  }
}

function creadoraToRecord(r: { id: string; fields: CreadoraFields; createdTime?: string }): CreatorRecord {
  return {
    id: r.id,
    name: r.fields.Nombre,
    handle: r.fields.Handle,
    email: r.fields.Email,
    followers: r.fields.Seguidores,
    city: r.fields.Ciudad,
    portfolio: r.fields.Portafolio,
    affiliateHandle: r.fields.AfiliadoHandle,
    shippingAddress: r.fields.Direccion,
    gmvMXN: r.fields.GMV_MXN,
    gmvDate: r.fields.GMV_Fecha,
    consentAt: r.fields.ConsentimientoFecha,
    consentVersion: r.fields.ConsentimientoVersion,
    createdAt: r.createdTime,
  };
}

export async function getCreatorByEmail(email: string, conn?: Conn): Promise<CreatorRecord | null> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<CreadoraFields>(TABLES.Creadoras, {
      filterByFormula: `LOWER({Email})='${escFormula(email.toLowerCase())}'`,
    }, conn);
    return recs[0] ? creadoraToRecord(recs[0]) : null;
  }
  const db = await readDB();
  return db.creators.find((x) => x.email === email) ?? null;
}

export async function listCreators(conn?: Conn): Promise<CreatorRecord[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<CreadoraFields>(TABLES.Creadoras, {}, conn);
    return recs.map(creadoraToRecord);
  }
  return (await readDB()).creators;
}

// El equipo captura a mano el GMV atribuible de la creadora (export de TT Shop
// Analytics). NO es tiempo real: se guarda con la fecha "actualizado al".
export async function setCreatorGmv(id: string, gmvMXN: number, gmvDate: string, conn?: Conn): Promise<void> {
  if (airtableConfigured(conn)) {
    await airtableUpdate(TABLES.Creadoras, id, { GMV_MXN: gmvMXN, GMV_Fecha: gmvDate }, conn);
    return;
  }
  const db = await readDB();
  const c = db.creators.find((x) => x.id === id);
  if (c) {
    c.gmvMXN = gmvMXN;
    c.gmvDate = gmvDate;
    await writeDB(db);
  }
}

// ── Inscripciones / Entregas ────────────────────────────────────────────
export async function addParticipation(p: Participation, conn?: Conn): Promise<Participation> {
  if (airtableConfigured(conn)) {
    // Dedupe: no crear una segunda inscripción de la misma creadora a la misma campaña.
    const existing = await fetchAll<{ Email: string; Campaña: string; Estado: string }>(TABLES.Entregas, {
      filterByFormula: `AND(LOWER({Email})='${escFormula(p.creatorEmail.toLowerCase())}',{Campaña}='${escFormula(p.campaignId)}')`,
    }, conn);
    if (existing[0]) {
      const r = existing[0];
      return { ...p, id: r.id, status: r.fields.Estado };
    }
    const r = await airtableCreate(TABLES.Entregas, {
      Email: p.creatorEmail,
      Campaña: p.campaignId,
      Estado: p.status,
      Link: p.link ?? "",
    }, conn);
    return { ...p, id: r.id };
  }
  const db = await readDB();
  const dup = db.participations.find((x) => x.creatorEmail === p.creatorEmail && x.campaignId === p.campaignId);
  if (dup) return dup;
  const rec: Participation = { ...p, id: "loc_" + randomUUID(), createdAt: new Date().toISOString() };
  db.participations.push(rec);
  await writeDB(db);
  return rec;
}

export async function participationsFor(email: string, conn?: Conn): Promise<Participation[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<{ Email: string; Campaña: string; Estado: string; Link?: string; Motivo?: string }>(TABLES.Entregas, {
      filterByFormula: `LOWER({Email})='${escFormula(email.toLowerCase())}'`,
    }, conn);
    return recs.map((r) => ({ creatorEmail: r.fields.Email, campaignId: r.fields.Campaña, status: r.fields.Estado, link: r.fields.Link, reason: r.fields.Motivo, id: r.id, createdAt: r.createdTime }));
  }
  const db = await readDB();
  return db.participations.filter((x) => x.creatorEmail === email);
}

export async function getParticipationById(id: string, conn?: Conn): Promise<Participation | undefined> {
  return (await listParticipations(conn)).find((p) => p.id === id);
}

// Todas las inscripciones (para el panel de admin).
export async function listParticipations(conn?: Conn): Promise<Participation[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<{ Email: string; Campaña: string; Estado: string; Link?: string; Motivo?: string }>(TABLES.Entregas, {}, conn);
    return recs.map((r) => ({
      id: r.id,
      creatorEmail: r.fields.Email,
      campaignId: r.fields.Campaña,
      status: r.fields.Estado,
      link: r.fields.Link,
      reason: r.fields.Motivo,
      createdAt: r.createdTime,
    }));
  }
  return (await readDB()).participations;
}

export async function setParticipationStatus(
  id: string,
  status: ParticipationStatus,
  reason?: string,
  conn?: Conn
): Promise<void> {
  // El motivo solo aplica a "rechazada"; en cualquier otro estado se limpia.
  const motivo = status === "rechazada" ? (reason ?? "") : "";
  if (airtableConfigured(conn)) {
    await airtableUpdate(TABLES.Entregas, id, { Estado: status, Motivo: motivo }, conn);
    return;
  }
  const db = await readDB();
  const p = db.participations.find((x) => x.id === id);
  if (p) {
    p.status = status;
    p.reason = motivo || undefined;
    await writeDB(db);
  }
}

// La creadora sube/actualiza el link de su video -> pasa a "entregada".
// No degrada una entrega ya aprobada. Devuelve true si actualizó algo.
export async function submitDelivery(
  creatorEmail: string,
  campaignId: string,
  link: string,
  conn?: Conn
): Promise<boolean> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<{ Estado: string }>(TABLES.Entregas, {
      filterByFormula: `AND(LOWER({Email})='${escFormula(creatorEmail.toLowerCase())}',{Campaña}='${escFormula(campaignId)}')`,
    }, conn);
    const rec = recs[0];
    if (!rec) return false;
    // Una entrega ya APROBADA no puede cambiar su link sin re-revisión.
    if (rec.fields.Estado === "aprobada") return false;
    await airtableUpdate(TABLES.Entregas, rec.id, { Link: link, Estado: "entregada", Motivo: "" }, conn);
    return true;
  }
  const db = await readDB();
  const p = db.participations.find(
    (x) => x.creatorEmail === creatorEmail && x.campaignId === campaignId
  );
  if (!p) return false;
  if (p.status === "aprobada") return false;
  p.link = link;
  p.status = "entregada";
  p.reason = undefined;
  await writeDB(db);
  return true;
}

// Estrellas otorgadas: solo cuentan las participaciones APROBADAS.
// (Inscribirse no da estrellas; el admin las "otorga" al aprobar la entrega.)
// Dedupe por campaña: si por una race quedaran 2 aprobadas de la misma campaña,
// no se cuentan doble.
export function starsFromApproved(parts: Participation[], campaigns: Campaign[]): number {
  const byId = new Map(campaigns.map((c) => [c.id, c]));
  const counted = new Set<string>();
  let total = 0;
  for (const p of parts) {
    if (p.status !== "aprobada" || counted.has(p.campaignId)) continue;
    counted.add(p.campaignId);
    total += byId.get(p.campaignId)?.stars ?? 0;
  }
  return total;
}

// ── Canjes (solicitudes de recompensa) ──────────────────────────────────
// La creadora "solicita" una recompensa desbloqueada; el equipo la aprueba o
// rechaza en /admin. Las recompensas con costo NO se aprueban sin GMV atribuible
// (gate anti-fuga en la server action). El catálogo de recompensas vive en código
// (lib/brands.ts); aquí solo persiste la transacción (espejo de Entregas).
// entregada = recompensa con costo ya entregada/pagada por el equipo (estado
// terminal que cierra el ciclo del canje).
export const CANJE_STATUS = ["solicitada", "aprobada", "rechazada", "entregada"] as const;
export type CanjeStatus = (typeof CANJE_STATUS)[number];

export interface Canje {
  id?: string;
  creatorEmail: string;
  rewardId: string;
  rewardTitle: string; // snapshot para el panel y el historial
  status: string; // CanjeStatus
  reason?: string; // motivo de rechazo (visible para la creadora)
  createdAt?: string;
}

interface CanjeFields {
  Email: string;
  Recompensa: string;
  Titulo?: string;
  Estado: string;
  Motivo?: string;
}

function canjeToRecord(r: { id: string; fields: CanjeFields; createdTime?: string }): Canje {
  return {
    id: r.id,
    creatorEmail: r.fields.Email,
    rewardId: r.fields.Recompensa,
    rewardTitle: r.fields.Titulo ?? "",
    status: r.fields.Estado,
    reason: r.fields.Motivo,
    createdAt: r.createdTime,
  };
}

// Solicitar un canje. Dedupe: una sola solicitud ABIERTA (solicitada o aprobada)
// por recompensa y creadora. Un rechazo permite volver a solicitar sobre el mismo
// registro (no se acumulan canjes muertos).
export async function requestCanje(creatorEmail: string, rewardId: string, rewardTitle: string, conn?: Conn): Promise<Canje> {
  if (airtableConfigured(conn)) {
    const existing = await fetchAll<CanjeFields>(TABLES.Canjes, {
      filterByFormula: `AND(LOWER({Email})='${escFormula(creatorEmail.toLowerCase())}',{Recompensa}='${escFormula(rewardId)}')`,
    }, conn);
    // solicitada/aprobada/entregada = ya hay un canje vigente o cerrado (no se
    // vuelve a solicitar una recompensa ya entregada). Solo un rechazo reabre.
    const open = existing.find(
      (r) => r.fields.Estado === "solicitada" || r.fields.Estado === "aprobada" || r.fields.Estado === "entregada"
    );
    if (open) return canjeToRecord(open);
    const rejected = existing.find((r) => r.fields.Estado === "rechazada");
    if (rejected) {
      await airtableUpdate(TABLES.Canjes, rejected.id, { Estado: "solicitada", Motivo: "", Titulo: rewardTitle }, conn);
      return { ...canjeToRecord(rejected), status: "solicitada", reason: undefined, rewardTitle };
    }
    const r = await airtableCreate(TABLES.Canjes, {
      Email: creatorEmail,
      Recompensa: rewardId,
      Titulo: rewardTitle,
      Estado: "solicitada",
    }, conn);
    return { id: r.id, creatorEmail, rewardId, rewardTitle, status: "solicitada" };
  }
  const db = await readDB();
  db.canjes = db.canjes ?? [];
  const existing = db.canjes.filter((x) => x.creatorEmail === creatorEmail && x.rewardId === rewardId);
  const open = existing.find((x) => x.status === "solicitada" || x.status === "aprobada" || x.status === "entregada");
  if (open) return open;
  const rejected = existing.find((x) => x.status === "rechazada");
  if (rejected) {
    rejected.status = "solicitada";
    rejected.reason = undefined;
    rejected.rewardTitle = rewardTitle;
    await writeDB(db);
    return rejected;
  }
  const rec: Canje = { id: "loc_" + randomUUID(), creatorEmail, rewardId, rewardTitle, status: "solicitada", createdAt: new Date().toISOString() };
  db.canjes.push(rec);
  await writeDB(db);
  return rec;
}

export async function canjesFor(email: string, conn?: Conn): Promise<Canje[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<CanjeFields>(TABLES.Canjes, {
      filterByFormula: `LOWER({Email})='${escFormula(email.toLowerCase())}'`,
    }, conn);
    return recs.map(canjeToRecord);
  }
  return (await readDB()).canjes?.filter((x) => x.creatorEmail === email) ?? [];
}

// Todos los canjes (para el panel de admin).
export async function listCanjes(conn?: Conn): Promise<Canje[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<CanjeFields>(TABLES.Canjes, {}, conn);
    return recs.map(canjeToRecord);
  }
  return (await readDB()).canjes ?? [];
}

export async function getCanjeById(id: string, conn?: Conn): Promise<Canje | undefined> {
  return (await listCanjes(conn)).find((c) => c.id === id);
}

export async function setCanjeStatus(id: string, status: CanjeStatus, reason?: string, conn?: Conn): Promise<void> {
  // El motivo solo aplica a "rechazada"; en cualquier otro estado se limpia.
  const motivo = status === "rechazada" ? (reason ?? "") : "";
  if (airtableConfigured(conn)) {
    await airtableUpdate(TABLES.Canjes, id, { Estado: status, Motivo: motivo }, conn);
    return;
  }
  const db = await readDB();
  const c = (db.canjes ?? []).find((x) => x.id === id);
  if (c) {
    c.status = status;
    c.reason = motivo || undefined;
    await writeDB(db);
  }
}

// ── Activaciones de Live (Flash Sales / Giveaways) ────────────────────────
// La creadora SOLICITA una activación para su Live; el equipo la OTORGA en TikTok
// Shop. Espejo de Canjes pero más simple: NO hay gate de GMV (es una activación de
// la marca SOBRE el Live de la creadora, no una recompensa con costo para ella; el
// equipo decide otorgar con el contexto de su nivel/GMV visible en /admin).
export const ACTIVACION_STATUS = ["solicitada", "otorgada", "rechazada"] as const;
export type ActivacionStatus = (typeof ACTIVACION_STATUS)[number];

export interface Activacion {
  id?: string;
  creatorEmail: string;
  tipo: string; // ActivacionTipo: "flash_sale" | "giveaway"
  usuario: string; // usuario de TikTok / del Live que dejó la creadora
  status: string; // ActivacionStatus
  reason?: string; // motivo de rechazo (visible para la creadora)
  createdAt?: string;
}

interface ActivacionFields {
  Email: string;
  Tipo: string;
  Usuario?: string;
  Estado: string;
  Motivo?: string;
}

function activacionToRecord(r: { id: string; fields: ActivacionFields; createdTime?: string }): Activacion {
  return {
    id: r.id,
    creatorEmail: r.fields.Email,
    tipo: r.fields.Tipo,
    usuario: r.fields.Usuario ?? "",
    status: r.fields.Estado,
    reason: r.fields.Motivo,
    createdAt: r.createdTime,
  };
}

// Solicitar una activación. Dedup: una sola solicitud ABIERTA (solicitada) por
// tipo y creadora, para no spamear al equipo. Una vez otorgada/rechazada puede
// volver a pedir (su siguiente Live).
export async function addActivacion(a: Activacion, conn?: Conn): Promise<Activacion> {
  if (airtableConfigured(conn)) {
    const existing = await fetchAll<ActivacionFields>(TABLES.Activaciones, {
      filterByFormula: `AND(LOWER({Email})='${escFormula(a.creatorEmail.toLowerCase())}',{Tipo}='${escFormula(a.tipo)}',{Estado}='solicitada')`,
    }, conn);
    if (existing[0]) {
      // Ya tiene una pendiente de ese tipo. Si reenvía con el usuario CORREGIDO
      // (distinto y no vacío), actualízalo: ese campo es el que usa el equipo para
      // saber en qué cuenta de TikTok prender la activación.
      const cur = activacionToRecord(existing[0]);
      if (a.usuario && a.usuario !== cur.usuario) {
        await airtableUpdate(TABLES.Activaciones, existing[0].id, { Usuario: a.usuario }, conn);
        return { ...cur, usuario: a.usuario };
      }
      return cur;
    }
    const r = await airtableCreate(TABLES.Activaciones, {
      Email: a.creatorEmail,
      Tipo: a.tipo,
      Usuario: a.usuario,
      Estado: "solicitada",
    }, conn);
    return { ...a, id: r.id, status: "solicitada" };
  }
  const db = await readDB();
  db.activaciones = db.activaciones ?? [];
  const dup = db.activaciones.find((x) => x.creatorEmail === a.creatorEmail && x.tipo === a.tipo && x.status === "solicitada");
  if (dup) {
    // Mismo caso en archivo local: actualiza el usuario corregido antes de devolver.
    if (a.usuario && a.usuario !== dup.usuario) {
      dup.usuario = a.usuario;
      await writeDB(db);
    }
    return dup;
  }
  const rec: Activacion = { ...a, id: "loc_" + randomUUID(), status: "solicitada", createdAt: new Date().toISOString() };
  db.activaciones.push(rec);
  await writeDB(db);
  return rec;
}

export async function activacionesFor(email: string, conn?: Conn): Promise<Activacion[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<ActivacionFields>(TABLES.Activaciones, {
      filterByFormula: `LOWER({Email})='${escFormula(email.toLowerCase())}'`,
    }, conn);
    return recs.map(activacionToRecord);
  }
  return (await readDB()).activaciones?.filter((x) => x.creatorEmail === email) ?? [];
}

export async function listActivaciones(conn?: Conn): Promise<Activacion[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<ActivacionFields>(TABLES.Activaciones, {}, conn);
    return recs.map(activacionToRecord);
  }
  return (await readDB()).activaciones ?? [];
}

export async function getActivacionById(id: string, conn?: Conn): Promise<Activacion | undefined> {
  return (await listActivaciones(conn)).find((a) => a.id === id);
}

export async function setActivacionStatus(id: string, status: ActivacionStatus, reason?: string, conn?: Conn): Promise<void> {
  const motivo = status === "rechazada" ? (reason ?? "") : "";
  if (airtableConfigured(conn)) {
    await airtableUpdate(TABLES.Activaciones, id, { Estado: status, Motivo: motivo }, conn);
    return;
  }
  const db = await readDB();
  const a = (db.activaciones ?? []).find((x) => x.id === id);
  if (a) {
    a.status = status;
    a.reason = motivo || undefined;
    await writeDB(db);
  }
}

// ── Muestras (Sample Requests: la creadora pide producto para crear contenido) ──
// La creadora SOLICITA una muestra de un producto del catálogo dejando su dirección
// de envío; el equipo la APRUEBA y la ENVÍA (o rechaza). Es una INVERSIÓN de la
// marca para generar contenido, NO un premio por venta: por eso NO tiene gate de GMV
// (como las activaciones); el equipo decide con el contexto de la creadora (afiliado
// conectado, nivel, GMV, perfil) visible en /admin. La aprobación manual del equipo
// ES el candado anti-fuga. Espejo de Activaciones + Canjes (estado "enviada" terminal).
//   solicitada -> la creadora la pidió (esperando que el equipo decida)
//   aprobada   -> el equipo la aprobó (preparando el envío)
//   enviada    -> el equipo ya la mandó (estado terminal)
//   rechazada  -> el equipo la rechazó con motivo (puede volver a pedir)
export const MUESTRA_STATUS = ["solicitada", "aprobada", "enviada", "rechazada"] as const;
export type MuestraStatus = (typeof MUESTRA_STATUS)[number];

export interface Muestra {
  id?: string;
  creatorEmail: string;
  productId: string;
  productName: string; // snapshot para el panel y el historial
  address: string; // dirección de envío que dejó la creadora
  note?: string; // nota opcional (para qué/dónde la usará)
  status: string; // MuestraStatus
  reason?: string; // motivo de rechazo (visible para la creadora)
  createdAt?: string;
}

interface MuestraFields {
  Email: string;
  Producto?: string;
  ProductoNombre?: string;
  Direccion?: string;
  Nota?: string;
  Estado: string;
  Motivo?: string;
}

function muestraToRecord(r: { id: string; fields: MuestraFields; createdTime?: string }): Muestra {
  return {
    id: r.id,
    creatorEmail: r.fields.Email,
    productId: r.fields.Producto ?? "",
    productName: r.fields.ProductoNombre ?? "",
    address: r.fields.Direccion ?? "",
    note: r.fields.Nota || undefined,
    status: r.fields.Estado,
    reason: r.fields.Motivo,
    createdAt: r.createdTime,
  };
}

const MUESTRA_OPEN = ["solicitada", "aprobada", "enviada"];

// Solicitar una muestra. Dedup: una sola solicitud ABIERTA (solicitada/aprobada/
// enviada) por creadora y producto. Un rechazo permite volver a pedir sobre el mismo
// registro (con la dirección/nota corregidas), sin acumular muestras muertas.
export async function addMuestra(m: Muestra, conn?: Conn): Promise<Muestra> {
  if (airtableConfigured(conn)) {
    const existing = await fetchAll<MuestraFields>(TABLES.Muestras, {
      filterByFormula: `AND(LOWER({Email})='${escFormula(m.creatorEmail.toLowerCase())}',{Producto}='${escFormula(m.productId)}')`,
    }, conn);
    const open = existing.find((r) => MUESTRA_OPEN.includes(r.fields.Estado));
    if (open) return muestraToRecord(open);
    const rejected = existing.find((r) => r.fields.Estado === "rechazada");
    if (rejected) {
      await airtableUpdate(TABLES.Muestras, rejected.id, { Estado: "solicitada", Motivo: "", Direccion: m.address, Nota: m.note ?? "", ProductoNombre: m.productName }, conn);
      return { ...muestraToRecord(rejected), status: "solicitada", reason: undefined, address: m.address, note: m.note, productName: m.productName };
    }
    const r = await airtableCreate(TABLES.Muestras, {
      Email: m.creatorEmail,
      Producto: m.productId,
      ProductoNombre: m.productName,
      Direccion: m.address,
      Nota: m.note ?? "",
      Estado: "solicitada",
    }, conn);
    return { ...m, id: r.id, status: "solicitada" };
  }
  const db = await readDB();
  db.muestras = db.muestras ?? [];
  const existing = db.muestras.filter((x) => x.creatorEmail === m.creatorEmail && x.productId === m.productId);
  const open = existing.find((x) => MUESTRA_OPEN.includes(x.status));
  if (open) return open;
  const rejected = existing.find((x) => x.status === "rechazada");
  if (rejected) {
    rejected.status = "solicitada";
    rejected.reason = undefined;
    rejected.address = m.address;
    rejected.note = m.note;
    rejected.productName = m.productName;
    await writeDB(db);
    return rejected;
  }
  const rec: Muestra = { ...m, id: "loc_" + randomUUID(), status: "solicitada", createdAt: new Date().toISOString() };
  db.muestras.push(rec);
  await writeDB(db);
  return rec;
}

export async function muestrasFor(email: string, conn?: Conn): Promise<Muestra[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<MuestraFields>(TABLES.Muestras, {
      filterByFormula: `LOWER({Email})='${escFormula(email.toLowerCase())}'`,
    }, conn);
    return recs.map(muestraToRecord);
  }
  return (await readDB()).muestras?.filter((x) => x.creatorEmail === email) ?? [];
}

export async function listMuestras(conn?: Conn): Promise<Muestra[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<MuestraFields>(TABLES.Muestras, {}, conn);
    return recs.map(muestraToRecord);
  }
  return (await readDB()).muestras ?? [];
}

export async function getMuestraById(id: string, conn?: Conn): Promise<Muestra | undefined> {
  return (await listMuestras(conn)).find((m) => m.id === id);
}

export async function setMuestraStatus(id: string, status: MuestraStatus, reason?: string, conn?: Conn): Promise<void> {
  const motivo = status === "rechazada" ? (reason ?? "") : "";
  if (airtableConfigured(conn)) {
    await airtableUpdate(TABLES.Muestras, id, { Estado: status, Motivo: motivo }, conn);
    return;
  }
  const db = await readDB();
  const m = (db.muestras ?? []).find((x) => x.id === id);
  if (m) {
    m.status = status;
    m.reason = motivo || undefined;
    await writeDB(db);
  }
}

// ── Misiones (tracking real de misiones) ─────────────────────────────────
// Una misión completable de verdad. Espejo de Entregas/Canjes. Estados:
//   completada -> misión de estatus terminada (watch: inducción vista). Otorga
//                 estrellas de inmediato (costo $0). Las "auto" (perfil/afiliado)
//                 NO persisten aquí: se derivan de los datos de la creadora.
//   enviada    -> misión de contenido: la creadora pegó su link, espera revisión.
//   aprobada   -> el equipo aprobó la entrega de la misión (otorga estrellas).
//   rechazada  -> el equipo la rechazó con motivo (puede corregir y reenviar).
// Las misiones de VENTA (requiresSale) NO viven aquí: se acreditan desde el GMV
// real capturado por el equipo (anti-fuga). No se auto-completan nunca.
export const MISION_STATUS = ["enviada", "aprobada", "rechazada", "completada"] as const;
export type MisionStatus = (typeof MISION_STATUS)[number];

export interface MisionCompletion {
  id?: string;
  creatorEmail: string;
  missionId: string;
  status: string; // MisionStatus
  link?: string; // payload (URL del video) para misiones de contenido
  reason?: string; // motivo de rechazo (visible para la creadora)
  createdAt?: string;
}

interface MisionFields {
  Email: string;
  Mision: string;
  Estado: string;
  Link?: string;
  Motivo?: string;
}

function misionToRecord(r: { id: string; fields: MisionFields; createdTime?: string }): MisionCompletion {
  return {
    id: r.id,
    creatorEmail: r.fields.Email,
    missionId: r.fields.Mision,
    status: r.fields.Estado,
    link: r.fields.Link,
    reason: r.fields.Motivo,
    createdAt: r.createdTime,
  };
}

export async function misionesFor(email: string, conn?: Conn): Promise<MisionCompletion[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<MisionFields>(TABLES.Misiones, {
      filterByFormula: `LOWER({Email})='${escFormula(email.toLowerCase())}'`,
    }, conn);
    return recs.map(misionToRecord);
  }
  return (await readDB()).misiones?.filter((x) => x.creatorEmail === email) ?? [];
}

// Todas las misiones registradas (para el panel de admin).
export async function listMisiones(conn?: Conn): Promise<MisionCompletion[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<MisionFields>(TABLES.Misiones, {}, conn);
    return recs.map(misionToRecord);
  }
  return (await readDB()).misiones ?? [];
}

export async function getMisionById(id: string, conn?: Conn): Promise<MisionCompletion | undefined> {
  return (await listMisiones(conn)).find((m) => m.id === id);
}

// Helper interno: registro de una misión de una creadora (Airtable o archivo).
async function findMision(email: string, missionId: string, conn?: Conn): Promise<MisionCompletion | null> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<MisionFields>(TABLES.Misiones, {
      filterByFormula: `AND(LOWER({Email})='${escFormula(email.toLowerCase())}',{Mision}='${escFormula(missionId)}')`,
    }, conn);
    return recs[0] ? misionToRecord(recs[0]) : null;
  }
  const db = await readDB();
  return db.misiones?.find((x) => x.creatorEmail === email && x.missionId === missionId) ?? null;
}

// La creadora pega/actualiza el link de su misión de contenido -> "enviada".
// No degrada una misión ya APROBADA (no re-abre estrellas concedidas). Devuelve
// true si registró algo.
export async function submitMision(email: string, missionId: string, link: string, conn?: Conn): Promise<boolean> {
  if (airtableConfigured(conn)) {
    const existing = await findMision(email, missionId, conn);
    if (existing?.status === "aprobada") return false;
    if (existing?.id) {
      await airtableUpdate(TABLES.Misiones, existing.id, { Link: link, Estado: "enviada", Motivo: "" }, conn);
    } else {
      await airtableCreate(TABLES.Misiones, { Email: email, Mision: missionId, Estado: "enviada", Link: link }, conn);
    }
    return true;
  }
  const db = await readDB();
  db.misiones = db.misiones ?? [];
  const m = db.misiones.find((x) => x.creatorEmail === email && x.missionId === missionId);
  if (m?.status === "aprobada") return false;
  if (m) {
    m.link = link;
    m.status = "enviada";
    m.reason = undefined;
  } else {
    db.misiones.push({ id: "loc_" + randomUUID(), creatorEmail: email, missionId, status: "enviada", link, createdAt: new Date().toISOString() });
  }
  await writeDB(db);
  return true;
}

// Marca una misión de estatus como "completada" (ej. inducción vista). Idempotente:
// no re-crea ni degrada un registro existente. Otorga estrellas (costo $0).
export async function markMisionDone(email: string, missionId: string, conn?: Conn): Promise<void> {
  if (airtableConfigured(conn)) {
    const existing = await findMision(email, missionId, conn);
    if (existing) {
      if (existing.status !== "completada") {
        await airtableUpdate(TABLES.Misiones, existing.id!, { Estado: "completada", Motivo: "" }, conn);
      }
      return;
    }
    await airtableCreate(TABLES.Misiones, { Email: email, Mision: missionId, Estado: "completada" }, conn);
    return;
  }
  const db = await readDB();
  db.misiones = db.misiones ?? [];
  const m = db.misiones.find((x) => x.creatorEmail === email && x.missionId === missionId);
  if (m) {
    m.status = "completada";
    m.reason = undefined;
  } else {
    db.misiones.push({ id: "loc_" + randomUUID(), creatorEmail: email, missionId, status: "completada", createdAt: new Date().toISOString() });
  }
  await writeDB(db);
}

export async function setMisionStatus(id: string, status: MisionStatus, reason?: string, conn?: Conn): Promise<void> {
  const motivo = status === "rechazada" ? (reason ?? "") : "";
  if (airtableConfigured(conn)) {
    await airtableUpdate(TABLES.Misiones, id, { Estado: status, Motivo: motivo }, conn);
    return;
  }
  const db = await readDB();
  const m = (db.misiones ?? []).find((x) => x.id === id);
  if (m) {
    m.status = status;
    m.reason = motivo || undefined;
    await writeDB(db);
  }
}

// ── Campañas ─────────────────────────────────────────────────────────────
function campaignToAirtableFields(c: Partial<CampaignInput> & { id?: string }): Record<string, unknown> {
  const f: Record<string, unknown> = {};
  if (c.id !== undefined) f.Id = c.id;
  if (c.title !== undefined) f["Título"] = c.title;
  if (c.brand !== undefined) f.Marca = c.brand;
  if (c.brief !== undefined) f.Brief = c.brief;
  if (c.reward !== undefined) f.Recompensa = c.reward;
  if (c.stars !== undefined) f.Estrellas = c.stars;
  if (c.deadline !== undefined) f.Deadline = c.deadline;
  if (c.tag !== undefined) f.Tag = c.tag;
  if (c.requirements !== undefined) f.Requisitos = c.requirements;
  if (c.cupo !== undefined) f.Cupo = c.cupo;
  if (c.tiers !== undefined) f.Niveles = serializeTiers(c.tiers);
  if (c.open !== undefined) f.Activa = c.open;
  return f;
}

interface CampanaFields {
  Id?: string;
  ["Título"]?: string;
  Marca?: string;
  Brief?: string;
  Recompensa?: string;
  Estrellas?: number;
  Deadline?: string;
  Tag?: string;
  Requisitos?: string;
  Cupo?: number;
  Niveles?: string;
  Activa?: boolean;
}

export async function listCampaigns(conn?: Conn): Promise<Campaign[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<CampanaFields>(TABLES.Campanas, {}, conn);
    return recs.map((r) => ({
      recordId: r.id,
      id: r.fields.Id || slugify(r.fields["Título"] ?? r.id),
      title: r.fields["Título"] ?? "(sin título)",
      brand: r.fields.Marca ?? BRAND.name,
      brief: r.fields.Brief ?? "",
      reward: r.fields.Recompensa ?? "",
      stars: Number(r.fields.Estrellas ?? 0),
      deadline: r.fields.Deadline ?? "",
      tag: r.fields.Tag ?? "",
      requirements: r.fields.Requisitos ?? "",
      cupo: r.fields.Cupo != null ? Number(r.fields.Cupo) : undefined,
      tiers: parseTiers(r.fields.Niveles),
      open: !!r.fields.Activa,
    }));
  }
  // Archivo local: sembrar desde el seed la primera vez.
  const db = await readDB();
  if (!db.campaigns) {
    db.campaigns = CAMPAIGN_SEED.map((c) => ({ ...c }));
    await writeDB(db);
  }
  return db.campaigns;
}

// Solo las campañas activas (lo que ve el portal público).
export async function listOpenCampaigns(conn?: Conn): Promise<Campaign[]> {
  return (await listCampaigns(conn)).filter((c) => c.open);
}

export async function getCampaignById(id: string, conn?: Conn): Promise<Campaign | undefined> {
  return (await listCampaigns(conn)).find((c) => c.id === id);
}

async function uniqueSlug(base: string, existing: { id: string }[]): Promise<string> {
  const taken = new Set(existing.map((c) => c.id));
  let slug = slugify(base) || "campana";
  let n = 2;
  while (taken.has(slug)) slug = `${slugify(base) || "campana"}-${n++}`;
  return slug;
}

export async function createCampaign(input: CampaignInput, conn?: Conn): Promise<Campaign> {
  const all = await listCampaigns(conn);
  const id = await uniqueSlug(input.title, all);
  const campaign: Campaign = { ...input, id };
  if (airtableConfigured(conn)) {
    const r = await airtableCreate(TABLES.Campanas, campaignToAirtableFields({ ...input, id }), conn);
    return { ...campaign, recordId: r.id };
  }
  const db = await readDB();
  db.campaigns = db.campaigns ?? all.map((c) => ({ ...c }));
  db.campaigns.push(campaign);
  await writeDB(db);
  return campaign;
}

export async function updateCampaign(id: string, patch: Partial<CampaignInput>, conn?: Conn): Promise<void> {
  if (airtableConfigured(conn)) {
    const current = await getCampaignById(id, conn);
    if (!current?.recordId) throw new Error(`Campaña ${id} no encontrada`);
    await airtableUpdate(TABLES.Campanas, current.recordId, campaignToAirtableFields(patch), conn);
    return;
  }
  const db = await readDB();
  db.campaigns = db.campaigns ?? CAMPAIGN_SEED.map((c) => ({ ...c }));
  const c = db.campaigns.find((x) => x.id === id);
  if (c) {
    Object.assign(c, patch);
    await writeDB(db);
  }
}

export async function setCampaignOpen(id: string, open: boolean, conn?: Conn): Promise<void> {
  await updateCampaign(id, { open }, conn);
}

export async function deleteCampaign(id: string, conn?: Conn): Promise<void> {
  if (airtableConfigured(conn)) {
    const current = await getCampaignById(id, conn);
    if (current?.recordId) await airtableDelete(TABLES.Campanas, current.recordId, conn);
    return;
  }
  const db = await readDB();
  db.campaigns = (db.campaigns ?? CAMPAIGN_SEED.map((c) => ({ ...c }))).filter((x) => x.id !== id);
  await writeDB(db);
}

// ── Recompensas (premios; el equipo las prende/apaga en /admin) ───────────
// Espejo de Campañas: viven en Airtable (tabla Recompensas) y se editan desde
// /admin. El candado anti-fuga (premio con costo exige GMV atribuible) NO está
// aquí: vive en lib/rewards.ts y se aplica SIEMPRE, sin importar lo que capture
// el equipo, así que un premio mal configurado no puede saltarse la regla.
interface RecompensaFields {
  Id?: string;
  Titulo?: string;
  Detalle?: string;
  Costo?: string;
  Kind?: string;
  Payer?: string;
  MinStars?: number;
  MinGmvMXN?: number;
  Niveles?: string;
  Activa?: boolean;
}

const REWARD_KINDS: RewardKind[] = ["estatus", "producto", "boost", "cash", "experiencia"];
// Default seguro: un kind desconocido se trata como "producto" (con costo), para
// que el candado anti-fuga (kind != estatus exige GMV) aplique aunque se capture mal.
function coerceKind(k?: string): RewardKind {
  return REWARD_KINDS.includes(k as RewardKind) ? (k as RewardKind) : "producto";
}

function rewardToAirtableFields(r: Partial<RewardInput>): Record<string, unknown> {
  const f: Record<string, unknown> = {};
  if (r.id !== undefined) f.Id = r.id;
  if (r.title !== undefined) f.Titulo = r.title;
  if (r.detail !== undefined) f.Detalle = r.detail;
  if (r.cost !== undefined) f.Costo = r.cost;
  if (r.kind !== undefined) f.Kind = r.kind;
  if (r.payer !== undefined) f.Payer = r.payer;
  if (r.minStars !== undefined) f.MinStars = r.minStars;
  if (r.minGmvMXN !== undefined) f.MinGmvMXN = r.minGmvMXN;
  if (r.tiers !== undefined) f.Niveles = serializeTiers(r.tiers);
  if (r.active !== undefined) f.Activa = r.active;
  return f;
}

function rewardFromAirtable(rec: { id: string; fields: RecompensaFields }): Reward {
  const f = rec.fields;
  return {
    recordId: rec.id,
    id: f.Id || slugify(f.Titulo ?? rec.id),
    title: f.Titulo ?? "(sin título)",
    detail: f.Detalle ?? "",
    cost: f.Costo ?? "",
    kind: coerceKind(f.Kind),
    payer: f.Payer === "club" ? "club" : "marca",
    minStars: f.MinStars != null ? Number(f.MinStars) : 0,
    minGmvMXN: f.MinGmvMXN != null ? Number(f.MinGmvMXN) : 0,
    tiers: parseTiers(f.Niveles),
    active: f.Activa !== false,
  };
}

export async function listRewards(conn?: Conn): Promise<Reward[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<RecompensaFields>(TABLES.Recompensas, {}, conn);
    return recs.map(rewardFromAirtable);
  }
  // Archivo local: sembrar desde el seed de la marca la primera vez.
  const db = await readDB();
  if (!db.rewards) {
    db.rewards = BRAND.rewards.map((r) => ({ ...r, active: r.active !== false }));
    await writeDB(db);
  }
  return db.rewards;
}

// Solo los premios ACTIVOS (lo que ve la creadora en /recompensas).
export async function listActiveRewards(conn?: Conn): Promise<Reward[]> {
  return (await listRewards(conn)).filter((r) => r.active !== false);
}

export async function getRewardById(id: string, conn?: Conn): Promise<Reward | undefined> {
  return (await listRewards(conn)).find((r) => r.id === id);
}

export async function createReward(input: RewardInput, conn?: Conn): Promise<Reward> {
  const all = await listRewards(conn);
  const id = await uniqueSlug(input.title, all);
  const reward: Reward = { ...input, id, active: input.active ?? true };
  if (airtableConfigured(conn)) {
    const r = await airtableCreate(TABLES.Recompensas, rewardToAirtableFields({ ...input, id }), conn);
    return { ...reward, recordId: r.id };
  }
  const db = await readDB();
  db.rewards = db.rewards ?? all.map((r) => ({ ...r }));
  db.rewards.push(reward);
  await writeDB(db);
  return reward;
}

export async function updateReward(id: string, patch: Partial<RewardInput>, conn?: Conn): Promise<void> {
  if (airtableConfigured(conn)) {
    const current = await getRewardById(id, conn);
    if (!current?.recordId) throw new Error(`Recompensa ${id} no encontrada`);
    await airtableUpdate(TABLES.Recompensas, current.recordId, rewardToAirtableFields(patch), conn);
    return;
  }
  const db = await readDB();
  db.rewards = db.rewards ?? BRAND.rewards.map((r) => ({ ...r }));
  const r = db.rewards.find((x) => x.id === id);
  if (r) {
    Object.assign(r, patch);
    await writeDB(db);
  }
}

export async function setRewardActive(id: string, active: boolean, conn?: Conn): Promise<void> {
  await updateReward(id, { active }, conn);
}

export async function deleteReward(id: string, conn?: Conn): Promise<void> {
  if (airtableConfigured(conn)) {
    const current = await getRewardById(id, conn);
    if (current?.recordId) await airtableDelete(TABLES.Recompensas, current.recordId, conn);
    return;
  }
  const db = await readDB();
  db.rewards = (db.rewards ?? BRAND.rewards.map((r) => ({ ...r }))).filter((x) => x.id !== id);
  await writeDB(db);
}

// ── Productos (fichas / briefs + assets; el equipo los edita en /admin) ────
// Espejo de Recompensas: viven en Airtable (tabla Productos) y se editan desde
// /admin. SOLO INFORMATIVO: no tocan recompensas/canjes/GMV (anti-fuga intacto).
// CRUVA-pluggable: el campo Fuente (source) queda "manual" hasta que el sync de
// CRUVA llene/actualice estos mismos campos (lib/products.syncProductsFromCruva).
interface ProductoFields {
  Id?: string;
  Nombre?: string;
  Precio?: string;
  Specs?: string;
  Beneficios?: string;
  Hooks?: string;
  Dos?: string;
  Donts?: string;
  Link?: string;
  Imagen?: string;
  Galeria?: string;
  Copy?: string;
  DeepLinks?: string;
  Campana?: string;
  Fuente?: string;
  Activa?: boolean;
}

function coerceSource(s?: string): ProductSource {
  return s === "cruva" ? "cruva" : "manual";
}

function productToAirtableFields(p: Partial<ProductInput>): Record<string, unknown> {
  const f: Record<string, unknown> = {};
  if (p.id !== undefined) f.Id = p.id;
  if (p.name !== undefined) f.Nombre = p.name;
  if (p.price !== undefined) f.Precio = p.price;
  if (p.specs !== undefined) f.Specs = p.specs;
  if (p.benefits !== undefined) f.Beneficios = p.benefits;
  if (p.hooks !== undefined) f.Hooks = p.hooks;
  if (p.dos !== undefined) f.Dos = p.dos;
  if (p.donts !== undefined) f.Donts = p.donts;
  if (p.link !== undefined) f.Link = p.link;
  if (p.image !== undefined) f.Imagen = p.image;
  if (p.gallery !== undefined) f.Galeria = p.gallery;
  if (p.copy !== undefined) f.Copy = p.copy;
  if (p.deeplinks !== undefined) f.DeepLinks = p.deeplinks;
  if (p.campaignId !== undefined) f.Campana = p.campaignId ?? "";
  if (p.source !== undefined) f.Fuente = p.source;
  if (p.active !== undefined) f.Activa = p.active;
  return f;
}

function productFromAirtable(rec: { id: string; fields: ProductoFields }): Product {
  const f = rec.fields;
  return {
    recordId: rec.id,
    id: f.Id || slugify(f.Nombre ?? rec.id),
    name: f.Nombre ?? "(sin nombre)",
    price: f.Precio ?? "",
    specs: f.Specs ?? "",
    benefits: f.Beneficios ?? "",
    hooks: f.Hooks ?? "",
    dos: f.Dos ?? "",
    donts: f.Donts ?? "",
    link: f.Link ?? "",
    image: f.Imagen ?? "",
    gallery: f.Galeria ?? "",
    copy: f.Copy ?? "",
    deeplinks: f.DeepLinks ?? "",
    campaignId: f.Campana || undefined,
    source: coerceSource(f.Fuente),
    active: f.Activa !== false,
  };
}

export async function listProducts(conn?: Conn): Promise<Product[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<ProductoFields>(TABLES.Productos, {}, conn);
    return recs.map(productFromAirtable);
  }
  // Archivo local: sembrar desde el seed de la marca la primera vez.
  const db = await readDB();
  if (!db.products) {
    db.products = BRAND.products.map((p) => ({ ...p, active: p.active !== false }));
    await writeDB(db);
  }
  return db.products;
}

// Solo los productos ACTIVOS (lo que ve la creadora en /productos).
export async function listActiveProducts(conn?: Conn): Promise<Product[]> {
  return (await listProducts(conn)).filter((p) => p.active !== false);
}

export async function getProductById(id: string, conn?: Conn): Promise<Product | undefined> {
  return (await listProducts(conn)).find((p) => p.id === id);
}

export async function createProduct(input: ProductInput, conn?: Conn): Promise<Product> {
  const all = await listProducts(conn);
  const id = await uniqueSlug(input.name, all);
  const product: Product = { ...input, id, active: input.active ?? true };
  if (airtableConfigured(conn)) {
    const r = await airtableCreate(TABLES.Productos, productToAirtableFields({ ...input, id }), conn);
    return { ...product, recordId: r.id };
  }
  const db = await readDB();
  db.products = db.products ?? all.map((p) => ({ ...p }));
  db.products.push(product);
  await writeDB(db);
  return product;
}

export async function updateProduct(id: string, patch: Partial<ProductInput>, conn?: Conn): Promise<void> {
  if (airtableConfigured(conn)) {
    const current = await getProductById(id, conn);
    if (!current?.recordId) throw new Error(`Producto ${id} no encontrado`);
    await airtableUpdate(TABLES.Productos, current.recordId, productToAirtableFields(patch), conn);
    return;
  }
  const db = await readDB();
  db.products = db.products ?? BRAND.products.map((p) => ({ ...p }));
  const p = db.products.find((x) => x.id === id);
  if (p) {
    Object.assign(p, patch);
    await writeDB(db);
  }
}

export async function setProductActive(id: string, active: boolean, conn?: Conn): Promise<void> {
  await updateProduct(id, { active }, conn);
}

export async function deleteProduct(id: string, conn?: Conn): Promise<void> {
  if (airtableConfigured(conn)) {
    const current = await getProductById(id, conn);
    if (current?.recordId) await airtableDelete(TABLES.Productos, current.recordId, conn);
    return;
  }
  const db = await readDB();
  db.products = (db.products ?? BRAND.products.map((p) => ({ ...p }))).filter((x) => x.id !== id);
  await writeDB(db);
}

// ── Calendario de fechas (campañas de TikTok Shop; el equipo lo edita en /admin) ──
// Espejo de Productos: catálogo admin-manejable, solo informativo. Cada marca tiene
// su base, así que el calendario de México vive en bases MX y el de USA en bases USA.
interface CalendarioFields {
  Id?: string;
  Nombre?: string;
  Periodo?: string;
  MesOrden?: number;
  Prioridad?: string;
  Tipo?: string;
  Tip?: string;
  Activa?: boolean;
}

const PRIORITIES: EventPriority[] = ["SS", "S", "A"];
function coercePriority(p?: string): EventPriority {
  return PRIORITIES.includes(p as EventPriority) ? (p as EventPriority) : "S";
}
function coerceKind2(k?: string): EventKind {
  return k === "marca" ? "marca" : "plataforma";
}

function eventToAirtableFields(e: Partial<CalendarEventInput>): Record<string, unknown> {
  const f: Record<string, unknown> = {};
  if (e.id !== undefined) f.Id = e.id;
  if (e.name !== undefined) f.Nombre = e.name;
  if (e.period !== undefined) f.Periodo = e.period;
  if (e.monthOrder !== undefined) f.MesOrden = e.monthOrder;
  if (e.priority !== undefined) f.Prioridad = e.priority;
  if (e.kind !== undefined) f.Tipo = e.kind;
  if (e.tip !== undefined) f.Tip = e.tip ?? "";
  if (e.active !== undefined) f.Activa = e.active;
  return f;
}

// Asegura un mes válido 0-12 (0 = todo el año). Una edición manual en Airtable con
// un valor fuera de rango caería a 0 en vez de desaparecer de la vista de la creadora.
function clampMonth(v: unknown): number {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 && n <= 12 ? n : 0;
}

function eventFromAirtable(rec: { id: string; fields: CalendarioFields }): CalendarEvent {
  const f = rec.fields;
  return {
    recordId: rec.id,
    id: f.Id || slugify(f.Nombre ?? rec.id),
    name: f.Nombre ?? "(sin nombre)",
    period: f.Periodo ?? "",
    monthOrder: clampMonth(f.MesOrden),
    priority: coercePriority(f.Prioridad),
    kind: coerceKind2(f.Tipo),
    tip: f.Tip || undefined,
    active: f.Activa !== false,
  };
}

export async function listCalendar(conn?: Conn): Promise<CalendarEvent[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<CalendarioFields>(TABLES.Calendario, {}, conn);
    return recs.map(eventFromAirtable);
  }
  const db = await readDB();
  if (!db.calendar) {
    db.calendar = BRAND.calendar.map((e) => ({ ...e, active: e.active !== false }));
    await writeDB(db);
  }
  return db.calendar;
}

export async function listActiveCalendar(conn?: Conn): Promise<CalendarEvent[]> {
  return (await listCalendar(conn)).filter((e) => e.active !== false);
}

export async function getCalendarEventById(id: string, conn?: Conn): Promise<CalendarEvent | undefined> {
  return (await listCalendar(conn)).find((e) => e.id === id);
}

export async function createCalendarEvent(input: CalendarEventInput, conn?: Conn): Promise<CalendarEvent> {
  const all = await listCalendar(conn);
  const id = await uniqueSlug(input.name, all);
  const ev: CalendarEvent = { ...input, id, active: input.active ?? true };
  if (airtableConfigured(conn)) {
    const r = await airtableCreate(TABLES.Calendario, eventToAirtableFields({ ...input, id }), conn);
    return { ...ev, recordId: r.id };
  }
  const db = await readDB();
  db.calendar = db.calendar ?? all.map((e) => ({ ...e }));
  db.calendar.push(ev);
  await writeDB(db);
  return ev;
}

export async function updateCalendarEvent(id: string, patch: Partial<CalendarEventInput>, conn?: Conn): Promise<void> {
  if (airtableConfigured(conn)) {
    const current = await getCalendarEventById(id, conn);
    if (!current?.recordId) throw new Error(`Evento ${id} no encontrado`);
    await airtableUpdate(TABLES.Calendario, current.recordId, eventToAirtableFields(patch), conn);
    return;
  }
  const db = await readDB();
  db.calendar = db.calendar ?? BRAND.calendar.map((e) => ({ ...e }));
  const e = db.calendar.find((x) => x.id === id);
  if (e) {
    Object.assign(e, patch);
    await writeDB(db);
  }
}

export async function setCalendarEventActive(id: string, active: boolean, conn?: Conn): Promise<void> {
  await updateCalendarEvent(id, { active }, conn);
}

export async function deleteCalendarEvent(id: string, conn?: Conn): Promise<void> {
  if (airtableConfigured(conn)) {
    const current = await getCalendarEventById(id, conn);
    if (current?.recordId) await airtableDelete(TABLES.Calendario, current.recordId, conn);
    return;
  }
  const db = await readDB();
  db.calendar = (db.calendar ?? BRAND.calendar.map((e) => ({ ...e }))).filter((x) => x.id !== id);
  await writeDB(db);
}

// ── FAQ / Centro de ayuda (el equipo lo edita en /admin) ──────────────────
interface FaqFields {
  Id?: string;
  Pregunta?: string;
  Respuesta?: string;
  Tag?: string;
  Activa?: boolean;
}

function faqToAirtableFields(q: Partial<FaqInput>): Record<string, unknown> {
  const f: Record<string, unknown> = {};
  if (q.id !== undefined) f.Id = q.id;
  if (q.question !== undefined) f.Pregunta = q.question;
  if (q.answer !== undefined) f.Respuesta = q.answer;
  if (q.tag !== undefined) f.Tag = q.tag ?? "";
  if (q.active !== undefined) f.Activa = q.active;
  return f;
}

function faqFromAirtable(rec: { id: string; fields: FaqFields }): FaqItem {
  const f = rec.fields;
  return {
    recordId: rec.id,
    id: f.Id || slugify(f.Pregunta ?? rec.id),
    question: f.Pregunta ?? "(sin pregunta)",
    answer: f.Respuesta ?? "",
    tag: f.Tag || undefined,
    active: f.Activa !== false,
  };
}

export async function listFaq(conn?: Conn): Promise<FaqItem[]> {
  if (airtableConfigured(conn)) {
    const recs = await fetchAll<FaqFields>(TABLES.FAQ, {}, conn);
    return recs.map(faqFromAirtable);
  }
  const db = await readDB();
  if (!db.faq) {
    db.faq = BRAND.faq.map((q) => ({ ...q, active: q.active !== false }));
    await writeDB(db);
  }
  return db.faq;
}

export async function listActiveFaq(conn?: Conn): Promise<FaqItem[]> {
  return (await listFaq(conn)).filter((q) => q.active !== false);
}

export async function getFaqById(id: string, conn?: Conn): Promise<FaqItem | undefined> {
  return (await listFaq(conn)).find((q) => q.id === id);
}

export async function createFaq(input: FaqInput, conn?: Conn): Promise<FaqItem> {
  const all = await listFaq(conn);
  const id = await uniqueSlug(input.question, all);
  const item: FaqItem = { ...input, id, active: input.active ?? true };
  if (airtableConfigured(conn)) {
    const r = await airtableCreate(TABLES.FAQ, faqToAirtableFields({ ...input, id }), conn);
    return { ...item, recordId: r.id };
  }
  const db = await readDB();
  db.faq = db.faq ?? all.map((q) => ({ ...q }));
  db.faq.push(item);
  await writeDB(db);
  return item;
}

export async function updateFaq(id: string, patch: Partial<FaqInput>, conn?: Conn): Promise<void> {
  if (airtableConfigured(conn)) {
    const current = await getFaqById(id, conn);
    if (!current?.recordId) throw new Error(`FAQ ${id} no encontrada`);
    await airtableUpdate(TABLES.FAQ, current.recordId, faqToAirtableFields(patch), conn);
    return;
  }
  const db = await readDB();
  db.faq = db.faq ?? BRAND.faq.map((q) => ({ ...q }));
  const q = db.faq.find((x) => x.id === id);
  if (q) {
    Object.assign(q, patch);
    await writeDB(db);
  }
}

export async function setFaqActive(id: string, active: boolean, conn?: Conn): Promise<void> {
  await updateFaq(id, { active }, conn);
}

export async function deleteFaq(id: string, conn?: Conn): Promise<void> {
  if (airtableConfigured(conn)) {
    const current = await getFaqById(id, conn);
    if (current?.recordId) await airtableDelete(TABLES.FAQ, current.recordId, conn);
    return;
  }
  const db = await readDB();
  db.faq = (db.faq ?? BRAND.faq.map((q) => ({ ...q }))).filter((x) => x.id !== id);
  await writeDB(db);
}
