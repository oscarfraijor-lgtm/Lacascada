// Persistencia: Airtable si está configurado; si no, archivo local JSON (.data/store.json)
// para que el flujo funcione en dev sin cuentas externas. La UI no cambia al migrar.
import { promises as fs } from "fs";
import path from "path";
import {
  airtableConfigured,
  airtableCreate,
  airtableUpdate,
  airtableDelete,
  fetchAll,
  TABLES,
} from "@/lib/airtable";
import {
  type Campaign,
  type CampaignInput,
  CAMPAIGN_SEED,
  slugify,
} from "@/lib/campaigns";

export interface CreatorRecord {
  id?: string;
  name: string;
  handle: string;
  email: string;
  followers?: string;
  city?: string;
  createdAt?: string;
}

// Estados de una inscripción/entrega. Solo "aprobada" otorga estrellas.
export const PARTICIPATION_STATUS = ["inscrita", "aprobada", "rechazada"] as const;
export type ParticipationStatus = (typeof PARTICIPATION_STATUS)[number];

export interface Participation {
  id?: string;
  creatorEmail: string;
  campaignId: string;
  status: string; // ParticipationStatus
  link?: string;
  createdAt?: string;
}

const FILE = path.join(process.cwd(), ".data", "store.json");
interface DB {
  creators: CreatorRecord[];
  participations: Participation[];
  campaigns?: Campaign[];
}

async function readDB(): Promise<DB> {
  try {
    const db = JSON.parse(await fs.readFile(FILE, "utf8")) as DB;
    return { creators: db.creators ?? [], participations: db.participations ?? [], campaigns: db.campaigns };
  } catch {
    return { creators: [], participations: [] };
  }
}
async function writeDB(db: DB): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2));
}

// ── Creadoras ──────────────────────────────────────────────────────────
export async function createCreator(c: CreatorRecord): Promise<CreatorRecord> {
  if (airtableConfigured()) {
    const r = await airtableCreate(TABLES.Creadoras, {
      Nombre: c.name,
      Handle: c.handle,
      Email: c.email,
      Seguidores: c.followers ?? "",
      Ciudad: c.city ?? "",
    });
    return { ...c, id: r.id };
  }
  const db = await readDB();
  const existing = db.creators.find((x) => x.email === c.email);
  if (existing) return existing;
  const rec: CreatorRecord = { ...c, id: "loc_" + Date.now(), createdAt: new Date().toISOString() };
  db.creators.push(rec);
  await writeDB(db);
  return rec;
}

export async function getCreatorByEmail(email: string): Promise<CreatorRecord | null> {
  if (airtableConfigured()) {
    const recs = await fetchAll<{ Nombre: string; Handle: string; Email: string }>(
      TABLES.Creadoras,
      { filterByFormula: `LOWER({Email})='${email.toLowerCase()}'` }
    );
    const r = recs[0];
    return r ? { id: r.id, name: r.fields.Nombre, handle: r.fields.Handle, email: r.fields.Email } : null;
  }
  const db = await readDB();
  return db.creators.find((x) => x.email === email) ?? null;
}

export async function listCreators(): Promise<CreatorRecord[]> {
  if (airtableConfigured()) {
    const recs = await fetchAll<{ Nombre: string; Handle: string; Email: string; Seguidores?: string; Ciudad?: string }>(TABLES.Creadoras);
    return recs.map((r) => ({
      id: r.id,
      name: r.fields.Nombre,
      handle: r.fields.Handle,
      email: r.fields.Email,
      followers: r.fields.Seguidores,
      city: r.fields.Ciudad,
      createdAt: r.createdTime,
    }));
  }
  return (await readDB()).creators;
}

// ── Inscripciones / Entregas ────────────────────────────────────────────
export async function addParticipation(p: Participation): Promise<Participation> {
  if (airtableConfigured()) {
    const r = await airtableCreate(TABLES.Entregas, {
      Email: p.creatorEmail,
      Campaña: p.campaignId,
      Estado: p.status,
      Link: p.link ?? "",
    });
    return { ...p, id: r.id };
  }
  const db = await readDB();
  const dup = db.participations.find((x) => x.creatorEmail === p.creatorEmail && x.campaignId === p.campaignId);
  if (dup) return dup;
  const rec: Participation = { ...p, id: "loc_" + Date.now(), createdAt: new Date().toISOString() };
  db.participations.push(rec);
  await writeDB(db);
  return rec;
}

