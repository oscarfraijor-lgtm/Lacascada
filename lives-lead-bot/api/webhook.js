// FASE 1: webhook Meta Cloud API. Requiere deploy en Vercel y app de Meta con producto WhatsApp.
//
// NOTA de limitacion: el Set de dedupe de mensajes vive en memoria del modulo, lo cual
// es efimero en un entorno serverless (cada cold start arranca un Set vacio, y no hay
// garantia de que las invocaciones caigan en la misma instancia). Sirve como mitigacion
// best-effort contra reintentos rapidos de Meta dentro de la misma instancia tibia, pero
// NO es una garantia de dedupe real. La memoria de conversacion en fs (leads/*-conv.json)
// tiene el mismo problema de efimeridad en serverless: en Fase 1 se debe mover a Airtable
// para persistencia real entre invocaciones/cold starts.
import { config } from "../src/config.js";
import { runTurn } from "../src/brain.js";
import { getConversation, saveConversation, pingOscar } from "../src/store.js";
import { sendText } from "../src/whatsapp.js";

const seenMessageIds = new Set();

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (
      req.query["hub.mode"] === "subscribe" &&
      req.query["hub.verify_token"] === config.WHATSAPP_VERIFY_TOKEN
    ) {
      res.status(200).send(req.query["hub.challenge"]);
    } else {
      res.status(403).send("Forbidden");
    }
    return;
  }

  try {
    const entries = req.body?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const messages = change?.value?.messages || [];
        for (const msg of messages) {
          // ignoramos "statuses" (delivered/read) implicitamente porque solo iteramos
          // sobre value.messages, que no incluye eventos de status

          if (seenMessageIds.has(msg.id)) continue;
          seenMessageIds.add(msg.id);

          const from = msg.from;

          let userText;
          if (msg.type === "text") {
            userText = msg.text?.body || "";
          } else {
            userText = "Por ahora solo puedo leer mensajes de texto, me puedes escribir lo mismo por aqui?";
          }

          const referral = msg.referral;
          const source = referral
            ? `ad:${referral.source_id || ""} ${referral.headline || ""}`.trim()
            : "organico";

          const state = await getConversation(from);
          const { reply, state: newState } = await runTurn({
            phone: from,
            userText,
            state,
            source,
          });

          if (config.COPILOT_MODE) {
            // Copiloto: NO se envia al prospecto. La respuesta sugerida queda en el
            // estado (visible en Airtable) y le llega a Oscar por CallMeBot para que
            // la pegue desde su telefono (coexistencia: el chat vive en su app).
            newState.pendingReply = { reply, at: new Date().toISOString() };
            await pingOscar(`[COPILOTO] ${from} escribio. Respuesta sugerida:\n\n${reply.slice(0, 500)}`);
            console.log("[COPILOT] Respuesta pendiente para", from);
          } else {
            await sendText(from, reply);
          }

          await saveConversation(from, newState);
        }
      }
    }
  } catch (err) {
    console.error("[webhook] Error procesando el webhook:", err);
  }

  res.status(200).json({ ok: true });
}
