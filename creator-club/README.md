# Creator Club

Portal de creadoras con misiones + gamificación (modelo L'Oréalistar) para las marcas que gestiona Indie Pro. Marca inicial: **Color Dreams** ("Color Club").

Stack (espejo de lives-app): Next.js 16 + React 19 + Tailwind v4 + Airtable (por fetch) + Vercel.

## Correr local

| Paso | Comando |
|---|---|
| Instalar | `npm install --legacy-peer-deps` |
| Dev | `npm run dev` (http://localhost:3000) |

Sin `AIRTABLE_TOKEN` en el env, la app corre con **datos mock** (`lib/mock.ts`) para ver la UI. Para datos reales: copiar `.env.example` a `.env.local`, crear el base Airtable (tablas en `lib/airtable.ts` → `TABLES`) y completar `data.ts`.

## Estructura

| Carpeta/archivo | Qué es |
|---|---|
| `lib/schema.ts` | Mecánica como código: NIVELES, MISIONES, marca. Fuente única de verdad |
| `lib/airtable.ts` | Cliente Airtable (fetch directo, patrón lives-app): fetchAll/create/update/delete |
| `lib/store.ts` | Persistencia: Airtable si está configurado, si no archivo local `.data/store.json`. Creadoras, Entregas y Campañas |
| `lib/campaigns.ts` | Tipo `Campaign` + `CAMPAIGN_SEED` + `slugify`. El CRUD vive en `store.ts` |
| `lib/session.ts` | Sesión por cookie (`cc_creator` = email) |
| `lib/token.ts` | Magic link: token firmado HMAC, temporal (30 min) |
| `lib/mailer.ts` | Envío del enlace con Resend; sin key, modo dev (imprime/enseña el enlace) |
| `lib/roles.ts` | Allowlist de admins (`ADMIN_EMAILS`) |
| `app/page.tsx` | Dashboard de la creadora (estrellas, nivel, progreso) |
| `app/registro` · `app/acceso` | Alta de creadora · login por correo (magic link) |
| `app/admin` | Panel del equipo: campañas (CRUD), inscripciones (aprobar/rechazar), creadoras |
| `app/misiones` · `app/leaderboard` · `app/recompensas` | Secciones del club |

## Variables de entorno

| Var | Para qué |
|---|---|
| `AIRTABLE_TOKEN` + `AIRTABLE_BASE_ID` | Usa Airtable; sin ellas, archivo local `.data/store.json` |
| `AUTH_SECRET` | Firma los magic links (HMAC). Genera: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `RESEND_API_KEY` + `RESEND_FROM` | Envío real del enlace por correo. Sin key = modo dev (enlace en pantalla/terminal) |
| `ADMIN_EMAILS` | Correos con acceso a `/admin` (separados por coma) |

Tablas Airtable: `node scripts/setup-airtable.mjs` crea Creadoras, Entregas y **Campañas** (y siembra el seed). Reinicia el dev server después.

## Estado

- ✅ Registro de creadora + sesión por cookie.
- ✅ Login por correo (magic link firmado + Resend/modo dev), maneja expiración y correo no registrado.
- ✅ Campañas en Airtable (tabla `Campañas`), leídas por el portal público.
- ✅ Panel `/admin` (allowlist): CRUD de campañas, aprobar/rechazar entregas (aprobar otorga estrellas), vista de creadoras.
- Las estrellas se derivan de entregas **aprobadas** (inscribirse deja la campaña "pendiente").

## Pendiente (roadmap)

1. Form de aplicación (Tally) → alta en Airtable; enlazar desde la landing `clients/color-dreams/09-landing-creadores`.
2. Alimentar GMV por creadora desde TTS/CRUVA (CSV → API).
3. Deploy a Vercel (setear `AIRTABLE_*`, `AUTH_SECRET`, `RESEND_API_KEY`, `ADMIN_EMAILS` en env; dominio tipo `club.colordreams...`).

Gate 0 antes de ir a producción: confirmar atribución de GMV por creadora + cerrar con la marca quién paga incentivos.
