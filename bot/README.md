# @Saramudpost_bot — инфраструктура

Telegram CRM-бот на базе n8n + PostgreSQL + NocoDB.

## Состав

| Компонент | Назначение |
|-----------|-----------|
| n8n | Воркфлоу (уже запущен на VPS) |
| PostgreSQL | Хранение контактов и логов |
| NocoDB | Визуальный CRM-интерфейс (порт 8080) |

## Быстрый старт

### 1. Клонировать и настроить окружение

```bash
cp .env.example .env
nano .env   # заполнить все переменные
```

### 2. Запустить PostgreSQL + NocoDB

```bash
docker-compose up -d
```

n8n трогать не нужно — он уже запущен отдельно.

### 3. Получить токены

- **Telegram Bot Token** — создать бота через [@BotFather](https://t.me/BotFather), команда `/newbot`
- **Groq API Key** — бесплатно на [console.groq.com](https://console.groq.com)

### 4. Импортировать воркфлоу в n8n

В интерфейсе n8n: **Settings → Import from file**, импортировать по очереди:
- `workflows/receive.json`
- `workflows/broadcast.json`
- `workflows/segment.json`

Настроить credentials для каждого воркфлоу:
- **Postgres** — указать данные из `.env`
- **Telegram** — вставить `TELEGRAM_BOT_TOKEN`
- **HTTP Header Auth** (Groq) — вставить `Bearer <GROQ_API_KEY>`

Активировать все три воркфлоу.

### 5. Зарегистрировать webhook

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "<N8N_BASE_URL>/webhook/telegram-webhook",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>"
  }'
```

### 6. Проверка

```bash
# Написать боту /start — контакт должен появиться в NocoDB (http://localhost:8080)

# Тестовый broadcast
curl -X POST "<N8N_BASE_URL>/webhook/broadcast" \
  -H "Content-Type: application/json" \
  -d '{"segment": "all", "message": "Тест рассылки"}'

# Сменить сегмент
curl -X POST "<N8N_BASE_URL>/webhook/segment" \
  -H "Content-Type: application/json" \
  -d '{"telegram_id": 123456789, "segment": "client"}'
```

## Структура БД

**contacts**
- `telegram_id` (unique) — ID пользователя
- `segment` — `lead | client | cold | blocked`
- `is_active` — флаг для рассылок
- `source`, `notes` — произвольные поля

**broadcast_log**
- История всех рассылок с количеством отправленных/ошибок

## Переменные окружения

| Переменная | Описание |
|-----------|---------|
| `TELEGRAM_BOT_TOKEN` | Токен бота от BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Любая случайная строка |
| `GROQ_API_KEY` | Ключ Groq для транскрипции голоса |
| `POSTGRES_DB/USER/PASSWORD` | Параметры БД |
| `N8N_BASE_URL` | Публичный URL n8n |
| `NOCODB_BASE_URL` | URL NocoDB (обычно http://localhost:8080) |
