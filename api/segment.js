const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ROBOFLOW_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ROBOFLOW_API_KEY not configured' });

  try {
    const { data } = req.body;

    const rfRes = await fetch(
      `https://outline.roboflow.com/chest-xrays-zogcf-jimfe/1?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data,
      }
    );

    const json = await rfRes.json();
    if (!json.predictions) return res.status(502).json({ error: json.message || 'No segmentation returned' });

    res.status(200).json(json.predictions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = handler;
