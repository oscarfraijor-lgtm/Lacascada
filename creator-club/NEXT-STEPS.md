# Next Steps — Creator Club

Prompt de handoff para **abrir un chat nuevo de Claude Code** dentro de esta carpeta
(`/Users/apkuzz/CascadeProjects/creator-club`) y seguir construyendo con contexto limpio.

## Cómo usarlo

1. Abre Claude Code dentro de esta carpeta.
2. Copia el bloque de abajo como primer mensaje.
3. En **TAREAS**, deja las que quieras o pega las tuyas en el placeholder.

## Prerequisitos vivos

| Cosa | Estado |
|---|---|
| Airtable | Base "Creator Club" `appiPoD3bYfj3bYh1`, tokens en `.env.local` (gitignored). Base limpia: 0 creadoras / 0 entregas / 5 campañas seed |
| Resend (correo) | API key configurada (Sending-access). En modo prueba entrega SOLO a `oscar.fraijor@gmail.com` hasta verificar dominio (Fase B) |
| Admins | `ADMIN_EMAILS` = Oscar (x2) + Paulina (`afiliadostiktok@indiepro.com.mx`) |
| Git | En el monorepo "Lacascada" (`oscarfraijor-lgtm/Lacascada`), rama `main`, todo pusheado (`origin/main` = `fd31088`) |

## El prompt

