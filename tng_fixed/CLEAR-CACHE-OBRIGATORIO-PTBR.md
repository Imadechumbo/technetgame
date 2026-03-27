# Limpeza obrigatória após este update

Depois de publicar esta versão, rode no servidor:

```bash
sudo rm -f /var/www/technetgame/shared/backend-cache/news-cache.json
sudo rm -f /var/www/technetgame/shared/backend-cache/image-cache.json
sudo rm -f /var/www/technetgame/shared/backend-cache/translation-cache.json
sudo -iu ubuntu pm2 restart technetgame-backend --update-env
```

Depois disso:

1. Cloudflare → Purge Everything
2. navegador → Ctrl + Shift + R
3. teste:

```bash
curl -s http://127.0.0.1:3000/api/health
```
