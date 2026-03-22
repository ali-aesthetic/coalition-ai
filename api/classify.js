// Vercel serverless function — proxies HuggingFace Inference API
// Token lives here (server-side), never reaches the browser
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.HF_TOKEN;
  const model = process.env.HF_MODEL || 'nickmuchi/vit-finetuned-chest-xray-pneumonia';

  if (!token) return res.status(500).json({ error: 'HF_TOKEN not configured on server' });

  try {
    const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': req.headers['content-type'] },
      body: req,
    });
    const data = await hfRes.json();
    res.status(hfRes.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
