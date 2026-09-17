# Разворачиваем на своём VPS (Ubuntu/Debian) с бесплатным доменом

Пошагово, копируй команды как есть, меняя только `YOUR_DOMAIN` и IP на свои.

## 1. Бесплатный домен (DuckDNS)

1. Открой https://www.duckdns.org и войди (через GitHub/Google — что угодно).
2. В поле «domains» впиши любое имя, например `noxaeterna`, нажми **add domain**.
   Получишь адрес вида `noxaeterna.duckdns.org`.
3. В поле «current ip» впиши **публичный IP своего VPS** (посмотреть его можно
   командой `curl -4 ifconfig.me`, выполненной прямо на VPS) и нажми **update ip**.

Готово — домен уже смотрит на твой сервер. Дальше везде используй свой
`noxaeterna.duckdns.org` вместо `YOUR_DOMAIN`.

## 2. Заходим на VPS и ставим зависимости

```bash
ssh USER@VPS_IP

sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx git

# Node.js 20 LTS (в apt обычно старая версия — ставим через NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## 3. Клонируем и собираем проект

```bash
cd /opt
sudo git clone https://github.com/nerkusa/noxaeterna2-0.git
cd noxaeterna2-0

# бэкенд
cd server
sudo npm install --omit=dev
cd ..

# фронтенд — пропиши свой домен (с /ws на конце, это путь, который проксирует nginx)
echo "REACT_APP_WS_URL=wss://YOUR_DOMAIN/ws" | sudo tee .env
sudo npm install
sudo npm run build
```

## 4. Бэкенд как systemd-сервис (чтобы жил после перезагрузки/падения)

```bash
sudo cp deploy/nox-server.service /etc/systemd/system/nox-server.service
sudo mkdir -p /opt/noxaeterna2-0/server
sudo chown -R www-data:www-data /opt/noxaeterna2-0/server

sudo systemctl daemon-reload
sudo systemctl enable --now nox-server
sudo systemctl status nox-server   # должно быть "active (running)"
```

## 5. Nginx (отдаёт сайт + проксирует WebSocket)

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/noxaeterna
sudo sed -i 's/YOUR_DOMAIN_HERE/YOUR_DOMAIN/' /etc/nginx/sites-available/noxaeterna
sudo ln -s /etc/nginx/sites-available/noxaeterna /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 6. Открываем порты и получаем бесплатный HTTPS-сертификат

```bash
sudo ufw allow 'Nginx Full'   # порты 80 и 443, если стоит ufw

sudo certbot --nginx -d YOUR_DOMAIN
```

Certbot сам допишет в nginx-конфиг SSL, редирект с http на https и настроит
автопродление сертификата (бесплатно, Let's Encrypt, продлевается сам).

## 7. Проверка

Открой в браузере `https://YOUR_DOMAIN` — должно открыться лобби игры.
Если WebSocket не подключается — проверь консоль браузера (F12) и:

```bash
sudo systemctl status nox-server     # бэкенд жив?
sudo journalctl -u nox-server -f     # логи бэкенда
sudo tail -f /var/log/nginx/error.log
```

## Обновление после новых изменений в репозитории

```bash
cd /opt/noxaeterna2-0
sudo git pull
sudo npm install && sudo npm run build
cd server && sudo npm install --omit=dev && cd ..
sudo systemctl restart nox-server
```
