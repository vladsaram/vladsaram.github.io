#!/usr/bin/env bash
# IndexNow ping для saramudvlad.ru (Яндекс + Bing).
# Использование: ./indexnow.sh URL [URL ...]
# Без аргументов пингует список по умолчанию (новые/изменённые страницы).
set -euo pipefail

HOST="saramudvlad.ru"
KEY="46717115505b5a7cd436168958f2d55e"
KEY_LOCATION="https://${HOST}/${KEY}.txt"

if [ "$#" -gt 0 ]; then
  URLS=("$@")
else
  URLS=(
    "https://saramudvlad.ru/"
    "https://saramudvlad.ru/blog/"
    "https://saramudvlad.ru/neyroseti-dlya-kontenta/"
    "https://saramudvlad.ru/about/"
    "https://saramudvlad.ru/articles/neyroseti-dlya-video-2026/"
    "https://saramudvlad.ru/articles/neyroset-dlya-reels-2026/"
  )
fi

# Собираем JSON-массив urlList
LIST=$(printf '"%s",' "${URLS[@]}")
LIST="[${LIST%,}]"

BODY=$(cat <<JSON
{"host":"${HOST}","key":"${KEY}","keyLocation":"${KEY_LOCATION}","urlList":${LIST}}
JSON
)

echo "Отправляю ${#URLS[@]} URL в IndexNow…"
for ENDPOINT in "https://yandex.com/indexnow" "https://api.indexnow.org/indexnow"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$ENDPOINT" \
    -H "Content-Type: application/json; charset=utf-8" \
    --data "$BODY")
  echo "  ${ENDPOINT} -> HTTP ${CODE}"
done
echo "Готово. (200/202 = принято)"
