import { useEffect, useState, type FormEvent } from "react";
import type { City } from "./geography";
import { parseCoordinates, type Origin } from "./trajectory";

export function OriginPicker({
  origin,
  onSelect,
}: {
  origin: Origin;
  onSelect: (point: Origin) => void;
}) {
  const [cities, setCities] = useState<City[]>([]);
  const [cityError, setCityError] = useState(false);
  const [query, setQuery] = useState("");
  const [lat, setLat] = useState(origin.lat.toFixed(5));
  const [lon, setLon] = useState(origin.lon.toFixed(5));
  const [error, setError] = useState("");
  useEffect(() => {
    setLat(origin.lat.toFixed(5));
    setLon(origin.lon.toFixed(5));
    setError("");
  }, [origin]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(import.meta.env.BASE_URL + "earth/cities.json", {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("城市数据加载失败");
        return response.json();
      })
      .then(setCities)
      .catch(() => {
        if (!controller.signal.aborted) setCityError(true);
      });
    return () => controller.abort();
  }, []);
  const search = query.trim().toLowerCase();
  const matches = search
    ? cities
        .filter(([name, english, country]) =>
          [name, english, country].some((value) =>
            value.toLowerCase().includes(search),
          ),
        )
        .slice(0, 8)
    : [];
  function enterCoordinates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const point = parseCoordinates(lat, lon);
    if (!point) setError("请填写有效纬度（−90 到 90）和经度（−180 到 180）。");
    else onSelect(point);
  }

  return (
    <div className="origin-picker">
      <label htmlFor="city-search">搜索出发城市</label>
      <input
        id="city-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="例如上海、东京、London"
        autoComplete="off"
      />
      {cityError && <p role="status">城市列表加载失败，可以用坐标选点。</p>}
      {search &&
        !cityError &&
        (matches.length ? (
          <ul className="city-results">
            {matches.map(([name, english, country, longitude, latitude]) => (
              <li key={`${longitude},${latitude}`}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect({ lat: latitude, lon: longitude, name });
                    setQuery("");
                  }}
                >
                  <strong>{name}</strong>
                  <small>
                    {[english !== name ? english : "", country]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p role="status">
            {cities.length
              ? "没有找到匹配城市，可以用坐标或点击地球选点。"
              : "正在加载城市列表…"}
          </p>
        ))}
      <details className="manual-coordinates">
        <summary>输入经纬度</summary>
        <form onSubmit={enterCoordinates}>
          <label>
            纬度
            <input
              value={lat}
              onChange={(event) => setLat(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <label>
            经度
            <input
              value={lon}
              onChange={(event) => setLon(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <button type="submit">设为出发点</button>
          {error && <p role="alert">{error}</p>}
        </form>
      </details>
    </div>
  );
}
