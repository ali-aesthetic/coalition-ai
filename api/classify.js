// api/classify.js — Vercel serverless function
// Calls HF Space /classify endpoint

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const HF_URL = process.env.HF_SPACE_URL;
  if (!HF_URL) return res.status(500).json({ error: "HF_SPACE_URL not configured" });

  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "Missing image field" });

  try {
    const response = await fetch(`${HF_URL}/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `HF Space error: ${text}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    if (err.name === "TimeoutError") {
      return res.status(504).json({ error: "Model inference timed out. The Space may be waking up — try again in 30s." });
    }
    return res.status(500).json({ error: err.message });
  }
};
