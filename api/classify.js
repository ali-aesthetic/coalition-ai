// api/classify.js — Coalition AI
// Calls our own EfficientNet-B0 model hosted on HuggingFace Spaces (FastAPI)

const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const spaceUrl = process.env.HF_SPACE_URL; // https://ali-ruslanbekov-coalition-ai-classifier.hf.space
  if (!spaceUrl) return res.status(500).json({ error: 'HF_SPACE_URL not configured' });

  try {
    const { data } = req.body; // raw base64 from frontend

    const rfRes = await fetch(`${spaceUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });

    const json = await rfRes.json();

    // FastAPI returns [{label, score}, ...] directly
    if (!Array.isArray(json)) {
      return res.status(502).json({ error: json.detail || json.error || 'Unexpected response from model' });
    }

    res.status(200).json(json);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = handler;