import { useEffect, useMemo, useRef, useState } from "react";
import {
  canvas,
  circleMarker,
  layerGroup,
  map,
  polygon,
  tileLayer,
  type Map as LeafletMap,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { direction, type City, type Geography } from "./geography";
import type { Coordinates } from "./trajectory";

const mercatorLimit = 85.05112878;

export default function DetailMap({
  point,
  label,
  zoom,
  cities,
  geography,
}: {
  point: Coordinates;
  label: string;
  zoom: number;
  cities: City[];
  geography: Geography | null;
}) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [localMap, setLocalMap] = useState(true);
  const [loading, setLoading] = useState(true);
  const atPole = Math.abs(point.lat) > mercatorLimit;
  const nearest = useMemo(() => {
    const origin = direction(point);
    return cities
      .map((city) => {
        const [, , , lon, lat] = city;
        const distance =
          Math.acos(
            Math.min(1, Math.max(-1, origin.dot(direction({ lat, lon })))),
          ) * 6371;
        return { city, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [cities, point]);

  useEffect(() => {
    if (!host.current || atPole) return;
    const location = { lat: point.lat, lng: point.lon };
    const detail = map(host.current, {
      scrollWheelZoom: true,
      zoomAnimation: false,
      fadeAnimation: false,
    }).setView(location, zoom);
    mapRef.current = detail;
    const background = detail.createPane("local-land");
    background.style.zIndex = "190";
    background.style.pointerEvents = "none";
    const layer = tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    });
    let successful = false;
    let failed = false;
    layer.on("loading", () => {
      successful = failed = false;
    });
    layer.on("tileload", () => {
      successful = true;
    });
    layer.on("tileerror", () => {
      failed = true;
    });
    layer.on("load", () => {
      setLocalMap(!successful || failed);
      setLoading(false);
    });
    layer.addTo(detail);
    const timeout = setTimeout(() => setLoading(false), 4000);
    circleMarker(location, {
      radius: 9,
      color: "#242319",
      weight: 2,
      fillColor: "#ffe1a7",
      fillOpacity: 1,
    }).addTo(detail);
    const observer = new ResizeObserver(() =>
      detail.invalidateSize({ pan: false }),
    );
    observer.observe(host.current);
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
      mapRef.current = null;
      detail.remove();
    };
  }, [atPole, point.lat, point.lon, zoom]);

  useEffect(() => {
    const detail = mapRef.current;
    if (!detail || !geography) return;
    const renderer = canvas({ pane: "local-land" });
    const land = layerGroup(
      geography.countries.flatMap(([, polygons]) =>
        polygons.map((rings) =>
          polygon(
            rings.map((ring) => ring.map(([lon, lat]) => ({ lat, lng: lon }))),
            {
              renderer,
              interactive: false,
              color: "#69795c",
              weight: 0.7,
              fillColor: "#b7c49b",
              fillOpacity: 1,
            },
          ),
        ),
      ),
    ).addTo(detail);
    return () => {
      if (mapRef.current === detail) {
        land.remove();
        renderer.remove();
      }
    };
  }, [geography, atPole, point.lat, point.lon, zoom]);

  useEffect(() => {
    const detail = mapRef.current;
    if (!detail || !localMap) return;
    const markers = layerGroup().addTo(detail);
    function update() {
      if (!detail) return;
      markers.clearLayers();
      const bounds = detail.getBounds();
      const visible = cities
        .filter(([, , , lon, lat]) => bounds.contains([lat, lon]))
        .slice(0, 16);
      for (const [name, , , lon, lat] of visible) {
        const caption = document.createElement("span");
        caption.textContent = name;
        circleMarker([lat, lon], {
          radius: 3,
          color: "#213320",
          fillOpacity: 1,
          interactive: false,
        })
          .bindTooltip(caption, {
            permanent: true,
            direction: "right",
            opacity: 1,
            className: "local-place-name",
          })
          .addTo(markers);
      }
    }
    update();
    detail.on("moveend", update);
    return () => {
      detail.off("moveend", update);
      if (mapRef.current === detail) markers.remove();
    };
  }, [cities, localMap, atPole, point.lat, point.lon, zoom]);

  if (atPole)
    return (
      <p className="map-message">
        街道地图的投影无法显示该极地坐标，请在 3D 地球上查看。
      </p>
    );

  return (
    <>
      <div className="street-map" ref={host} aria-label={`${label}周边地图`} />
      {localMap && (
        <div className="local-map-notes">
          <p role="status">
            {loading
              ? "已显示本地地名，正在加载街道图。"
              : "街道图块未完整加载，当前显示本地地名和海岸轮廓。"}
          </p>
          {nearest.length > 0 && (
            <div className="nearby-cities">
              <span>附近已收录城市</span>
              {nearest.map(({ city: [name, , , lon, lat], distance }) => (
                <button
                  key={`${lon}/${lat}`}
                  type="button"
                  onClick={() => {
                    mapRef.current?.setView([lat, lon], 10, { animate: false });
                  }}
                >
                  {name} · {distance < 1 ? "<1" : Math.round(distance)} 公里
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
