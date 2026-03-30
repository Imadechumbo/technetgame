# 🚀 TECHNETGAME — EXECUÇÃO TOTAL (SYNC + CORS FIX FINAL)

Leia e siga rigorosamente o arquivo AGENTS.md na raiz do projeto.

---

## 🎯 OBJETIVO

Corrigir completamente a sincronização entre backend (Railway) e frontend (Cloudflare Pages), garantindo:

- ZERO erro de CORS
- Home carregando corretamente
- Destaque funcionando
- API estável
- Nenhum endpoint inválido
- Nenhum erro no DevTools

---

## 📂 ARQUIVOS OBRIGATÓRIOS PARA REVISÃO

Revise e corrija TODOS:

1. backend/src/app.js
2. backend/src/middleware/errorHandler.js
3. site/assets/js/runtime-config.js
4. site/assets/js/feeds.js
5. site/index.html

---

## 🔥 AÇÕES OBRIGATÓRIAS

### 1. BACKEND (app.js)

- Garantir middleware CORS manual global
- Permitir apenas:
  - https://technetgame.com.br
  - https://www.technetgame.com.br
  - https://technetgame-site.pages.dev
- Usar:
  - Access-Control-Allow-Origin dinâmico
  - Vary: Origin
- Responder OPTIONS com 204
- Não usar biblioteca cors()
- Não usar "*"

---

### 2. ERROR HANDLER

- NÃO definir headers CORS aqui
- Retornar JSON padrão:

```json
{ "ok": false, "error": "mensagem" }