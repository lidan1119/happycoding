import { Vector3, type PerspectiveCamera } from "three";
import { direction, type City } from "./geography";

export function cityPositions(cities: City[]) {
  return cities.map(([name, , , lon, lat]) => ({
    name,
    position: direction({ lat, lon }),
  }));
}

export function drawGlobeLabels(
  layer: HTMLElement,
  camera: PerspectiveCamera,
  locations: ReturnType<typeof cityPositions>,
  focus: { name: string; position: Vector3 },
  zoom: number,
  width: number,
  height: number,
) {
  if (zoom < 1) {
    layer.replaceChildren();
    return;
  }
  const projected = new Vector3();
  const positions: { x: number; y: number }[] = [];
  const labels = document.createDocumentFragment();
  const limit = zoom < 1.4 ? 8 : 13;

  for (const { name, position } of [focus, ...locations]) {
    if (position !== focus.position && name === focus.name) continue;
    // The surface point faces the camera only when it is above the horizon.
    if (position.dot(camera.position) <= 1.01) continue;
    projected.copy(position).project(camera);
    const x = ((projected.x + 1) * width) / 2;
    const y = ((1 - projected.y) * height) / 2;
    if (
      x < (width < 720 ? 16 : width * 0.39) ||
      x > width - 86 ||
      y < 85 ||
      y > height - 26
    )
      continue;
    if (
      positions.some(
        (other) => Math.abs(x - other.x) < 84 && Math.abs(y - other.y) < 25,
      )
    )
      continue;
    positions.push({ x, y });
    const label = document.createElement("span");
    label.textContent = name;
    if (position === focus.position) label.className = "globe-focus";
    label.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    labels.append(label);
    if (positions.length >= limit) break;
  }
  layer.replaceChildren(labels);
}
