export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  icon: string;
  power: string;
  side: string;
  tag: string;
};
const raw: [string, string, string, number, string, string, string, string][] =
  [
    [
      "cat",
      "猫语六级",
      "奇妙日常",
      25,
      "🐈",
      "听懂每一声喵背后的潜台词。",
      "猫也听得懂你的碎碎念，并且会点评。",
      "跨物种社交",
    ],
    [
      "save",
      "人生读档",
      "时空漏洞",
      40,
      "📼",
      "每天可以撤回自己说过的一句话。",
      "对方会记得你突然发出了拨号音。",
      "谨慎发言",
    ],
    [
      "weather",
      "私人晴天",
      "奇妙日常",
      20,
      "🌤️",
      "头顶永远是你最喜欢的天气。",
      "覆盖半径只有一米，朋友得贴着你走。",
      "随身气象台",
    ],
    [
      "dream",
      "梦境续播会员",
      "脑内宇宙",
      35,
      "🌙",
      "昨晚没做完的梦，今晚接着演。",
      "入梦前要看十五秒脑内广告。",
      "禁止剧透",
    ],
    [
      "teleport",
      "瞬移月票",
      "时空漏洞",
      30,
      "🚪",
      "瞬间抵达任何你去过的地方。",
      "落地自带一声响亮的「欢迎光临」。",
      "告别早高峰",
    ],
    [
      "bread",
      "面包召唤术",
      "奇妙日常",
      15,
      "🥐",
      "随时从口袋掏出一只热乎面包。",
      "口袋里会永久积满面包屑。",
      "碳水自由",
    ],
    [
      "plant",
      "绿植发言人",
      "奇妙日常",
      15,
      "🌱",
      "家里的植物会开口告诉你它需要什么。",
      "仙人掌说话特别扎人。",
      "浇水提醒",
    ],
    [
      "pause",
      "周日加时赛",
      "时空漏洞",
      45,
      "⏳",
      "每个周日多出六小时私人时间。",
      "这六小时所有电子设备只剩 1% 电。",
      "时间富翁",
    ],
    [
      "music",
      "人生背景乐",
      "脑内宇宙",
      20,
      "🎧",
      "每个重要时刻都有恰到好处的配乐。",
      "心动时的音乐，方圆十米都听得见。",
      "自带片尾曲",
    ],
    [
      "ghost",
      "社交隐身斗篷",
      "奇妙日常",
      30,
      "👻",
      "不想寒暄的时候，可以透明十分钟。",
      "衣服不会透明，记得提前规划穿搭。",
      "低电量模式",
    ],
    [
      "luck",
      "小概率幸运",
      "脑内宇宙",
      25,
      "🍀",
      "每天必定遇到一件小小的好事。",
      "宇宙认为「没踩到狗屎」也算。",
      "解释权归宇宙",
    ],
    [
      "future",
      "明日便利贴",
      "时空漏洞",
      35,
      "📮",
      "每天收到来自明天的自己的一条提醒。",
      "最多五个字，而且那个你字很丑。",
      "未来来信",
    ],
    [
      "sleep",
      "秒睡开关",
      "脑内宇宙",
      25,
      "💤",
      "闭眼默念晚安，三秒就能睡着。",
      "每次醒来，发型随机生成。",
      "梦乡直达",
    ],
    [
      "memory",
      "记忆放映机",
      "脑内宇宙",
      30,
      "🎞️",
      "把一段美好回忆投影到墙上重看。",
      "当年的尴尬发型会以 4K 显示。",
      "往日重映",
    ],
    [
      "door",
      "任意门外卖",
      "时空漏洞",
      20,
      "🍜",
      "任何想吃的食物，三分钟送到门口。",
      "送餐员会坐下来讲一个很冷的笑话。",
      "胃的远行",
    ],
    [
      "bird",
      "飞行体验券",
      "时空漏洞",
      40,
      "🪁",
      "每天能自由飞行二十分钟。",
      "起飞前必须大喊「我是大风筝」。",
      "禁止嘴硬",
    ],
    [
      "duck",
      "烦恼变小鸭",
      "脑内宇宙",
      20,
      "🦆",
      "把一件烦恼变成一只橡皮小黄鸭。",
      "小鸭会跟着你，而且不能静音。",
      "嘎嘎有效",
    ],
    [
      "clean",
      "家务小精灵",
      "奇妙日常",
      35,
      "🧹",
      "每天醒来，房间都会被收拾整齐。",
      "小精灵按自己的审美摆放你的收藏。",
      "审美外包",
    ],
  ];
