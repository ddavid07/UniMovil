#!/usr/bin/env python3
"""Create the campus-only EMT transit catalog from an official GTFS ZIP."""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import zipfile
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
BOUNDARY_PATH = ROOT / "apps/mobile/src/features/campus/data/campus-boundary.json"
OUTPUT_PATH = ROOT / "apps/mobile/src/features/campus/data/campus-transit.json"
DATASET_URL = "https://datos.emtmadrid.es/es/dataset/gtfs-de-emtmadrid"
LICENSE_NAME = "Open Data Commons Attribution License"
LICENSE_URL = "https://opendatacommons.org/licenses/by/1-0/"
TIME_ZONE = "Europe/Madrid"


def read_csv(archive: zipfile.ZipFile, filename: str) -> list[dict[str, str]]:
    with archive.open(filename) as resource:
        return list(csv.DictReader(io.TextIOWrapper(resource, encoding="utf-8-sig", newline="")))


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


def parse_gtfs_time(value: str) -> int:
    hours, minutes, seconds = (int(part) for part in value.split(":"))
    return hours * 3600 + minutes * 60 + seconds


def clipped_shapes(
    archive: zipfile.ZipFile,
    shape_ids: set[str],
    boundary: list[list[float]],
) -> dict[str, list[list[list[float]]]]:
    result: dict[str, list[list[list[float]]]] = defaultdict(list)
    if not shape_ids:
        return result

    with archive.open("shapes.txt") as resource:
        rows = csv.DictReader(io.TextIOWrapper(resource, encoding="utf-8-sig", newline=""))
        current_shape = ""
        current_segment: list[list[float]] = []

        def flush() -> None:
            if len(current_segment) >= 2:
                result[current_shape].append(current_segment.copy())
            current_segment.clear()

        for row in rows:
            shape_id = row["shape_id"]
            if shape_id not in shape_ids:
                continue
            if current_shape != shape_id:
                flush()
                current_shape = shape_id
            latitude = float(row["shape_pt_lat"])
            longitude = float(row["shape_pt_lon"])
            if point_in_polygon(latitude, longitude, boundary):
                current_segment.append([longitude, latitude])
            else:
                flush()
        flush()
    return result


