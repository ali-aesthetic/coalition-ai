// Roboflow hosted inference — chest-x-rays-qjmia/2
const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ROBOFLOW_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ROBOFLOW_API_KEY not configured on server' });

  try {
    const { data } = req.body; // base64 string from frontend

    const hfRes = await fetch(
      `https://classify.roboflow.com/chest-x-rays-qjmia/2?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `base64=${encodeURIComponent(data)}`,
      }
    );

    const json = await hfRes.json();

    if (!json.predictions) {
      return res.status(502).json({ error: json.message || 'Unexpected response from Roboflow' });
    }

    // Normalise to [{label, score}] — same shape the frontend already expects
    const normalised = json.predictions.map(p => ({
      label: p.class,
      score: p.confidence,
    }));

    res.status(200).json(normalised);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = handler;
