# TechNetGame — Stack Free Ready

Pacote preparado para:
- **Cloudflare Pages** no frontend (`site/`)
- **Render** no backend Node (`backend/`)
- **Railway** no backend Python/Gemini (`backend-python/`)
- **GitHub Actions** com validação e rollback por health check

## Arquivos que você vai editar primeiro
- `site/assets/js/runtime-config.js`
- `backend/.env.example`
- `backend-python/.env.example`
- `.github/workflows/deploy-backend-node.yml`
- `.github/workflows/deploy-backend-python.yml`

## Rotas importantes
- Node health: `/api/health`
- Node → Python health: `/api/ai/health`
- Python health: `/health`
- IA: `POST /api/ai`

## Deploy rápido
Leia:
- `DEPLOY-100-FREE.md`
