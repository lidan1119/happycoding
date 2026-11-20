import { lazy, Suspense, useEffect, useRef } from "react";
import type { City, Geography } from "./geography";
import type { Coordinates } from "./trajectory";

const DetailMap = lazy(() => import("./DetailMap"));

export type MapLocation = { point: Coordinates; label: string; zoom: number };

export function MapDialog({
  location,
  cities,
  geography,
  onClose,
}: {
  location: MapLocation;
  cities: City[];
  geography: Geography | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
    };
  }, []);

  const { point, label, zoom } = location;
  const external = new URL("https://www.openstreetmap.org/");
  external.search = new URLSearchParams({
    mlat: String(point.lat),
    mlon: String(point.lon),
  }).toString();
  external.hash = `map=${zoom}/${point.lat}/${point.lon}`;
  return (
    <dialog
      ref={dialog}
      className="map-dialog"
      aria-labelledby="map-title"
      onClose={onClose}
    >
      <header className="map-header">
        <div>
          <h2 id="map-title">{label}</h2>
          <p>
            {point.lat.toFixed(5)}°, {point.lon.toFixed(5)}°
          </p>
        </div>
        <button
          type="button"
          aria-label="关闭地图"
          onClick={() => dialog.current?.close()}
          autoFocus
        >
          ×
        </button>
      </header>
      <Suspense
        fallback={
          <p className="map-message" role="status">
            正在打开地图…
          </p>
        }
      >
        <DetailMap
          point={point}
          label={label}
          zoom={zoom}
          cities={cities}
          geography={geography}
        />
      </Suspense>
      <footer className="map-footer">
        <a href={external.href} target="_blank" rel="noopener noreferrer">
          在 OpenStreetMap 打开 ↗
        </a>
      </footer>
    </dialog>
  );
}
