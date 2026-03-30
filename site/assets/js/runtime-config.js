window.RUNTIME_CONFIG = {
  ...(window.RUNTIME_CONFIG || {}),
  API_URL: "https://api.technetgame.com.br",
  API_BASE: "https://api.technetgame.com.br",
  API_FALLBACKS: [
    "https://api.technetgame.com.br",
    "https://technetgame-backend-production.up.railway.app",
    "http://127.0.0.1:8080"
  ]
};
