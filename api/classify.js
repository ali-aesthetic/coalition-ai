const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ROBOFLOW_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ROBOFLOW_API_KEY not configured' });

  try {
    const { data } = req.body;

    const rfRes = await fetch(
      `https://serverless.roboflow.com/chest-x-rays-qjmia/3?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data, // raw base64, no encodeURIComponent
      }
    );

    const json = await rfRes.json();
    if (!json.predictions) return res.status(502).json({ error: json.message || 'No predictions returned' });

    const normalised = json.predictions.map(p => ({ label: p.class, score: p.confidence }));
    res.status(200).json(normalised);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = handler;
