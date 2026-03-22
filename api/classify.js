// Disable Vercel's body parser — we need raw binary (the image bytes)
const config = { api: { bodyParser: false } };

const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.HF_TOKEN;
  const model = process.env.HF_MODEL || 'nickmuchi/vit-finetuned-chest-xray-pneumonia';

  if (!token) return res.status(500).json({ error: 'HF_TOKEN not configured on server' });

  try {
    // Read raw body chunks (binary image data)
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    let data;
    // Retry up to 3 times to handle HF cold-start (model loading)
    for (let attempt = 0; attempt < 3; attempt++) {
      const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': req.headers['content-type'] || 'image/jpeg',
        },
        body,
      });
      data = await hfRes.json();

      if (data.error && data.estimated_time) {
        // Model is loading — wait then retry
        await new Promise(r => setTimeout(r, Math.min(data.estimated_time * 1000, 20000)));
        continue;
      }
      break;
    }

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = handler;
module.exports.config = config;