export async function participationsFor(email: string): Promise<Participation[]> {
  if (airtableConfigured()) {
    const recs = await fetchAll<{ Email: string; Campaña: string; Estado: string; Link?: string }>(TABLES.Entregas, {
      filterByFormula: `LOWER({Email})='${email.toLowerCase()}'`,
    });
    return recs.map((r) => ({ creatorEmail: r.fields.Email, campaignId: r.fields.Campaña, status: r.fields.Estado, link: r.fields.Link, id: r.id }));
  }
  const db = await readDB();
  return db.participations.filter((x) => x.creatorEmail === email);
}

// Todas las inscripciones (para el panel de admin).
export async function listParticipations(): Promise<Participation[]> {
  if (airtableConfigured()) {
    const recs = await fetchAll<{ Email: string; Campaña: string; Estado: string; Link?: string }>(TABLES.Entregas);
    return recs.map((r) => ({
      id: r.id,
      creatorEmail: r.fields.Email,
      campaignId: r.fields.Campaña,
      status: r.fields.Estado,
      link: r.fields.Link,
      createdAt: r.createdTime,
    }));
  }
  return (await readDB()).participations;
}

export async function setParticipationStatus(id: string, status: ParticipationStatus): Promise<void> {
  if (airtableConfigured()) {
    await airtableUpdate(TABLES.Entregas, id, { Estado: status });
    return;
  }
  const db = await readDB();
  const p = db.participations.find((x) => x.id === id);
  if (p) {
    p.status = status;
    await writeDB(db);
  }
}

// Estrellas otorgadas: solo cuentan las participaciones APROBADAS.
// (Inscribirse no da estrellas; el admin las "otorga" al aprobar la entrega.)
export function starsFromApproved(parts: Participation[], campaigns: Campaign[]): number {
  const byId = new Map(campaigns.map((c) => [c.id, c]));
  return parts
    .filter((p) => p.status === "aprobada")
    .reduce((s, p) => s + (byId.get(p.campaignId)?.stars ?? 0), 0);
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
  Activa?: boolean;
}

export async function listCampaigns(): Promise<Campaign[]> {
  if (airtableConfigured()) {
    const recs = await fetchAll<CampanaFields>(TABLES.Campanas);
    return recs.map((r) => ({
      recordId: r.id,
      id: r.fields.Id || slugify(r.fields["Título"] ?? r.id),
      title: r.fields["Título"] ?? "(sin título)",
      brand: r.fields.Marca ?? "Color Dreams",
      brief: r.fields.Brief ?? "",
      reward: r.fields.Recompensa ?? "",
      stars: Number(r.fields.Estrellas ?? 0),
      deadline: r.fields.Deadline ?? "",
      tag: r.fields.Tag ?? "",
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
export async function listOpenCampaigns(): Promise<Campaign[]> {
  return (await listCampaigns()).filter((c) => c.open);
}

export async function getCampaignById(id: string): Promise<Campaign | undefined> {
  return (await listCampaigns()).find((c) => c.id === id);
}

async function uniqueSlug(base: string, existing: Campaign[]): Promise<string> {
  const taken = new Set(existing.map((c) => c.id));
  let slug = slugify(base) || "campana";
  let n = 2;
  while (taken.has(slug)) slug = `${slugify(base) || "campana"}-${n++}`;
  return slug;
}

export async function createCampaign(input: CampaignInput): Promise<Campaign> {
  const all = await listCampaigns();
  const id = await uniqueSlug(input.title, all);
  const campaign: Campaign = { ...input, id };
  if (airtableConfigured()) {
    const r = await airtableCreate(TABLES.Campanas, campaignToAirtableFields({ ...input, id }));
    return { ...campaign, recordId: r.id };
  }
  const db = await readDB();
  db.campaigns = db.campaigns ?? all.map((c) => ({ ...c }));
  db.campaigns.push(campaign);
  await writeDB(db);
  return campaign;
}

export async function updateCampaign(id: string, patch: Partial<CampaignInput>): Promise<void> {
  if (airtableConfigured()) {
    const current = await getCampaignById(id);
    if (!current?.recordId) throw new Error(`Campaña ${id} no encontrada`);
    await airtableUpdate(TABLES.Campanas, current.recordId, campaignToAirtableFields(patch));
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

export async function setCampaignOpen(id: string, open: boolean): Promise<void> {
  await updateCampaign(id, { open });
}

export async function deleteCampaign(id: string): Promise<void> {
  if (airtableConfigured()) {
    const current = await getCampaignById(id);
    if (current?.recordId) await airtableDelete(TABLES.Campanas, current.recordId);
    return;
  }
  const db = await readDB();
  db.campaigns = (db.campaigns ?? CAMPAIGN_SEED.map((c) => ({ ...c }))).filter((x) => x.id !== id);
  await writeDB(db);
}
