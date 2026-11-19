import { test } from "node:test";
import assert from "node:assert/strict";
import {
  products,
  combos,
  total,
  toggle,
  restore,
  stories,
  receipt,
} from "../src/shop.ts";
test("catalog has unique products and six reachable combinations", () => {
  assert.equal(products.length, 18);
  assert.equal(new Set(products.map((p) => p.id)).size, 18);
  assert.equal(combos.length, 6);
  for (const c of combos) {
    assert.ok(c.ids.every((id) => products.some((p) => p.id === id)));
    assert.ok(total(c.ids) <= 100);
    assert.equal(stories(c.ids)[0].title, c.title);
  }
});
test("budget exact, excess rejected and removal refunds", () => {
  const ids = ["save", "bird", "weather"];
  assert.equal(total(ids), 100);
  assert.ok(toggle(ids, "bread").error);
  assert.deepEqual(toggle(ids, "bread").ids, ids);
  assert.equal(total(toggle(ids, "weather").ids), 80);
});
test("five item cap enforced separately from budget", () => {
  const ids = ["bread", "plant", "weather", "music", "door"];
  assert.equal(total(ids), 90);
  assert.match(toggle(ids, "duck").error!, /5 件/);
});
test("duplicate toggle removes, unknown IDs rejected", () => {
  assert.deepEqual(toggle(["cat"], "cat").ids, []);
  assert.ok(toggle([], "fake").error);
});
test("cache is validated and does not trust stored amounts", () => {
  assert.deepEqual(restore("broken"), []);
  assert.deepEqual(restore('{"version":0,"ids":["cat"]}'), []);
  assert.deepEqual(
    restore(
      '{"version":1,"ids":["cat","cat","fake",null,"dream"],"balance":999}',
    ),
    ["cat", "dream"],
  );
  const restored = restore(
    JSON.stringify({ version: 1, ids: products.map((p) => p.id) }),
  );
  assert.ok(total(restored) <= 100);
  assert.ok(restored.length <= 5);
});
test("result deterministic, capped, and fallback is related to selection", () => {
  assert.deepEqual(stories(["cat", "dream"]), stories(["dream", "cat"]));
  assert.ok(
    stories(["cat", "dream", "weather", "plant", "music", "bird"]).length <= 2,
  );
  assert.match(stories(["bread"])[0].story, /面包召唤术/);
});
test("receipt includes correct prices, powers, side effects and disclaimer", () => {
  const text = receipt(["cat", "dream"]);
  assert.match(text, /合计 60 币 · 余额 40 币/);
  assert.match(text, /猫导/);
  assert.match(text, /代价/);
  assert.match(text, /概不预测人生/);
});
