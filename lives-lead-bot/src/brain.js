// El cerebro del bot: un turno de conversacion con Claude, incluyendo el loop manual
// de tool use (investigar_website / guardar_ficha) y el cierre forzado por max turnos.
import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";
import { SYSTEM_PROMPT, TOOLS } from "./prompts.js";
import { enrichWebsite } from "./enrich.js";
import { buildFicha } from "./ficha.js";
import { saveLead, pingOscar } from "./store.js";
import { sendDocument } from "./whatsapp.js";

const MAX_TOOL_ITERATIONS = 5;

const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

// La PRIMERA compilacion de la gramatica de tools estrictas puede exceder el timeout
// del API (400 "Grammar compilation timed out"); reintentar la misma llamada suele
// pegar contra la gramatica ya cacheada. Solo se reintenta ese error especifico.
async function createWithGrammarRetry(messages) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await client.messages.create({
        model: config.MODEL,
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages,
        output_config: { effort: config.EFFORT },
      });
    } catch (err) {
      const esGrammarTimeout =
        err instanceof Anthropic.BadRequestError &&
        String(err.message).includes("Grammar compilation timed out");
      if (esGrammarTimeout && attempt < 2) {
        console.error(`[brain] Grammar timeout (intento ${attempt + 1}), reintentando...`);
        await new Promise((r) => setTimeout(r, 1500));
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

function extractText(content) {
  if (!Array.isArray(content)) return "";
  return content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

async function runTool(block, state) {
  if (block.name === "investigar_website") {
    const { url, seed_ig, seed_tiktok } = block.input;
    const result = await enrichWebsite(url, { seedIg: seed_ig, seedTiktok: seed_tiktok });
    state.enrich = result;
    return { content: JSON.stringify(result), is_error: false };
  }

  if (block.name === "enviar_deck") {
    if (state.deckSent) {
      return { content: JSON.stringify({ ok: true, note: "deck ya enviado antes" }), is_error: false };
    }
    try {
      await sendDocument(
        state.phone,
        config.DECK_URL,
        "Indie Pro Lives - Presentacion.pdf",
        "Presentacion de Indie Pro Marketing, Partner Oficial de TikTok Shop."
      );
      state.deckSent = true;
      return { content: JSON.stringify({ ok: true }), is_error: false };
    } catch (err) {
      console.error("[brain] enviar_deck fallo:", err);
      // No tumbamos la conversacion: el bot puede seguir sin el adjunto.
      return { content: JSON.stringify({ ok: false, error: "no se pudo enviar el deck" }), is_error: false };
    }
  }

  if (block.name === "guardar_ficha") {
    if (state.fichaSaved) {
      return { content: JSON.stringify({ ok: false, error: "ficha ya guardada" }), is_error: false };
    }
    const ficha = buildFicha({
      args: block.input,
      enrich: state.enrich,
      messages: state.messages,
      phone: state.phone,
      source: state.source,
    });
    await saveLead(ficha);
    state.fichaSaved = true;
    return { content: JSON.stringify({ ok: true }), is_error: false };
  }

  return { content: JSON.stringify({ ok: false, error: `tool desconocida: ${block.name}` }), is_error: true };
}

/**
 * Corre un turno de conversacion: agrega el mensaje del prospecto, llama a Claude,
 * resuelve el loop de tool use si aplica, y devuelve la respuesta final de texto.
 *
 * @param {object} params
 * @param {string} params.phone - telefono del prospecto
 * @param {string} params.userText - texto que mando el prospecto
 * @param {object|null} params.state - estado previo de la conversacion (o null si es nueva)
 * @param {string} params.source - fuente del contacto (organico, ad:..., harness-demo, etc)
 */
export async function runTurn({ phone, userText, state, source }) {
  if (!state) {
    state = { messages: [], turnCount: 0, enrich: null, fichaSaved: false };
  }
  // el phone y source viajan en el state para que runTool los use al armar la ficha
  state.phone = phone;
  state.source = source;

  // Marca cuando el lead escribio por ultima vez y reinicia los recordatorios:
  // el seguimiento automatico (src/followup.js) mide el silencio desde aqui.
  state.lastLeadAt = new Date().toISOString();
  state.followups = {};

  state.messages.push({ role: "user", content: userText });

  let reply = "";

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    let response;
    try {
      response = await createWithGrammarRetry(state.messages);
    } catch (err) {
      if (
        err instanceof Anthropic.RateLimitError ||
        err instanceof Anthropic.APIConnectionError ||
        err instanceof Anthropic.APIError
      ) {
        console.error("[brain] Error de API/red:", err);
        // Alarma a Oscar: el bot no pudo contestar (creditos agotados, key
        // invalida, red caida). CallMeBot es independiente de la API de Anthropic.
        const motivo = String(err?.message || "").includes("credit balance")
          ? "SIN CREDITOS de la API de Anthropic, recargar YA en console.anthropic.com"
          : `error de API: ${String(err?.message || err).slice(0, 120)}`;
        await pingOscar(`ALERTA bot leads: no pude responder a ${phone}. Causa: ${motivo}`);
        reply = "Dame un momento, se me trabo el sistema. Te leo.";
        break;
      }
      throw err;
    }

    // Siempre se pushea el turno del assistant (con o sin tool_use) para mantener
    // el historial correcto de cara al proximo turno.
    state.messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      reply = extractText(response.content);
      break;
    }

    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    const toolResults = [];
    for (const block of toolUseBlocks) {
      const { content, is_error } = await runTool(block, state);
      const toolResult = { type: "tool_result", tool_use_id: block.id, content };
      if (is_error) toolResult.is_error = true;
      toolResults.push(toolResult);
    }
    state.messages.push({ role: "user", content: toolResults });

    // si esta es la ultima iteracion permitida, no hay otro create() que capture
    // texto final; reply se queda como esta (vacio o lo que haya quedado de antes).
  }

  state.turnCount++;

  // Cierre forzado si se paso de MAX_TURNS y no se guardo ficha todavia.
  if (state.turnCount >= config.MAX_TURNS && !state.fichaSaved) {
    const args = {
      nombre: "desconocido",
      marca: "desconocido",
      categoria: "desconocido",
      ventas_bucket: "desconocido",
      nivel: "HUMANO",
      rol: "desconocido",
      tiktok: "",
      instagram: "",
      website: "",
      ciudad: "",
      correo: "",
      mercado: "desconocido",
      gancho: "Max turnos alcanzado, revisar transcript",
      resumen: "Conversacion larga sin cierre, revisar transcript completo",
      notas: "",
    };
    const ficha = buildFicha({
      args,
      enrich: state.enrich,
      messages: state.messages,
      phone: state.phone,
      source: state.source,
    });
    await saveLead(ficha);
    state.fichaSaved = true;
    reply = `${reply}\n\nGracias por tu tiempo, alguien de nuestro equipo te contacta pronto.`.trim();
  }

  return { reply, state, fichaSaved: state.fichaSaved };
}
