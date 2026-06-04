# Video Autopublish Bot — Setup (MVP)

**Бот:** @Saramudpost_bot
**Стек:** n8n (self-hosted) → Claude Haiku 4.5 → 5 площадок + сайт
**Бюджет:** $0/мес (только Claude ~$0.25/мес за токены)

## Что в MVP

| Площадка | Способ | Ключи |
|----------|--------|-------|
| Telegram-канал | Bot API напрямую | `$env` |
| VK | Official API (`video.save`+`wall.post`) | `$env` |
| YouTube | Data API v3 (бинарная загрузка) | n8n OAuth2 |
| LinkedIn | UGC API (шара YouTube-ссылки) | `$env` |
| Reddit | API (link-пост на YouTube) | `$env` + Basic Auth |
| **Сайт saramudvlad.ru** | Claude → HTML → GitHub API | `$env` |

> Фаза 2 (после аудита/ревью): Instagram, TikTok. Likee — без API, вне проекта.

---

## Поток

```
TG-бот → Webhook → есть видео? →
  getFile → Claude (тексты + статья) →
  скачать видео → YouTube upload → videoId →
    ├─ Telegram-канал  (видео по file_id + ссылка на YT)
    ├─ VK              (video.save + wall.post)
    ├─ LinkedIn        (шара YT-ссылки)
    ├─ Reddit          (link-пост на YT)
    └─ Сайт            (Claude-HTML + iframe YT → коммит в /video/<slug>/
                        + обновление videos.json) → ответ автору
```

YouTube идёт первым: его `videoId` нужен сайту (iframe), VK, LinkedIn и Reddit (ссылка).

---

## 1. Прокинуть env в процесс n8n

Не в UI Variables, а в окружение процесса (иначе `$env` не виден в выражениях):
- **Docker:** `env_file: bot/.env` в `docker-compose.yml`
- **systemd/PM2:** `Environment=` или `.env`
- Флаг по умолчанию открыт: `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`

Заполнить значения из `.env.example`.

## 2. Импорт workflow

1. **Workflows → Import from file** → `bot/n8n-workflow.json`
2. Заменить плейсхолдеры credential-ов (их всего 2, см. ниже):
   - `REPLACE_WITH_YOUTUBE_OAUTH_CREDENTIAL`
   - `REPLACE_WITH_REDDIT_BASIC_AUTH`
3. Активировать → скопировать **Production Webhook URL** нода `Telegram Webhook`
4. Зарегистрировать вебхук (токен из env, в n8n не хранится):
   ```bash
   curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=https://<n8n-host>/webhook/saramudpost-telegram"
   ```

---

## 3. Площадки

### Telegram
- `/newbot` у @BotFather → `TELEGRAM_BOT_TOKEN`
- Бот → админ канала с правом постинга. `TELEGRAM_CHANNEL_ID` = `@канал` или `-100…`

### VK
- Приложение: https://vk.com/apps?act=manage, scopes `video`, `wall`, `groups`
- `VK_ACCESS_TOKEN` (Implicit Flow), `VK_OWNER_ID` = id сообщества с минусом

### YouTube (единственный OAuth2)
- Google Cloud Console → включить **YouTube Data API v3**
- OAuth-клиент (Desktop/Web) → в n8n **Credentials → YouTube OAuth2 API** пройти авторизацию
- Токен живёт 1 час с авто-рефрешем — поэтому его нельзя положить в env, нужен n8n credential
- Привязать этот credential к ноде `YouTube Upload`

### LinkedIn
- App: https://developer.linkedin.com → продукты «Share on LinkedIn» + «Sign In»
- Scope `w_member_social`. Токен (~60 дней) → `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_AUTHOR_URN` = `urn:li:person:<id>` (или `urn:li:organization:<id>`)
- ⚠️ Токен истекает раз в 60 дней — обновлять вручную или добавить refresh-ноду

### Reddit
- https://www.reddit.com/prefs/apps → создать app типа **script**
- `client_id` + `secret` → в n8n **Credentials → Basic Auth** (нода `Reddit — Get Token`)
- `REDDIT_USERNAME` / `REDDIT_PASSWORD` / `REDDIT_SUBREDDIT` → env
- ⚠️ Проверь правила сабреддита (многие запрещают самопромо/ссылки)

### Сайт saramudvlad.ru (GitHub API)
- PAT (fine-grained) со scope **Contents: Read and write** на репо
- `GITHUB_TOKEN`, `GITHUB_REPO=vladsaram/vladsaram.github.io`, `GITHUB_BRANCH=main`
- n8n коммитит `/video/<slug>/index.html` и обновляет `videos.json` → GitHub Pages деплоит сам
- Раздел уже создан: `/video/` (сетка) + `videos.json` + пример страницы

---

## 4. Тест

1. **Сначала вручную:** в редакторе n8n кнопка **Test Workflow**, отправить тестовое видео боту
2. Смотреть **Executions** — где упало
3. Проверить порядок: YouTube должен отдать `id` до сайта/VK/LinkedIn/Reddit
4. На сайте: дождаться деплоя GitHub Pages (~1 мин), открыть `/video/`

---

## Частые грабли

- **Сайт:** видео встраивается как **YouTube-iframe**, отдельный хостинг файла не нужен
- **YouTube квота:** Data API даёт ~6 загрузок/день на дефолтной квоте — для потока запросить увеличение
- **LinkedIn 60 дней:** токен протухает, заложить обновление
- **Reddit User-Agent:** обязателен уникальный, иначе 429
- **GitHub `videos.json`:** PUT требует актуальный `sha` — нода `Get videos.json` его берёт прямо перед коммитом
