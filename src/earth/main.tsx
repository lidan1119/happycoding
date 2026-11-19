import { useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Globe } from "./Globe";
import { OriginPicker } from "./OriginPicker";
import { countryAt, nearestCoast, type Geography } from "./geography";
import {
  antipode,
  beijing,
  duration,
  fromLink,
  type Coordinates,
  type Origin,
} from "./trajectory";
import "./earth.css";

function coordinates({ lat, lon }: Coordinates) {
  return `${Math.abs(lat).toFixed(2)}° ${lat < 0 ? "S" : "N"} · ${Math.abs(lon).toFixed(2)}° ${lon < 0 ? "W" : "E"}`;
}

function EarthTrip() {
  const [origin, setOrigin] = useState(
    () => fromLink(location.search) ?? beijing,
  );
  const [started, setStarted] = useState<number | null>(null);
  const [finished, setFinished] = useState(
    () =>
      Boolean(fromLink(location.search)) &&
      new URLSearchParams(location.search).get("view") === "arrival",
  );
  const [unavailable, setUnavailable] = useState(false);
  const [geography, setGeography] = useState<Geography | null>(null);
  const [geoError, setGeoError] = useState(false);
  const [share, setShare] = useState("");
  const [showLink, setShowLink] = useState(false);
  const handleUnavailable = useCallback(() => setUnavailable(true), []);
  const flying = started !== null && !finished;
  const destination = useMemo(() => antipode(origin), [origin]);
  const result = useMemo(() => {
    if (!finished || !geography) return null;
    const country = countryAt(geography, destination);
    return {
      country,
      coast: country ? null : nearestCoast(geography, destination),
    };
  }, [finished, geography, destination]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(import.meta.env.BASE_URL + "earth/geography.json", {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("地理数据加载失败");
        return response.json();
      })
      .then(setGeography)
      .catch(() => {
        if (!controller.signal.aborted) setGeoError(true);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!flying || started === null) return;
    const timer = setTimeout(
      () => setFinished(true),
      Math.max(0, duration - (performance.now() - started)),
    );
    return () => clearTimeout(timer);
  }, [flying, started]);

  function select(point: Origin) {
    setOrigin(point);
    back();
  }
  function back() {
    setStarted(null);
    setFinished(false);
    setShare("");
    setShowLink(false);
  }
  function travel() {
    window.scrollTo({ top: 0, behavior: "instant" });
    setShare("");
    setShowLink(false);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || unavailable) {
      setFinished(true);
      return;
    }
    setFinished(false);
    setStarted(performance.now());
  }
  const shareUrl = new URL(location.pathname, location.origin);
  shareUrl.search = new URLSearchParams({
    lat: origin.lat.toFixed(6),
    lon: origin.lon.toFixed(6),
    ...(origin.name ? { from: origin.name } : {}),
    view: "arrival",
  }).toString();
  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl.href);
      setShare("已复制结果链接");
    } catch {
      setShowLink(true);
      setShare("请复制下方链接");
    }
  }

  const isBeijing =
    destination.lat === -beijing.lat &&
    destination.lon === antipode(beijing).lon;
  const arrivalDetails = result?.country
    ? isBeijing
      ? "落点在阿根廷内格罗河省，靠近大西洋沿岸。"
      : `落点位于陆地 · ${result.country}。`
    : result?.coast
      ? `落点由底图判定为水域，距最近的海岸线约 ${Math.round(result.coast.km).toLocaleString("zh-CN")} 公里。${unavailable ? "" : "青色圆环标出海岸点。"}`
      : geoError
        ? "地理数据加载失败，仍可查看落点坐标。"
        : "正在查找落点与最近海岸…";

  return (
    <main
      className="expedition"
      data-phase={finished ? "arrived" : flying ? "travel" : "departure"}
    >
      <div className="starfield" aria-hidden="true" />
      {unavailable ? (
        <div className="map-fallback">
          <img
            src={import.meta.env.BASE_URL + "earth/earth.jpg"}
            alt="地球的平面卫星底图"
            onClick={(event) => {
              if (flying) return;
              const box = event.currentTarget.getBoundingClientRect();
              select({
                lat: 90 - (180 * (event.clientY - box.top)) / box.height,
                lon: (360 * (event.clientX - box.left)) / box.width - 180,
              });
            }}
          />
          <p>平面地图 · 点击选点</p>
        </div>
      ) : (
        <div className="globe">
          <Globe
            origin={origin}
            coastline={result?.coast?.point}
            onSelect={select}
            started={started}
            finished={finished}
            onUnavailable={handleUnavailable}
          />
        </div>
      )}
      {flying && (
        <div className="crossing" key={started} aria-hidden="true">
          <div className="section-view">
            <div className="diameter" />
          </div>
          <div className="depth">
            经过地心 <span>直线约 12,742 公里</span>
          </div>
        </div>
      )}
      <header className="masthead">
        <a href="./">平行人生小卖部</a>
        <span>{origin.name ?? "自选坐标"}出发</span>
      </header>
      <section className="details">
        <div className="chapter">
          {finished ? "抵达" : flying ? "穿越中" : "出发"}
        </div>
        <h1>
          {finished ? (
            (result?.country ?? (result ? "落在水域" : "穿越落点"))
          ) : (
            <>
              把家搬到
              <br />
              地球另一边
            </>
          )}
        </h1>
        <div className="travel-description" aria-live="polite">
          <p>
            {finished ? (
              arrivalDetails
            ) : (
              <>
                从{origin.name ?? "选定的坐标"}
                出发。拖动地球查看各地，点击地表更换出发点。
              </>
            )}
          </p>
          <div className="coords">
            {coordinates(finished ? destination : origin)}
          </div>
        </div>
        {!flying && !finished && (
          <OriginPicker origin={origin} onSelect={select} />
        )}
        <div className="play-controls">
          <button
            type="button"
            onClick={flying ? () => setFinished(true) : travel}
          >
            {flying ? "跳到落点" : finished ? "再穿越一次" : "穿过去"}{" "}
            <span aria-hidden="true">↗</span>
          </button>
          {finished && (
            <>
              <button className="return" type="button" onClick={back}>
                更换出发点
              </button>
              <button className="return" type="button" onClick={copy}>
                复制结果链接
              </button>
            </>
          )}
        </div>
        {share && (
          <p className="share-status" role="status">
            {share}
          </p>
        )}
        {showLink && (
          <input
            className="share-link"
            aria-label="结果链接"
            value={shareUrl.href}
            readOnly
            onFocus={(event) => event.target.select()}
          />
        )}
      </section>
      <footer className="credit">
        <a href="https://www.naturalearthdata.com/">Natural Earth 地理数据</a>
        <span> · 海陆与距离为估算</span>
        <span> · </span>
        <a href="https://github.com/mrdoob/three.js/blob/dev/examples/textures/planets/earth_atmos_2048.jpg">
          地表底图
        </a>
      </footer>
    </main>
  );
}
createRoot(document.getElementById("earth-root")!).render(<EarthTrip />);
