# TechNetGame — stack 100% free com auto-rollback

## Estrutura oficial
- `site/` → Cloudflare Pages
- `backend/` → Render
- `backend-python/` → Railway
- `.github/workflows/` → validação + deploy + rollback

## 1) Frontend — Cloudflare Pages
Use estes valores:
- **Root directory:** `site`
- **Build command:** deixe vazio
- **Output directory:** `site`

Arquivo principal para configurar:
- `site/assets/js/runtime-config.js`

Placeholder atual:
- `https://SEU-BACKEND.onrender.com`

## 2) Backend Node — Render
Use estes valores:
- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Health check path:** `/api/health`

Variáveis mínimas no Render:
- `FRONTEND_URL=https://SEU-PROJETO.pages.dev`
- `ALLOWED_ORIGIN=https://SEU-PROJETO.pages.dev,https://technetgame.com.br,https://www.technetgame.com.br`
- `AI_URL=https://SEU-PROJETO-AI.up.railway.app`
- `TRANSLATION_API_URL=https://libretranslate.de/translate`
- `REFRESH_TOKEN=gere-uma-chave-forte`

## 3) Backend Python — Railway
Suba a pasta `backend-python` e configure:
- `GEMINI_API_KEY`
- `ALLOWED_ORIGIN=https://SEU-PROJETO.pages.dev`
- `PORT=5000`

Health:
- `/health`

## 4) GitHub Actions
Crie estes secrets:
- `RENDER_DEPLOY_HOOK`
- `RENDER_HEALTH_URL`
- `RAILWAY_DEPLOY_HOOK`
- `RAILWAY_HEALTH_URL`

## 5) Ordem certa do deploy
1. Railway
2. Render
3. Cloudflare Pages

## 6) Testes locais
### Backend Node
```bash
cd backend
npm install
npm start
```

Teste:
- `http://localhost:3000/api/health`
- `http://localhost:3000/api/ai/health`

### Backend Python
```bash
cd backend-python
pip install -r requirements.txt
python app.py
```

Teste:
- `http://localhost:5000/health`

## 7) Auto-rollback
Quando um deploy falhar no health check:
- o workflow faz `git revert HEAD --no-edit`
- altera a mensagem para rollback automático
- envia o commit para `main`

## 8) Ajustes finais obrigatórios
Troque os placeholders:
- `SEU-BACKEND.onrender.com`
- `SEU-PROJETO-AI.up.railway.app`
- `SEU-PROJETO.pages.dev`
