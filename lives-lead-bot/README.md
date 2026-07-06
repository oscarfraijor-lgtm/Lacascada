# lives-lead-bot

Bot calificador de leads inbound de WhatsApp para el programa de Lives de Indie Pro Marketing (agencia de TikTok Shop Management). Conversa con el prospecto usando la API de Claude, investiga el website de su marca con un motor de reglas (regex) portado desde Python, y guarda una ficha del lead lista para que el equipo humano la retome.

## Arquitectura

| Pieza | Detalle |
|-------|---------|
| Cerebro | Claude (`claude-sonnet-5` via `@anthropic-ai/sdk`), tool use loop manual en `src/brain.js` |
| Enrich | Motor de reglas en `src/enrich.js`, port fiel de `scripts/prospect-enrich.py` (Windsurf) |
| Sink | Airtable (si hay credenciales) + JSON local en `leads/` (siempre) |
| Canal | WhatsApp Cloud API (Meta), Fase 1 en `api/webhook.js` |
| Host | Vercel (funcion serverless) |

## Correr local

| Paso | Comando |
|------|---------|
| Instalar dependencias | `npm install` |
| Configurar variables de entorno | copiar `.env.example` a `.env` y llenar lo necesario |
| Correr la demo con transcript fijo | `npm run demo` |
| Chatear en modo interactivo | `npm run chat` |

El modo demo (`npm run demo`) corre el guion de `harness/demo-prospecto.txt` linea por linea y al final imprime la ficha guardada. El modo interactivo (`npm run chat`) abre un prompt en la terminal donde puedes escribir como si fueras el prospecto, con el comando `/salir` para terminar.

Ambos modos requieren `ANTHROPIC_API_KEY` configurada en `.env` para llamar a la API real.

## Variables de entorno

| Variable | Para que sirve |
|----------|-----------------|
| `ANTHROPIC_API_KEY` | Autenticacion con la API de Claude |
| `MODEL` | Modelo de Claude a usar (default `claude-sonnet-5`) |
| `EFFORT` | Nivel de esfuerzo del modelo: `low`, `medium` o `high` (default `low`) |
| `AIRTABLE_TOKEN` | Token personal de Airtable, para guardar leads en la base |
| `AIRTABLE_BASE_ID` | ID de la base de Airtable donde vive la tabla de Leads |
| `AIRTABLE_TABLE_LEADS` | Nombre de la tabla de Leads (default `Leads`) |
| `WHATSAPP_TOKEN` | Token de acceso de WhatsApp Cloud API |
| `WHATSAPP_PHONE_NUMBER_ID` | ID del numero de telefono de WhatsApp Cloud API |
| `WHATSAPP_VERIFY_TOKEN` | Token de verificacion del webhook (lo defines tu) |
| `COPILOT_MODE` | Si es `true` (default), las respuestas quedan pendientes en vez de enviarse solas |
| `CALLMEBOT_APIKEY` | API key de CallMeBot, para el ping opcional cuando hay un lead caliente |
| `CALLMEBOT_PHONE` | Numero registrado en CallMeBot que recibe el ping |
| `MAX_TURNS` | Maximo de intercambios antes de forzar el cierre de la conversacion (default 12) |

## Rutas de calificacion

| Ruta | Significado | Cierre con el prospecto |
|------|-------------|---------------------------|
| A | Lives-ready: ya vende en TikTok Shop, producto demostrable en vivo, catalogo razonable | Buen perfil para el programa, el equipo lo contacta en el transcurso del dia |
| B | Gestion primero: marca DTC buena pero sin TikTok Shop conectada, o catalogo muy chico | Conviene dejar lista la tienda primero, el equipo tambien ayuda con eso |
| C | No apto: B2B, servicios, ticket muy alto, o producto no demostrable en vivo | Agradecimiento calido, se explica que el programa es para marcas de producto al consumidor final |
| H | Humano directo: pide hablar con una persona, es cliente actual, o no se pudo clasificar | Se confirma que alguien del equipo lo contacta |

La ruta es calificacion interna, nunca se le menciona al prospecto.

## Fases

| Fase | Estado | Contenido |
|------|--------|-----------|
| Fase 0 | Hecha | Cerebro (`src/brain.js`) + harness de prueba (`harness/chat.js`) |
| Fase 1 | Pendiente | Webhook (`api/webhook.js`), app de Meta con producto WhatsApp, deploy en Vercel |
| Fase 2 | Pendiente | Copiloto en produccion (respuestas pendientes revisadas por un humano antes de enviarse) |
| Fase 3 | Pendiente | Autonomo (respuestas se envian solas) mas template de follow-up a las 24 horas |

## Limitaciones conocidas

| Limitacion | Detalle | Se resuelve en |
|------------|---------|------------------|
| Memoria de conversacion en filesystem | En Vercel el filesystem es efimero entre invocaciones y cold starts, la conversacion se puede perder | Fase 1, moviendo la memoria de conversacion a Airtable |
| Dedupe de mensajes en memoria | El Set que evita procesar el mismo mensaje dos veces vive en memoria del modulo, no sobrevive un cold start ni se comparte entre instancias | Fase 1, moviendo el dedupe a Airtable |
