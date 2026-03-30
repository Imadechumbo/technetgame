window.RUNTIME_CONFIG = {
  ...(window.RUNTIME_CONFIG || {}),
  API_BASE_URL: "https://api.technetgame.com.br",
  API_FALLBACKS: [
    "https://api.technetgame.com.br"
  ]
};

window.__TNG_CONFIG_READY__ = Promise.resolve();