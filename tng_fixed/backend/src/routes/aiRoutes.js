import express from 'express';

const router = express.Router();
const AI_URL = String(process.env.AI_URL || process.env.AI_SERVICE_URL || '').trim();
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || process.env.AI_SERVICE_TIMEOUT_MS || 45000);

function upstreamUrl(pathname) {
  return `${AI_URL.replace(/\/$/, '')}${pathname}`;
}

router.get('/ai/health', async (req, res) => {
  if (!AI_URL) {
    return res.status(503).json({
      ok: false,
      error: 'AI_URL não configurada'
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(AI_TIMEOUT_MS, 10000));

  try {
    const response = await fetch(upstreamUrl('/health'), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });

    const payload = await response.json();
    clearTimeout(timeout);

    return res.status(response.status).json({
      ok: response.ok,
      python: payload
    });
  } catch (error) {
    clearTimeout(timeout);
    return res.status(502).json({
      ok: false,
      error: 'Python offline',
      details: error.message
    });
  }
});

router.post('/ai', async (req, res) => {
  if (!AI_URL) {
    return res.status(503).json({
      ok: false,
      error: 'AI_URL não configurada'
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(upstreamUrl('/ai'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(req.body || {}),
      signal: controller.signal
    });

    const payload = await response.json().catch(async () => ({ raw: await response.text() }));
    clearTimeout(timeout);
    return res.status(response.status).json(payload);
  } catch (error) {
    clearTimeout(timeout);
    return res.status(502).json({
      ok: false,
      error: 'Falha ao acessar serviço Python',
      details: error.message
    });
  }
});

export default router;
