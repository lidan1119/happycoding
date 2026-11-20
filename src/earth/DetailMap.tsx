import { useEffect, useRef, useState } from "react";
import { circleMarker, map, tileLayer } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Coordinates } from "./trajectory";

const mercatorLimit = 85.05112878;

export default function DetailMap({
  point,
  label,
  zoom,
}: {
  point: Coordinates;
  label: string;
  zoom: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const atPole = Math.abs(point.lat) > mercatorLimit;

  useEffect(() => {
    if (!host.current || atPole) return;
    const location = { lat: point.lat, lng: point.lon };
    const detail = map(host.current, {
      scrollWheelZoom: true,
      zoomAnimation: false,
      fadeAnimation: false,
    }).setView(
      location,
      zoom,
    );
    const layer = tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    });
    layer.on("tileerror", () => setUnavailable(true));
    layer.on("tileload", () => setUnavailable(false));
    layer.addTo(detail);
    circleMarker(location, {
      radius: 9,
      color: "#242319",
      weight: 2,
      fillColor: "#ffe1a7",
      fillOpacity: 1,
    }).addTo(detail);
    const observer = new ResizeObserver(() => detail.invalidateSize({ pan: false }));
    observer.observe(host.current);
    return () => {
      observer.disconnect();
      detail.remove();
    };
  }, [atPole, point.lat, point.lon, zoom]);

  if (atPole) {
    return (
      <p className="map-message">
        街道地图的投影无法显示该极地坐标，请在 3D 地球上查看。
      </p>
    );
  }
  return (
    <>
      <div className="street-map" ref={host} aria-label={`${label}周边地图`} />
      {unavailable && (
        <p className="map-message" role="status">
          部分地图图块未加载，可以尝试缩放或在 OpenStreetMap 打开。
        </p>
      )}
    </>
  );
}
