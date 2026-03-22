const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ROBOFLOW_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ROBOFLOW_API_KEY not configured' });

  try {
    const { data } = req.body;

    const rfRes = await fetch(
      `https://segment.roboflow.com/chest-xrays-zogcf/3?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data,
      }
    );

    const json = await rfRes.json();
    if (json.error) return res.status(502).json({ error: json.error });

    // Return full predictions object — contains segmentation_mask + class_map
    res.status(200).json(json.predictions || json);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = handler;
