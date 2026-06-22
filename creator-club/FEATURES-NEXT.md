# Creator Club — Prompt de handoff: funcionalidades pendientes

Pega este contenido como primer mensaje en un chat nuevo de Claude Code abierto en
`/Users/apkuzz/CascadeProjects/creator-club` (o pídele que lo lea de este archivo).
Salió del loop de dogfooding + revisión adversarial (jun 2026): los bugs críticos ya
se arreglaron; aquí van las **features obvias** que faltan.

---

Trabajas en "creator-club", app Next.js en `/Users/apkuzz/CascadeProjects/creator-club`. Está EN VIVO en https://creator-club-nu.vercel.app con CI/CD: cada push a `main` se auto-deploya a Vercel.

## Qué es

Portal MULTIMARCA de "creator clubs" tipo L'Oréalistar que opera la agencia Indie Pro Marketing (MX) / ESH Creative Lab (USA) para sus marcas-cliente. La primera y de referencia es Color Dreams (colchones bed-in-a-box). UN solo código sirve a todas; cada marca tiene su propia base de Airtable (datos aislados) y su deploy. La marca es dueña de su club; Indie Pro NO se expone a las creadoras (salvo en `/legal` como responsable de datos).

## Stack

Next.js 16.2.6 (App Router, Turbopack, reactCompiler), React 19, TypeScript, Tailwind v4, datos en Airtable por fetch directo (sin SDK; `lib/store.ts` es Airtable-o-archivo-local con conexión por marca), deploy Vercel. Next 16 tiene breaking changes: `cookies()`/`searchParams`/`headers()` son async; usa server actions como ya se usan; si dudas, imita los patrones reales del repo.

## Antes de tocar nada, lee

- `README.md`
- Contexto/decisiones de negocio (clave): `/Users/apkuzz/.claude/projects/-Users-apkuzz-Desktop-Windsurf/memory/project-lorealistar-humanz-creator-community.md`
- `lib/brands.ts` (registro de marcas + mecánica), `lib/schema.ts` (niveles/misiones, `levelForStars`), `lib/store.ts` (persistencia Airtable-o-archivo, `conn` por marca), `lib/data.ts` (vistas dashboard/recompensas/ledger/leaderboard), `lib/rewards.ts` (candado por GMV), `lib/brand-admin.ts` (`getAdminContext`/`managedBrands`/`resolveConn`), `lib/session.ts` + `lib/token.ts` (cookie de sesión FIRMADA + magic link HMAC), `lib/roles.ts` (allowlist admin), `lib/airtable.ts` (fetch + `escFormula`), `lib/mailer.ts` (Resend), `lib/email.ts`, `lib/theme.ts`
- `app/(public)/*` (club público), `app/console/*` + `app/operador/*` (consola operador), `app/admin/*` (admin por marca), `components/*` (Nav, SubmitButton, RewardStateChip, AdminBrandPending)

## Arquitectura (3 capas, NO romper)

1. **Club PÚBLICO**: route group `app/(public)/` con su layout (tema de la marca del env `NEXT_PUBLIC_BRAND` + `<Nav>`). Aquí viven `/`, registro, acceso (+verificar), campanas, misiones, leaderboard, recompensas, historial, legal, salir. Usa `BRAND`/`getBrand()` y store SIN `conn`.
2. **Consola OPERADOR** (nivel superior, NEUTRAL Indie Pro + ESH): `app/operador` (login del equipo) y `app/console` (selector de clubs; `/console/equipo` genera links de acceso). Tema neutro (`lib/theme` `OPERATOR_THEME`). Gate `isAdmin`.
3. **Admin POR MARCA**: `app/admin/` se re-themea con la marca seleccionada y pasa `ctx.conn` (`getAdminContext`) a store para apuntar a SU base. Pestañas: Campañas, Inscripciones, Canjes, Creadoras. "Ver el club" abre el club público.

## Reglas de negocio (no las violes)

