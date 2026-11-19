import { Vector3 } from "three";
import type { Coordinates } from "./trajectory.ts";

type Point = [lon: number, lat: number];
type Polygon = Point[][];
export type Geography = {
  countries: [name: string, polygons: Polygon[]][];
  coast: Point[][];
};
export type City = [
  name: string,
  english: string,
  country: string,
  lon: number,
  lat: number,
  population: number,
];

export function direction({ lat, lon }: Coordinates) {
  const phi = (lat * Math.PI) / 180;
  const theta = (lon * Math.PI) / 180;
  return new Vector3(
    Math.cos(phi) * Math.cos(theta),
    Math.sin(phi),
    -Math.cos(phi) * Math.sin(theta),
  );
}

export function coordinatesOf(point: Vector3): Coordinates {
  return {
    lat: (Math.asin(Math.max(-1, Math.min(1, point.y))) * 180) / Math.PI,
    lon: (Math.atan2(-point.z, point.x) * 180) / Math.PI,
  };
}

function inRing({ lat, lon }: Coordinates, ring: Point[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x, y] = ring[i],
      [prevX, prevY] = ring[j];
    if (
      y > lat !== prevY > lat &&
      lon < ((prevX - x) * (lat - y)) / (prevY - y) + x
    )
      inside = !inside;
  }
  return inside;
}

export function countryAt(
  data: Geography,
  point: Coordinates,
): string | undefined {
  // The Natural Earth Antarctica outline ends just short of the mathematical pole.
  const sample = {lat: Math.max(-89.99, Math.min(89.99, point.lat)), lon: point.lon};
  return data.countries.find(([, polygons]) =>
    polygons.some(
      ([outer, ...holes]) =>
        inRing(sample, outer) && holes.every((hole) => !inRing(sample, hole)),
    ),
  )?.[0];
}

export function nearestCoast(data: Geography, target: Coordinates) {
  const here = direction(target);
  const normal = new Vector3(),
    projection = new Vector3(),
    cross = new Vector3();
  let bestDot = -Infinity;
  const best = new Vector3();
  function candidate(vector: Vector3) {
    const score = here.dot(vector);
    if (score > bestDot) {
      bestDot = score;
      best.copy(vector);
    }
  }
  for (const line of data.coast) {
    let previous: Vector3 | undefined;
    for (const [lon, lat] of line) {
      const next = direction({ lat, lon });
      candidate(next);
      if (previous) {
        // The foot of the perpendicular is valid only on the short spherical arc.
        normal.crossVectors(previous, next);
        if (normal.lengthSq() > 1e-20) {
          normal.normalize();
          projection.copy(here).addScaledVector(normal, -here.dot(normal));
          if (projection.lengthSq() > 1e-20) {
            projection.normalize();
            if (
              cross.crossVectors(previous, projection).dot(normal) >= 0 &&
              cross.crossVectors(projection, next).dot(normal) >= 0
            )
              candidate(projection);
          }
        }
      }
      previous = next;
    }
  }
  if (!Number.isFinite(bestDot)) return null;
  return {
    point: coordinatesOf(best),
    km: Math.acos(Math.min(1, Math.max(-1, bestDot))) * 6371.0088,
  };
}
