// Cliente Airtable por fetch directo (mismo patrón que lives-app).
// Cuando AIRTABLE_TOKEN + AIRTABLE_BASE_ID estén en el env, las funciones de
// data.ts leen de aquí; sin env, la app usa datos mock.

export const TABLES = {
  Creadoras: "Creadoras",
  Misiones: "Misiones",
  Entregas: "Entregas",
  Campanas: "Campañas",
  Ledger: "Ledger_Puntos",
  Recompensas: "Recompensas",
  Canjes: "Canjes",
  Niveles: "Niveles",
} as const;

const BASE_ID = process.env.AIRTABLE_BASE_ID;

function token(): string {
  const t = process.env.AIRTABLE_TOKEN;
  if (!t) throw new Error("AIRTABLE_TOKEN missing in env");
  return t;
}

export function airtableConfigured(): boolean {
  return !!process.env.AIRTABLE_TOKEN && !!process.env.AIRTABLE_BASE_ID;
}

export interface AirtableRecord<T> {
  id: string;
  fields: T;
  createdTime: string;
}

export async function fetchAll<T>(
  table: string,
  params: Record<string, string> = {}
): Promise<AirtableRecord<T>[]> {
  const out: AirtableRecord<T>[] = [];
  let offset: string | undefined;
  do {
    const qs = new URLSearchParams({ pageSize: "100", ...params });
    if (offset) qs.set("offset", offset);
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(
      table
    )}?${qs.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token()}` },
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
  fields: Record<string, unknown>
): Promise<{ id: string }> {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
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
  fields: Record<string, unknown>
): Promise<{ id: string }> {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}/${recordId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields, typecast: false }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? `Airtable ${res.status}`);
  return { id: json.id };
}

export async function airtableDelete(table: string, recordId: string): Promise<void> {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}/${recordId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } }
  );
  if (!res.ok) throw new Error(`Airtable delete ${res.status}: ${await res.text()}`);
}