- **Anti-fuga**: nada con costo real (producto/cash/boost/experiencia) se gatilla sin venta atribuible en TikTok Shop (GMV). Las estrellas son estatus, costo $0. Gate server-side en canjes (`canApproveCanje`), fail-closed.
- **UNA base de Airtable por marca**; los datos NUNCA se cruzan. El lado público usa la marca del env; el admin pasa `ctx.conn` de la marca seleccionada.
- La marca es dueña del club; NO exponer "Indie Pro" a creadoras (sí en `/legal` y en la consola interna).
- Comisión Indie Pro = 10% GMV. Lean (fundador solo). No hardcodees marca ni colores: usa `BRAND`/`getBrand()`/`ctx.brand`.
- Español (mezcla inglés técnico). Evita look "hecho por IA". Verifica antes de afirmar; nunca inventes datos. NO uses em/en dashes (—). Logout y acciones destructivas SIEMPRE por POST. La cookie de sesión va FIRMADA (`lib/token` `signSession`/`verifySession`), nunca el email en claro.

## Estado actual (funciona y verificado, NO lo rebuildees)

Registro + login magic-link, sesión firmada, campañas (CRUD admin), ciclo de inscripción (inscrita → aceptada → entregada → aprobada/rechazada, solo aprobada da estrellas), recompensas con candado por GMV (Disponible/Desbloqueada/Bloqueada), canjes (solicitar → admin aprueba con gate anti-fuga), historial de estrellas (ledger), misiones con candado por GMV, leaderboard real (con privacidad), multimarca (consola + admin por marca + base por marca), `/operador` y `/console/equipo`, anti-doble-click (`SubmitButton`), escape de `filterByFormula`, error boundaries.

## Tareas — construir estas funcionalidades (prioridad de arriba a abajo)

Para cada una: respeta el patrón `store.ts` (Airtable-o-archivo con `conn?`), public sin `conn` / admin con `ctx.conn`, y agrega campos a Airtable vía `scripts/setup-airtable.mjs` (idempotente) si tocas el schema.

1. **[BAJO] "Mis canjes" (creadora)**: nueva ruta `app/(public)/canjes/page.tsx`. Usa `canjesFor(session.email)` (ya existe en `store.ts`). Lista cada canje: `rewardTitle`, estado (solicitada/aprobada/rechazada), motivo de rechazo, fecha. Link desde el dashboard (`app/(public)/page.tsx`, junto a "Ver historial") y desde `/recompensas`.
2. **[BAJO] Export CSV (operador)**: route handler `app/admin/creadoras/export/route.ts` (GET) que arma CSV (Nombre, Handle, Email, Ciudad, Estrellas, GMV, Nivel) con `Content-Disposition: attachment`. Botón "Exportar CSV" en `/admin/creadoras`. OJO: un route handler NO hereda el gate del layout — valida `currentEmail()`+`isAdmin()` dentro, y usa `getAdminContext().conn`. Considera también export de inscripciones/canjes.
3. **[MEDIO] Perfil editable (creadora)**: agrega `updateCreator(id, patch, conn?)` a `store.ts` (`airtableUpdate` / archivo). Nueva ruta `app/(public)/cuenta/page.tsx` con form (name/handle/city/portfolio/followers, prellenado de `getCurrentCreator`) + action. NO permitir cambiar el email (es la clave de identidad). Link desde dashboard/nav.
4. **[MEDIO] Capturar @handle de afiliado / link de TikTok Shop**: agrega campo `affiliateHandle` a Creadoras (en `setup-airtable.mjs` `ensureFields`, `CreatorRecord`+`creadoraToRecord` en `store.ts`, `createCreator`/`updateCreator`). Captúralo en el perfil editable (y opcional en registro). Muéstralo en `/admin/creadoras` y en la ficha (tarea 5) para que el equipo sepa qué cuenta atribuir al capturar GMV. Conecta con la misión "Conecta tu TikTok afiliado".
5. **[MEDIO] Ficha de creadora en admin**: ruta `app/admin/creadoras/[email]/page.tsx` (gateada por el admin layout). Muestra datos + nivel + estrellas + GMV + handle afiliado; sus inscripciones (estado + link de entrega), sus canjes (estado + motivo), su ledger. Usa `listParticipations`/`listCanjes` con `ctx.conn` filtrados por email. Link desde cada fila en `/admin/creadoras`.
6. **[MEDIO] Búsqueda/filtros/orden en listas admin**: en inscripciones/canjes/creadoras, input de búsqueda (nombre/email/handle) + filtro por estado. Client component (`useState`) que filtra la lista ya cargada por el server (mantén el render server + un wrapper client de filtro), o por searchParams. Permite filtrar inscripciones a "por revisar".
7. **[MEDIO] Resumen/métricas en la consola**: en `app/console/page.tsx`, para cada club CONFIGURADO (`managedBrands` + `resolveConn`), muestra mini-stats: # creadoras, # inscripciones por revisar, # canjes pendientes, GMV total. Lee la base de cada marca con su `conn` (`Promise.all`, solo configuradas, cuida performance). Es el panel "dónde hay trabajo".
8. **[MEDIO] Aviso por correo a la creadora**: en `cambiarEstadoEntrega`/`cambiarEstadoCanje` (`app/admin/actions.ts`), al pasar a aceptada/aprobada/rechazada, envía email transaccional (patrón de `lib/mailer`; agrega `sendNotification`). Hazlo tolerante (try/catch, no rompas la acción si falla el envío). DEPENDE de Resend con dominio verificado: HOY Resend está en modo test y solo entrega a `oscar.fraijor@gmail.com`, así que esto no llega a las creadoras hasta verificar el dominio (reco `club.indiepro.com.mx` con DKIM+SPF). Constrúyelo igual, gateado/tolerante.
9. **[MEDIO] Cupos por campaña**: agrega `cupo?: number` a `Campaign` (`lib/campaigns.ts`) + `CampaignInput` + `setup-airtable` (Campañas.Cupo number) + el form admin (crear/editar) + `campaignToAirtableFields`. En `participar` (`app/(public)/campanas/actions.ts`), si `cupo>0` y #inscripciones>=cupo → no inscribir y mostrar "Cupo lleno". En la card muestra "X/cupo" o "Cupo lleno". Clave para campañas de producto físico.
10. **[OPCIONAL] Estado "entregada" en canjes**: agrega "entregada" a `CANJE_STATUS` (`store.ts`), un botón en `/admin/canjes` para marcar un canje aprobado como entregado/pagado, y el chip correspondiente. Cierra el ciclo de canjes con costo.

