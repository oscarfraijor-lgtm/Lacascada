// Seguimiento automatico a leads que se quedaron callados a media conversacion.
// Manda como maximo 2 recordatorios: ~1h y ~20h despues del ultimo mensaje del
// lead, ambos dentro de la ventana de 24h de WhatsApp (mensaje libre, sin
// plantilla). El texto lo genera Claude segun el CONTEXTO de la conversacion:
// retoma el hilo donde se quedo, en tono corporativo de Rudy y NADA pushy.
import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";
import { listConversations, saveConversation } from "./store.js";
import { sendText } from "./whatsapp.js";

const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const UNA_HORA_MS = 60 * 60 * 1000;
const VEINTE_HORAS_MS = 20 * 60 * 60 * 1000;
// Colchon: nunca despues de las 23h para no salirnos de la ventana de 24h.
const LIMITE_VENTANA_MS = 23 * 60 * 60 * 1000;

function transcript(messages) {
  const lines = [];
  for (const m of messages || []) {
    if (m.role === "user" && typeof m.content === "string") {
      lines.push(`LEAD: ${m.content}`);
    } else if (m.role === "assistant" && Array.isArray(m.content)) {
      const t = m.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      if (t) lines.push(`RUDY: ${t}`);
    }
  }
  return lines.join("\n");
}

function systemNudge(tipo) {
  const base =
    "Eres Rudy, asesor de Indie Pro Marketing, agencia Partner Oficial de TikTok Shop que produce TikTok Lives. Tono profesional y calido, nada pushy, sin jerga casual. Sin guiones largos. Maximo 1 emoji, mejor ninguno.";
  if (tipo === "1h") {
    return `${base}\n\nUn lead te escribio hace cerca de una hora y dejo de responder a media conversacion. Escribe UN mensaje de seguimiento MUY breve (1 o 2 lineas) que retome exactamente donde se quedo la conversacion: haz referencia natural a lo ultimo que se hablo o al dato que faltaba, y con suavidad invitalo a continuar. No lo presiones. Responde SOLO con el texto del mensaje, sin comillas ni explicaciones.`;
  }
  return `${base}\n\nUn lead dejo de responder hace cerca de 20 horas. Escribe UN ultimo mensaje breve, cordial y sin ninguna presion, que le deje la puerta abierta: reconoce que quiza no es el mejor momento, ofrece retomar cuando guste y que con gusto le compartes informacion si le sirve. Responde SOLO con el texto del mensaje, sin comillas ni explicaciones.`;
}

async function generarNudge(state, tipo) {
  try {
    const res = await client.messages.create({
      model: config.MODEL,
      max_tokens: 500,
      system: systemNudge(tipo),
      messages: [
        {
          role: "user",
          content: `Conversacion hasta ahora:\n${transcript(state.messages)}\n\nGenera el mensaje de seguimiento.`,
        },
      ],
      output_config: { effort: config.EFFORT },
    });
    return res.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
  } catch (err) {
    console.error("[followup] no se pudo generar nudge:", err);
    return "";
  }
}

/**
 * Barre las conversaciones abiertas y manda el recordatorio que toque.
 * @returns {Promise<Array<{phone:string,tipo:string}>>}
 */
export async function sweepFollowups({ limit = 25 } = {}) {
  const convs = await listConversations();
  const now = Date.now();
  const enviados = [];

  for (const { phone, state } of convs) {
    if (enviados.length >= limit) break;
    if (!phone || !state) continue;
    if (state.fichaSaved || state.sweptAt) continue; // cerrado o ya barrido

    const msgs = state.messages || [];
    if (msgs.length === 0) continue;
    // El ultimo mensaje debe ser del bot: el lead se quedo callado esperandonos.
    // Si el ultimo es del lead, es el bot quien debe responder (no un nudge).
    const last = msgs[msgs.length - 1];
    const lastEsBot =
      last.role === "assistant" &&
      Array.isArray(last.content) &&
      last.content.some((b) => b.type === "text" && b.text);
    if (!lastEsBot) continue;

    const lastLeadAt = Date.parse(state.lastLeadAt || "");
    if (Number.isNaN(lastLeadAt)) continue;
    const quiet = now - lastLeadAt;
    if (quiet > LIMITE_VENTANA_MS) continue; // fuera de la ventana de 24h

    const fu = state.followups || {};
    let tipo = null;
    if (quiet >= VEINTE_HORAS_MS && !fu.twentyHour) tipo = "20h";
    else if (quiet >= UNA_HORA_MS && !fu.oneHour) tipo = "1h";
    if (!tipo) continue;

    const texto = await generarNudge(state, tipo);
    if (!texto) continue;

    try {
      await sendText(phone, texto);
      state.messages.push({ role: "assistant", content: [{ type: "text", text: texto }] });
      state.followups = { ...fu, [tipo === "1h" ? "oneHour" : "twentyHour"]: true };
      await saveConversation(phone, state);
      enviados.push({ phone, tipo });
    } catch (err) {
      console.error("[followup] fallo al enviar a", phone, err);
    }
  }

  return enviados;
}
