// Cliente Airtable por fetch directo (mismo patrón que lives-app).
// Cuando AIRTABLE_TOKEN + AIRTABLE_BASE_ID estén en el env, las funciones de
// store.ts leen de aquí; sin env, la app usa el archivo local.
//
// Multimarca: cada llamada acepta una conexión opcional (base + token) para
// apuntar a la base de OTRA marca (panel de admin multimarca). Sin conexión
// explícita se usa la del env (la marca de ESTE deploy). Así los datos de cada
// marca viven en SU base y NUNCA se cruzan.

export const TABLES = {
  Creadoras: "Creadoras",
  Misiones: "Misiones",
  Entregas: "Entregas",
  Campanas: "Campañas",
  Ledger: "Ledger_Puntos",
  Recompensas: "Recompensas",
  Canjes: "Canjes",
  Activaciones: "Activaciones",
  Productos: "Productos",
  Muestras: "Muestras",
  Niveles: "Niveles",
} as const;

// Conexión a una base concreta de Airtable (base + token).
export interface Conn {
  baseId: string;
  token: string;
}

// Conexión por defecto: la marca del env de este deploy.
export function envConn(): Conn | null {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_TOKEN;
  return baseId && token ? { baseId, token } : null;
}

// Resuelve la conexión a usar: la explícita (otra marca) o la del env.
function resolve(conn?: Conn | null): Conn {
  const c = conn ?? envConn();
  if (!c) throw new Error("Airtable no configurado (sin base/token)");
  return c;
}

// ¿Hay base Airtable para esta conexión? Sin conexión explícita, mira el env.
export function airtableConfigured(conn?: Conn | null): boolean {
  if (conn !== undefined) return conn !== null;
  return !!envConn();
}

// Escapa un valor para interpolarlo seguro dentro de un filterByFormula con
// comillas simples (evita inyección de fórmula con valores tipo email/campaignId
// del usuario). Airtable escapa la comilla simple con backslash.
export function escFormula(s: string): string {
  return String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export interface AirtableRecord<T> {
  id: string;
  fields: T;
  createdTime: string;
}

export async function fetchAll<T>(
  table: string,
  params: Record<string, string> = {},
  conn?: Conn | null
): Promise<AirtableRecord<T>[]> {
  const { baseId, token } = resolve(conn);
  const out: AirtableRecord<T>[] = [];
  let offset: string | undefined;
  do {
    const qs = new URLSearchParams({ pageSize: "100", ...params });
    if (offset) qs.set("offset", offset);
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
      table
    )}?${qs.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Airtable ${table} ${res.status}: ${await res.text()}`);
    }
    const json = (await res.json()) as {
      records: AirtableRecord<T>[];
      offset?: string;
    };
    out.push(...json.records);
    offset = json.offset;
  } while (offset);
  return out;
}

export async function airtableCreate(
  table: string,
  fields: Record<string, unknown>,
  conn?: Conn | null
): Promise<{ id: string }> {
  const { baseId, token } = resolve(conn);
  const res = await fetch(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields, typecast: false }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? `Airtable ${res.status}`);
  return { id: json.id };
}

export async function airtableUpdate(
  table: string,
  recordId: string,
  fields: Record<string, unknown>,
  conn?: Conn | null
): Promise<{ id: string }> {
  const { baseId, token } = resolve(conn);
  const res = await fetch(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}/${recordId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields, typecast: false }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? `Airtable ${res.status}`);
  return { id: json.id };
}

export async function airtableDelete(
  table: string,
  recordId: string,
  conn?: Conn | null
): Promise<void> {
  const { baseId, token } = resolve(conn);
  const res = await fetch(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}/${recordId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Airtable delete ${res.status}: ${await res.text()}`);
}
