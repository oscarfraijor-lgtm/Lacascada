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
| `ADMIN_EMAILS` | Correos con acceso a `/admin` (separados por coma). Aquí van Mabel, Oscar y Paulina |
| `AIRTABLE_BASE_<SLUG>` (+ opcional `AIRTABLE_TOKEN_<SLUG>`) | **Multimarca**: conecta la base de otra marca al panel de admin (ej. `AIRTABLE_BASE_ANYELUZ`). El token cae al `AIRTABLE_TOKEN` global si la base comparte cuenta de Airtable; si vive en otra cuenta, define `AIRTABLE_TOKEN_<SLUG>` con un PAT que la acceda |

Tablas Airtable: `node scripts/setup-airtable.mjs` crea Creadoras, Entregas, **Campañas** y **Canjes** (y siembra el seed). Reinicia el dev server después.

## Estado

- ✅ Registro de creadora + sesión por cookie.
- ✅ Login por correo (magic link firmado + Resend/modo dev), maneja expiración y correo no registrado.
- ✅ Campañas en Airtable (tabla `Campañas`), leídas por el portal público.
- ✅ Panel `/admin` (allowlist): CRUD de campañas, aprobar/rechazar entregas (aprobar otorga estrellas), vista de creadoras.
- ✅ Recompensas accionables con candado por GMV + canjes (`/admin/canjes`), historial de estrellas (`/historial`).
- ✅ **Admin multimarca**: `/admin/marcas` lista todas las marcas gestionadas; "entrar" a una apunta todo el panel a SU base de Airtable (datos aislados por marca). El lado público sigue sirviendo la marca del env (`NEXT_PUBLIC_BRAND`). Marcas nuevas: copia la plantilla en `lib/brands.ts` (identidad + mecánica) y conecta su base con `AIRTABLE_BASE_<SLUG>`.
- Las estrellas se derivan de entregas **aprobadas** (inscribirse deja la campaña "pendiente").

## Pendiente (roadmap)

1. Form de aplicación (Tally) → alta en Airtable; enlazar desde la landing `clients/color-dreams/09-landing-creadores`.
2. Alimentar GMV por creadora desde TTS/CRUVA (CSV → API).
3. Deploy a Vercel (setear `AIRTABLE_*`, `AUTH_SECRET`, `RESEND_API_KEY`, `ADMIN_EMAILS` en env; dominio tipo `club.colordreams...`).

Gate 0 antes de ir a producción: confirmar atribución de GMV por creadora + cerrar con la marca quién paga incentivos.
