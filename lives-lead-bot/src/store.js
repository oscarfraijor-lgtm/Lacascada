// Persistencia de leads y estado de conversacion. Siempre escribe el JSON local
// (fuente de verdad barata); Airtable es un sink adicional best-effort.
import { mkdirSync, existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { config, LEADS_DIR } from "./config.js";

function ensureDir() {
  mkdirSync(LEADS_DIR, { recursive: true });
}

function leadPath(phone) {
  return join(LEADS_DIR, `${phone}-lead.json`);
}

function convPath(phone) {
  return join(LEADS_DIR, `${phone}-conv.json`);
}

function pendingPath(phone) {
  return join(LEADS_DIR, `${phone}-pending.json`);
}

// Mapeo de campos internos de la ficha -> nombres de columna en Airtable.
function toAirtableFields(ficha) {
  return {
    Telefono: ficha.telefono || "",
    Nombre: ficha.nombre || "",
    Marca: ficha.marca || "",
    Website: ficha.website || "",
    TikTok: ficha.tiktok || "",
    Instagram: ficha.instagram || "",
    Mercado: ficha.mercado || "",
    YaEnTTS: ficha.ya_en_tts || "",
    Categoria: ficha.categoria || "",
    NumProductos: ficha.num_productos_aprox || "",
    HaceLives: ficha.hace_lives || "",
    Ruta: ficha.ruta || "",
    Score: ficha.score ?? null,
    Tier: ficha.tier || "",
    Gancho: ficha.gancho || "",
    Resumen: ficha.resumen || "",
    Investigacion: JSON.stringify(ficha.investigacion || null),
    Transcript: ficha.transcript || "",
    Fuente: ficha.fuente || "",
    Estado: "Nuevo",
  };
}

async function upsertAirtable(ficha) {
  if (!config.AIRTABLE_TOKEN || !config.AIRTABLE_BASE_ID) return;

  const base = config.AIRTABLE_BASE_ID;
  const table = encodeURIComponent(config.AIRTABLE_TABLE_LEADS);
  const headers = {
    Authorization: `Bearer ${config.AIRTABLE_TOKEN}`,
    "Content-Type": "application/json",
  };

  try {
    const formula = encodeURIComponent(`{Telefono}='${ficha.telefono}'`);
    const listUrl = `https://api.airtable.com/v0/${base}/${table}?filterByFormula=${formula}&maxRecords=1`;
    const listRes = await fetch(listUrl, { headers });
    const listData = await listRes.json();
    const existingRecord = listData?.records?.[0];

    const body = {
      records: [{ fields: toAirtableFields(ficha) }],
      typecast: true,
    };

    if (existingRecord) {
      // PATCH necesita el id del record dentro de cada elemento de records
      body.records[0].id = existingRecord.id;
      const patchUrl = `https://api.airtable.com/v0/${base}/${table}`;
      await fetch(patchUrl, { method: "PATCH", headers, body: JSON.stringify(body) });
    } else {
      const postUrl = `https://api.airtable.com/v0/${base}/${table}`;
      await fetch(postUrl, { method: "POST", headers, body: JSON.stringify(body) });
    }
  } catch (err) {
    console.error("[store] Error guardando en Airtable:", err);
  }
}

async function pingCallMeBot(ficha) {
  if (!config.CALLMEBOT_APIKEY || !config.CALLMEBOT_PHONE) return;
  if (ficha.ruta !== "A" && ficha.ruta !== "H") return;
  try {
    const text = encodeURIComponent(`Lead ${ficha.ruta}: ${ficha.marca}. ${ficha.gancho}`);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${config.CALLMEBOT_PHONE}&apikey=${config.CALLMEBOT_APIKEY}&text=${text}`;
    await fetch(url);
  } catch {
    // silencioso: el ping es un extra, no debe tumbar el flujo principal
  }
}

/**
 * Guarda la ficha del lead. Siempre escribe el JSON local; si hay credenciales
 * de Airtable configuradas, hace upsert ahi tambien (best-effort, no bloquea
 * si falla). Si hay credenciales de CallMeBot y la ruta es A o H, manda un
 * ping de WhatsApp (silencioso si falla).
 */
export async function saveLead(ficha) {
  ensureDir();
  writeFileSync(leadPath(ficha.telefono), JSON.stringify(ficha, null, 2));
  await upsertAirtable(ficha);
  await pingCallMeBot(ficha);
}

/** Lee el estado de conversacion guardado para un telefono, o null si no existe. */
export function getConversation(phone) {
  const p = convPath(phone);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf-8"));
  } catch {
    return null;
  }
}

/** Escribe el estado de conversacion para un telefono. */
export function saveConversation(phone, state) {
  ensureDir();
  writeFileSync(convPath(phone), JSON.stringify(state, null, 2));
}

/** Borra el lead y la conversacion guardados de un telefono, si existen. */
export function resetPhone(phone) {
  for (const p of [leadPath(phone), convPath(phone), pendingPath(phone)]) {
    if (existsSync(p)) unlinkSync(p);
  }
}

export { pendingPath };
