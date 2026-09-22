# Nox Aeterna

## Деплой

Пользователь деплоит вручную на своём сервере. Команда:

```bash
cd /opt/noxaeterna2-0 && git pull && npm run build
```

Backend (`server/index.js`) перезапускается отдельно, только если менялся сам backend:

```bash
sudo systemctl restart nox-server
```

После каждого пуша явно говори пользователю, нужен ли перезапуск backend'а или достаточно пересборки фронта.
