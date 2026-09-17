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

## Деплой на свой VPS

- Сервер (`server/`) — обычное Node-приложение, запускать через `pm2` или systemd:
  `PORT=8787 node server/index.js`. Поставьте перед ним nginx как reverse proxy
  с TLS (`wss://`), если фронтенд отдаётся по https — браузеры не разрешают
  небезопасный `ws://` со страницы на `https://`.
- Клиент собирается как обычно (`npm run build`) и раздаётся статикой (nginx/любой
  веб-сервер). Перед сборкой пропишите в `.env` реальный адрес сокет-сервера:
  `REACT_APP_WS_URL=wss://your-domain:8787` (или путь через nginx-проксирование).
- Данные комнаты хранятся в `server/data.json` — бэкапьте этот файл при желании.