def build_dataset(input_path: Path, checked_at: str, updated_at: str) -> dict[str, Any]:
    date.fromisoformat(checked_at)
    boundary_geojson = json.loads(BOUNDARY_PATH.read_text(encoding="utf-8"))
    boundary = boundary_geojson["features"][0]["geometry"]["coordinates"][0]
    boundary_source = boundary_geojson["features"][0]["properties"]["sourceUrl"]

    with zipfile.ZipFile(input_path) as archive:
        routes = {row["route_id"]: row for row in read_csv(archive, "routes.txt")}
        trips = {row["trip_id"]: row for row in read_csv(archive, "trips.txt")}
        stops = {row["stop_id"]: row for row in read_csv(archive, "stops.txt")}
        calendars = read_csv(archive, "calendar.txt")
        calendar_dates = read_csv(archive, "calendar_dates.txt")

        campus_stops = {
            stop_id: stop
            for stop_id, stop in stops.items()
            if point_in_polygon(float(stop["stop_lat"]), float(stop["stop_lon"]), boundary)
        }
        visits_by_trip: dict[str, list[dict[str, str]]] = defaultdict(list)
        with archive.open("stop_times.txt") as resource:
            rows = csv.DictReader(io.TextIOWrapper(resource, encoding="utf-8-sig", newline=""))
            for row in rows:
                if row["stop_id"] in campus_stops and row["trip_id"] in trips:
                    visits_by_trip[row["trip_id"]].append(row)

        relevant_trips = {
            trip_id: trip
            for trip_id, trip in trips.items()
            if trip_id in visits_by_trip
        }
        relevant_route_ids = {trip["route_id"] for trip in relevant_trips.values()}
        relevant_shape_ids = {
            trip["shape_id"]
            for trip in relevant_trips.values()
            if trip.get("shape_id")
        }
        shapes_by_id = clipped_shapes(archive, relevant_shape_ids, boundary)

    patterns_by_route: dict[str, dict[tuple[Any, ...], dict[str, Any]]] = defaultdict(dict)
    for trip_id, trip in relevant_trips.items():
        visits = sorted(
            visits_by_trip[trip_id], key=lambda visit: int(visit["stop_sequence"])
        )
        stop_ids = [visit["stop_id"] for visit in visits]
        shape_id = trip.get("shape_id", "")
        pattern_key = (
            trip.get("direction_id", ""),
            trip.get("trip_headsign", ""),
            shape_id,
            tuple(stop_ids),
        )
        route_patterns = patterns_by_route[trip["route_id"]]
        pattern = route_patterns.setdefault(
            pattern_key,
            {
                "id": f"{trip['route_id']}-{len(route_patterns) + 1}",
                "directionId": trip.get("direction_id", ""),
                "headsign": trip.get("trip_headsign", ""),
                "stopIds": stop_ids,
                "shapeDistances": [
                    float(visit["shape_dist_traveled"])
                    if visit.get("shape_dist_traveled")
                    else None
                    for visit in visits
                ],
                "shapes": shapes_by_id.get(shape_id, []),
                "trips": [],
            },
        )
        pattern["trips"].append(
            {
                "serviceId": trip["service_id"],
                "arrivals": [parse_gtfs_time(visit["arrival_time"]) for visit in visits],
                "departures": [parse_gtfs_time(visit["departure_time"]) for visit in visits],
            }
        )

    lines = []
    referenced_stop_ids: set[str] = set()
    for route_id in sorted(relevant_route_ids):
        route = routes[route_id]
        patterns = sorted(
            patterns_by_route[route_id].values(),
            key=lambda pattern: (pattern["directionId"], pattern["headsign"], pattern["id"]),
        )
        for pattern in patterns:
            pattern["trips"].sort(
                key=lambda trip: (trip["serviceId"], trip["departures"])
            )
            referenced_stop_ids.update(pattern["stopIds"])
        lines.append(
            {
                "id": f"gtfs-route-{route_id}",
                "reference": route["route_short_name"],
                "name": route["route_long_name"],
                "url": route.get("route_url", ""),
                "color": f"#{route.get('route_color') or '0072CE'}",
                "textColor": f"#{route.get('route_text_color') or 'FFFFFF'}",
                "stopIds": sorted(
                    {stop_id for pattern in patterns for stop_id in pattern["stopIds"]}
                ),
                "patterns": patterns,
            }
        )

    transit_stops = []
    for stop_id in sorted(referenced_stop_ids):
        stop = campus_stops[stop_id]
        transit_stops.append(
            {
                "id": stop_id,
                "name": stop["stop_name"],
                "reference": stop.get("stop_code") or stop_id,
                "coordinates": {
                    "latitude": float(stop["stop_lat"]),
                    "longitude": float(stop["stop_lon"]),
                },
                "url": stop.get("stop_url", ""),
            }
        )

    source_hash = hashlib.sha256(input_path.read_bytes()).hexdigest()
    return {
        "source": {
            "name": "EMT Madrid",
            "datasetUrl": DATASET_URL,
            "downloadUrl": "https://datos.emtmadrid.es/dataset/9b23259a-4491-494b-9695-36a7709b2c12/resource/3cba2058-9833-422c-a704-bf992d31d2ee/download/gtfs_emt.zip",
            "license": LICENSE_NAME,
            "licenseUrl": LICENSE_URL,
            "checkedAt": checked_at,
            "updatedAt": updated_at,
            "timeZone": TIME_ZONE,
            "archiveSha256": source_hash,
            "campusBoundarySource": boundary_source,
            "campusBoundaryLicense": "ODbL-1.0",
            "schedulesAreRealtime": False,
        },
        "services": [
            {
                "id": row["service_id"],
                "startDate": row["start_date"],
                "endDate": row["end_date"],
                "weekdays": [
                    row["monday"] == "1",
                    row["tuesday"] == "1",
                    row["wednesday"] == "1",
                    row["thursday"] == "1",
                    row["friday"] == "1",
                    row["saturday"] == "1",
                    row["sunday"] == "1",
                ],
            }
            for row in calendars
        ],
        "serviceExceptions": [
            {
                "serviceId": row["service_id"],
                "date": row["date"],
                "active": row["exception_type"] == "1",
            }
            for row in calendar_dates
        ],
        "lines": lines,
        "stops": transit_stops,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("gtfs_zip", type=Path, help="Path to the downloaded EMT GTFS ZIP")
    parser.add_argument("--checked-at", required=True, help="Date when the source was checked (YYYY-MM-DD)")
    parser.add_argument("--updated-at", required=True, help="Source resource update time (ISO 8601)")
    args = parser.parse_args()
    dataset = build_dataset(args.gtfs_zip, args.checked_at, args.updated_at)
    OUTPUT_PATH.write_text(
        json.dumps(dataset, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {len(dataset['lines'])} lines and {len(dataset['stops'])} campus stops "
        f"to {OUTPUT_PATH}"
    )


if __name__ == "__main__":
    main()
