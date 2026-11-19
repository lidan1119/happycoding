import { test } from "node:test";
import assert from "node:assert/strict";
import { products, combos, total } from "../src/shop.ts";
import {
  archiveText,
  choose,
  choices,
  endings,
  epilogue,
  flag,
  has,
  load,
  promises,
  save,
  sceneCount,
  scenes,
  start,
  type State,
} from "../src/adventure.ts";
const path = (ids: string[], steps: string[]) =>
  steps.reduce((s, id) => choose(s, id), start(ids));
const prefix = [
  "follow-cat",
  "cat-partner",
  "sign-seat",
  "ordinary-exit",
  "carry-boxes",
  "help-wish",
  "promise-birthday",
  "face-partner",
];
test("all scene IDs, choices and edges are valid; the graph is acyclic", () => {
  assert.equal(Object.keys(scenes).length, sceneCount);
  assert.equal(endings.length, 8);
  for (const s of Object.values(scenes)) {
    assert.ok(s.text.length);
    assert.equal(new Set(s.choices.map((c) => c.id)).size, s.choices.length);
    if (!s.ending) assert.ok(s.choices.length);
    for (const c of s.choices) assert.ok(scenes[c.next], c.next);
  }
  // Cache completed subgraphs to avoid traversing every route combination.
  const done = new Set<string>();
  const visit = (id: string, stack: Set<string>) => {
    if (done.has(id)) return;
    assert.ok(!stack.has(id));
    const n = new Set(stack).add(id);
    for (const c of scenes[id].choices) visit(c.next, n);
    done.add(id);
  };
  visit("opening", new Set());
  assert.equal(done.size, sceneCount);
});
test("cooperation and theft lead to different scenes and lasting cat reactions", () => {
  const partner = choose(start(["cat"]), "follow-cat");
  const thief = choose(start(["cat"]), "steal-contract");
  assert.notEqual(partner.node, thief.node);
  assert.ok(partner.relations.cat > thief.relations.cat);
  const s = path(
    ["cat"],
    [
      "steal-contract",
      "give-driver",
      "keep-rendezvous",
      "ordinary-exit",
      "carry-boxes",
      "chase-archive",
      "reject-priority",
      "face-search",
    ],
  );
  assert.equal(s.node, "cat-search");
  assert.ok(!flag(s, "contract"));
  assert.ok(choices(s).some((c) => c.id === "call-custodian"));
  assert.ok(
    !choices(s).some(
      (c) => c.id === "return-original" || c.id === "expose-original",
    ),
  );
  assert.throws(() => choose(s, "return-original"));
});
test("returning original removes ownership and wanted status without erasing theft", () => {
  const s = path(
    ["cat"],
    [
      "steal-contract",
      "keep-original",
      "hide-record",
      "ordinary-exit",
      "carry-boxes",
      "chase-archive",
      "reject-priority",
      "face-search",
      "return-original",
    ],
  );
  assert.ok(flag(s, "stolen"));
  assert.ok(!flag(s, "contract"));
  assert.ok(!flag(s, "wanted"));
  assert.ok(flag(s, "returned-contract"));
});
test("breaking cat partnership removes future cooperation even after earlier trust", () => {
  const s = path(["cat"], [...prefix, "break-partnership"]);
  assert.ok(flag(s, "broke-cat"));
  assert.ok(!choices(s).some((c) => c.id === "cat-guarantee"));
  assert.ok(epilogue(s).some((p) => p.includes("撤下")));
});
test("betraying the clerk is remembered and removes her aid and rewrite ending", () => {
  let s = path(
    ["cat"],
    [
      ...prefix,
      "share-ownership",
      "publish-name",
      "read-letter",
      "keep-letter",
    ],
  );
  assert.equal(s.node, "crisis");
  assert.ok(flag(s, "betrayed-clerk"));
  assert.ok(!choices(s).some((c) => c.id === "call-clerk"));
  s = choose(choose(choose(s, "cross-alone"), "reach-console"), "keep-powers");
  assert.ok(!choices(s).some((c) => c.id === "end-rewrite"));
  assert.ok(epilogue(s).some((p) => p.includes("停职")));
});
test("all abilities unlock distinct events and no-power route always works", () => {
  for (const p of products) {
    const s = path([p.id], ["help-driver", "be-conductor", "call-daughter"]);
    assert.ok(choices(s).some((c) => c.id === `try-${p.id}`));
    assert.ok(choices(s).some((c) => c.id === "ordinary-exit"));
    const available = choices(s).filter((c) => c.id.startsWith("try-"));
    assert.equal(available.length, 1);
    assert.equal(choose(s, `try-${p.id}`).node, `ability-${p.id}`);
    assert.ok(choices(choose(s, `try-${p.id}`)).length >= 2);
  }
});
test("combos require their actual abilities and are optional", () => {
  let s = path(["cat", "dream"], [...prefix, "share-ownership", "redact-name"]);
  assert.ok(choices(s).some((c) => c.id === "enter-cat-dream"));
  assert.ok(choices(s).some((c) => c.id === "read-letter"));
  s = path(["cat"], [...prefix, "share-ownership", "redact-name"]);
  assert.ok(!choices(s).some((c) => c.id === "enter-cat-dream"));
});
test("surrendered dream cannot unlock dream ending; all-return enables sunday", () => {
  const s = path(
    ["dream"],
    [
      "help-clerk",
      "protect-clerk",
      "take-letter",
      "try-dream",
      "use-dream-care",
      "answer-home",
      "promise-home",
      "face-outsider",
      "request-hearing",
      "redact-name",
      "read-letter",
      "keep-letter",
      "call-clerk",
      "leave-together",
    ],
  );
  assert.equal(s.node, "cost");
  assert.ok(has(s, "dream"));
  const surrendered = choose(s, "surrender-dream");
  assert.ok(!has(surrendered, "dream"));
  assert.ok(!choices(surrendered).some((c) => c.id === "end-dream"));
  const retained = choose(s, "keep-powers");
  assert.ok(choices(retained).some((c) => c.id === "end-dream"));
  const all = choose(s, "return-all");
  assert.deepEqual(all.sacrificed, ["dream"]);
  assert.ok(choices(all).some((c) => c.id === "end-sunday"));
});
test("save replays exact choices and rejects tampering, invalid loadout and impossible history", () => {
  const s = path(["cat"], [...prefix, "share-ownership"]);
  assert.deepEqual(load(save(s)), s);
  assert.equal(load("bad"), null);
  assert.equal(load('{"version":0}'), null);
  assert.equal(
    load(
      JSON.stringify({
        version: 1,
        loadout: ["cat"],
        history: ["end-company"],
      }),
    ),
    null,
  );
  assert.equal(
    load(JSON.stringify({ version: 1, loadout: ["cat", "cat"], history: [] })),
    null,
  );
  assert.equal(
    load(
      JSON.stringify({
        version: 1,
        loadout: ["bird", "save", "dream"],
        history: [],
      }),
    ),
    null,
  );
  assert.equal(
    load(JSON.stringify({ version: 1, loadout: ["fake"], history: [] })),
    null,
  );
  assert.throws(() => start([]));
});
test("all promises and inventory appear in a complete export", () => {
  const s = path(
    ["cat"],
    [
      ...prefix,
      "share-ownership",
      "redact-name",
      "read-letter",
      "keep-letter",
      "call-cat",
      "honor-cat",
      "keep-powers",
      "end-company",
    ],
  );
  assert.ok(scenes[s.node].ending);
  assert.match(archiveText(s), /猫司实习生/);
  assert.match(archiveText(s), /猫语六级/);
  assert.match(archiveText(s), /尚未完成的事/);
  assert.ok(promises(s).some((p) => p.includes("纸箱")));
  assert.ok(promises(s).some((p) => p.includes("生日")));
  assert.ok(promises(s).some((p) => p.includes("月账单")));
});
test("seeded playthroughs reach every authored scene and all 8 endings without dead ends", () => {
  let seed = 291119;
  const rand = (n: number) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return Math.floor((seed / 4294967296) * n);
  };
  const loadouts = [
    ...products.map((p) => [p.id]),
    ...combos.map((c) => c.ids),
  ];
  for (let i = 0; i < 36; i++) {
    const ids: string[] = [];
    for (let j = 0; j < 5; j++) {
      const p = products[rand(products.length)];
      if (!ids.includes(p.id) && total([...ids, p.id]) <= 100) ids.push(p.id);
    }
    if (ids.length) loadouts.push(ids);
  }
  const visited = new Set<string>(),
    reached = new Set<string>();
  let longest = 0;
  for (const ids of loadouts)
    for (let k = 0; k < 100; k++) {
      let s = start(ids);
      for (let step = 0; step < 25; step++) {
        visited.add(s.node);
        if (scenes[s.node].ending) {
          reached.add(scenes[s.node].ending!);
          longest = Math.max(longest, s.history.length);
          break;
        }
        const options = choices(s);
        assert.ok(options.length, `${s.node} has no choices`);
        s = choose(s, options[rand(options.length)].id);
        assert.ok(s.sacrificed.every((id) => s.loadout.includes(id)));
        if (step === 24) assert.fail("did not terminate");
      }
    }
  assert.deepEqual([...reached].sort(), endings.map((e) => e.id).sort());
  assert.deepEqual(
    Object.keys(scenes).filter((id) => !visited.has(id)),
    [],
  );
  assert.ok(longest <= 18, `longest: ${longest}`);
  console.log(
    `Verified ${visited.size} scenes, ${reached.size} endings, ${loadouts.length * 100} seeded runs; longest ${longest} decisions.`,
  );
});
