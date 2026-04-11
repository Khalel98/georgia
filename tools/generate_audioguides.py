#!/usr/bin/env python3
"""Генерация MP3 аудиогидов через edge-tts (нейросеть Microsoft, бесплатно). Требует: .venv-tts с edge-tts."""
import asyncio
import pathlib
import sys

try:
    import edge_tts
except ImportError:
    print("Установите: python3 -m venv .venv-tts && . .venv-tts/bin/activate && pip install edge-tts")
    sys.exit(1)

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "audio" / "places" / "scripts"
OUT = ROOT / "audio" / "places"
VOICE = "ru-RU-SvetlanaNeural"
RATE = "-5%"

FILES = [
    "tbilisi_evening",
    "mtskheta",
    "borjomi",
    "batumi_night",
    "batumi_nature",
    "martvili",
    "prometheus",
    "kutaisi",
]


async def synth(name: str) -> None:
    txt_path = SCRIPTS / f"{name}.txt"
    if not txt_path.is_file():
        raise FileNotFoundError(txt_path)
    text = txt_path.read_text(encoding="utf-8").strip()
    if not text:
        raise ValueError(f"Пустой файл: {txt_path}")
    out_mp3 = OUT / f"{name}.mp3"
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(str(out_mp3))
    print(f"OK {out_mp3.name} ({len(text)} символов)")


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        await synth(name)
    print("Готово. Проверьте длительность: ffprobe -i FILE -show_entries format=duration -v quiet -of csv=p=0")


if __name__ == "__main__":
    asyncio.run(main())
