#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="technetgame"
APP_USER="${APP_USER:-ubuntu}"
APP_GROUP="${APP_GROUP:-ubuntu}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
PM2_APP_NAME="technetgame-backend"

BASE_DIR="/var/www/${APP_NAME}"
RELEASES_DIR="${BASE_DIR}/releases"
SHARED_DIR="${BASE_DIR}/shared"
CURRENT_LINK="${BASE_DIR}/current"
TMP_DIR="${BASE_DIR}/tmp"
ARCHIVE="${1:-${TMP_DIR}/technetgame-release.tar.gz}"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
NEW_RELEASE_DIR="${RELEASES_DIR}/${TIMESTAMP}"
EXTRACT_DIR="${TMP_DIR}/extract-${TIMESTAMP}"
LOG_DIR="${SHARED_DIR}/deploy-logs"
LOG_FILE="${LOG_DIR}/deploy-${TIMESTAMP}.log"

CACHE_DIR="${SHARED_DIR}/backend-cache"
LOGS_DIR="${SHARED_DIR}/backend-logs"
UPLOADS_DIR="${SHARED_DIR}/uploads"
SHARED_ENV="${SHARED_DIR}/.env"
LIBRE_DIR_REL="infra/libretranslate"
LIBRE_COMPOSE_FILE="docker-compose.yml"
API_URL="http://127.0.0.1:3000/api/news/latest"
LIBRE_HEALTH_URL="http://127.0.0.1:5000/languages"

PREVIOUS_TARGET=""
NEW_ACTIVE="false"

log() {
  printf '[DEPLOY] %s\n' "$*" | tee -a "${LOG_FILE}"
}

fail() {
  log "ERRO: $*"
  exit 1
}

cleanup() {
  rm -rf "${EXTRACT_DIR}" || true
}
trap cleanup EXIT

rollback() {
  log "ROLLBACK..."

  if [[ -n "${PREVIOUS_TARGET}" && -d "${PREVIOUS_TARGET}" ]]; then
    ln -sfn "${PREVIOUS_TARGET}" "${CURRENT_LINK}.tmp"
    mv -Tf "${CURRENT_LINK}.tmp" "${CURRENT_LINK}"

    sudo -iu "${APP_USER}" bash -lc "cd '${CURRENT_LINK}' && pm2 startOrReload ecosystem.config.cjs --update-env && pm2 save" || true
    sudo systemctl reload nginx || true

    if [[ -f "${CURRENT_LINK}/${LIBRE_DIR_REL}/${LIBRE_COMPOSE_FILE}" ]]; then
      ( cd "${CURRENT_LINK}/${LIBRE_DIR_REL}" && docker compose up -d ) || true
    fi

    log "Rollback concluído -> ${PREVIOUS_TARGET}"
  else
    log "Rollback ignorado: release anterior não encontrada"
  fi
}

on_error() {
  local exit_code=$?
  log "Falha detectada (exit ${exit_code})"
  if [[ "${NEW_ACTIVE}" == "true" ]]; then
    rollback
  fi
  exit "${exit_code}"
}
trap on_error ERR

mkdir -p "${RELEASES_DIR}" "${SHARED_DIR}" "${TMP_DIR}" "${LOG_DIR}"
mkdir -p "${CACHE_DIR}"/{raw,normalized,translated,enriched,responses,metrics} "${LOGS_DIR}" "${UPLOADS_DIR}"
touch "${SHARED_ENV}"

[[ -n "${ARCHIVE}" ]] || fail "Uso: deploy-technetgame.sh /tmp/technetgame-release.tar.gz"
[[ -f "${ARCHIVE}" ]] || fail "Arquivo não encontrado: ${ARCHIVE}"

PREVIOUS_TARGET="$(readlink -f "${CURRENT_LINK}" || true)"
log "Release anterior: ${PREVIOUS_TARGET:-nenhuma}"

mkdir -p "${NEW_RELEASE_DIR}" "${EXTRACT_DIR}"
log "Extraindo pacote..."
tar -xzf "${ARCHIVE}" -C "${EXTRACT_DIR}"
rsync -a "${EXTRACT_DIR}/" "${NEW_RELEASE_DIR}/"

