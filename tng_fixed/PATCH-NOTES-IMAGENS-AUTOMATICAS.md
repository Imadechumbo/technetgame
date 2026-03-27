# Patch final — imagens automáticas no backend

Incluído neste ZIP:

- extração de imagens por RSS (`enclosure`, `media:content`, `media:thumbnail`, `itunes:image`)
- fallback por HTML do feed (`<img>`)
- enriquecimento por página da notícia com `og:image`, `twitter:image` e `image_src`
- fallback de imagem por categoria
- limite de enriquecimento por ciclo com `IMAGE_ENRICH_LIMIT`
- timeout de coleta com `IMAGE_FETCH_TIMEOUT_MS`

Arquivos alterados:

- `backend/src/services/imageService.js` (novo)
- `backend/src/services/normalizer.js`
- `backend/src/services/feedService.js`

Depois do deploy:

```bash
cd /var/www/technetgame/backend
npm install --production
pm2 restart all
node src/jobs/manualRefresh.js
```
