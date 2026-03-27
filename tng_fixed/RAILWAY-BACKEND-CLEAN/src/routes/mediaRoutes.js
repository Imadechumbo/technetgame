
import { Router } from 'express';
import { getCreatorAvatar, getGameImage } from '../services/mediaService.js';

const router = Router();

router.get('/media/game-image', async (req, res, next) => {
  try {
    const title = String(req.query.title || '').trim();
    const fallback = String(req.query.fallback || '/assets/img/fallback-game-cover.svg').trim();
    if (!title) return res.status(400).json({ ok: false, error: 'Missing title' });
    const image = await getGameImage(title, fallback);
    res.set('Cache-Control', 'public, max-age=21600, s-maxage=21600, stale-while-revalidate=86400');
    return res.json({ ok: true, title, image });
  } catch (error) {
    return next(error);
  }
});

router.get('/media/creator-avatar', async (req, res, next) => {
  try {
    const name = String(req.query.name || '').trim();
    const channelUrl = String(req.query.channelUrl || '').trim();
    const fallback = String(req.query.fallback || '/assets/img/default-avatar.svg').trim();
    if (!name && !channelUrl) return res.status(400).json({ ok: false, error: 'Missing name or channelUrl' });
    const image = await getCreatorAvatar(name, channelUrl, fallback);
    res.set('Cache-Control', 'public, max-age=21600, s-maxage=21600, stale-while-revalidate=86400');
    return res.json({ ok: true, name, image, fallback });
  } catch (error) {
    return next(error);
  }
});

export default router;
