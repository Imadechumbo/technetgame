(function () {
  const explicit = (window.__TNG_API_BASE__ || '').trim();
  const fromMeta = document.querySelector('meta[name="technetgame-api-base"]')?.getAttribute('content')?.trim() || '';

  function guessBase() {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:3000';
    if (host.endsWith('.pages.dev')) return 'https://SEU-BACKEND.onrender.com';
    if (host === 'technetgame.com.br' || host === 'www.technetgame.com.br') return 'https://SEU-BACKEND.onrender.com';
    return window.location.origin;
  }

  const API_BASE_URL = explicit || fromMeta || guessBase();
  const AI_BASE_URL = API_BASE_URL;

  function withApiBase(path) {
    if (!path) return API_BASE_URL;
    if (/^https?:\/\//i.test(path)) return path;
    const normalizedBase = API_BASE_URL.replace(/\/$/, '');
    const normalizedPath = String(path).startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }

  window.RUNTIME_CONFIG = {
    API_BASE_URL,
    AI_BASE_URL
  };

  window.TechNetGameRuntime = {
    API_BASE_URL,
    AI_BASE_URL,
    withApiBase
  };
})();
