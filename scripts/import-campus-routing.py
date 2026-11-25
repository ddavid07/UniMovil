#!/usr/bin/env python3
"""Build the pedestrian routing graph from an OpenStreetMap map XML extract."""

from __future__ import annotations

import argparse
import json
import time
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlencode


ROOT = Path(__file__).resolve().parents[1]
BOUNDARY_PATH = ROOT / "apps/mobile/src/features/campus/data/campus-boundary.json"
OUTPUT_PATH = ROOT / "apps/mobile/src/features/campus/data/campus-routing-network.json"
OSM_MAP_API = "https://api.openstreetmap.org/api/0.6/map"
LICENSE = "ODbL-1.0"
PROPERTY_KEYS = ("highway", "name", "surface", "foot", "access", "lit", "incline")


def point_in_polygon(latitude: float, longitude: float, ring: list[list[float]]) -> bool:
    inside = False
    previous = ring[-1]
    for current in ring:
        x1, y1 = current
        x2, y2 = previous
        if (y1 > latitude) != (y2 > latitude):
            crossing = (x2 - x1) * (latitude - y1) / (y2 - y1) + x1
            if longitude < crossing:
                inside = not inside
        previous = current
    return inside


def download_map_extract(ring: list[list[float]]) -> ET.Element:
    west = min(point[0] for point in ring)
    south = min(point[1] for point in ring)
    east = max(point[0] for point in ring)
    north = max(point[1] for point in ring)
    columns = 4
    rows = 4
    merged = ET.Element("osm", {"version": "0.6", "generator": "UniMovil campus graph importer"})
    entities: dict[tuple[str, str], ET.Element] = {}

    for column in range(columns):
        tile_west = west + (east - west) * column / columns
        tile_east = west + (east - west) * (column + 1) / columns
        for row in range(rows):
            tile_south = south + (north - south) * row / rows
            tile_north = south + (north - south) * (row + 1) / rows
            query = urlencode({"bbox": f"{tile_west},{tile_south},{tile_east},{tile_north}"})
            request = urllib.request.Request(
                f"{OSM_MAP_API}?{query}",
                headers={"User-Agent": "UniMovil/0.1 campus graph importer"},
            )
            with urllib.request.urlopen(request, timeout=90) as response:
                root = ET.fromstring(response.read())
            for element in root:
                if element.tag not in {"node", "way"}:
                    continue
                entity_id = element.get("id")
                if not entity_id:
                    continue
                key = (element.tag, entity_id)
                previous = entities.get(key)
                if previous is None or int(element.get("version", "0")) > int(
                    previous.get("version", "0")
                ):
                    entities[key] = element
            time.sleep(1)

    for (kind, _), element in sorted(
        entities.items(), key=lambda item: (item[0][0], int(item[0][1]))
    ):
        merged.append(element)
    return merged


def build_network(osm_root: ET.Element, checked_at: str) -> dict[str, object]:
    boundary_geojson = json.loads(BOUNDARY_PATH.read_text(encoding="utf-8"))
    feature = boundary_geojson["features"][0]
    ring = feature["geometry"]["coordinates"][0]
    west = min(point[0] for point in ring)
    south = min(point[1] for point in ring)
    east = max(point[0] for point in ring)
    north = max(point[1] for point in ring)
    query = urlencode({"bbox": f"{west},{south},{east},{north}"})
    source_url = f"{OSM_MAP_API}?{query}"

    all_nodes: dict[str, dict[str, object]] = {}
    for element in osm_root.findall("node"):
        node_id = element.get("id")
        latitude = element.get("lat")
        longitude = element.get("lon")
        if node_id is None or latitude is None or longitude is None:
            continue
        coordinate = {"id": node_id, "latitude": float(latitude), "longitude": float(longitude)}
        if point_in_polygon(coordinate["latitude"], coordinate["longitude"], ring):
            all_nodes[node_id] = coordinate

    ways: list[dict[str, object]] = []
    referenced_node_ids: set[str] = set()
    for element in osm_root.findall("way"):
        tags = {tag.get("k"): tag.get("v") for tag in element.findall("tag")}
        if not tags.get("highway"):
            continue
        properties = {key: tags[key] for key in PROPERTY_KEYS if tags.get(key) is not None}
        nodes = [nd.get("ref") for nd in element.findall("nd")]
        segment: list[str] = []

        def append_segment() -> None:
            if len(segment) < 2:
                segment.clear()
                return
            ways.append(
                {
                    "id": element.get("id", ""),
                    "version": element.get("version", ""),
                    "updatedAt": element.get("timestamp", ""),
                    "properties": properties,
                    "nodes": segment.copy(),
                }
            )
            referenced_node_ids.update(segment)
            segment.clear()

        for node_id in nodes:
            if node_id is not None and node_id in all_nodes:
                segment.append(node_id)
            else:
                append_segment()
        append_segment()

    nodes = [all_nodes[node_id] for node_id in sorted(referenced_node_ids, key=int)]
    return {
        "source": {
            "source": "OpenStreetMap contributors",
            "url": source_url,
            "license": LICENSE,
            "checkedAt": checked_at,
            "campusBoundarySource": feature["properties"]["sourceUrl"],
        },
        "nodes": nodes,
        "ways": ways,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "osm_xml",
        type=Path,
        nargs="?",
        help="OpenStreetMap map API XML extract; download a tiled snapshot when omitted",
    )
    parser.add_argument("--checked-at", required=True, help="Source check date (YYYY-MM-DD)")
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH, help="Output JSON path")
    args = parser.parse_args()
    boundary_geojson = json.loads(BOUNDARY_PATH.read_text(encoding="utf-8"))
    ring = boundary_geojson["features"][0]["geometry"]["coordinates"][0]
    osm_root = (
        ET.parse(args.osm_xml).getroot()
        if args.osm_xml
        else download_map_extract(ring)
    )
    network = build_network(osm_root, args.checked_at)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(network, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {len(network['nodes'])} nodes and {len(network['ways'])} walkable ways "
        f"to {args.output}"
    )


if __name__ == "__main__":
    main()
