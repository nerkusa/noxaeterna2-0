# Nox Aeterna

ttrpg companion (React + собственный локальный realtime-сервер вместо Firebase).

## Запуск локально

1. Бэкенд (хранит комнаты и рассылает обновления всем подключённым клиентам):
   ```
   cd server
   npm install
   npm start
   ```
   По умолчанию слушает `ws://localhost:8787`, данные пишутся в `server/data.json`.

2. Клиент:
   ```
   cp .env.example .env
   npm install
   npm start
   ```

## Деплой на свой VPS (с бесплатным доменом)

Полная пошаговая инструкция (DuckDNS + Ubuntu + nginx + systemd + бесплатный
HTTPS через Let's Encrypt) — [deploy/VPS_SETUP.md](deploy/VPS_SETUP.md).

Кратко: сервер (`server/`) — обычный Node-процесс, держим его живым через
systemd (готовый юнит в `deploy/nox-server.service`); nginx отдаёт собранный
клиент и проксирует WebSocket на `/ws` (готовый конфиг в
`deploy/nginx.conf.example`); `certbot --nginx` выдаёт бесплатный сертификат.
Данные комнат хранятся в `server/data.json` — бэкапьте этот файл при желании.
