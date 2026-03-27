TECHNETGAME - RAILWAY NIXPACKS (SEM DOCKER)

Este pacote foi limpo para forcar Railway a usar builder Node/Nixpacks.

ARQUIVOS REMOVIDOS:
- backend/Dockerfile
- render.yaml
- backend-python/railway.json
- pasta .git nao foi incluida no zip final

CONFIGURACAO NO RAILWAY:
1) New Project -> Deploy from GitHub Repo
2) Escolha o repo atualizado com este conteudo
3) No service da API configure:
   - Root Directory: backend
   - Builder: Railpack / Nixpacks / Default
   - Build Command: npm install
   - Start Command: npm start
4) Variables:
   - NODE_ENV=production
   - PORT sera fornecida pelo Railway automaticamente
5) Deploy novamente

IMPORTANTE:
- Enquanto existir backend/Dockerfile no repo, Railway pode voltar a detectar Docker.
- O package.json do backend ja esta pronto para subir com npm start.

CHECK RAPIDO:
- backend/package.json
  scripts.start = node src/server.js
  engines.node = 20.x

SE FOR SUBIR NO GITHUB:
- substitua o conteudo do repo por este pacote limpo
- commit
- push
- redeploy no Railway
