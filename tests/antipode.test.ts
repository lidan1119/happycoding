import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  antipode,
  beijing,
  fromLink,
  parseCoordinates,
} from "../src/earth/trajectory.ts";
import {
  countryAt,
  nearestCoast,
  type Geography,
} from "../src/earth/geography.ts";

const geography = JSON.parse(
  readFileSync(
    new URL("../public/earth/geography.json", import.meta.url),
    "utf8",
  ),
) as Geography;

test("antipodes wrap across the date line and preserve hemispheres and poles", () => {
  assert.deepEqual(antipode({ lat: 90, lon: 180 }), { lat: -90, lon: 0 });
  assert.equal(antipode({ lat: 0, lon: 0 }).lon, -180);
  const original = antipode(antipode(beijing));
  assert.ok(Math.abs(original.lon - beijing.lon) < 1e-9);
  assert.equal(original.lat, beijing.lat);
});

test("direct coordinate entry and shared links reject missing or out-of-range positions", () => {
  assert.deepEqual(fromLink("?lat=-17&lon=180&from=Suva"), {
    lat: -17,
    lon: -180,
    name: "Suva",
  });
  assert.equal(fromLink("?lat=0"), null);
  assert.equal(parseCoordinates(" ", "0"), null);
  assert.equal(parseCoordinates("Infinity", "0"), null);
  assert.equal(parseCoordinates("0", "181"), null);
});

test("real land data distinguishes Beijing's Argentine antipode from Tokyo's Atlantic antipode", () => {
  assert.equal(countryAt(geography, antipode(beijing)), "阿根廷");
  const atlantic = antipode({ lat: 35.6762, lon: 139.6503 });
  assert.equal(countryAt(geography, atlantic), undefined);
  const distance = nearestCoast(geography, atlantic);
  assert.ok(distance && distance.km > 1000 && distance.km < 1200);
  assert.equal(countryAt(geography, { lat: -86, lon: 179.9 }), "南极洲");
});

test("closest coastline uses segment interiors even across the date line", () => {
  const point = nearestCoast(
    {
      countries: [],
      coast: [
        [
          [179, 0],
          [-179, 0],
        ],
      ],
    },
    { lat: 1, lon: 180 },
  );
  assert.ok(point && Math.abs(point.km - 111.195) < 0.01);
  assert.ok(point && Math.abs(point.point.lon) > 179.99);
});
