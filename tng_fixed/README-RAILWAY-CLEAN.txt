PACOTE CLEAN PARA RAILWAY

Use esta pasta se quiser subir só o backend no Railway sem o restante do projeto.

Configuração sugerida no Railway:
- Root Directory: /
- Build Command: npm install
- Start Command: npm start

Endpoints iniciais para teste:
- /
- /api/health

Mudanças aplicadas:
- removido dotenv do backend clean
- removido acoplamento com site estático
- removida rota aiRoutes do backend clean
- server.js ajustado para subir rápido no Railway
