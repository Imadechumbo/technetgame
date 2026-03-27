import app from "./app.js";
import { primeCache, startRefreshScheduler } from "./jobs/refreshScheduler.js";

const port = Number(process.env.PORT || 3000);
const host = "0.0.0.0";

const server = app.listen(port, host, () => {
  console.log(`TechNetGame API rodando em http://${host}:${port}`);

  (async () => {
    try {
      await primeCache();
      console.log("[server] cache inicial carregado");
    } catch (error) {
      console.error("[server] erro no primeCache:", error?.message || error);
    }

    try {
      startRefreshScheduler();
      console.log("[server] scheduler iniciado");
    } catch (error) {
      console.error("[server] erro no scheduler:", error?.message || error);
    }
  })();
});

function shutdown(signal) {
  console.log(`[server] encerrando com ${signal}`);
  server.close((error) => {
    if (error) {
      console.error("[server] erro ao encerrar:", error.message);
      process.exit(1);
    }
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("[server] unhandledRejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("[server] uncaughtException:", error);
  process.exit(1);
});
