// Crea las tablas del Creator Club en tu base de Airtable y siembra las campañas.
// Uso:  node scripts/setup-airtable.mjs
// Lee AIRTABLE_TOKEN y AIRTABLE_BASE_ID de .env.local (o del entorno).
import { readFileSync } from "node:fs";

const env = {};
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* sin .env.local: usa process.env */ }

const TOKEN = process.env.AIRTABLE_TOKEN || env.AIRTABLE_TOKEN;
const BASE = process.env.AIRTABLE_BASE_ID || env.AIRTABLE_BASE_ID;
const BRAND_SLUG = process.env.NEXT_PUBLIC_BRAND || env.NEXT_PUBLIC_BRAND || "color-dreams";

if (!TOKEN || !BASE) {
  console.error("✗ Falta AIRTABLE_TOKEN o AIRTABLE_BASE_ID en .env.local");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

const text = (name) => ({ name, type: "singleLineText" });
const multiline = (name) => ({ name, type: "multilineText" });
const number = (name) => ({ name, type: "number", options: { precision: 0 } });
const checkbox = (name) => ({ name, type: "checkbox", options: { icon: "check", color: "greenBright" } });

const TABLES = [
  {
    name: "Creadoras",
    description: "Creadoras inscritas al Color Club",
    fields: [text("Nombre"), text("Handle"), text("Email"), text("Seguidores"), text("Ciudad")],
  },
  {
    name: "Entregas",
    description: "Participaciones / entregas por campaña",
    fields: [text("Email"), text("Campaña"), text("Estado"), text("Link")],
  },
  {
    name: "Campañas",
    description: "Campañas que la marca publica (editables desde /admin)",
    fields: [
      text("Id"),
      text("Título"),
      text("Marca"),
      multiline("Brief"),
      text("Recompensa"),
      number("Estrellas"),
      text("Deadline"),
      text("Tag"),
      checkbox("Activa"),
    ],
  },
  {
    name: "Canjes",
    description: "Solicitudes de canje de recompensa (creadora pide, equipo aprueba)",
    fields: [text("Email"), text("Recompensa"), text("Titulo"), text("Estado"), text("Motivo")],
  },
  {
    name: "Misiones",
    description: "Tracking de misiones: inducción vista, video enviado/aprobado (equipo valida)",
    fields: [text("Email"), text("Mision"), text("Estado"), text("Link"), text("Motivo")],
  },
  {
    name: "Recompensas",
    description: "Catálogo de premios (el equipo los prende/apaga y edita en /admin)",
    fields: [text("Id"), text("Titulo"), multiline("Detalle"), text("Costo"), text("Kind"), text("Payer"), number("MinStars"), number("MinGmvMXN"), checkbox("Activa")],
  },
  {
    name: "Activaciones",
    description: "Solicitudes de activación de Live (Flash Sale / Giveaway). La creadora pide, el equipo otorga en TTS",
    fields: [text("Email"), text("Tipo"), text("Usuario"), text("Estado"), text("Motivo")],
  },
  {
    name: "Productos",
    description: "Catálogo de productos (ficha + assets). Solo informativo. El equipo los edita en /admin. CRUVA-pluggable (Fuente)",
    fields: [
      text("Id"), text("Nombre"), text("Precio"),
      multiline("Specs"), multiline("Beneficios"), multiline("Hooks"),
      multiline("Dos"), multiline("Donts"),
      text("Link"), text("Imagen"), multiline("Galeria"),
      multiline("Copy"), multiline("DeepLinks"),
      text("Campana"), text("Fuente"), checkbox("Activa"),
    ],
  },
  {
    name: "Muestras",
    description: "Sample Requests: la creadora pide producto para crear contenido. El equipo aprueba y envía. Sin gate de GMV (inversión de marca)",
    fields: [
      text("Email"), text("Producto"), text("ProductoNombre"),
      multiline("Direccion"), multiline("Nota"), text("Estado"), text("Motivo"),
    ],
  },
  {
    name: "Calendario",
    description: "Fechas clave de TikTok Shop (campañas). Solo informativo, el equipo lo edita en /admin. Por marca (MX/USA en su base)",
    fields: [
      text("Id"), text("Nombre"), text("Periodo"), number("MesOrden"),
      text("Prioridad"), text("Tipo"), multiline("Tip"), checkbox("Activa"),
    ],
  },
  {
    name: "FAQ",
    description: "Preguntas frecuentes (Centro de ayuda). El equipo las edita en /admin",
    fields: [
      text("Id"), text("Pregunta"), multiline("Respuesta"), text("Tag"), checkbox("Activa"),
    ],
  },
];

// Seed por marca (espejo de lib/brands.ts -> campaignSeed). Una marca nueva
// puede arrancar sin seed (crea sus campañas en /admin) o agregar su set aquí.
const SEED_BY_BRAND = {
  "color-dreams": [
    { Id: "prueba-30", "Título": "Prueba 30 Noches", Marca: "Color Dreams", Brief: "Recibe tu colchón, haz el unboxing y arma en cámara. Documenta tus primeras noches con tu link de afiliado.", Recompensa: "Colchón a prueba + 250 estrellas", Estrellas: 250, Deadline: "Cupo abierto", Tag: "Producto", Requisitos: "Perfil completo + dirección de envío. No necesitas seguidores.", Cupo: 10, Activa: true },
    { Id: "unboxing-express", "Título": "Unboxing Express", Marca: "Color Dreams", Brief: "Tu primer video mostrando cómo llega en caja y se infla en minutos. Pega tu link de TikTok Shop.", Recompensa: "150 estrellas + boost de comisión", Estrellas: 150, Deadline: "Cupo abierto", Tag: "Contenido", Requisitos: "Perfil completo + link de afiliado de TikTok Shop.", Activa: true },
    { Id: "recamara-makeover", "Título": "Recámara Makeover", Marca: "Color Dreams", Brief: "Antes y después de tu recámara con tu Color Dreams. Estilo lifestyle, súper compartible.", Recompensa: "200 estrellas", Estrellas: 200, Deadline: "Cupo abierto", Tag: "Contenido", Requisitos: "Perfil completo + dirección de envío. No necesitas seguidores.", Activa: true },
    { Id: "resena-real", "Título": "Reseña Real", Marca: "Color Dreams", Brief: "Tras 30 noches, comparte tu opinión honesta en video. La autenticidad vende.", Recompensa: "150 estrellas", Estrellas: 150, Deadline: "Cupo abierto", Tag: "Reseña", Requisitos: "Haber completado Prueba 30 Noches.", Activa: true },
    { Id: "rutina-noche", "Título": "Mi Rutina de Noche", Marca: "Color Dreams", Brief: "Muestra tu ritual antes de dormir y cómo tu Color Dreams es el centro de tu descanso. Acogedor, real, fácil de grabar.", Recompensa: "150 estrellas", Estrellas: 150, Deadline: "Cupo abierto", Tag: "Contenido", Requisitos: "Tener tu Color Dreams + link de afiliado.", Activa: false },
    { Id: "por-que-cambie", "Título": "Por qué cambié de colchón", Marca: "Color Dreams", Brief: "Tu antes y después honesto: cómo dormías antes y cómo cambió con Color Dreams. La comparación auténtica convierte.", Recompensa: "200 estrellas", Estrellas: 200, Deadline: "Cupo abierto", Tag: "Reseña", Requisitos: "Tener tu Color Dreams al menos 1 semana.", Activa: false },
    { Id: "sueno-segundos", "Título": "Sueño en Segundos", Marca: "Color Dreams", Brief: "Video corto y satisfying: el colchón saliendo de la caja e inflándose, cerrando con tu momento de caer rendida. Formato viral.", Recompensa: "150 estrellas", Estrellas: 150, Deadline: "Cupo abierto", Tag: "Contenido", Requisitos: "Tener tu Color Dreams + link de afiliado.", Activa: false },
    { Id: "promo-flash", "Título": "Promo Flash con tu Link", Marca: "Color Dreams", Brief: "En días de promoción, sube un video corto invitando a comprar con tu link de afiliado. Sin envío de producto: puro contenido que mueve ventas.", Recompensa: "100 estrellas + tu comisión por venta", Estrellas: 100, Deadline: "Por temporada", Tag: "Afiliado", Requisitos: "Link de afiliado de TikTok Shop activo.", Activa: false },
  ],
};
const CAMPAIGN_SEED = SEED_BY_BRAND[BRAND_SLUG] || [];
console.log(`Marca activa: ${BRAND_SLUG} (${CAMPAIGN_SEED.length} campañas en el seed)`);

// Seed de premios (espejo de lib/brands.ts -> rewards). El equipo los prende/apaga
// y edita en /admin después.
const REWARDS_SEED_BY_BRAND = {
  "color-dreams": [
    { Id: "r-status", Titulo: "Subir de nivel + insignia", Detalle: "Estatus, badge y acceso a misiones premium.", Costo: "Acumula estrellas", Kind: "estatus", Payer: "club", MinStars: 0, MinGmvMXN: 0, Activa: true },
    { Id: "r-muestra", Titulo: "Muestra de colchón", Detalle: "Pruébalo 30 noches (atado a tu primera venta).", Costo: "Nivel Soñadora + tu primera venta", Kind: "producto", Payer: "marca", MinStars: 500, MinGmvMXN: 0, Activa: true },
    { Id: "r-boost", Titulo: "Boost de comisión +1%", Detalle: "Ganas 1% extra de comisión por cada venta que cierres.", Costo: "Nivel Soñadora + tu primera venta", Kind: "boost", Payer: "marca", MinStars: 500, MinGmvMXN: 0, Activa: true },
    { Id: "r-colchon", Titulo: "Colchón propio (regalo)", Detalle: "Tuyo para siempre.", Costo: "Nivel Insomne Pro · $60K GMV", Kind: "producto", Payer: "marca", MinStars: 1500, MinGmvMXN: 60000, Activa: true },
    { Id: "r-cdmx", Titulo: "Experiencia CDMX", Detalle: "Noche de Sueños + sesión de fotos + kit de creadora.", Costo: "Nivel Embajadora · $150K GMV", Kind: "experiencia", Payer: "marca", MinStars: 4000, MinGmvMXN: 150000, Activa: true },
  ],
};
const REWARD_SEED = REWARDS_SEED_BY_BRAND[BRAND_SLUG] || [];

// Seed de productos (espejo de lib/brands.ts -> products). PLANTILLA de arranque:
// el equipo edita precio/specs/fotos/link reales en /admin. Precio/Imagen/Link
// vacíos a propósito (Oscar los carga). Fuente=manual (CRUVA se enchufa después).
const PRODUCTS_SEED_BY_BRAND = {
  "color-dreams": [
    { Id: "classic-foam", Nombre: "Classic Foam", Precio: "", Specs: "Colchón de espuma. Disponible en Individual, Matrimonial, Queen y King. Llega comprimido en caja.", Beneficios: "Llega enrollado en una caja y se infla en minutos. Lo pruebas en casa. Soporte firme y fresco para dormir mejor.", Hooks: "Llega en una caja y se arma solito en minutos\nEl unboxing más satisfying de tu feed\nDe la caja a tu cama en 5 minutos\nLo probé 30 noches y esto pasó", Dos: "Graba el unboxing completo (abrir la caja y verlo inflarse)\nMuestra el tamaño real comparándolo con tu recámara\nPega tu link de afiliado y fija el producto en tu perfil", Donts: "No prometas resultados médicos ni cures dolencias\nNo inventes precios ni promociones que el equipo no confirmó\nNo uses música o clips de terceros con copyright", Link: "", Imagen: "", Galeria: "", Copy: "Cambié mi colchón por un Color Dreams Classic Foam y no puedo creer lo bien que duermo. Llega en una caja, se infla en minutos y lo pruebas en casa. Te dejo mi link para que lo consigas. #ColorDreams #BedInABox #TikTokShop", DeepLinks: "", Campana: "", Fuente: "manual", Activa: true },
    { Id: "snow-plus", Nombre: "Snow Plus", Precio: "", Specs: "Colchón con tecnología de frescura. Disponible en Individual, Matrimonial, Queen y King. Llega comprimido en caja.", Beneficios: "Mantiene una sensación fresca toda la noche. Llega en caja y se infla en minutos. Lo pruebas en casa.", Hooks: "Para las que duermen con calor: el colchón que se mantiene fresco\nDe la caja a tu cama en minutos\nEl colchón que no te deja sudar\nMi rutina de noche con Color Dreams", Dos: "Enseña la sensación fresca como tu ángulo principal\nGraba tu rutina de noche real y acogedora\nAgrega el producto a tu perfil de TikTok Shop", Donts: "No prometas resultados médicos\nNo inventes precios ni descuentos sin confirmar con el equipo\nNo uses contenido con copyright", Link: "", Imagen: "", Galeria: "", Copy: "Si duermes con calor, el Color Dreams Snow Plus es para ti. Se mantiene fresco toda la noche, llega en una caja y se infla en minutos. Mi link está aquí para que lo pruebes. #ColorDreams #TikTokShop", DeepLinks: "", Campana: "", Fuente: "manual", Activa: true },
  ],
};
const PRODUCT_SEED = PRODUCTS_SEED_BY_BRAND[BRAND_SLUG] || [];

// Seed del CALENDARIO de TikTok Shop (espejo de lib/brands.ts -> calendar).
// México 2026. Para marcas de USA, su seed va aquí cuando se lancen.
const CALENDAR_SEED_BY_BRAND = {
  "color-dreams": [
    { Id: "dia-reyes", Nombre: "Día de Reyes", Periodo: "Enero", MesOrden: 1, Prioridad: "S", Tipo: "plataforma", Tip: "Contenido de inicio de año y descanso para arrancar parejo.", Activa: true },
    { Id: "san-valentin", Nombre: "Día de San Valentín", Periodo: "Febrero", MesOrden: 2, Prioridad: "S", Tipo: "plataforma", Tip: "Regálate (o regalen) descanso: ángulo pareja / autocuidado.", Activa: true },
    { Id: "dia-nino", Nombre: "Día del Niño", Periodo: "Abril", MesOrden: 4, Prioridad: "S", Tipo: "plataforma", Tip: "Descanso en familia, recámara de los peques.", Activa: true },
    { Id: "hot-sale", Nombre: "Hot Sale", Periodo: "Mayo", MesOrden: 5, Prioridad: "SS", Tipo: "plataforma", Tip: "La venta más grande del primer semestre. Prepara tu mejor video con tu link.", Activa: true },
    { Id: "dia-madres", Nombre: "Día de las Madres", Periodo: "Mayo", MesOrden: 5, Prioridad: "S", Tipo: "plataforma", Tip: "Regálale buen descanso a mamá: testimonio emotivo.", Activa: true },
    { Id: "dia-padres", Nombre: "Día del Padre", Periodo: "Junio", MesOrden: 6, Prioridad: "S", Tipo: "plataforma", Tip: "Descanso para papá: ángulo regalo práctico.", Activa: true },
    { Id: "ofertas-verano", Nombre: "Ofertas de Verano", Periodo: "Julio", MesOrden: 7, Prioridad: "S", Tipo: "plataforma", Tip: "Frescura para las noches de calor (ideal para Snow Plus).", Activa: true },
    { Id: "regreso-clases", Nombre: "Regreso a Clases", Periodo: "Julio", MesOrden: 7, Prioridad: "S", Tipo: "plataforma", Tip: "Dormir bien para rendir: rutina de estudiantes y familias.", Activa: true },
    { Id: "independencia", Nombre: "Día de la Independencia", Periodo: "Septiembre", MesOrden: 9, Prioridad: "S", Tipo: "plataforma", Tip: "Mes patrio: contenido mexicano, orgullo de marca nacional.", Activa: true },
    { Id: "muertos-halloween", Nombre: "Día de Muertos x Halloween", Periodo: "Octubre", MesOrden: 10, Prioridad: "S", Tipo: "plataforma", Tip: "Temporada temática; arranca el cierre de año.", Activa: true },
    { Id: "buen-fin", Nombre: "Buen Fin", Periodo: "Noviembre", MesOrden: 11, Prioridad: "SS", Tipo: "plataforma", Tip: "La venta más fuerte del año en México. Planea contenido con anticipación.", Activa: true },
    { Id: "black-friday", Nombre: "Black Friday", Periodo: "Noviembre", MesOrden: 11, Prioridad: "SS", Tipo: "plataforma", Tip: "Cierra noviembre con todo: urgencia y descuentos reales.", Activa: true },
    { Id: "fin-de-ano", Nombre: "Oferta de Fin de Año", Periodo: "Diciembre", MesOrden: 12, Prioridad: "S", Tipo: "plataforma", Tip: "Regalos y propósitos de descanso para el año nuevo.", Activa: true },
    { Id: "super-dia-marca", Nombre: "Super Día de Marca", Periodo: "Todo el año", MesOrden: 0, Prioridad: "S", Tipo: "marca", Tip: "El día grande de la marca: empújalo con tu mejor contenido.", Activa: true },
    { Id: "gran-estreno", Nombre: "Gran Estreno", Periodo: "Todo el año", MesOrden: 0, Prioridad: "S", Tipo: "marca", Tip: "Lanzamiento de producto nuevo: sé de las primeras en mostrarlo.", Activa: true },
    { Id: "novedades", Nombre: "Novedades", Periodo: "Todo el año", MesOrden: 0, Prioridad: "A", Tipo: "marca", Tip: "", Activa: true },
    { Id: "dia-marca", Nombre: "Día de Marca", Periodo: "Todo el año", MesOrden: 0, Prioridad: "A", Tipo: "marca", Tip: "", Activa: true },
    { Id: "ventas-quincenales", Nombre: "Ventas Quincenales", Periodo: "Cada ~2 semanas", MesOrden: 0, Prioridad: "S", Tipo: "plataforma", Tip: "Hay una venta quincenal casi siempre activa: contenido constante mueve ventas.", Activa: true },
  ],
};
const CALENDAR_SEED = CALENDAR_SEED_BY_BRAND[BRAND_SLUG] || [];

// Seed del FAQ (espejo de lib/brands.ts -> faq).
const FAQ_SEED_BY_BRAND = {
  "color-dreams": [
    { Id: "como-llega", Pregunta: "¿Cómo llega el colchón?", Respuesta: "Llega comprimido y enrollado en una caja. Lo sacas, lo desenrollas y se infla solo en minutos. Es el famoso bed-in-a-box.", Tag: "Producto", Activa: true },
    { Id: "prueba-casa", Pregunta: "¿Se puede probar en casa?", Respuesta: "Sí, esa es la idea: lo pruebas en tu propia cama, sin filas ni vendedores. Consulta con el equipo las condiciones vigentes de prueba.", Tag: "Producto", Activa: true },
    { Id: "tamanos", Pregunta: "¿Qué tamaños hay?", Respuesta: "Individual, Matrimonial, Queen y King. Confirma disponibilidad y modelo exacto con el equipo antes de grabar.", Tag: "Producto", Activa: true },
    { Id: "mi-link", Pregunta: "¿Dónde está mi link de afiliado?", Respuesta: "Lo generas desde TikTok Shop al unirte al programa de afiliados de la marca. Si tienes dudas para conectarlo, escríbele a tu Affiliate Manager.", Tag: "Contenido", Activa: true },
    { Id: "que-puedo-decir", Pregunta: "¿Qué SÍ y qué NO puedo decir del producto?", Respuesta: "Sí: que llega en caja, se infla en minutos y se prueba en casa. No: prometer resultados médicos, curar dolencias, ni inventar precios o promociones que el equipo no confirmó.", Tag: "Contenido", Activa: true },
  ],
};
const FAQ_SEED = FAQ_SEED_BY_BRAND[BRAND_SLUG] || [];

// 1) Crear tablas (idempotente)
for (const t of TABLES) {
  const res = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE}/tables`, {
    method: "POST",
    headers,
    body: JSON.stringify(t),
  });
  const j = await res.json().catch(() => ({}));
  if (res.ok) console.log(`✓ Tabla creada: ${t.name} (${j.id})`);
  else {
    const msg = JSON.stringify(j);
    if (msg.includes("DUPLICATE_TABLE_NAME") || msg.includes("already")) console.log(`• ${t.name}: ya existe, ok`);
    else console.log(`✗ ${t.name}: ${res.status} ${msg.slice(0, 200)}`);
  }
}

// 1.5) Asegurar campos nuevos en tablas existentes (idempotente)
async function ensureFields() {
  const res = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE}/tables`, { headers });
  const j = await res.json().catch(() => ({}));
  const tables = j.tables || [];
  const want = [
    { table: "Entregas", field: text("Motivo") },
    { table: "Campañas", field: text("Requisitos") },
    { table: "Campañas", field: number("Cupo") },
    { table: "Campañas", field: text("Niveles") }, // scope por categoría (CSV de llaves: "l2,l3")
    { table: "Recompensas", field: text("Niveles") }, // scope por categoría (CSV de llaves)
    { table: "Creadoras", field: text("Portafolio") },
    { table: "Creadoras", field: text("AfiliadoHandle") },
    { table: "Creadoras", field: text("Direccion") },
    { table: "Creadoras", field: number("GMV_MXN") },
    { table: "Creadoras", field: text("GMV_Fecha") },
    { table: "Creadoras", field: checkbox("Consentimiento") },
    { table: "Creadoras", field: text("ConsentimientoFecha") },
    { table: "Creadoras", field: text("ConsentimientoVersion") },
    { table: "Canjes", field: text("Titulo") },
    { table: "Canjes", field: text("Motivo") },
    // Productos: asegura columnas si la tabla ya existía sin alguna.
    { table: "Productos", field: text("Id") },
    { table: "Productos", field: text("Nombre") },
    { table: "Productos", field: text("Precio") },
    { table: "Productos", field: multiline("Specs") },
    { table: "Productos", field: multiline("Beneficios") },
    { table: "Productos", field: multiline("Hooks") },
    { table: "Productos", field: multiline("Dos") },
    { table: "Productos", field: multiline("Donts") },
    { table: "Productos", field: text("Link") },
    { table: "Productos", field: text("Imagen") },
    { table: "Productos", field: multiline("Galeria") },
    { table: "Productos", field: multiline("Copy") },
    { table: "Productos", field: multiline("DeepLinks") },
    { table: "Productos", field: text("Campana") },
    { table: "Productos", field: text("Fuente") },
    { table: "Productos", field: checkbox("Activa") },
    // Muestras: asegura columnas si la tabla ya existía sin alguna.
    { table: "Muestras", field: text("Email") },
    { table: "Muestras", field: text("Producto") },
    { table: "Muestras", field: text("ProductoNombre") },
    { table: "Muestras", field: multiline("Direccion") },
    { table: "Muestras", field: multiline("Nota") },
    { table: "Muestras", field: text("Estado") },
    { table: "Muestras", field: text("Motivo") },
    // Calendario
    { table: "Calendario", field: text("Id") },
    { table: "Calendario", field: text("Nombre") },
    { table: "Calendario", field: text("Periodo") },
    { table: "Calendario", field: number("MesOrden") },
    { table: "Calendario", field: text("Prioridad") },
    { table: "Calendario", field: text("Tipo") },
    { table: "Calendario", field: multiline("Tip") },
    { table: "Calendario", field: checkbox("Activa") },
    // FAQ
    { table: "FAQ", field: text("Id") },
    { table: "FAQ", field: text("Pregunta") },
    { table: "FAQ", field: multiline("Respuesta") },
    { table: "FAQ", field: text("Tag") },
    { table: "FAQ", field: checkbox("Activa") },
  ];
  for (const w of want) {
    const t = tables.find((x) => x.name === w.table);
    if (!t) { console.log(`✗ tabla ${w.table} no existe (campo ${w.field.name})`); continue; }
    if ((t.fields || []).some((f) => f.name === w.field.name)) { console.log(`• ${w.table}.${w.field.name}: ya existe`); continue; }
    const r = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE}/tables/${t.id}/fields`, {
      method: "POST", headers, body: JSON.stringify(w.field),
    });
    const rj = await r.json().catch(() => ({}));
    if (r.ok) console.log(`✓ campo creado: ${w.table}.${w.field.name}`);
    else console.log(`✗ ${w.table}.${w.field.name}: ${r.status} ${JSON.stringify(rj).slice(0, 150)}`);
  }
}
await ensureFields();

// 2) Sembrar campañas (solo las que falten, por Id)
async function fetchExistingCampaignIds() {
  const ids = new Set();
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent("Campañas")}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url, { headers });
    if (!res.ok) { console.log(`✗ No se pudieron leer campañas: ${res.status}`); return ids; }
    const j = await res.json();
    for (const r of j.records ?? []) if (r.fields?.Id) ids.add(r.fields.Id);
    offset = j.offset;
  } while (offset);
  return ids;
}

const existing = await fetchExistingCampaignIds();
const missing = CAMPAIGN_SEED.filter((c) => !existing.has(c.Id));
if (missing.length === 0) {
  console.log("• Campañas: seed ya presente, nada que sembrar");
} else {
  // Airtable permite hasta 10 registros por POST
  for (let i = 0; i < missing.length; i += 10) {
    const batch = missing.slice(i, i + 10).map((fields) => ({ fields }));
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent("Campañas")}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ records: batch, typecast: true }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) console.log(`✓ Campañas sembradas: ${batch.map((b) => b.fields.Id).join(", ")}`);
    else console.log(`✗ Seed campañas: ${res.status} ${JSON.stringify(j).slice(0, 200)}`);
  }
}

// 3) Sembrar premios (solo los que falten, por Id)
async function fetchExistingRewardIds() {
  const ids = new Set();
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent("Recompensas")}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url, { headers });
    if (!res.ok) { console.log(`✗ No se pudieron leer premios: ${res.status}`); return ids; }
    const j = await res.json();
    for (const r of j.records ?? []) if (r.fields?.Id) ids.add(r.fields.Id);
    offset = j.offset;
  } while (offset);
  return ids;
}
const existingRewards = await fetchExistingRewardIds();
const missingRewards = REWARD_SEED.filter((r) => !existingRewards.has(r.Id));
if (missingRewards.length === 0) {
  console.log("• Premios: seed ya presente, nada que sembrar");
} else {
  for (let i = 0; i < missingRewards.length; i += 10) {
    const batch = missingRewards.slice(i, i + 10).map((fields) => ({ fields }));
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent("Recompensas")}`, {
      method: "POST", headers, body: JSON.stringify({ records: batch, typecast: true }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) console.log(`✓ Premios sembrados: ${batch.map((b) => b.fields.Id).join(", ")}`);
    else console.log(`✗ Seed premios: ${res.status} ${JSON.stringify(j).slice(0, 200)}`);
  }
}

