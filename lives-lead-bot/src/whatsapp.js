// Envio de mensajes de texto via WhatsApp Cloud API (Meta).
import { config } from "./config.js";

/**
 * Manda un mensaje de texto a un numero de WhatsApp via Cloud API.
 *
 * @param {string} to - numero destino (formato E.164 sin '+')
 * @param {string} body - texto del mensaje
 */
export async function sendText(to, body) {
  const url = `https://graph.facebook.com/v23.0/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp sendText fallo (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Manda un documento (PDF) a un numero via Cloud API, por link publico.
 *
 * @param {string} to - numero destino (E.164 sin '+')
 * @param {string} link - URL publica del PDF (WhatsApp lo descarga)
 * @param {string} filename - nombre con el que se ve el archivo
 * @param {string} [caption] - texto opcional bajo el documento
 */
export async function sendDocument(to, link, filename, caption) {
  const url = `https://graph.facebook.com/v23.0/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const document = { link, filename };
  if (caption) document.caption = caption;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "document", document }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp sendDocument fallo (${res.status}): ${text}`);
  }

  return res.json();
}
