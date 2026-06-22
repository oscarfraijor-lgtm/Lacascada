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
];

// Seed por marca (espejo de lib/brands.ts -> campaignSeed). Una marca nueva
// puede arrancar sin seed (crea sus campañas en /admin) o agregar su set aquí.
const SEED_BY_BRAND = {
  "color-dreams": [
    { Id: "prueba-30", "Título": "Prueba 30 Noches", Marca: "Color Dreams", Brief: "Recibe tu colchón, haz el unboxing y arma en cámara. Documenta tus primeras noches con tu link de afiliado.", Recompensa: "Colchón a prueba + 250 estrellas", Estrellas: 250, Deadline: "Cupo abierto", Tag: "Producto", Requisitos: "Perfil completo + dirección de envío. No necesitas seguidores.", Activa: true },
    { Id: "unboxing-express", "Título": "Unboxing Express", Marca: "Color Dreams", Brief: "Tu primer video mostrando cómo llega en caja y se infla en minutos. Pega tu link de TikTok Shop.", Recompensa: "150 estrellas + boost de comisión", Estrellas: 150, Deadline: "Cupo abierto", Tag: "Contenido", Requisitos: "Perfil completo + link de afiliado de TikTok Shop.", Activa: true },
    { Id: "hot-sale-live", "Título": "Hot Sale Live", Marca: "Color Dreams", Brief: "Co-host en un Live oficial durante Hot Sale. Las ventas en Live cuentan doble.", Recompensa: "Fee de Live + 200 estrellas", Estrellas: 200, Deadline: "Próximamente", Tag: "Live", Requisitos: "Haber publicado al menos 1 video con Color Dreams + link de afiliado.", Activa: true },
    { Id: "recamara-makeover", "Título": "Recámara Makeover", Marca: "Color Dreams", Brief: "Antes y después de tu recámara con tu Color Dreams. Estilo lifestyle, súper compartible.", Recompensa: "200 estrellas", Estrellas: 200, Deadline: "Cupo abierto", Tag: "Contenido", Requisitos: "Perfil completo + dirección de envío. No necesitas seguidores.", Activa: true },
    { Id: "resena-real", "Título": "Reseña Real", Marca: "Color Dreams", Brief: "Tras 30 noches, comparte tu opinión honesta en video. La autenticidad vende.", Recompensa: "150 estrellas", Estrellas: 150, Deadline: "Cupo abierto", Tag: "Reseña", Requisitos: "Haber completado Prueba 30 Noches.", Activa: true },
  ],
};
const CAMPAIGN_SEED = SEED_BY_BRAND[BRAND_SLUG] || [];
console.log(`Marca activa: ${BRAND_SLUG} (${CAMPAIGN_SEED.length} campañas en el seed)`);

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
    { table: "Creadoras", field: text("Portafolio") },
    { table: "Creadoras", field: number("GMV_MXN") },
    { table: "Creadoras", field: text("GMV_Fecha") },
    { table: "Canjes", field: text("Titulo") },
    { table: "Canjes", field: text("Motivo") },
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

console.log("Listo. Reinicia el dev server para que tome Airtable.");
