// Vercel Serverless Function: POST /api/send  { text }
// Token & Chat ID nằm trong biến môi trường (Vercel → Settings → Environment Variables),
// KHÔNG nằm trong index.html nên người xem không đọc được.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method' });
  }

  const token = process.env.TG_TOKEN;
  const chatId = process.env.TG_CHAT;
  if (!token || !chatId) return res.status(500).json({ ok: false, error: 'missing env TG_TOKEN / TG_CHAT' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const text = String((body && body.text) || '').trim().slice(0, 500);
  if (text.length < 2) return res.status(400).json({ ok: false, error: 'empty' });

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: '🌹 Điều em muốn giữ lại:\n\n' + text })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.ok) return res.status(502).json({ ok: false, error: data.description || 'telegram' });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'network' });
  }
}
