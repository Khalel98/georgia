#!/usr/bin/env bash
# Загрузка треков с Internet Archive: The Rustavi Choir — Georgian Voices
# (если archive.org отвечает). Сохраните в audio/music/ и добавьте в music-data.js.
# Проверьте лицензию использования в вашей юрисдикции.
set -euo pipefail
BASE="https://archive.org/download/the-rustavi-choir-georgian-voices"
OUT="$(dirname "$0")/../audio/music"
mkdir -p "$OUT"
UA="Mozilla/5.0 (compatible; GruziaTrip/1.0)"
# Имена файлов на IA могут отличаться — смотрите список на странице альбома.
for pair in \
  "Orovela.mp3:rustavi_orovela.mp3" \
  "Mival%20Guriashi.mp3:rustavi_mival_guriashi.mp3" \
  "Sabodisho.mp3:rustavi_sabodisho.mp3"; do
  src="${pair%%:*}"
  dst="${pair##*:}"
  echo "GET $src -> $dst"
  curl -fL -A "$UA" --connect-timeout 30 --max-time 300 "$BASE/$src" -o "$OUT/$dst" || echo "  (пропуск)"
done
echo "Дальше: ffmpeg -i ВХОД.mp3 -codec:a libmp3lame -b:a 48k -ac 1 ВЫХОД.mp3"
