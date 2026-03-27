# TechNetGame v9 - Deploy blindado

## O que esta blindado nesta versao
- Corrige ownership e permissoes do backend-cache em todo deploy
- Recria os arquivos:
  - news-cache.json
  - image-cache.json
  - translation-cache.json
- Garante chmod/chown antes do restart do PM2
- Liga e recarrega o nginx no final do deploy
- Exclui `technetgame_fullstack_combr_ready` do pacote para evitar warning de timestamp futuro
