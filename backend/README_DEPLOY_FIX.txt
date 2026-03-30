TechNetGame backend fix final

Arquivos corrigidos:
- src/app.js
- src/server.js
- src/routes/healthRoutes.js

Principais ajustes:
- /api/media e /api/hardware montados corretamente
- app sobe antes do primeCache
- background jobs não bloqueiam startup
- health route tolera cache vazio
- static path protegido quando PUBLIC_SITE_DIR não existir
- endpoint /ping adicionado

Teste após deploy:
- /ping
- /api/health
- /api/media/hardware-image?q=rtx%205070
- /api/hardware/products?q=rtx%205070&limit=4
