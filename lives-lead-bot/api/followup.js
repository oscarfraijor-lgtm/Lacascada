// Endpoint de seguimiento: lo pega un GitHub Action cada ~30 min (Vercel Hobby
// no permite crons sub-diarios). Protegido con CRON_SECRET.
import { sweepFollowups } from "../src/followup.js";

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers["authorization"] || "";
  if (secret && auth !== `Bearer ${secret}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const enviados = await sweepFollowups();
    console.log(`[followup] ${enviados.length} recordatorios enviados`, enviados);
    res.status(200).json({ ok: true, count: enviados.length, enviados });
  } catch (err) {
    console.error("[followup] error:", err);
    res.status(500).json({ ok: false, error: "followup failed" });
  }
}
