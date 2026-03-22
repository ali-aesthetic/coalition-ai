// Body parser ON — we receive base64 JSON, no binary transfer issues
const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.HF_TOKEN;
  const model = process.env.HF_MODEL || 'nickmuchi/vit-finetuned-chest-xray-pneumonia';
  if (!token) return res.status(500).json({ error: 'HF_TOKEN not configured on server' });

  try {
    const { data, type } = req.body; // base64 string + mime type from frontend
    const binary = Buffer.from(data, 'base64');

    let result;
    for (let attempt = 0; attempt < 3; attempt++) {
      const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': type || 'image/jpeg',
        },
        body: binary,
      });

      const text = await hfRes.text();
      // HF returns HTML when model is loading or rate-limited
      if (text.trim().startsWith('<')) {
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 15000));
          continue;
        }
        return res.status(503).json({ error: 'Model is still loading. Wait 20s and try again.' });
      }

      result = JSON.parse(text);
      break;
    }

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = handler;
