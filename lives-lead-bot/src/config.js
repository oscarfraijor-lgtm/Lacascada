// Carga las variables de entorno desde .env (si existe) y arma el objeto config
// que usa el resto del proyecto. Aqui viven los defaults de cada variable.
import "dotenv/config";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// src/ esta un nivel adentro de la raiz del proyecto, subimos uno para llegar a leads/
const PROJECT_ROOT = join(__dirname, "..");

export const config = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",
  MODEL: process.env.MODEL || "claude-sonnet-5",
  EFFORT: process.env.EFFORT || "low",
  AIRTABLE_TOKEN: process.env.AIRTABLE_TOKEN || "",
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID || "",
  AIRTABLE_TABLE_LEADS: process.env.AIRTABLE_TABLE_LEADS || "Leads",
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || "",
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || "",
  // COPILOT_MODE es true por default. Solo se apaga si la variable es EXACTAMENTE "false".
  COPILOT_MODE: process.env.COPILOT_MODE !== "false",
  CALLMEBOT_APIKEY: process.env.CALLMEBOT_APIKEY || "",
  CALLMEBOT_PHONE: process.env.CALLMEBOT_PHONE || "",
  // Segundo destinatario (Sergio/Checo): SOLO recibe los HOT. Cada numero
  // necesita su propia apikey de CallMeBot (la activa el desde su WhatsApp).
  CALLMEBOT_APIKEY_SERGIO: process.env.CALLMEBOT_APIKEY_SERGIO || "",
  CALLMEBOT_PHONE_SERGIO: process.env.CALLMEBOT_PHONE_SERGIO || "",
  MAX_TURNS: parseInt(process.env.MAX_TURNS || "12", 10),
  // URL publica del deck PDF (servido desde public/ del propio bot en Vercel).
  DECK_URL: process.env.DECK_URL || "https://lives-lead-bot.vercel.app/deck-indiepro-lives.pdf",
};

// Ruta absoluta a la carpeta leads/ en la raiz del proyecto (no depende de process.cwd()).
export const LEADS_DIR = join(PROJECT_ROOT, "leads");
