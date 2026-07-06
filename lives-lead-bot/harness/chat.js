#!/usr/bin/env node
// Harness de linea de comandos para probar el bot sin WhatsApp.
// Modo script: --script archivo.txt lee lineas y las manda una por una.
// Modo interactivo: sin --script, abre un prompt de readline.
import { createInterface } from "node:readline";
import { readFileSync, existsSync } from "node:fs";
import { runTurn } from "../src/brain.js";
import { getConversation, saveConversation, resetPhone } from "../src/store.js";
import { formatFicha } from "../src/ficha.js";
import { LEADS_DIR } from "../src/config.js";
import { join } from "node:path";

function parseArgs(argv) {
  const args = { script: null, phone: "5216640000001", reset: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--script") {
      args.script = argv[i + 1];
      i++;
    } else if (argv[i] === "--phone") {
      args.phone = argv[i + 1];
      i++;
    } else if (argv[i] === "--reset") {
      args.reset = true;
    }
  }
  return args;
}

async function runScriptMode(phone, scriptPath) {
  if (!existsSync(scriptPath)) {
    console.error(`No existe el archivo de script: ${scriptPath}`);
    process.exitCode = 1;
    return;
  }

  const lines = readFileSync(scriptPath, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  let state = getConversation(phone);
  let fichaSaved = false;

  for (const line of lines) {
    console.log(`\n>>> PROSPECTO: ${line}`);
    const result = await runTurn({ phone, userText: line, state, source: "harness-demo" });
    state = result.state;
    fichaSaved = result.fichaSaved;
    console.log(`<<< BOT: ${result.reply}`);
    saveConversation(phone, state);
  }

  if (fichaSaved) {
    const leadPath = join(LEADS_DIR, `${phone}-lead.json`);
    const ficha = JSON.parse(readFileSync(leadPath, "utf-8"));
    console.log("\n--- FICHA GUARDADA ---");
    console.log(formatFicha(ficha));
    console.log(`\nArchivo: ${leadPath}`);
  } else {
    console.log("\n(no se guardo ficha en esta corrida)");
  }
}

function runInteractiveMode(phone) {
  console.log(`lives-lead-bot -- chat interactivo (telefono: ${phone})`);
  console.log("Escribe tu mensaje y presiona enter. Comando /salir para terminar.\n");

  let state = getConversation(phone);

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  rl.setPrompt("Tu (prospecto)> ");
  rl.prompt();

  rl.on("line", async (line) => {
    const text = line.trim();
    if (text === "/salir") {
      rl.close();
      return;
    }
    if (!text) {
      rl.prompt();
      return;
    }

    try {
      const result = await runTurn({ phone, userText: text, state, source: "harness-interactivo" });
      state = result.state;
      saveConversation(phone, state);
      console.log(`BOT: ${result.reply}`);
      if (result.fichaSaved) {
        console.log("(ficha guardada)");
      }
    } catch (err) {
      console.error("Error corriendo el turno:", err);
    }

    rl.prompt();
  });

  rl.on("close", () => {
    console.log("\nHasta luego.");
    process.exit(0);
  });

  // Ctrl+C limpio
  rl.on("SIGINT", () => {
    rl.close();
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.reset) {
    resetPhone(args.phone);
    console.log(`(estado reseteado para ${args.phone})`);
  }

  if (args.script) {
    await runScriptMode(args.phone, args.script);
  } else {
    runInteractiveMode(args.phone);
  }
}

main().catch((err) => {
  console.error("Error fatal en el harness:", err);
  process.exitCode = 1;
});
