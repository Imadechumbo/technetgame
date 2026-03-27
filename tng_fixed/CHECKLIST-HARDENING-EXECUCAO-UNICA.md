# TechNetGame — checklist de execução única

## 0) Subir o projeto atualizado

No Windows, dentro da pasta onde está `deploy-technetgame.bat`:

```bat
deploy-technetgame.bat
```

## 1) Reinstalar o script de deploy final no servidor

```bash
sudo cp /var/www/technetgame/current/scripts/deploy-technetgame.sh /usr/local/bin/deploy-technetgame.sh
```

```bash
sudo chmod +x /usr/local/bin/deploy-technetgame.sh
```

## 2) Gravar snippet de proxy do Nginx

```bash
sudo tee /etc/nginx/snippets/technetgame-proxy.conf > /dev/null <<'EOF'
proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto https;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Port 443;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
proxy_connect_timeout 5s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
EOF
```

## 3) Gravar Cloudflare real IP no Nginx

```bash
{ curl -fsSL https://www.cloudflare.com/ips-v4 | sed 's#^#set_real_ip_from #; s#$#;#'; curl -fsSL https://www.cloudflare.com/ips-v6 | sed 's#^#set_real_ip_from #; s#$#;#'; echo 'real_ip_header CF-Connecting-IP;'; echo 'real_ip_recursive on;'; } | sudo tee /etc/nginx/conf.d/cloudflare-realip.conf > /dev/null
```

## 4) Gravar vhost final do Nginx

```bash
sudo cp /var/www/technetgame/current/nginx/technetgame.production.conf /etc/nginx/sites-available/technetgame
```

```bash
sudo ln -sf /etc/nginx/sites-available/technetgame /etc/nginx/sites-enabled/technetgame
```

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

## 5) Criar PM2 startup como usuário ubuntu

```bash
PM2_BIN="$(sudo -iu ubuntu bash -lc 'command -v pm2')" && echo "$PM2_BIN"
```

```bash
PM2_BIN="$(sudo -iu ubuntu bash -lc 'command -v pm2')" && sudo tee /etc/systemd/system/pm2-ubuntu.service > /dev/null <<EOF
[Unit]
Description=PM2 process manager for ubuntu
After=network.target

[Service]
Type=forking
User=ubuntu
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=PM2_HOME=/home/ubuntu/.pm2
PIDFile=/home/ubuntu/.pm2/pm2.pid
ExecStart=${PM2_BIN} resurrect
ExecReload=${PM2_BIN} reload all
ExecStop=${PM2_BIN} kill
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
```

```bash
sudo systemctl daemon-reload
```

```bash
sudo systemctl enable pm2-ubuntu
```

```bash
sudo systemctl start pm2-ubuntu
```

```bash
sudo systemctl status pm2-ubuntu --no-pager
```

```bash
sudo -iu ubuntu pm2 save
```

```bash
sudo -iu ubuntu pm2 status
```

## 6) Ativar rotação de logs do PM2

```bash
sudo -iu ubuntu pm2 install pm2-logrotate
```

```bash
sudo -iu ubuntu pm2 set pm2-logrotate:max_size 20M
```

```bash
sudo -iu ubuntu pm2 set pm2-logrotate:retain 14
```

```bash
sudo -iu ubuntu pm2 set pm2-logrotate:compress true
```

```bash
sudo -iu ubuntu pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
```

```bash
sudo -iu ubuntu pm2 save
```

## 7) Fechar firewall

```bash
sudo apt-get update
```

```bash
sudo apt-get install -y ufw
```

```bash
sudo ufw default deny incoming
```

```bash
sudo ufw default allow outgoing
```

```bash
sudo ufw allow OpenSSH
```

```bash
sudo ufw allow 80/tcp
```

```bash
sudo ufw allow 443/tcp
```

```bash
sudo ufw deny 3000/tcp
```

```bash
sudo ufw --force enable
```

```bash
sudo ufw status verbose
```

## 8) Fail2ban opcional, mas recomendado

```bash
sudo apt-get install -y fail2ban
```

```bash
sudo tee /etc/fail2ban/jail.d/sshd.local > /dev/null <<'EOF'
[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = systemd
maxretry = 5
findtime = 10m
bantime = 1h
EOF
```

```bash
sudo systemctl enable --now fail2ban
```

```bash
sudo fail2ban-client status
```

```bash
sudo fail2ban-client status sshd
```

## 9) Validação final

```bash
sudo -iu ubuntu pm2 status
```

```bash
sudo -iu ubuntu pm2 logs technetgame-backend --lines 50
```

```bash
curl -I https://www.technetgame.com.br/
```

```bash
curl https://www.technetgame.com.br/api/health
```

```bash
sudo ss -ltnp | grep :3000 || true
```

```bash
sudo nginx -t
```

## 10) Teste real de reboot

```bash
sudo reboot
```

Depois de reconectar:

```bash
sudo systemctl status pm2-ubuntu --no-pager
```

```bash
sudo -iu ubuntu pm2 status
```

```bash
curl https://www.technetgame.com.br/api/health
```

```bash
sudo ss -ltnp | grep :3000 || true
```

```bash
sudo ufw status verbose
```

## decisão final de arquitetura

- manter só o scheduler interno do Node
- não instalar cron externo do projeto
- não usar o service legado `technetgame-api.service`
- PM2 sempre no usuário `ubuntu`
- Nginx na frente com Cloudflare Full (strict)
