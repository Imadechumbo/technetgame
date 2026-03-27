#!/usr/bin/env bash
set -euo pipefail

APP_NAME="technetgame"
BASE_DIR="/var/www/${APP_NAME}"
SHARED_ENV="${BASE_DIR}/shared/.env"
CRON_FILE="/tmp/${APP_NAME}-cron"

if [ ! -f "${SHARED_ENV}" ]; then
  echo "ERRO: ${SHARED_ENV} não encontrado"
  exit 1
fi

REFRESH_TOKEN=$(grep -E '^REFRESH_TOKEN=' "${SHARED_ENV}" | tail -n 1 | cut -d '=' -f2-)

if [ -z "${REFRESH_TOKEN}" ]; then
  echo "ERRO: REFRESH_TOKEN ausente em ${SHARED_ENV}"
  exit 1
fi

(crontab -l 2>/dev/null | grep -v 'internal/refresh-news' || true; \
 echo "*/15 * * * * curl -s -X POST http://127.0.0.1:3000/api/internal/refresh-news -H \"Authorization: Bearer ${REFRESH_TOKEN}\" >/dev/null 2>&1") > "${CRON_FILE}"
crontab "${CRON_FILE}"
rm -f "${CRON_FILE}"

echo "Cron instalado com sucesso."