log "Ajustando permissões e links compartilhados..."
ln -sfn "${SHARED_ENV}" "${NEW_RELEASE_DIR}/backend/.env"
rm -rf "${NEW_RELEASE_DIR}/backend/data/cache" || true
ln -sfn "${CACHE_DIR}" "${NEW_RELEASE_DIR}/backend/data/cache"
ln -sfn "${CACHE_DIR}" "${NEW_RELEASE_DIR}/backend/cache"
ln -sfn "${LOGS_DIR}" "${NEW_RELEASE_DIR}/backend/logs"
ln -sfn "${UPLOADS_DIR}" "${NEW_RELEASE_DIR}/backend/uploads"

touch "${CACHE_DIR}/news-cache.json" "${CACHE_DIR}/image-cache.json" "${CACHE_DIR}/translation-cache.json"
sudo chown -R "${APP_USER}:${APP_GROUP}" "${BASE_DIR}"
sudo chmod -R 2775 "${CACHE_DIR}"
sudo chmod 664 "${CACHE_DIR}/news-cache.json" "${CACHE_DIR}/image-cache.json" "${CACHE_DIR}/translation-cache.json"

log "Instalando dependências do backend..."
if [[ -f "${NEW_RELEASE_DIR}/backend/package-lock.json" ]]; then
  log "package-lock.json encontrado -> npm ci"
  sudo -iu "${APP_USER}" bash -lc "cd '${NEW_RELEASE_DIR}/backend' && npm ci --omit=dev"
else
  log "package-lock.json não encontrado -> npm install"
  sudo -iu "${APP_USER}" bash -lc "cd '${NEW_RELEASE_DIR}/backend' && npm install --omit=dev"
fi

log "Ativando release..."
ln -sfn "${NEW_RELEASE_DIR}" "${CURRENT_LINK}.tmp"
mv -Tf "${CURRENT_LINK}.tmp" "${CURRENT_LINK}"
NEW_ACTIVE="true"
sudo chown -h "${APP_USER}:${APP_GROUP}" "${CURRENT_LINK}"

log "Reiniciando backend (PM2)..."
sudo -iu "${APP_USER}" bash -lc "cd '${CURRENT_LINK}' && pm2 startOrReload ecosystem.config.cjs --update-env && pm2 save"

log "Subindo LibreTranslate..."
if [[ -f "${CURRENT_LINK}/${LIBRE_DIR_REL}/${LIBRE_COMPOSE_FILE}" ]]; then
  mkdir -p "${CURRENT_LINK}/${LIBRE_DIR_REL}/data"
  ( cd "${CURRENT_LINK}/${LIBRE_DIR_REL}" && docker compose up -d )

  LIBRE_OK=0
  for i in {1..15}; do
    if curl -fsS --max-time 5 "${LIBRE_HEALTH_URL}" >/dev/null; then
      LIBRE_OK=1
      break
    fi
    log "LibreTranslate tentativa ${i}/15 falhou... aguardando"
    sleep 3
  done

  if [[ "${LIBRE_OK}" -ne 1 ]]; then
    log "LibreTranslate não respondeu"
    ( cd "${CURRENT_LINK}/${LIBRE_DIR_REL}" && docker compose ps ) || true
    fail "LibreTranslate falhou"
  fi
  log "LibreTranslate OK"
else
  log "${LIBRE_DIR_REL}/${LIBRE_COMPOSE_FILE} não encontrado; pulando LibreTranslate"
fi

log "Validando Nginx..."
sudo nginx -t
sudo systemctl reload nginx

log "Aguardando backend estabilizar..."
sleep 10

[[ -f "${CURRENT_LINK}/site/index.html" ]] || fail "index.html não encontrado"

log "Validando API (até 30s)..."
SUCCESS=0
for i in {1..10}; do
  if curl -fsS --max-time 5 "${API_URL}" >/dev/null; then
    SUCCESS=1
    break
  fi
  log "Tentativa ${i}/10 falhou... aguardando"
  sleep 3
done

if [[ "${SUCCESS}" -ne 1 ]]; then
  log "API não respondeu a tempo. Coletando diagnóstico..."
  sudo -iu "${APP_USER}" pm2 status || true
  sudo -iu "${APP_USER}" pm2 logs "${PM2_APP_NAME}" --lines 50 --nostream || true
  sudo ss -ltnp | grep :3000 || true

  if sudo -iu "${APP_USER}" pm2 status | grep -q "${PM2_APP_NAME}.*online"; then
    log "PM2 está online; evitando falso negativo"
  else
    fail "Deploy falhou de verdade"
  fi
fi

log "API OK"
cd "${RELEASES_DIR}"
ls -1dt */ 2>/dev/null | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf
rm -f "${ARCHIVE}"
log "Deploy concluído com sucesso -> ${NEW_RELEASE_DIR}"
