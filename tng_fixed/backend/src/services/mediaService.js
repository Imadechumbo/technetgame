
import { readImageCache, writeImageCache } from './cacheService.js';
import { CURATED_GAME_IMAGES, CURATED_CREATOR_AVATARS } from '../config/mediaCatalog.js';

const RAWG_API_KEY = String(process.env.RAWG_API_KEY || '').trim();
const RAWG_API_BASE = String(process.env.RAWG_API_BASE || 'https://api.rawg.io/api').trim();
const MEDIA_CACHE_TTL_MS = Number(process.env.MEDIA_CACHE_TTL_MS || process.env.IMAGE_CACHE_TTL_MS || 7 * 24 * 60 * 60 * 1000);
const REQUEST_TIMEOUT_MS = Number(process.env.MEDIA_REQUEST_TIMEOUT_MS || process.env.REQUEST_TIMEOUT_MS || 12000);
const SITE_URL = String(process.env.SITE_URL || '').trim().replace(/\/$/, '');

function normalizeKey(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function withSiteUrl(value = '') {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (!SITE_URL) return value;
  return `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

function createCacheShell(cache) {
  return {
    generatedAt: cache?.generatedAt || null,
    items: cache?.items && typeof cache.items === 'object' ? cache.items : {}
  };
}

function getFresh(cache, key) {
  const entry = cache?.items?.[key];
  if (!entry?.value || !entry?.updatedAt) return null;
  const updatedAt = new Date(entry.updatedAt).getTime();
  if (Number.isNaN(updatedAt)) return null;
  if ((Date.now() - updatedAt) > MEDIA_CACHE_TTL_MS) return null;
  return entry.value;
}

async function persist(cache, key, value, meta = {}) {
  const next = createCacheShell(cache);
  next.generatedAt = new Date().toISOString();
  next.items[key] = {
    value,
    updatedAt: next.generatedAt,
    ...meta
  };
  await writeImageCache(next);
  return value;
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': process.env.USER_AGENT || 'TechNetGameBot/1.0'
      },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveRawgImage(title) {
  if (!RAWG_API_KEY || !title) return null;
  const url = `${RAWG_API_BASE}/games?key=${encodeURIComponent(RAWG_API_KEY)}&page_size=1&search_precise=true&search=${encodeURIComponent(title)}`;
  const data = await fetchJson(url);
  return data?.results?.[0]?.background_image || null;
}

export async function getGameImage(title = '', fallback = '/assets/img/fallback-game-cover.svg') {
  const normalizedTitle = normalizeKey(title);
  const cacheKey = `game:${normalizedTitle}`;
  const cache = createCacheShell(await readImageCache());
  const cached = getFresh(cache, cacheKey);
  if (cached) return cached;

  const curated = CURATED_GAME_IMAGES[normalizedTitle];
  if (curated) return persist(cache, cacheKey, withSiteUrl(curated), { source: 'curated' });

  try {
    const rawgImage = await resolveRawgImage(title);
    if (rawgImage) return persist(cache, cacheKey, rawgImage, { source: 'rawg' });
  } catch (error) {
    console.warn('[media] RAWG image lookup failed for', title, error?.message || error);
  }

  return persist(cache, cacheKey, withSiteUrl(fallback), { source: 'fallback' });
}

export async function getCreatorAvatar(name = '', channelUrl = '', fallback = '/assets/img/default-avatar.svg') {
  const normalizedName = normalizeKey(name);
  const normalizedChannel = normalizeKey(channelUrl);
  const cacheKey = `creator:${normalizedName || normalizedChannel}`;
  const cache = createCacheShell(await readImageCache());
  const cached = getFresh(cache, cacheKey);
  if (cached) return cached;

  const curated = CURATED_CREATOR_AVATARS[normalizedName];
  if (curated?.image) {
    return persist(cache, cacheKey, curated.image, {
      source: 'curated-avatar',
      fallback: curated.fallback || fallback
    });
  }

  if (channelUrl) {
    const unavatar = `https://unavatar.io/${channelUrl.replace(/^https?:\/\//i, '')}`;
    return persist(cache, cacheKey, unavatar, { source: 'unavatar-channel' });
  }

  if (name) {
    const unavatarByName = `https://unavatar.io/${encodeURIComponent(name)}`;
    return persist(cache, cacheKey, unavatarByName, { source: 'unavatar-name' });
  }

  return persist(cache, cacheKey, withSiteUrl(fallback), { source: 'fallback-avatar' });
}
