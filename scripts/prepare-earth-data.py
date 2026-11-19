"""Compact the Natural Earth v5.1.2 1:50m GeoJSON downloads into public/earth."""
import json
import sys
from pathlib import Path


source = Path(sys.argv[1])
target = Path(__file__).resolve().parents[1] / "public" / "earth"


def features(layer):
    return json.loads((source / f"{layer}.json").read_text())["features"]


def points(coords):
    return [[round(x, 4), round(y, 4)] for x, y, *_ in coords]


def write(filename, data):
    (target / filename).write_text(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


cities = []
for feature in features("ne_50m_populated_places"):
    props = feature["properties"]
    english = props["NAME"]
    chinese = props.get("NAME_ZH") or english
    if english and feature["geometry"]["type"] == "Point":
        cities.append([
            chinese, english, props["ADM0NAME"],
            *points([feature["geometry"]["coordinates"]])[0],
            props["POP_MAX"] or 0,
        ])
write("cities.json", sorted(cities, key=lambda city: -city[-1]))

countries = []
for feature in features("ne_50m_admin_0_countries"):
    props, geometry = feature["properties"], feature["geometry"]
    polygons = geometry["coordinates"]
    if geometry["type"] == "Polygon":
        polygons = [polygons]
    countries.append([props.get("NAME_ZH") or props["NAME"], [[points(ring) for ring in polygon] for polygon in polygons]])

coast = []
for feature in features("ne_50m_coastline"):
    geometry = feature["geometry"]
    lines = geometry["coordinates"] if geometry["type"] == "MultiLineString" else [geometry["coordinates"]]
    coast.extend(points(line) for line in lines)
write("geography.json", {"countries": countries, "coast": coast})