## Reglas de ejecución

- Por tarea: `npx tsc --noEmit` + `npm run build` + DOGFOOD visual con las preview tools (screenshot, no solo que compila) + commit atómico. Push solo cuando Oscar lo pida, sabiendo que el push auto-deploya a producción.
- Para probar sin tocar la base real de Color Dreams: modo ARCHIVO LOCAL — en `.env.local` renombra `AIRTABLE_TOKEN`→`AIRTABLE_TOKEN_OFF` y `AIRTABLE_BASE_ID`→`AIRTABLE_BASE_ID_OFF` (el override por args NO sirve, `@next/env` re-aplica el `.env.local`), corre `npm run dev`. Al terminar restaura `.env.local` y borra `.data/store.json`. Mata el server (Mac con recursos limitados, un server a la vez).
- Login admin sin correo (para test): genera un magic-link token con el `AUTH_SECRET` de `.env.local` en formato `base64url(email.toLowerCase()+":"+exp) + "." + HMAC-SHA256(payload, AUTH_SECRET)`, y abre `/acceso/verificar?token=...` (eso setea la cookie de sesión firmada). Admins en `lib/roles.ts`: oscarfraijo@indiepro.com.mx, oscar.fraijor@gmail.com, mabelsantanav@gmail.com (+ Paulina vía `ADMIN_EMAILS`).
- Si creas datos de prueba en Airtable, límpialos al final (la base de Color Dreams debe quedar limpia).
- Git: creator-club vive DENTRO del monorepo "Lacascada" (oscarfraijor-lgtm/Lacascada). Scope tus commits SOLO a `creator-club/`. NO toques cambios ajenos de Oscar en el monorepo, ni `NEXT-STEPS.md` ni `.claude/`.
- Deploy/config: proyecto Vercel "creator-club" (team oscarfraijor-lgtms-projects), Root Directory=`creator-club`, env vars en Vercel (`AIRTABLE_TOKEN`/`BASE_ID`, `NEXT_PUBLIC_BRAND=color-dreams`, `AUTH_SECRET`, `RESEND_API_KEY`/`FROM`, `ADMIN_EMAILS`; para multimarca `AIRTABLE_BASE_<SLUG>`/`AIRTABLE_TOKEN_<SLUG>`). Si agregas variables nuevas, avísale a Oscar para que las ponga en Vercel.

Sé exhaustivo y verifica de verdad cada tarea (dogfooding) antes de darla por hecha. Cuestiona supuestos y recomienda concreto.
