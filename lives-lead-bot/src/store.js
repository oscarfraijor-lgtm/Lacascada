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
const BUCKET_LABELS = {
  mas_200k: "+200K",
  vende_quiere_mas: "Vende, quiere mas",
  aun_no_vende: "Aun no vende",
  desconocido: "Desconocido",
};

const ROL_LABELS = {
  dueno_fundador: "Dueno o fundador",
  direccion_gerencia: "Direccion o gerencia",
  marketing: "Marketing",
  desconocido: "",
};

function toAirtableFields(ficha) {
  // YaEnTTS se deriva del bucket de ventas (si vende, ya esta en TTS).
  const yaEnTts =
    ficha.ventas_bucket === "aun_no_vende"
      ? "no"
      : ficha.ventas_bucket === "mas_200k" || ficha.ventas_bucket === "vende_quiere_mas"
        ? "si"
        : "desconocido";
  return {
    Telefono: ficha.telefono || "",
    Nombre: ficha.nombre || "",
    Marca: ficha.marca || "",
    Website: ficha.website || "",
    TikTok: ficha.tiktok || "",
    Instagram: ficha.instagram || "",
    Mercado: ficha.mercado || "",
    YaEnTTS: yaEnTts,
    Categoria: ficha.categoria || "",
    Nivel: ficha.nivel || "",
    VentasBucket: BUCKET_LABELS[ficha.ventas_bucket] || "Desconocido",
    Rol: ROL_LABELS[ficha.rol] ?? (ficha.rol || ""),
    Ciudad: ficha.ciudad || "",
    Correo: ficha.correo || "",
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
  // HOT va directo a direccion y HUMANO pidio persona: esos ameritan ping inmediato.
  if (ficha.nivel !== "HOT" && ficha.nivel !== "HUMANO") return;
  try {
    const text = encodeURIComponent(`Lead ${ficha.nivel}: ${ficha.marca}. ${ficha.gancho}`);
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
  // fs local es cache de desarrollo: en Vercel el filesystem es de solo lectura,
  // por eso todo write local va en try/catch y la persistencia real es Airtable.
  try {
    ensureDir();
    writeFileSync(leadPath(ficha.telefono), JSON.stringify(ficha, null, 2));
  } catch {}
  await upsertAirtable(ficha);
  await pingCallMeBot(ficha);
}

// ---- Estado de conversacion: Airtable primero (tabla Conversaciones), fs como cache dev ----

const CONV_TABLE = "Conversaciones";

function airtableReady() {
  return Boolean(config.AIRTABLE_TOKEN && config.AIRTABLE_BASE_ID);
}

function airtableHeaders() {
  return {
    Authorization: `Bearer ${config.AIRTABLE_TOKEN}`,
    "Content-Type": "application/json",
  };
}

async function findConvRecord(phone) {
  const formula = encodeURIComponent(`{Telefono}='${phone}'`);
  const url = `https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/${CONV_TABLE}?filterByFormula=${formula}&maxRecords=1`;
  const res = await fetch(url, { headers: airtableHeaders() });
  const data = await res.json();
  return data?.records?.[0] || null;
}

/** Lee el estado de conversacion guardado para un telefono, o null si no existe. */
export async function getConversation(phone) {
  if (airtableReady()) {
    try {
      const rec = await findConvRecord(phone);
      if (rec?.fields?.StateJSON) return JSON.parse(rec.fields.StateJSON);
      return null;
    } catch (err) {
      console.error("[store] Error leyendo conversacion de Airtable:", err);
    }
  }
  try {
    const p = convPath(phone);
    if (!existsSync(p)) return null;
    return JSON.parse(readFileSync(p, "utf-8"));
  } catch {
    return null;
  }
}

/** Escribe el estado de conversacion para un telefono. */
export async function saveConversation(phone, state) {
  if (airtableReady()) {
    try {
      const rec = await findConvRecord(phone);
      const fields = {
        Telefono: phone,
        StateJSON: JSON.stringify(state),
        Actualizado: new Date().toISOString(),
      };
      const url = `https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/${CONV_TABLE}`;
      const body = { records: [{ fields }], typecast: true };
      if (rec) {
        body.records[0].id = rec.id;
        await fetch(url, { method: "PATCH", headers: airtableHeaders(), body: JSON.stringify(body) });
      } else {
        await fetch(url, { method: "POST", headers: airtableHeaders(), body: JSON.stringify(body) });
      }
    } catch (err) {
      console.error("[store] Error guardando conversacion en Airtable:", err);
    }
  }
  try {
    ensureDir();
    writeFileSync(convPath(phone), JSON.stringify(state, null, 2));
  } catch {}
}

/** Ping generico a Oscar por CallMeBot (copiloto: respuesta sugerida, avisos). */
export async function pingOscar(text) {
  if (!config.CALLMEBOT_APIKEY || !config.CALLMEBOT_PHONE) return;
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${config.CALLMEBOT_PHONE}&apikey=${config.CALLMEBOT_APIKEY}&text=${encodeURIComponent(text)}`;
    await fetch(url);
  } catch {}
}

/** Borra el lead y la conversacion guardados de un telefono, si existen. */
export async function resetPhone(phone) {
  for (const p of [leadPath(phone), convPath(phone), pendingPath(phone)]) {
    try {
      if (existsSync(p)) unlinkSync(p);
    } catch {}
  }
  if (airtableReady()) {
    try {
      const rec = await findConvRecord(phone);
      if (rec) {
        const url = `https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/${CONV_TABLE}/${rec.id}`;
        await fetch(url, { method: "DELETE", headers: airtableHeaders() });
      }
    } catch {}
  }
}

export { pendingPath };
