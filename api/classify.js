// api/classify.js — Coalition AI
// Calls your own EfficientNet-B0 model hosted on HuggingFace Spaces

const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const spaceUrl = process.env.HF_SPACE_URL; // e.g. https://ali-coalition-ai-classifier.hf.space
  if (!spaceUrl) return res.status(500).json({ error: 'HF_SPACE_URL not configured' });

  try {
    const { data } = req.body; // raw base64 from frontend

    // Gradio /run/predict expects a data URI
    const dataUri = `data:image/jpeg;base64,${data}`;

    const rfRes = await fetch(`${spaceUrl}/run/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [dataUri] }),
    });

    const json = await rfRes.json();

    // Gradio Label output: { label: "PNEUMONIA", confidences: [{label, confidence}, ...] }
    if (!json.data || !json.data[0]) {
      return res.status(502).json({ error: json.error || 'No data returned from model' });
    }

    const output = json.data[0];
    const confidences = output.confidences || [];

    if (confidences.length === 0) {
      return res.status(502).json({ error: 'Empty confidences from model' });
    }

    const normalised = confidences.map(c => ({ label: c.label, score: c.confidence }));
    res.status(200).json(normalised);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = handler;