```
Trabajas en "creator-club", app Next.js en /Users/apkuzz/CascadeProjects/creator-club (ábrela en esa carpeta).

QUÉ ES: portal MULTIMARCA de "creator clubs" tipo L'Oréalistar que opera la agencia Indie Pro Marketing para sus marcas-cliente. Cada marca (la primera y de referencia es Color Dreams, colchones bed-in-a-box de México) tiene su propio club branded donde las creadoras se inscriben, participan en campañas (canje/gifting) y suben de nivel con estrellas. UN solo código sirve a todas; cada marca tiene su propia base de Airtable (datos aislados) y su propio deploy. La marca es la dueña de su club; Indie Pro NO se expone a las creadoras (salvo en /legal como responsable de datos).

STACK (espejo de la app hermana lives-app): Next.js 16.2.6 (App Router, Turbopack, reactCompiler), React 19, TypeScript, Tailwind v4, datos en Airtable por fetch directo (sin SDK), deploy Vercel. CRÍTICO: Next 16 tiene breaking changes vs lo que conoces; imita los patrones reales del repo. cookies() y searchParams son async. Usa server actions como ya se usan. Si dudas, lee node_modules/next/dist/docs/ antes de escribir código.

ANTES DE TOCAR NADA, LEE:
- README.md y NEXT-STEPS.md
- lib/brands.ts (registro de marcas: identidad/colores/legal obligatorios + mecánica opcional con fallback a Color Dreams; getBrand() lee NEXT_PUBLIC_BRAND)
- lib/schema.ts (BRAND/LEVELS/MISSIONS vienen de getBrand(); levelForStars/nextLevel)
- lib/store.ts (persistencia Airtable-o-archivo: creadoras, entregas, campañas, GMV; estados de participación)
- lib/campaigns.ts, lib/data.ts, lib/session.ts, lib/token.ts (magic link HMAC), lib/mailer.ts (Resend/modo-dev), lib/roles.ts (allowlist admin), lib/airtable.ts
- app/page.tsx (dashboard), app/registro, app/acceso, app/campanas, app/admin/*, app/legal, app/misiones|leaderboard|recompensas, components/Nav.tsx, components/TrustBar.tsx
- Contexto/decisiones de negocio: /Users/apkuzz/.claude/projects/-Users-apkuzz-Desktop-Windsurf/memory/project-lorealistar-humanz-creator-community.md

ESTADO ACTUAL (funciona y verificado E2E, NO lo rompas):
- Registro de creadora (con portafolio + checkbox de consentimiento del aviso de privacidad) -> sesión por cookie. "Seguidores" es opcional ("no necesitas seguidores").
- Login magic-link en /acceso: token HMAC firmado (30 min) + envío con Resend; sin RESEND_API_KEY = modo dev que muestra el enlace en pantalla. Maneja expirado/inválido/correo-no-registrado y admite admins.
- /campanas: requisitos "Para calificar" visibles + ciclo de entrega: inscrita -> aceptada -> entregada (la creadora sube el link de su video) -> aprobada/rechazada. SOLO "aprobada" otorga estrellas (anti-fuga). Rechazo con motivo visible + reaplicar. Dedupe de inscripción en Airtable.
- /admin (protegido por allowlist ADMIN_EMAILS, gate en layout Y en cada server action): CRUD de campañas (crear/editar/activar/eliminar), aprobar/aceptar/rechazar inscripciones (rechazo con motivo), captura MANUAL de GMV por creadora (Creadoras.GMV_MXN/GMV_Fecha, del export de TT Shop Analytics, NO API), lista de creadoras. Indicador de fuente de datos (Airtable/archivo).
- Mecánica: estrellas = suma de entregas APROBADAS. GMV manual alimenta levelForStars -> enciende Insomne Pro/Embajadora. Dashboard real (estrellas/nivel/progreso/ventas atribuidas "actualizado al [fecha]"/ranking real con "(tú)"). Misiones, leaderboard y recompensas son del usuario real (ya NO hay datos mock).
- Confianza: TrustBar anti-fraude (3 promesas, sin mencionar a Indie Pro) en registro/campanas/home. /legal = aviso de privacidad + términos (incluye usage rights), brand-driven. OJO: /legal es BORRADOR, debe validarlo un abogado y confirmar la entidad responsable.
- MULTIMARCA: todo lo visible/legal sale de la marca activa. Colores inyectados como CSS variables en layout.tsx (globals.css = default). Hay una marca "demo" en brands.ts como plantilla.

DATOS (Airtable base "Creator Club" appiPoD3bYfj3bYh1):
- Creadoras: Nombre, Handle, Email, Seguidores, Ciudad, Portafolio, GMV_MXN, GMV_Fecha
- Entregas: Email, Campaña, Estado, Link, Motivo  (Estado in: inscrita|aceptada|entregada|aprobada|rechazada)
- Campañas: Id, Título, Marca, Brief, Recompensa, Estrellas, Deadline, Tag, Requisitos, Activa
- Crear/actualizar tablas y campos (idempotente, brand-aware): node scripts/setup-airtable.mjs
- Tokens en .env.local (gitignored). La base está LIMPIA (0 creadoras / 0 entregas / 5 campañas seed).

CÓMO CORRER/VERIFICAR: npm run dev (puerto 3000). Verifica SIEMPRE visualmente (screenshot/preview), no solo que compila. Corre npx tsc --noEmit. Mata el server al terminar (Mac con recursos limitados; nunca lo dejes corriendo). Si creas datos de prueba en Airtable, LÍMPIALOS al final (deja la base en 0 creadoras / 0 entregas). Para probar login/admin sin depender del correo: genera un token con AUTH_SECRET (node + crypto, mismo formato que lib/token.ts) y abre /acceso/verificar?token=... Para probar otra marca: cambia NEXT_PUBLIC_BRAND en .env.local (ej. "demo") y reinicia.

GIT: creator-club vive DENTRO del monorepo "Lacascada" (/Users/apkuzz/CascadeProjects, remoto github oscarfraijor-lgtm/Lacascada), rama main, todo del club pusheado (origin/main = fd31088). Hay ~74 cambios ajenos de Oscar en el monorepo: NO los toques; scope tus commits SOLO a creator-club/. Commits atómicos por tarea. Push SOLO cuando Oscar lo pida.

REGLAS DE NEGOCIO (no las violes):
- Anti-fuga: nada con costo real (producto/cash/boost) se gatilla sin venta atribuible en TikTok Shop. Las estrellas son estatus, costo $0.
- UNA base de Airtable por marca; los datos NUNCA se cruzan entre marcas (consentimiento/legal).
- La marca es la dueña del club; NO exponer "Indie Pro Marketing" a las creadoras (sí en /legal como responsable de datos).
- Gifting/canje es el formato dominante; comisión Indie Pro = 10% GMV. Lean (fundador solo, piloto ~$0): nada de infra pesada (apps nativas, microservicios, ML).
- No hardcodees "Color Dreams" ni colores: usa BRAND / getBrand().
- Idioma español. Evita el look "hecho por IA" (sin emojis-icono regados). Verifica antes de afirmar; nunca inventes datos.

TAREAS:
1) [RECOMENDADO] Recompensas + misiones REALES con candado honesto por GMV. Hoy el catálogo de recompensas y las misiones se muestran pero no son accionables. Construye: (a) las recompensas/misiones de venta se muestran como Disponible / Desbloqueada (cumple estrellas Y GMV) / Bloqueada (con el criterio exacto), usando el GMV manual que ya existe; (b) flujo de canje: la creadora "solicita", el admin aprueba en /admin, y los canjes con costo NO se aprueban sin GMV atribuible (gating SERVER-SIDE, no solo UI). Respeta anti-fuga. Patrón store.ts (Airtable-o-archivo); las tablas Recompensas/Canjes ya están declaradas en lib/airtable.ts pero sin uso.
2) Historial de estrellas (ledger): muéstrale a la creadora el recibo línea por línea de cada estrella otorgada (de qué campaña, cuándo). Versión mínima: iterar las entregas aprobadas (datos que ya existen). Ataca el dolor #1 del research (confianza en que el premio llega).
3) [OSCAR: PEGA AQUÍ TUS OTROS CAMBIOS]

REGLAS DE EJECUCIÓN: mantén el patrón de lib/store.ts (Airtable si está configurado, archivo si no) para que corra en local sin cuentas externas. No rompas el flujo actual (registro/login/campañas/admin/multimarca). Código consistente con lo existente. Al terminar cada tarea: npx tsc --noEmit + corre la app + screenshots de que funciona + limpia datos de prueba + mata el server. Commits atómicos por tarea; push solo si Oscar lo pide.
```
