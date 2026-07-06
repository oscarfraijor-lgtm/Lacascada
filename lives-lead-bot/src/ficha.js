// Arma y formatea la ficha final del lead a partir del input de la tool guardar_ficha,
// la investigacion del website, y el historial de la conversacion.

/**
 * Arma el objeto plano de la ficha del lead.
 *
 * @param {object} params
 * @param {object} params.args - input de la tool guardar_ficha (ya parseado)
 * @param {object|null} params.enrich - resultado de enrichWebsite, o null si no se investigo
 * @param {Array} params.messages - historial completo de mensajes de la conversacion
 * @param {string} params.phone - telefono del prospecto
 * @param {string} params.source - fuente del contacto (organico, ad:..., harness-demo, etc)
 */
export function buildFicha({ args, enrich, messages, phone, source }) {
  return {
    ...args,
    telefono: phone,
    fuente: source,
    score: enrich?.score ?? null,
    tier: enrich?.tier ?? "",
    investigacion: enrich || null,
    transcript: formatTranscript(messages),
    creado: new Date().toISOString(),
  };
}

// Formatea el historial de mensajes a texto plano legible para el equipo humano.
// Solo turnos user/assistant con texto; los turnos user que son puro tool_result
// (content array) se saltan porque no aportan nada legible.
function formatTranscript(messages) {
  const lines = [];
  for (const msg of messages || []) {
    if (msg.role === "user") {
      if (typeof msg.content === "string") {
        lines.push(`PROSPECTO: ${msg.content}`);
      }
      // si content es array (tool_result), se salta: no es texto del prospecto
    } else if (msg.role === "assistant") {
      const text = extractAssistantText(msg.content);
      if (text) {
        lines.push(`BOT: ${text}`);
      }
      // si no hay texto (solo tool_use), tambien se salta
    }
  }
  return lines.join("\n\n");
}

function extractAssistantText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/**
 * String corto multilinea para consola: marca, ruta, score/tier, mercado, ya_en_tts,
 * gancho, resumen.
 */
export function formatFicha(ficha) {
  const lines = [
    `Marca: ${ficha.marca || "desconocido"}`,
    `Ruta: ${ficha.ruta || "?"}`,
    `Score/Tier: ${ficha.score ?? "n/a"} / ${ficha.tier || "n/a"}`,
    `Mercado: ${ficha.mercado || "desconocido"}`,
    `Ya en TTS: ${ficha.ya_en_tts || "desconocido"}`,
    `Gancho: ${ficha.gancho || ""}`,
    `Resumen: ${ficha.resumen || ""}`,
  ];
  return lines.join("\n");
}
