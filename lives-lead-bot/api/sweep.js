// Cron diario (ver vercel.json): cierra fichas de leads que dejaron de responder.
// Vercel manda Authorization: Bearer CRON_SECRET en las invocaciones de cron.
// Tambien se puede invocar a mano: GET /api/sweep?minAgeHours=0 con el mismo Bearer.
import { sweepGhosts } from "../src/sweep.js";

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers["authorization"] || "";
  if (secret && auth !== `Bearer ${secret}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const minAgeHours =
    req.query.minAgeHours !== undefined ? Number(req.query.minAgeHours) : 6;

  try {
    const swept = await sweepGhosts({ minAgeHours });
    console.log(`[sweep] ${swept.length} conversaciones cerradas`, swept);
    res.status(200).json({ ok: true, count: swept.length, swept });
  } catch (err) {
    console.error("[sweep] Error:", err);
    res.status(500).json({ ok: false, error: "sweep failed" });
  }
}
