// Export CSV del admin (creadoras / inscripciones / canjes).
// OJO: un route handler NO hereda el gate del layout de /admin: se valida aquí
// dentro (currentEmail + isAdmin) y se usa la conexión de la MARCA seleccionada
// (getAdminContext().conn) para no cruzar datos entre marcas.
import { currentEmail } from "@/lib/session";
import { isAdmin } from "@/lib/roles";
import { getAdminContext } from "@/lib/brand-admin";
import {
  listCreators,
  listParticipations,
  listCanjes,
  listCampaigns,
  listMisiones,
  starsFromApproved,
} from "@/lib/store";
import { levelForStars } from "@/lib/schema";
import { starsFromMissions } from "@/lib/missions";

// Escapa un campo CSV (comillas, comas, saltos de línea). RFC 4180.
// + Anti CSV-injection (CWE-1236): los campos vienen de texto libre PÚBLICO de la
// creadora (nombre, @afiliado, portafolio, motivo…). Excel/Sheets ejecutan una
// celda que empieza con = + - @ (o tab/CR) como fórmula. Se les antepone un
// apóstrofo para que el spreadsheet las trate como texto.
function cell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(headers: string[], rows: (unknown[])[]): string {
  const lines = [headers, ...rows].map((r) => r.map(cell).join(","));
  // BOM para que Excel abra los acentos en UTF-8 correctamente.
  return "﻿" + lines.join("\r\n") + "\r\n";
}

type ExportType = "creadoras" | "inscripciones" | "canjes";

export async function GET(req: Request) {
  const email = await currentEmail();
  if (!isAdmin(email)) return new Response("No autorizado", { status: 403 });

  const ctx = await getAdminContext();
  if (!ctx.configured) return new Response("Marca sin base configurada", { status: 409 });
  const conn = ctx.conn ?? undefined;

  const raw = new URL(req.url).searchParams.get("type");
  const type: ExportType =
    raw === "inscripciones" || raw === "canjes" ? raw : "creadoras";

  let headers: string[];
  let rows: unknown[][];

  if (type === "inscripciones") {
    const [parts, creators, campaigns] = await Promise.all([
      listParticipations(conn),
      listCreators(conn),
      listCampaigns(conn),
    ]);
    const creatorBy = new Map(creators.map((c) => [c.email.toLowerCase(), c]));
    const campaignBy = new Map(campaigns.map((c) => [c.id, c]));
    headers = ["Creadora", "Email", "Handle", "Campaña", "Estado", "Link de entrega", "Motivo", "Fecha"];
    rows = parts.map((p) => {
      const c = creatorBy.get(p.creatorEmail.toLowerCase());
      return [
        c?.name ?? "",
        p.creatorEmail,
        c?.handle ?? "",
        campaignBy.get(p.campaignId)?.title ?? p.campaignId,
        p.status,
        p.link ?? "",
        p.reason ?? "",
        p.createdAt ?? "",
      ];
    });
  } else if (type === "canjes") {
    const [canjes, creators] = await Promise.all([listCanjes(conn), listCreators(conn)]);
    const creatorBy = new Map(creators.map((c) => [c.email.toLowerCase(), c]));
    headers = ["Creadora", "Email", "Handle", "Recompensa", "Estado", "Motivo", "GMV (MXN)", "Fecha"];
    rows = canjes.map((c) => {
      const creator = creatorBy.get(c.creatorEmail.toLowerCase());
      return [
        creator?.name ?? "",
        c.creatorEmail,
        creator?.handle ?? "",
        c.rewardTitle || c.rewardId,
        c.status,
        c.reason ?? "",
        creator?.gmvMXN ?? 0,
        c.createdAt ?? "",
      ];
    });
  } else {
    const [creators, parts, campaigns, misiones] = await Promise.all([
      listCreators(conn),
      listParticipations(conn),
      listCampaigns(conn),
      listMisiones(conn),
    ]);
    const partsByEmail = new Map<string, typeof parts>();
    for (const p of parts) {
      const k = p.creatorEmail.toLowerCase();
      const arr = partsByEmail.get(k);
      if (arr) arr.push(p);
      else partsByEmail.set(k, [p]);
    }
    const misionesByEmail = new Map<string, typeof misiones>();
    for (const m of misiones) {
      const k = m.creatorEmail.toLowerCase();
      const arr = misionesByEmail.get(k);
      if (arr) arr.push(m);
      else misionesByEmail.set(k, [m]);
    }
    headers = [
      "Nombre", "Handle", "Afiliado TTS", "Email", "Ciudad", "Seguidores",
      "Estrellas", "GMV (MXN)", "GMV actualizado", "Nivel",
      "Campañas aprobadas", "Campañas totales",
    ];
    rows = creators
      .map((c) => {
        const mine = partsByEmail.get(c.email.toLowerCase()) ?? [];
        const stars =
          starsFromApproved(mine, campaigns) +
          starsFromMissions(ctx.brand.missions, c, misionesByEmail.get(c.email.toLowerCase()) ?? []);
        const gmv = c.gmvMXN ?? 0;
        const level = levelForStars(stars, gmv, ctx.brand.levels);
        return {
          row: [
            c.name, c.handle ?? "", c.affiliateHandle ?? "", c.email, c.city ?? "", c.followers ?? "",
            stars, gmv, c.gmvDate ?? "", level.name,
            mine.filter((p) => p.status === "aprobada").length, mine.length,
          ] as unknown[],
          stars,
        };
      })
      .sort((a, b) => b.stars - a.stars)
      .map((x) => x.row);
  }

  const csv = toCsv(headers, rows);
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `${type}-${ctx.slug}-${stamp}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
