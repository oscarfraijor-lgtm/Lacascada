// Barredor de conversaciones fantasma: leads que dejaron de responder a media
// conversacion y nunca llegaron al cierre de ficha. Sin esto, esos leads quedan
// con transcript en Conversaciones pero invisibles en el pipeline de Leads.
// Se corre por cron diario (api/sweep.js) o a mano con el CRON_SECRET.
import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";
import { SYSTEM_PROMPT, TOOLS } from "./prompts.js";
import { buildFicha } from "./ficha.js";
import { saveLead, listConversations, saveConversation } from "./store.js";

const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const SWEEP_NOTE =
  "MODO CIERRE POR INACTIVIDAD: el lead dejo de responder hace horas y NO va a leer ningun mensaje nuevo. No escribas nada para el lead. Llama guardar_ficha AHORA con todo lo que sepas del transcript; usa desconocido o cadena vacia donde falte informacion.";

/**
 * Cierra las fichas de conversaciones inactivas sin ficha guardada.
 *
 * @param {object} opts
 * @param {number} opts.minAgeHours - horas minimas sin actividad para barrer
 * @param {number} opts.limit - maximo de conversaciones a cerrar por corrida
 * @returns {Promise<Array<{phone: string, marca: string, nivel: string}>>}
 */
export async function sweepGhosts({ minAgeHours = 6, limit = 20 } = {}) {
  const convs = await listConversations();
  const cutoff = Date.now() - minAgeHours * 3600 * 1000;
  const swept = [];

  for (const { phone, state, actualizado } of convs) {
    if (swept.length >= limit) break;
    if (!phone || !state || state.fichaSaved || state.sweptAt) continue;
    if (!Array.isArray(state.messages) || state.messages.length === 0) continue;
    const ts = Date.parse(actualizado || "");
    if (Number.isNaN(ts) || ts > cutoff) continue;

    try {
      // La nota de cierre viaja como mensaje sintetico SOLO en esta llamada;
      // ni el state guardado ni el transcript de la ficha la incluyen.
      const messagesForClose = [...state.messages, { role: "user", content: `[${SWEEP_NOTE}]` }];
      const response = await client.messages.create({
        model: config.MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        tool_choice: { type: "tool", name: "guardar_ficha" },
        messages: messagesForClose,
        output_config: { effort: config.EFFORT },
      });

      const toolUse = response.content.find(
        (b) => b.type === "tool_use" && b.name === "guardar_ficha"
      );
      if (!toolUse) continue;

      const ficha = buildFicha({
        args: toolUse.input,
        enrich: state.enrich,
        messages: state.messages,
        phone,
        source: state.source || "sweep",
      });
      ficha.notas = `${ficha.notas ? `${ficha.notas} | ` : ""}Cerrado por barrido de inactividad (el lead dejo de responder).`;

      await saveLead(ficha);
      state.fichaSaved = true;
      state.sweptAt = new Date().toISOString();
      await saveConversation(phone, state);
      swept.push({ phone, marca: ficha.marca, nivel: ficha.nivel });
    } catch (err) {
      console.error("[sweep] Error cerrando", phone, err);
    }
  }

  return swept;
}
