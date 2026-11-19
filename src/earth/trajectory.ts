export type Coordinates = { lat: number; lon: number };
export type Origin = Coordinates & { name?: string };
export const beijing = { lat: 39.9042, lon: 116.4074, name: "北京" };

export function wrapLongitude(lon: number) {
  return ((((lon + 180) % 360) + 360) % 360) - 180;
}

export function antipode({ lat, lon }: Coordinates): Coordinates {
  return { lat: -lat, lon: wrapLongitude(lon + 180) };
}

export function parseCoordinates(
  latText: string,
  lonText: string,
): Coordinates | null {
  if (!latText.trim() || !lonText.trim()) return null;
  const lat = Number(latText),
    lon = Number(lonText);
  return Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
    ? { lat, lon: wrapLongitude(lon) }
    : null;
}

export function fromLink(search: string): Origin | null {
  const params = new URLSearchParams(search);
  const coords = parseCoordinates(
    params.get("lat") ?? "",
    params.get("lon") ?? "",
  );
  return coords
    ? { ...coords, name: params.get("from")?.trim().slice(0, 70) || undefined }
    : null;
}

export const duration = 5100;
