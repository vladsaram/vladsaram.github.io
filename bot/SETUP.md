# Video Autopublish Bot — Setup Guide

**Bot:** @Saramudpost_bot  
**Stack:** n8n → Claude Haiku 4.5 → 6 платформ

---

## 1. Telegram Bot

1. `/newbot` у @BotFather → получить `TELEGRAM_BOT_TOKEN`
2. Добавить бота в канал как **Admin** с правом публикации
3. Узнать `TELEGRAM_CHANNEL_ID`:
   - Переслать любое сообщение из канала в @userinfobot
   - Или: `https://api.telegram.org/bot{TOKEN}/getUpdates` после подписки

---

## 2. n8n

1. Импортировать `n8n-workflow.json` через **Workflows → Import from file**
2. В n8n **Settings → Variables** добавить все переменные из `.env.example`
3. Создать credential **Telegram API** → вставить `TELEGRAM_BOT_TOKEN`
4. Заменить `REPLACE_WITH_CREDENTIAL_ID` на реальные ID в 3 нодах:
   - `Telegram Trigger`
   - `Post to Telegram Channel`
   - `Reply Success` / `Reply No Video`
5. Активировать workflow (переключатель вверху)

---

## 3. Платформы

### VK
- Создать приложение: https://vk.com/apps?act=manage
- Permissions: `video`, `wall`, `groups`
- Получить `VK_ACCESS_TOKEN` через Implicit Flow
- `VK_OWNER_ID` — ID группы с минусом: `-123456789`

### Instagram (Graph API)
- Нужен **Business** или **Creator** аккаунт
- Создать Facebook App: https://developers.facebook.com
- Permissions: `instagram_content_publish`, `instagram_basic`
- Получить долгоживущий токен (60 дней)
- Добавить **Wait node (30s)** перед `Instagram — Check ID` — видео обрабатывается асинхронно

### TikTok (Content Posting API)
- Нужен **Business** аккаунт с одобренным API доступом
- Подать заявку: https://developers.tiktok.com/products/content-posting-api
- Нода `Post to TikTok` использует `PULL_FROM_URL` — TikTok сам скачает видео с URL
- ⚠️ URL из Telegram (`api.telegram.org/file/bot...`) недоступен публично — нужен CDN

### Likee (через Ayrshare)
- Зарегистрироваться: https://www.ayrshare.com (~$29/мес)
- Подключить Likee аккаунт в дашборде Ayrshare
- Получить `AYRSHARE_API_KEY`

### YouTube
- YouTube требует **бинарную загрузку** видео (OAuth2 + resumable upload)
- Стратегия: добавить **HTTP Request** → скачать видео → **YouTube node** (OAuth2)
- Или использовать `n8n-nodes-base.youtube` с OAuth2 credentials
- В текущем workflow нода YouTube **не включена** — добавить вручную

---

## 4. Публичный URL для видео

TikTok, Instagram и Likee требуют **публично доступный** URL видео.  
Telegram file URL (`api.telegram.org/file/bot{TOKEN}/...`) — приватный.

**Решения:**
- Добавить ноду **HTTP Request (GET binary)** → скачать видео → **S3/Cloudflare R2** upload
- Или использовать **n8n binary data** → upload к CDN → получить публичный URL
- Самый простой вариант: **Cloudflare R2** (бесплатный tier: 10GB/мес)

---

## 5. Тест

1. Отправить видео с подписью боту @Saramudpost_bot
2. Смотреть выполнение в **n8n → Executions**
3. Первый тест запустить в ручном режиме: нажать **Test Workflow** в редакторе

---

## Стоимость

| Сервис          | В месяц |
|----------------|---------|
| n8n self-hosted | $0      |
| Claude Haiku 4.5 | ~$0.25  |
| Ayrshare (Likee) | $29 (опционально) |
| **Итого**       | **~$0.25–29** |
