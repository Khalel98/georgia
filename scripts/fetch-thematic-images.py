#!/usr/bin/env python3
"""Поиск и скачивание тематических фото с Wikimedia Commons по запросам."""
from __future__ import annotations

import json
import os
import ssl
import time
import urllib.parse
import urllib.request

OUT_DIR = "/Users/khalel/Desktop/грузия/places"
UA = "GeorgiaTripSchedule/1.0 (educational)"

# (локальный slug, поисковый запрос на Commons)
QUERIES: list[tuple[str, str]] = [
    ("kutaisi-airport", "Kutaisi International Airport"),
    ("road-cafe-georgia", "Georgian cuisine khinkali"),
    ("tbilisi-houses", "Tbilisi old town houses"),
    ("peace-bridge", "Bridge of Peace Tbilisi"),
    ("kartlis-deda", "Kartlis Deda Tbilisi"),
    ("old-tbilisi", "Old Tbilisi Abanotubani"),
    ("breakfast-table", "breakfast table food"),
    ("chronicle-georgia", "Chronicle of Georgia Tbilisi"),
    ("jvari", "Jvari monastery Mtskheta"),
    ("mtskheta-svetitskhoveli", "Svetitskhoveli cathedral"),
    ("georgian-road", "Georgia country road mountains"),
    ("borjomi-park", "Borjomi Central Park"),
    ("borjomi-town", "Borjomi Georgia town"),
    ("night-driving", "highway at night lights"),
    ("batumi-boulevard", "Batumi boulevard sea"),
    ("makhuntseti", "Makhuntseti waterfall"),
    ("waterfall-georgia", "waterfall Adjara Georgia"),
    ("ali-nino", "Ali and Nino Batumi"),
    ("batumi-yacht-sea", "Batumi Black Sea coast"),
    ("canteen-food", "cafeteria food tray"),
    ("batumi-night", "Batumi night lights"),
    ("batumi-piazza", "Batumi Piazza square"),
    ("batumi-shopping-day", "Batumi old town"),
    ("hopa-bazaar", "outdoor market clothes bazaar"),
    ("mall-interior", "shopping mall interior"),
    ("europe-square-batumi", "Europe Square Batumi"),
    ("turkish-food", "Turkish restaurant food meze"),
    ("batumi-botanical", "Batumi Botanical Garden"),
    ("fish-dish", "grilled fish plate"),
    ("farmers-market", "vegetable market stall"),
    ("batumi-relax", "Batumi seaside promenade"),
    ("alphabet-tower", "Batumi Alphabet Tower"),
    ("ukrainian-borscht", "borscht soup bowl"),
    ("georgia-highway-coast", "Georgia road Adjara"),
    ("kutaisi-center", "Kutaisi city Georgia"),
    ("kutaisi-bar-street", "Kutaisi night"),
    ("white-bridge-kutaisi", "White Bridge Kutaisi"),
    ("prometheus-cave", "Prometheus Cave Georgia"),
    ("khinkali-plate", "Khinkali Georgian dumplings"),
    ("martvili-canyon", "Martvili canyon Georgia"),
    ("georgian-restaurant", "Georgian restaurant table wine"),
    ("airport-departure", "airport terminal check-in"),
]


def commons_search_file(title_snippet: str) -> str | None:
    q = urllib.parse.urlencode(
        {
            "action": "query",
            "list": "search",
            "srsearch": title_snippet,
            "srnamespace": "6",
            "srlimit": "3",
            "format": "json",
        }
    )
    url = "https://commons.wikimedia.org/w/api.php?" + q
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx, timeout=45) as r:
        data = json.loads(r.read().decode())
    hits = data.get("query", {}).get("search", [])
    if not hits:
        return None
    return hits[0]["title"]


def file_thumb_url(file_title: str) -> str | None:
    q = urllib.parse.urlencode(
        {
            "action": "query",
            "titles": file_title,
            "prop": "imageinfo",
            "iiprop": "url",
            "iiurlwidth": "1200",
            "format": "json",
        }
    )
    url = "https://commons.wikimedia.org/w/api.php?" + q
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx, timeout=45) as r:
        data = json.loads(r.read().decode())
    pages = data.get("query", {}).get("pages", {})
    for _pid, page in pages.items():
        if "missing" in page:
            return None
        ii = page.get("imageinfo", [{}])[0]
        return ii.get("thumburl") or ii.get("url")
    return None


def download(url: str, path: str) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx, timeout=120) as r:
        body = r.read()
    if len(body) < 800:
        return False
    with open(path, "wb") as f:
        f.write(body)
    return True


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    ok = 0
    for slug, query in QUERIES:
        out = os.path.join(OUT_DIR, slug + ".jpg")
        if os.path.isfile(out) and os.path.getsize(out) > 800:
            print("exists", slug)
            ok += 1
            continue
        print("search:", query, flush=True)
        title = commons_search_file(query)
        time.sleep(1.2)
        if not title:
            print("  no hit", slug)
            continue
        thumb = file_thumb_url(title)
        time.sleep(1.2)
        if not thumb:
            print("  no thumb", title)
            continue
        try:
            if download(thumb, out):
                print("  OK", slug, "<-", title[:50])
                ok += 1
            else:
                print("  small file", slug)
        except Exception as e:
            print("  ERR", slug, e)
        time.sleep(2.0)
    print("Downloaded/found", ok, "of", len(QUERIES))


if __name__ == "__main__":
    main()