export const products: Product[] = raw.map(
  ([id, name, category, price, icon, power, side, tag]) => ({
    id,
    name,
    category,
    price,
    icon,
    power,
    side,
    tag,
  }),
);
export const combos = [
  {
    ids: ["cat", "dream"],
    title: "猫导，请多指教",
    story:
      "你的猫成了梦里的导演，坚持把你拍成配角。今晚的片名是《人类，去开罐头》。",
  },
  {
    ids: ["weather", "plant"],
    title: "一平方米的春天",
    story:
      "你成了植物界的移动度假村。阳台上的薄荷每天排队，申请在你头上晒十五分钟太阳。",
  },
  {
    ids: ["teleport", "door"],
    title: "宇宙级取餐事故",
    story:
      "你瞬移去找外卖，外卖穿门来找你。你们在宇宙中错过三次，最后决定一起吃堂食。",
  },
  {
    ids: ["music", "bird"],
    title: "天空音乐剧",
    story:
      "你大喊「我是大风筝」的瞬间，背景乐响起。全城都以为今天是某部电影的大结局。",
  },
  {
    ids: ["bread", "duck"],
    title: "禁止投喂烦恼",
    story: "你试着用面包喂小黄鸭。烦恼没有消失，但它开始挑剔可颂的酥皮层数。",
  },
  {
    ids: ["pause", "sleep"],
    title: "周日失踪事件",
    story:
      "你终于拥有多出来的六小时，然后三秒睡着了。宇宙尊重你的选择，并替你盖好被子。",
  },
];
export function total(ids: string[]) {
  return products
    .filter((p) => ids.includes(p.id))
    .reduce((s, p) => s + p.price, 0);
}
export function toggle(
  ids: string[],
  id: string,
): { ids: string[]; error?: string } {
  if (ids.includes(id)) return { ids: ids.filter((x) => x !== id) };
  const p = products.find((p) => p.id === id);
  if (!p) return { ids, error: "这件商品来自另一个宇宙。" };
  if (ids.length >= 5)
    return { ids, error: "购物篮最多装 5 件，给人生留一点空位。" };
  if (total(ids) + p.price > 100)
    return { ids, error: "人生币不够啦，先放回一件试试。" };
  return { ids: [...ids, id] };
}
export function restore(raw: string | null): string[] {
  try {
    const v = JSON.parse(raw ?? "null");
    if (v?.version !== 1 || !Array.isArray(v.ids)) return [];
    let ids: string[] = [];
    for (const id of v.ids)
      if (typeof id === "string" && !ids.includes(id))
        ids = toggle(ids, id).ids;
    return ids;
  } catch {
    return [];
  }
}
export function stories(ids: string[]) {
  const hits = combos
    .filter((c) => c.ids.every((id) => ids.includes(id)))
    .slice(0, 2);
  return hits.length
    ? hits
    : [
        {
          title: "普通宇宙的意外来客",
          story: `带着「${products.find((p) => ids.includes(p.id))?.name ?? "一点勇气"}」，你推开了新人生的门。世界没有立刻改变，但今天的你，多了一个值得期待的秘密。`,
        },
      ];
}
export function receipt(ids: string[]) {
  return [
    "平行人生小卖部",
    "PARALLEL LIFE · 人生分店",
    "────────────────────",
    ...products
      .filter((p) => ids.includes(p.id))
      .flatMap((p) => [
        `${p.icon} ${p.name}  ${p.price} 币`,
        `能力：${p.power}`,
        `代价：${p.side}`,
      ]),
    "────────────────────",
    `合计 ${total(ids)} 币 · 余额 ${100 - total(ids)} 币`,
    ...stories(ids).flatMap((s) => ["", `✦ ${s.title}`, s.story]),
    "",
    "人生没有最优解，喜欢就值得。",
    "纯属脑洞，概不预测人生。",
    "本店售出的平行宇宙，欢迎再次光临。",
  ].join("\n");
}
