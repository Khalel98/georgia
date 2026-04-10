#!/usr/bin/env python3
"""Тематические фото через Unsplash napi → папка places/ (без premium)."""
from __future__ import annotations

import json
import ssl
import time
import urllib.parse
import urllib.request

OUT = "/Users/khalel/Desktop/грузия/places"
UA = "Mozilla/5.0 (compatible; GeorgiaTrip/1.0; +local)"

# ключ: (файл без .jpg, поисковый запрос)
QUERIES: list[tuple[str, str]] = [
    ("borjomi-park-u", "borjomi park georgia mineral water"),
    ("borjomi-town-u", "borjomi georgia town street"),
    ("makhuntseti-u", "waterfall georgia adjara mountains"),
    ("waterfall-cafe-u", "waterfall restaurant terrace"),
    ("ali-nino-u", "Ali and Nino statue Batumi"),
    ("batumi-sea-u", "Batumi black sea beach promenade"),
    ("batumi-night-u", "Batumi night city lights"),
    ("batumi-piazza-u", "Batumi Piazza square"),
    ("batumi-botanical-u", "Batumi botanical garden subtropical"),
    ("alphabet-tower-u", "Batumi alphabet tower"),
    ("ferris-wheel-sea-u", "ferris wheel seaside promenade"),
    ("outdoor-bazaar-u", "outdoor clothing market bazaar"),
    ("shopping-mall-u", "shopping mall interior modern"),
    ("europe-square-u", "Batumi modern architecture square"),
    ("turkish-meal-u", "turkish restaurant meze table"),
    ("fish-dinner-u", "grilled fish plate restaurant"),
    ("produce-market-u", "vegetable market stall colorful"),
    ("ukrainian-borscht-u", "borscht soup bowl"),
    ("georgian-feast-u", "Georgian supra wine table food"),
    ("mountain-road-u", "caucasus mountain road georgia"),
    ("night-highway-u", "highway car lights night"),
    ("kutaisi-city-u", "Kutaisi Georgia city"),
    ("kutaisi-nightlife-u", "Kutaisi Georgia evening"),
    ("white-bridge-u", "pedestrian bridge river city europe"),
    ("prometheus-cave-u", "cave stalactites tourist lights"),
    ("martvili-u", "canyon boat turquoise water"),
    ("khinkali-closeup-u", "khinkali dumplings georgian food"),
    ("airport-terminal-u", "airport terminal departure hall"),
    ("hotel-checkin-u", "hotel room luggage travel"),
    ("canteen-tray-u", "cafeteria tray lunch"),
    ("tbilisi-apartment-u", "Tbilisi residential balcony view"),
]


def napi_first_free_url(query: str) -> str | None:
    q = urllib.parse.urlencode({"query": query, "per_page": "15", "xp": ""})
    url = "https://unsplash.com/napi/search/photos?" + q
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx, timeout=45) as r:
        data = json.loads(r.read().decode())
    for item in data.get("results", []):
        u = item.get("urls", {}).get("full") or item.get("urls", {}).get("regular")
        if not u:
            continue
        if "plus.unsplash.com" in u:
            continue
        if "&w=" in u:
            base = u.split("&w=")[0]
            return base + "&w=1200&q=82&auto=format&fit=crop"
        return u + ("&" if "?" in u else "?") + "w=1200&q=82&auto=format&fit=crop"
    return None


def download(url: str, path: str) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx, timeout=90) as r:
        body = r.read()
    if len(body) < 2000:
        return False
    with open(path, "wb") as f:
        f.write(body)
    return True


def main() -> None:
    import os

    os.makedirs(OUT, exist_ok=True)
    for slug, query in QUERIES:
        path = os.path.join(OUT, slug + ".jpg")
        if os.path.isfile(path) and os.path.getsize(path) > 2000:
            print("skip", slug)
            continue
        print("search:", query, flush=True)
        u = napi_first_free_url(query)
        time.sleep(0.6)
        if not u:
            print("  no url", slug)
            continue
        try:
            if download(u, path):
                print("  OK", slug)
            else:
                print("  small", slug)
        except Exception as e:
            print("  ERR", slug, e)
        time.sleep(0.8)
    print("done")


if __name__ == "__main__":
    main()
