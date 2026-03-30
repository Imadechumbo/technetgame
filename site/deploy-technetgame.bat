@echo off
setlocal

set SERVER=ubuntu@163.176.34.244
set KEY=oracle-key/ssh-key-2026-03-15.key
set LOCAL_FILE=technetgame-release.tar.gz

echo =========================================
echo TechNetGame - Deploy Rapido
echo =========================================

if not exist "%KEY%" (
  echo ERRO: chave SSH nao encontrada
  pause
  exit /b 1
)

del /f /q "%LOCAL_FILE%" >nul 2>&1

echo [1/4] Empacotando...
tar -czf "%LOCAL_FILE%" ^
  --exclude="%LOCAL_FILE%" ^
  --exclude=.git ^
  --exclude=.github ^
  --exclude=.vscode ^
  --exclude=.idea ^
  --exclude=node_modules ^
  --exclude=backend/node_modules ^
  --exclude=site/node_modules ^
  --exclude=.env ^
  --exclude=.env.* ^
  --exclude=*.log ^
  --exclude=tmp ^
  --exclude=dist ^
  --exclude=coverage ^
  --exclude=technetgame_fullstack_combr_ready ^
  backend site scripts nginx cloudflare ecosystem.config.js ecosystem.config.cjs

if errorlevel 1 (
  echo ERRO ao empacotar
  pause
  exit /b 1
)

echo [2/4] Enviando pacote...
scp -i "%KEY%" "%LOCAL_FILE%" %SERVER%:/home/ubuntu/technetgame-release.tar.gz

if errorlevel 1 (
  echo ERRO ao enviar pacote
  pause
  exit /b 1
)

echo [3/4] Movendo pacote...
ssh -i "%KEY%" %SERVER% "sudo mkdir -p /var/www/technetgame/tmp && sudo mv /home/ubuntu/technetgame-release.tar.gz /var/www/technetgame/tmp/technetgame-release.tar.gz && sudo chown ubuntu:ubuntu /var/www/technetgame/tmp/technetgame-release.tar.gz"

if errorlevel 1 (
  echo ERRO ao mover pacote
  pause
  exit /b 1
)

echo [4/4] Rodando deploy remoto...
ssh -i "%KEY%" %SERVER% "sudo /usr/local/bin/deploy-technetgame.sh"

if errorlevel 1 (
  echo ERRO no deploy remoto
  pause
  exit /b 1
)

del /f /q "%LOCAL_FILE%" >nul 2>&1

echo DEPLOY FINALIZADO
pause
