import type { Scene } from "./adventure.ts";

export const cast = {
  keeper: {
    name: "小卖部店主",
    color: 0xb4bd7a,
    line: "咖啡拿好。快到午夜时，来控制台找我。",
  },
  cat: {
    name: "猫董事长",
    color: 0x354c68,
    line: "我的名片背面有字。谈合作的话，叫我董事长。",
  },
  guard: {
    name: "猫保安",
    color: 0x803e54,
    line: "冻干可以带走。公文包和里面的东西得留下。",
  },
  driver: {
    name: "末班车司机",
    color: 0x467d80,
    line: "我还没熄火呢。车开走前，我会再看一眼站台。",
  },
  clerk: {
    name: "管理处实习生小余",
    color: 0x766cad,
    line: "文件要看到第九十七页。别急着在最后一栏签字。",
  },
  cleaner: {
    name: "保洁阿姨",
    color: 0x548459,
    line: "出口就在那堆箱子后头。搭把手？",
  },
  child: {
    name: "过生日的小孩",
    color: 0xe9a258,
    line: "你们可以陪我吹蜡烛吗？一根也行。",
  },
  courier: {
    name: "外卖员",
    color: 0xe1b347,
    line: "几分钟后就到。真的，你先别把门关了！",
  },
  station: {
    name: "站务员",
    color: 0x6081b1,
    line: "往后退一点。末班车的门，今天关得比较慢。",
  },
};
export type Npc = keyof typeof cast;

export const sets = {
  shop: { label: "平行人生小卖部", color: "#1a3040", icon: "▣" },
  street: { label: "宇宙拐角", color: "#253651", icon: "▥" },
  board: { label: "纸箱集团董事会", color: "#382942", icon: "▤" },
  roof: { label: "广告牌背后的屋顶", color: "#4a2e46", icon: "▴" },
  bus: { label: "0 路末班车", color: "#263949", icon: "▰" },
  office: { label: "临时管理处", color: "#283848", icon: "▤" },
  station: { label: "以后再说站", color: "#233745", icon: "▰" },
  queue: { label: "心愿退货服务台", color: "#473142", icon: "▥" },
  bakery: { label: "街边蛋糕店", color: "#503342", icon: "♢" },
  home: { label: "家的方向", color: "#503925", icon: "⌂" },
  archive: { label: "明天失物招领处", color: "#322848", icon: "▥" },
  dream: { label: "失物层与梦境", color: "#392d58", icon: "✦" },
  bridge: { label: "最后一座桥", color: "#162538", icon: "⌓" },
  console: { label: "午夜天台", color: "#273450", icon: "✳" },
};
export type SetName = keyof typeof sets;

const locations: Record<string, SetName> = {
  "cat-deal": "street",
  "cat-theft": "street",
  "cat-board": "board",
  "cat-photo": "bridge",
  "roof-chase": "roof",
  "driver-start": "bus",
  "driver-custody": "bus",
  "bus-radio": "bus",
  "bus-repair": "street",
  "clerk-start": "office",
  "clerk-backdoor": "office",
  "clerk-counter": "office",
  queue: "queue",
  birthday: "bakery",
  "archive-door": "archive",
  "home-call": "home",
  "lost-letter": "dream",
  sidegate: "dream",
  "ally-cat": "bridge",
  "ally-driver": "bus",
  "ally-clerk": "office",
  "ally-alone": "bridge",
  cost: "console",
  "end-home": "home",
  "end-company": "board",
  "end-train": "bus",
  "end-keeper": "shop",
  "end-dream": "dream",
};
const opening: { set: SetName; npcs: Npc[]; speaker: string }[] = [
  { set: "shop", npcs: [], speaker: "收银机" },
  { set: "shop", npcs: [], speaker: "宇宙临时通知" },
  { set: "shop", npcs: ["keeper"], speaker: cast.keeper.name },
  { set: "street", npcs: ["cat", "driver", "clerk"], speaker: "街角" },
];

export function stageFor(scene: Scene, line: number) {
  const beat = Math.min(line, scene.text.length - 1);
  if (scene.id === "opening") return { ...opening[beat], beat, focus: 0 };
  const speaker = scene.speaker;
  const npcs: Npc[] = [];
  if (speaker.includes("猫保安")) npcs.push("guard");
  else if (
    speaker.includes("猫") ||
    scene.id.startsWith("cat-") ||
    scene.id === "archive"
  )
    npcs.push("cat");
  if (speaker.includes("司机") || scene.id.startsWith("bus-"))
    npcs.push("driver");
  if (speaker.includes("实习生") || scene.id.startsWith("clerk-"))
    npcs.push("clerk");
  if (speaker.includes("店主") || scene.id === "combo-extra-hours")
    npcs.push("keeper");
  if (scene.id === "ordinary" || scene.id === "ability-ghost")
    npcs.push("cleaner");
  if (scene.id === "birthday" || scene.id === "queue") npcs.push("child");
  if (scene.id === "ability-door" || scene.id === "combo-old-order")
    npcs.push("courier");
  if (
    scene.id === "station" ||
    (scene.id.startsWith("ability-") && !npcs.length)
  )
    npcs.push("station");
  if (scene.id === "cat-search" && !npcs.includes("guard")) npcs.push("guard");
  if (scene.id === "cat-theft" && !npcs.includes("guard")) npcs.push("guard");
  const set =
    locations[scene.id] ??
    (scene.id.startsWith("combo-")
      ? "dream"
      : (["street", "station", "archive", "bridge", "console"] as const)[
          scene.act - 1
        ]);
  const focus = Array.from(scene.id).reduce(
    (value, char) => (value * 31 + char.charCodeAt(0)) % 97,
    0,
  );
  return { set, npcs, speaker, beat, focus };
}
export type Stage = ReturnType<typeof stageFor>;
