# AGENTS.md — TechNetGame Sync System

## 🎯 MISSÃO
Manter frontend (Cloudflare Pages) e backend (Railway) 100% sincronizados, evitando erros de:
- CORS
- cache antigo
- endpoints quebrados
- diferenças entre domínio do site e domínio da API
- versionamento inconsistente

O objetivo final é:
- Home carregando corretamente
- destaque funcionando
- zero erro CORS no DevTools
- frontend consumindo a API oficial sem falhas

---

## 📦 STACK OFICIAL

- Backend: Node.js + Express
- Deploy backend: Railway
- Frontend: Cloudflare Pages
- Domínio site: https://technetgame.com.br
- Domínio site alternativo: https://www.technetgame.com.br
- Domínio frontend Pages: https://technetgame-site.pages.dev
- Domínio oficial da API: https://api.technetgame.com.br

---

## 🚨 REGRAS CRÍTICAS

1. Nunca corrigir apenas frontend ou apenas backend isoladamente.
2. Sempre revisar em conjunto os arquivos:
   - `backend/src/app.js`
   - `backend/src/middleware/errorHandler.js`
   - `site/assets/js/runtime-config.js`
   - `site/assets/js/feeds.js`
   - `site/index.html`
3. Nunca trocar a API para URL temporária do Railway se já existir domínio oficial.
4. Nunca deixar código antigo convivendo com código novo.
5. Sempre preferir correção estável e simples.
6. Nunca adicionar headers no fetch sem necessidade.
7. Nunca criar endpoint fictício.
8. Home nunca pode quebrar por falha parcial de uma request.

---

## 🌐 CORS — REGRA OFICIAL

### Backend deve aceitar apenas estas origens:
- `https://technetgame.com.br`
- `https://www.technetgame.com.br`
- `https://technetgame-site.pages.dev`
- `http://localhost:3000`
- `http://127.0.0.1:3000`

### Implementação correta:
- Ler `req.headers.origin`
- Verificar se está na allowlist
- Retornar:
  - `Access-Control-Allow-Origin: <origin-da-request>`
  - `Vary: Origin`
- Nunca retornar múltiplas origens numa única string
- Nunca usar `*` em produção se houver controle por domínio

### Métodos permitidos:
- `GET,POST,PUT,PATCH,DELETE,OPTIONS`

### Headers permitidos:
- `Content-Type`
- `Authorization`
- `X-Refresh-Token`
- `Accept`

### Preflight:
- Responder `OPTIONS` com status `204`
- Incluir `Access-Control-Max-Age`

### Observações:
- Não usar `Access-Control-Allow-Credentials` se o frontend não usa cookies/sessão
- Não depender da biblioteca `cors()` se existir middleware manual estável

---

## ⚠️ FETCH RULES (FRONTEND)

### Regras obrigatórias:
- Não usar headers desnecessários
- Não enviar `Cache-Control` manual no fetch
- Não enviar `Content-Type` em GET
- Não forçar preflight sem necessidade
- Sempre consumir a API a partir de `runtime-config.js`
- Nunca hardcodar URL da API em vários arquivos

### Fetch GET ideal:
- método GET simples
- header `Accept: application/json` opcional
- sem credentials
- sem modo custom desnecessário

---

## 🔗 API CONFIG

Arquivo:
- `site/assets/js/runtime-config.js`

Deve usar sempre:

```js
window.TNG_CONFIG = Object.freeze({
  API_BASE_URL: "https://api.technetgame.com.br"
});
## ENDPOINTS REAIS (CONFIRMADOS)

### Health
- /api/health

### News
- /api/news/latest
- /api/news/featured
- /api/news/home
- /api/news/month
- /api/news/status
- /api/news/game-search
- /api/news/category/:slug
- /api/news/source/:slug

### Media
- /api/media/game-image
- /api/media/hardware-image
- /api/media/creator-avatar

### Hardware
- /api/hardware/products

### REGRA
O agente deve usar apenas endpoints reais existentes no backend.
Nunca inventar endpoint.
Sempre verificar backend/src/routes antes de concluir qualquer correção.