// 4) Sembrar productos (solo los que falten, por Id)
async function fetchExistingProductIds() {
  const ids = new Set();
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent("Productos")}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url, { headers });
    if (!res.ok) { console.log(`✗ No se pudieron leer productos: ${res.status}`); return ids; }
    const j = await res.json();
    for (const r of j.records ?? []) if (r.fields?.Id) ids.add(r.fields.Id);
    offset = j.offset;
  } while (offset);
  return ids;
}
const existingProducts = await fetchExistingProductIds();
const missingProducts = PRODUCT_SEED.filter((p) => !existingProducts.has(p.Id));
if (missingProducts.length === 0) {
  console.log("• Productos: seed ya presente, nada que sembrar");
} else {
  for (let i = 0; i < missingProducts.length; i += 10) {
    const batch = missingProducts.slice(i, i + 10).map((fields) => ({ fields }));
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent("Productos")}`, {
      method: "POST", headers, body: JSON.stringify({ records: batch, typecast: true }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) console.log(`✓ Productos sembrados: ${batch.map((b) => b.fields.Id).join(", ")}`);
    else console.log(`✗ Seed productos: ${res.status} ${JSON.stringify(j).slice(0, 200)}`);
  }
}

// 4) Sembrar Calendario + FAQ (genérico, solo los que falten por Id)
async function seedByIds(table, seed) {
  if (!seed.length) return;
  const ids = new Set();
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url, { headers });
    if (!res.ok) { console.log(`✗ No se pudo leer ${table}: ${res.status}`); return; }
    const j = await res.json();
    for (const r of j.records ?? []) if (r.fields?.Id) ids.add(r.fields.Id);
    offset = j.offset;
  } while (offset);
  const missing = seed.filter((x) => !ids.has(x.Id));
  if (missing.length === 0) { console.log(`• ${table}: seed ya presente, nada que sembrar`); return; }
  for (let i = 0; i < missing.length; i += 10) {
    const batch = missing.slice(i, i + 10).map((fields) => ({ fields }));
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}`, {
      method: "POST", headers, body: JSON.stringify({ records: batch, typecast: true }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) console.log(`✓ ${table} sembrado: ${batch.map((b) => b.fields.Id).join(", ")}`);
    else console.log(`✗ Seed ${table}: ${res.status} ${JSON.stringify(j).slice(0, 200)}`);
  }
}
await seedByIds("Calendario", CALENDAR_SEED);
await seedByIds("FAQ", FAQ_SEED);

console.log("Listo. Reinicia el dev server para que tome Airtable.");
