# Checklist final de publicação

- [ ] domínio `technetgame.com.br` apontando para o Cloudflare
- [ ] registros `@`, `www` e `api` em modo Proxied
- [ ] Origin Certificate salvo em `/opt/technetgame/cloudflare/`
- [ ] `backend/.env` confirmado
- [ ] `docker compose up -d --build` executado sem erro
- [ ] `curl http://127.0.0.1:3000/api/health` retornando `ok`
- [ ] `nginx -t` sem erro
- [ ] `https://www.technetgame.com.br` abrindo com cadeado
- [ ] `https://api.technetgame.com.br/api/health` respondendo
- [ ] `robots.txt` e `sitemap.xml` publicados
- [ ] página Valve/Steam validada
- [ ] e-mail de contato `weiganlight@gmail.com` visível
- [ ] página de apoio com QR Pix validada
- [ ] placeholders de AdSense/Amazon substituídos pelos códigos finais
