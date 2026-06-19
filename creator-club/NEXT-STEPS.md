# Next Steps — Creator Club

Prompt listo para pegar en una **nueva conversación de Claude Code** y seguir construyendo la plataforma.

## Cómo usarlo

1. Abre Claude Code **dentro de esta carpeta** (`/Users/apkuzz/CascadeProjects/creator-club`).
2. Copia el bloque de abajo y pégalo como primer mensaje.
3. En la **tarea 3** reemplaza el placeholder con tus otros cambios.

## Antes de arrancar (prerequisitos)

| Para | Necesitas |
|---|---|
| Magic-link (tarea 1) | Cuenta de Resend (gratis) + `RESEND_API_KEY`. Para empezar sirve el dominio de prueba `onboarding@resend.dev` |
| Admin (tarea 2) | Definir los correos admin (el de Oscar + el de Paulina) para el allowlist |

## El prompt

```
Trabajas en una app Next.js llamada "creator-club" en /Users/apkuzz/CascadeProjects/creator-club (abre Claude Code en esa carpeta).

QUÉ ES: portal web donde las creadoras de contenido de la marca Color Dreams (colchones bed-in-a-box, México) se inscriben y participan en campañas, con gamificación ligera (estrellas, niveles). Es una réplica accesible del modelo L'Oréalistar. La opera la agencia Indie Pro Marketing.

STACK (espejo de la app hermana "lives-app"): Next.js 16.2.6 (App Router, Turbopack, reactCompiler:true), React 19, TypeScript, Tailwind v4, datos en Airtable vía fetch directo (sin SDK), deploy futuro en Vercel. CRÍTICO: Next.js 16 tiene breaking changes vs lo que conoces; imita los patrones reales que ya están en el repo y, si dudas, lee node_modules/next/dist/docs/ antes de escribir código. cookies() y searchParams son async. Usa server actions como ya se usan.

ANTES DE TOCAR NADA, LEE:
- README.md (estructura + roadmap)
- lib/schema.ts (niveles + misiones), lib/campaigns.ts (campañas seed en código), lib/store.ts (persistencia Airtable-o-archivo), lib/session.ts (sesión por cookie), lib/airtable.ts, lib/data.ts
- app/page.tsx, app/registro/, app/campanas/, app/salir/, components/Nav.tsx
- Contexto de negocio/decisiones: /Users/apkuzz/.claude/projects/-Users-apkuzz-Desktop-Windsurf/memory/project-lorealistar-humanz-creator-community.md
- Patrón de auth next-auth v5 (por si lo reusas): /Users/apkuzz/Desktop/Windsurf/lives-app/auth.ts

ESTADO ACTUAL (funciona y está verificado, NO lo rompas): registro de creadora (/registro, server action) -> sesión por cookie SIN password -> /campanas (botón Participar) -> dashboard personalizado con nivel/estrellas/"mis campañas". Persistencia en lib/store.ts: si .env.local tiene AIRTABLE_TOKEN + AIRTABLE_BASE_ID usa Airtable, si no usa archivo local .data/store.json. Airtable YA cableado: base "Creator Club" appiPoD3bYfj3bYh1, tablas Creadoras (Nombre/Handle/Email/Seguidores/Ciudad) y Entregas (Email/Campaña/Estado/Link). El token vive en .env.local (gitignored). Deploy a Vercel está PENDIENTE (no asumas que está deployado).

CÓMO CORRER/VERIFICAR: `npm run dev` (puerto 3000). Verifica SIEMPRE visualmente (screenshot con Chrome headless o navegador) que funciona, no solo que compila. Mata el server al terminar (la Mac tiene recursos limitados; nunca dejes server o headless corriendo). No metas node_modules en el Desktop.

TAREAS:

1) LOGIN POR CORREO (MAGIC-LINK) para que las creadoras regresen a su cuenta. Hoy la cookie de sesión solo se setea al registrarse y no hay forma de volver a entrar. Crea /acceso: la creadora pone su correo, recibe un email con un enlace firmado y temporal, al abrirlo se valida y se setea la cookie de sesión (reusa lib/session.ts). Enfoque sugerido: ligero con token firmado (HMAC o JWT) + envío con Resend (necesitarás RESEND_API_KEY en .env.local; pídeselo a Oscar, o usa el dominio de prueba de Resend onboarding@resend.dev para empezar). next-auth v5 Email es alternativa pero NO hay adapter de Airtable, así que el enfoque ligero suele ser más simple. Maneja expiración del link y el caso correo ya registrado vs no registrado.

2) PANEL DE ADMIN (/admin) para que el equipo (Oscar + Paulina) publique campañas y apruebe entregas SIN tocar Airtable:
   - Protégelo con allowlist de correos admin (ej. ADMIN_EMAILS en .env.local, mismo patrón de roles que lives-app). Solo esos correos entran.
   - Campañas: mueve las campañas de lib/campaigns.ts (seed en código) a una tabla nueva de Airtable "Campañas" y haz CRUD desde el admin (crear / editar / activar / desactivar). El portal público debe leer campañas desde Airtable. Crea la tabla con un script tipo scripts/setup-airtable.mjs (ese patrón ya existe).
   - Aprobaciones: lista las inscripciones (tabla Entregas) y permite cambiar el Estado (inscrita -> aprobada / rechazada). Al aprobar, suma las estrellas correspondientes a la creadora.
   - Vista de creadoras inscritas.

3) [OSCAR: PEGA AQUÍ TUS OTROS CAMBIOS]

REGLAS: mantén el patrón de lib/store.ts (Airtable si está configurado, archivo si no) para que todo siga corriendo en local sin cuentas externas. No rompas el flujo actual de registro/campañas. Código consistente con lo existente (mismos componentes; tema Color Dreams: crema #EFEDDF, violeta #7979EC, lima #C7EC4D con texto violeta oscuro encima, fuente Red Hat). Al terminar cada tarea, corre la app y muéstrame screenshots de que funciona. Si hay git, commits atómicos por tarea.
```
