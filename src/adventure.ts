import { products, restore as restoreBasket } from "./shop.ts";

export type Person = "cat" | "driver" | "clerk" | "keeper";
export const people: Record<Person, string> = {
  cat: "猫董事长",
  driver: "末班车司机",
  clerk: "管理处实习生",
  keeper: "小卖部店主",
};
export type State = {
  loadout: string[];
  node: string;
  flags: string[];
  relations: Record<Person, number>;
  sacrificed: string[];
  history: string[];
  journal: { scene: string; choice: string; outcome: string }[];
};
export type Choice = {
  id: string;
  label: string;
  next: string;
  hint?: string;
  when?: (s: State) => boolean;
  flags?: string[];
  remove?: string[];
  relation?: Partial<Record<Person, number>>;
  sacrifice?: string;
  outcome: string;
};
export type Scene = {
  id: string;
  act: number;
  title: string;
  place: string;
  speaker: string;
  text: string[];
  choices: Choice[];
  ending?: string;
};
export const acts = [
  "不正常的早晨",
  "城市开始收摊",
  "明天失物招领处",
  "能力故障高峰期",
  "最后一班明天",
];
export const has = (s: State, id: string) =>
  s.loadout.includes(id) && !s.sacrificed.includes(id);
export const flag = (s: State, id: string) => s.flags.includes(id);
const c = (
  id: string,
  label: string,
  next: string,
  outcome: string,
  options: Partial<Choice> = {},
): Choice => ({ id, label, next, outcome, ...options });
const scene = (
  id: string,
  act: number,
  title: string,
  place: string,
  speaker: string,
  text: string[],
  choices: Choice[],
): Scene => ({ id, act, title, place, speaker, text, choices });
const list: Scene[] = [
  scene(
    "opening",
    1,
    "明天，暂停营业",
    "宇宙拐角 · 07:03",
    "收银机",
    [
      "你刚揣好人生小票，收银机又吐出一张纸。上面不是找零，而是一则讣告似的通知：",
      "「明天因故取消。请于今晚 23:59 前处理尚未完成的人生。已售能力不退。」",
      "店主把一杯还没冲开的咖啡塞给你：“上次是忘了续费，这次恐怕没那么简单。”他翻进柜台后的小门，门牌随即变成了墙。",
      "街上，一只穿西装的橘猫正把公文包夹在腋下；末班车司机蹲在路边，试图把已经告别的乘客叫回来。管理处实习生举着「请有序等待消失」的牌子，眼睛红红的。",
    ],
    [
      c(
        "follow-cat",
        "拦住橘猫，谈一笔合作",
        "cat-deal",
        "你选择和掌握秘密的猫谈条件。",
        { relation: { cat: 1 }, flags: ["cat-route"] },
      ),
      c(
        "steal-contract",
        "顺走猫的公文包，先看真相",
        "cat-theft",
        "你拿到了公文包，也成了猫保安的重点关注对象。",
        { flags: ["stolen", "contract", "wanted"], relation: { cat: -2 } },
      ),
      c(
        "help-driver",
        "帮司机把最后一班车开起来",
        "driver-start",
        "你留下来帮司机，而不是独自逃离。",
        { relation: { driver: 1 }, flags: ["driver-route"] },
      ),
      c(
        "help-clerk",
        "问问实习生：这个通知谁签的？",
        "clerk-start",
        "你从最不起眼的窗口开始调查。",
        { relation: { clerk: 1 }, flags: ["clerk-route"] },
      ),
    ],
  ),
  scene(
    "cat-deal",
    1,
    "罐头本位制",
    "街角 · 董事长专车",
    "猫董事长",
    [
      "橘猫掏出一张烫金名片。你不懂猫语也没关系，背面印着字：“人类事务，请扫码；宇宙末日，请直接说。”",
      "“城市被拿去抵押了。我准备买回来。”它把合同推近，却用爪子压住最后一页。“你帮我拿到市民的同意，我给你一个有明天的职位。”",
      "它的公文包里露出一张旧照片：一只幼猫，趴在一只快递纸箱里。你觉得那箱子有点眼熟。",
    ],
    [
      c(
        "cat-partner",
        "答应合作，但要求公开账目",
        "cat-board",
        "猫给你董事会旁听证。你承诺帮它争取市民同意。",
        { flags: ["partner", "cat-promise"], relation: { cat: 1 } },
      ),
      c(
        "cat-question",
        "先问照片，为什么偏偏要买这座城？",
        "cat-photo",
        "你没有立刻签字，而是问起了那只旧纸箱。",
        { flags: ["cat-secret"], relation: { cat: 1 } },
      ),
    ],
  ),
  scene(
    "cat-theft",
    1,
    "公文包里没有鱼",
    "自动售货机后 · 07:11",
    "猫保安的对讲机",
    [
      "你躲到售货机后面。包里有一把梳子、半包冻干，以及《明天收益权抵押协议》。借款方竟然是每一个说过“等以后再说”的市民。",
      "你也是签约人。签名那一栏，是你去年给自己发过的一条消息：“等有空再回家。”",
      "猫保安的皮鞋声逼近。你可以带着证据走屋顶，也可以把它交给看起来还愿意等人的司机。",
    ],
    [
      c(
        "keep-original",
        "带着原件翻上屋顶",
        "roof-chase",
        "你保留了合同原件，猫保安仍在追踪。",
        { flags: ["evidence"] },
      ),
      c(
        "give-driver",
        "把原件塞进司机的保温杯套",
        "driver-custody",
        "司机替你保管原件，你手里不再有合同。",
        {
          flags: ["driver-custody", "evidence"],
          remove: ["contract"],
          relation: { driver: 1 },
        },
      ),
    ],
  ),
  scene(
    "driver-start",
    1,
    "请不要跟乘客告别",
    "停运前的 0 路车",
    "末班车司机",
    [
      "司机用胶带粘起一张线路图。终点“以后再说站”正在一点点褪色。",
      "“我女儿从小觉得这车能开到月亮。”他指着仪表盘上的贴纸，“答应过带她坐一次，可总说等休息。明天一没，我这谎就彻底圆不上了。”",
      "车还能开，只差一个愿意报站的人。另一边，退愿望的队伍已经挤到了马路上。",
    ],
    [
      c(
        "be-conductor",
        "拿起话筒，替他报站",
        "bus-radio",
        "你成了临时售票员，答应帮司机完成最后一趟接送。",
        { flags: ["driver-promise"], relation: { driver: 1 } },
      ),
      c(
        "repair-bus",
        "先修线路，把退愿望的人接上",
        "bus-repair",
        "你把逃生车改成了接人的公交车。",
        { flags: ["public-bus"], relation: { driver: 1 } },
      ),
    ],
  ),
  scene(
    "clerk-start",
    1,
    "第 404 号办事窗口",
    "临时管理处",
    "管理处实习生",
    [
      "实习生的工牌写着“小余”，有效期到今天。她悄悄告诉你，管理处并不是取消了明天，而是把“暂时不用的明天”卖给了更需要它的人。",
      "“问题是系统默认所有人都不需要。那个勾选框，藏在第九十七页。”她抱着一叠表，“我能带你去档案馆，但我进去，可能就要签保密承诺。”",
    ],
    [
      c(
        "protect-clerk",
        "答应保护她的身份，走员工入口",
        "clerk-backdoor",
        "小余交出员工通行证；你答应不公开她的姓名。",
        { flags: ["protect-clerk", "clerk-pass"], relation: { clerk: 1 } },
      ),
      c(
        "demand-records",
        "从公开窗口申请查阅，不让她背锅",
        "clerk-counter",
        "你拿到了一份带公章的查阅回执。",
        { flags: ["legal-record"], relation: { clerk: 1 } },
      ),
    ],
  ),
  scene(
    "cat-board",
    1,
    "九把椅子，八只猫",
    "纸箱集团 · 临时董事会",
    "猫董事长",
    [
      "第九把椅子是你的。桌上的水杯全是纸箱形状，有位董事正认真地坐在杯子里。",
      "投票结果是：只保留有产权的明天。流浪猫董事投了反对票，说自己连今天的纸箱都没有。橘猫第一次没接话。",
    ],
    [
      c(
        "insist-public",
        "坚持没有房子的人也该有明天",
        "station",
        "你让董事会把“全体居民”写进议案。",
        { flags: ["public-demand"], relation: { cat: -1, driver: 1 } },
      ),
      c(
        "sign-seat",
        "先签旁听协议，换一条内部通道",
        "station",
        "你获得董事会席位，但默认承担了集团的纸箱供给义务。",
        { flags: ["cat-seat", "box-debt"], relation: { cat: 1 } },
      ),
    ],
  ),
  scene(
    "cat-photo",
    1,
    "它记得的不是城市",
    "桥下 · 旧纸箱地址",
    "猫董事长",
    [
      "猫把照片翻过来，背面是你十年前的字：“先住这里，明天给你找家。”",
      "“你后来搬了。”它低头整理领带，“我不想再让别人的‘明天’变成一句客气话。买下城听起来，比求人留下容易。”",
      "它没有看你，只问：“这次你会把一句话说完吗？”",
    ],
    [
      c(
        "promise-cat",
        "承诺今晚回来，和它一起找办法",
        "station",
        "你答应今晚回来，猫把备用钥匙交给了你。",
        {
          flags: ["cat-promise", "cat-secret", "partner"],
          relation: { cat: 2 },
        },
      ),
      c(
        "honest-cat",
        "不轻易承诺，但愿意把真相告诉大家",
        "station",
        "猫收起钥匙，却把合同副本给了你。",
        { flags: ["evidence", "cat-secret"], relation: { cat: 1 } },
      ),
    ],
  ),
  scene(
    "roof-chase",
    1,
    "屋顶不是捷径",
    "广告牌背面",
    "猫保安",
    [
      "你抱着公文包跃过两栋楼，落在“未来可期”的广告牌后。广告牌正在被拆，工人说后面两个字欠费了。",
      "保安没有抓你，只把手伸出来：“董事长不是唯一想拿到这张纸的人。你打算公开，还是拿它换自己的那一份？”",
    ],
    [
      c(
        "copy-record",
        "拍下协议编号，把证据公开",
        "station",
        "你留住原件并公开编号，管理处已经无法悄悄销账。",
        { flags: ["exposed"], relation: { cat: -1, clerk: 1 } },
      ),
      c(
        "hide-record",
        "藏好原件，暂不表态",
        "station",
        "你保留了最强的筹码，但没人知道你站在哪边。",
        { flags: ["bargain"] },
      ),
    ],
  ),
  scene(
    "driver-custody",
    1,
    "杯套里的明天",
    "0 路车后排",
    "末班车司机",
    [
      "司机把合同塞进保温杯套，表面还写着“多喝热水”。猫保安检查了发动机，没检查枸杞。",
      "“我会替你带到终点。”他递给你一张车票，“但你得回来。今晚我不想再白等一个人。”",
    ],
    [
      c(
        "keep-rendezvous",
        "答应在终点接头，记下末班时间",
        "station",
        "你承诺回到终点取证，原件仍由司机保管。",
        { flags: ["driver-promise"], relation: { driver: 1 } },
      ),
      c(
        "let-driver-decide",
        "告诉他必要时先公开，不必等你",
        "station",
        "你授权司机公开原件，证据不再只掌握在你手中。",
        { flags: ["public-evidence"], relation: { driver: 1 } },
      ),
    ],
  ),
  scene(
    "bus-radio",
    1,
    "这一站，未完成",
    "0 路车驾驶室",
    "末班车司机",
    [
      "你按下话筒：“下一站，没说出口的话。请带好随身遗憾。”乘客居然笑了。",
      "司机的女儿接通电话：“爸，你能不能别再发月亮表情了，直接说你在哪？”车窗外的路牌开始消失。",
    ],
    [
      c(
        "call-daughter",
        "把话筒交给司机，让他亲口约她",
        "station",
        "司机和女儿约好在终点见面，她会等这趟车。",
        { flags: ["daughter-waiting"], relation: { driver: 1 } },
      ),
      c(
        "route-moon",
        "在路线图上补一站“月亮”",
        "station",
        "你答应让最后一班车开到能看见月亮的地方。",
        { flags: ["moon-route"], relation: { driver: 1 } },
      ),
    ],
  ),
  scene(
    "bus-repair",
    1,
    "修好一辆往回开的车",
    "桥下车库",
    "修车师傅",
    [
      "线路故障不在发动机，而在导航里。所有目的地都被改成了“更好的以后”。",
      "你恢复手动画线，司机把车头调转。队伍里有人敲窗：“这趟车，到不到我妈家？”",
    ],
    [
      c(
        "pick-everyone",
        "先接上每一个愿意上车的人",
        "station",
        "0 路车成了公共避难所，居民记住了你的帮助。",
        { flags: ["helped-citizens"], relation: { driver: 1 } },
      ),
      c(
        "map-homes",
        "把乘客想去的家连成新线路",
        "station",
        "你留下了一张由家组成的地图。",
        { flags: ["home-map"], relation: { driver: 1 } },
      ),
    ],
  ),
  scene(
    "clerk-backdoor",
    1,
    "员工通道也通向生活",
    "管理处茶水间",
    "管理处实习生",
    [
      "小余带你钻进茶水间。墙上写着“这里所有加班都可以兑换未来假期”。兑换机已经拔电。",
      "她的柜子里藏着未寄出的辞职信。“我只是想亲手完成一件事，再走。”",
    ],
    [
      c(
        "take-letter",
        "替她保管辞职信，查完后一起出去",
        "station",
        "你替小余保管信件，也答应带她离开。",
        { flags: ["clerk-letter", "clerk-promise"], relation: { clerk: 1 } },
      ),
      c(
        "keep-copy",
        "复印员工兑换规则，留作谈判证据",
        "station",
        "你取得了管理处也欠明天的证明。",
        { flags: ["employee-evidence"], relation: { clerk: 1 } },
      ),
    ],
  ),
  scene(
    "clerk-counter",
    1,
    "排在你前面的，是昨天",
    "公开查阅窗口",
    "窗口广播",
    [
      "取号机吐出“第 0 号”。窗口说：“前面都是没来得及的人。”玻璃后的小余用口型告诉你：别走。",
      "她把回执盖了三遍章，终于将你变成系统不能删除的申请人。你听见后台响起一声很小的警报。",
    ],
    [
      c(
        "wait-legal",
        "带着盖章回执，正式要求归档",
        "station",
        "你的申请获得正式编号，最后可以走公开听证程序。",
        { flags: ["hearing"], relation: { clerk: 1 } },
      ),
      c(
        "share-number",
        "把查阅编号发给排队的人",
        "station",
        "每个人都能跟进这份申请，你不再是唯一的知情人。",
        { flags: ["exposed", "helped-citizens"], relation: { clerk: 1 } },
      ),
    ],
  ),
  scene(
    "station",
    2,
    "所有路，都要先经过这里",
    "以后再说站 · 11:40",
    "站务广播",
    [
      "地铁停在两站之间。闸机显示：“请证明您确实需要明天。”一个人翻遍手机，只找到一百七十条收藏但没做过的菜。",
      "你的小票在口袋里发热。买来的能力第一次真正派上用场，但收银机从来没说它们好用。",
    ],
    [],
  ),
  scene(
    "ordinary",
    2,
    "没有超能力的那条路",
    "站台边缘",
    "保洁阿姨",
    [
      "你没用能力。你问保洁阿姨：“有没有正常出口？”她把拖把一横：“当然有，只是人们总觉得那个太慢。”",
      "你们推开一扇写着“请勿堆物”的门，搬开三十七箱“下次一定”，楼梯就在后面。",
    ],
    [
      c(
        "carry-boxes",
        "帮她把最后一箱也搬开",
        "queue",
        "你花了时间帮别人打开出口，居民愿意替你作证。",
        { flags: ["helped-citizens"], relation: { driver: 1 } },
      ),
      c(
        "leave-map",
        "把出口画在墙上，再赶路",
        "queue",
        "你留下出口地图，后来的人不再需要能力也能出去。",
        { flags: ["public-path"], relation: { clerk: 1 } },
      ),
    ],
  ),
  scene(
    "queue",
    2,
    "这里退不了“算了”",
    "心愿退货服务台 · 14:20",
    "退货员",
    [
      "队伍里的人捧着未拆封的吉他、两张过期车票，以及一盆从没晒过太阳的小树。退货员反复解释：“没尝试过，不算质量问题。”",
      "一个小孩拽住你，问明天没了，生日蛋糕上的蜡烛还要不要吹。远处，档案馆的闸门正在合拢；你手机里那个许久没拨的号码亮了起来。",
    ],
    [
      c(
        "help-wish",
        "先帮小孩过完这个生日",
        "birthday",
        "你把别人的小事排在了大事前面。",
        { flags: ["helped-citizens"], relation: { driver: 1 } },
      ),
      c(
        "chase-archive",
        "先追查合同，给所有人找答案",
        "archive-door",
        "你追上了档案馆最后一辆收件车。",
        { flags: ["investigate"] },
      ),
      c(
        "answer-home",
        "接起电话，问清回家的路",
        "home-call",
        "你没有再把那通电话留到以后。",
        { flags: ["home-call"] },
      ),
    ],
  ),
  scene(
    "birthday",
    2,
    "第七根蜡烛",
    "街边已打烊的蛋糕店",
    "过生日的小孩",
    [
      "蛋糕店只剩一块样品。老板说不能吃，小孩说：“那就假装吃。愿望也没说必须是真的。”",
      "你们围着塑料草莓唱完歌。小孩没许拯救世界的愿望，只想明天还能和今天的人一起玩。它把一根蜡烛交给你。",
    ],
    [
      c(
        "promise-birthday",
        "答应明年还来，收下蜡烛",
        "archive",
        "你答应来年的生日，并带走了一根未熄的蜡烛。",
        { flags: ["birthday-promise", "candle"] },
      ),
      c(
        "invite-child",
        "不许远期愿望，先带他们走到安全地方",
        "archive",
        "你把孩子和老板送上了 0 路车。",
        { flags: ["child-safe", "public-bus"], relation: { driver: 1 } },
      ),
    ],
  ),
  scene(
    "archive-door",
    2,
    "没有首页的账本",
    "档案馆装卸口",
    "搬运员",
    [
      "所有人的明天装在透明袋里。有人的袋子沉甸甸，有人的袋子像一口没叹完的气。",
      "你找到自己的袋子，上面贴着“优先归还，交换其他住户同意权”。只要签字，你就能先安全回去。",
    ],
    [
      c(
        "reject-priority",
        "撕掉优先归还标签，查整本账",
        "archive",
        "你拒绝拿别人的明天交换自己的安全。",
        { flags: ["public-demand"] },
      ),
      c(
        "keep-priority",
        "留下标签，但暂时不签字",
        "archive",
        "你留下私人退路，最后仍有机会独自离开。",
        { flags: ["private-ticket"] },
      ),
    ],
  ),
  scene(
    "home-call",
    2,
    "电话那边没有末日",
    "桥上 · 家的方向",
    "电话里的家人",
    [
      "电话里先问你吃没吃饭。你说城市可能没明天了。对面想了一会儿，说：“那今天回来吃。”",
      "你突然发现，回家的地址一直没有变，变的是你每次打算动身的日期。对面锅铲响了一声，没催你。",
    ],
    [
      c(
        "promise-home",
        "说“给我留盏灯”，先把事情做完",
        "archive",
        "你约好回家，不再用“有空”作答。",
        { flags: ["home-promise", "home-key"] },
      ),
      c(
        "share-home",
        "问能不能多带几个无处可去的人",
        "archive",
        "电话那边开始多淘几杯米，你带走了一把家门钥匙。",
        { flags: ["home-key", "open-home"], relation: { driver: 1 } },
      ),
    ],
  ),
  scene(
    "archive",
    3,
    "抵押的不是时间",
    "明天失物招领处 · 17:00",
    "馆内录音",
    [
      "你终于看见账本第一页。城市没有缺少时间，缺少的是有人愿意为尚未发生的事负责。每一句“以后再说”，都被系统当成了放弃声明。",
      "猫董事长买走这些声明，想阻止人们离开；管理处拿钱给永远加班的职员发未来假期。没有一个人承认自己在取消明天。",
      "门被敲了三下。猫董事长进来，身后的保安看向你的包。",
    ],
    [
      c(
        "face-search",
        "把包放上桌，面对它",
        "cat-search",
        "猫认出了被偷走的公文包，要求你说明原件在哪。",
        { when: (s) => flag(s, "stolen") },
      ),
      c(
        "face-partner",
        "提醒它：我们说好公开账目",
        "cat-partner",
        "你把董事会的承诺搬上桌面。",
        { when: (s) => !flag(s, "stolen") && flag(s, "cat-route") },
      ),
      c(
        "face-outsider",
        "以市民身份要求它解释",
        "cat-outsider",
        "你没有欠它合作义务，因此也不接受它替你决定明天。",
        { when: (s) => !flag(s, "stolen") && !flag(s, "cat-route") },
      ),
    ],
  ),
  scene(
    "cat-search",
    3,
    "包里的证据，包外的信任",
    "档案馆谈判桌",
    "猫董事长",
    [
      "“偷东西的人要我相信他？”猫把空包翻过来，一粒冻干落在桌上。保安检查了每一层夹袋。",
      "它不只是在找合同，也是在等你承认。你发现有些门，即使拿到了钥匙，也不能假装自己从没撬过锁。",
    ],
    [
      c(
        "return-original",
        "承认偷窃，交回原件换公开谈判",
        "crossroads",
        "你交出了原件，猫撤销追踪；但它不会立刻重新信任你。",
        {
          when: (s) => flag(s, "contract"),
          remove: ["contract", "wanted"],
          flags: ["returned-contract", "negotiation"],
          relation: { cat: 1 },
        },
      ),
      c(
        "call-custodian",
        "说明司机持有原件，请他公开作证",
        "crossroads",
        "司机在车载广播里读出合同编号，猫保安再也无法收回秘密。",
        {
          when: (s) => flag(s, "driver-custody"),
          flags: ["public-evidence", "exposed"],
          relation: { cat: -1, driver: 1 },
        },
      ),
      c(
        "expose-original",
        "把手中原件贴到公共公告栏",
        "crossroads",
        "你用原件公开指控猫的收购，双方正式决裂。",
        {
          when: (s) => flag(s, "contract"),
          flags: ["exposed", "public-evidence"],
          remove: ["contract"],
          relation: { cat: -1, clerk: 1 },
        },
      ),
    ],
  ),
  scene(
    "cat-partner",
    3,
    "合作伙伴，还是装饰品",
    "董事会之外的一张桌子",
    "猫董事长",
    [
      "猫拿来你坐过的第九把椅子。“给你留着的。”它说。你问没有椅子的人怎么办，它的耳朵低了下来。",
      "“我只是怕你们又走了。”这句话像猫语，又不像。合同背面压着那张旧纸箱照片。",
    ],
    [
      c(
        "share-ownership",
        "要求把城市归还给居民共同持有",
        "crossroads",
        "猫答应加入共同谈判，前提是你不再替居民作主。",
        { flags: ["negotiation", "collective"], relation: { cat: 1 } },
      ),
      c(
        "accept-company",
        "接受职位，用公司资源保住大家",
        "crossroads",
        "你成为董事长的人类代理，猫的席位会在最后为你保留。",
        { flags: ["cat-seat", "box-debt"], relation: { cat: 1 } },
      ),
      c(
        "break-partnership",
        "公开账本，不再代表纸箱集团",
        "crossroads",
        "你结束与猫的合作，保留了秘密却失去了它的信任。",
        { flags: ["exposed", "broke-cat"], relation: { cat: -2 } },
      ),
    ],
  ),
  scene(
    "cat-outsider",
    3,
    "不需要被收购的明天",
    "市民旁听席",
    "猫董事长",
    [
      "“人类不是每天都在出售明天吗？”猫问，“给工作，给焦虑，给还没出现的别人。”",
      "小余把一张空白申请表推到你面前：“出售和被默认出售，不是一回事。你可以让他们重新选一次。”",
    ],
    [
      c(
        "request-hearing",
        "要求每个人重新表达意愿",
        "crossroads",
        "你发起公开听证，居民的决定将取代默认勾选。",
        { flags: ["hearing", "collective"], relation: { clerk: 1 } },
      ),
      c(
        "offer-cat",
        "请猫成为担保者，而不是所有者",
        "crossroads",
        "猫答应给谈判提供担保，关系从对峙变成试探。",
        { flags: ["negotiation"], relation: { cat: 1 } },
      ),
    ],
  ),
  scene(
    "crossroads",
    3,
    "谁替明天签字",
    "档案馆 · 签名台",
    "管理处实习生",
    [
      "系统要求一位责任人。不是救世主，只是有人愿意写下：“出了问题，可以找我。”",
      "小余的手抖得厉害。她说可以公开内部记录，但记录第一页就是她的名字。猫提出另一种办法：让它买单，也让它继续拥有城市。",
    ],
    [
      c(
        "redact-name",
        "遮住实习生姓名，公开制度和账目",
        "sidegate",
        "你公开证据而不出卖提供证据的人，小余愿意继续作证。",
        { flags: ["redacted", "hearing"], relation: { clerk: 1 } },
      ),
      c(
        "publish-name",
        "完整公开记录，连姓名也不遮",
        "sidegate",
        "真相传播得更快，但小余被立即停职；她记住了你的决定。",
        { flags: ["exposed", "betrayed-clerk"], relation: { clerk: -3 } },
      ),
      c(
        "cat-guarantee",
        "接受猫的担保，先保住现有城市",
        "sidegate",
        "猫拿出自己的股份作担保，代价是你欠下了一份长期纸箱订单。",
        {
          when: (s) => s.relations.cat >= 1 && !flag(s, "broke-cat"),
          flags: ["cat-seat", "box-debt"],
          relation: { cat: 1 },
        },
      ),
    ],
  ),
  scene(
    "sidegate",
    3,
    "档案馆的侧门",
    "失物层 · 不存在的 B1",
    "一封没有寄出的信",
    [
      "主出口暂时封闭，侧门却开了。门里存放的不是物品，是人们以为以后还能完成的版本。",
      "小票上的能力标记亮起来，某些组合能把你带到更奇怪的地方。你也可以走普通信件通道；那里的地址未必属于别人。",
    ],
    [],
  ),
  scene(
    "lost-letter",
    3,
    "寄给今天的你",
    "未寄出的信件走廊",
    "旧信",
    [
      "你找到一封十年前写给自己的信。没有成功人士清单，只有一句：“希望以后的我，还有人可以一起吃面。”",
      "信封里掉出一张空座位的照片。你不确定那是不是命运，但至少那是一张可以挪动的椅子。",
    ],
    [
      c(
        "keep-letter",
        "收下信，把那个空位留给别人",
        "crisis",
        "你留下了一张邀请，而不是一份人生考核。",
        { flags: ["open-seat", "keeper-clue"], relation: { keeper: 1 } },
      ),
      c(
        "send-reply",
        "写一句“我还在”，把信寄回去",
        "crisis",
        "信箱吞下回信，走廊尽头传来一句很轻的“收到”。",
        { flags: ["replied", "home-key"], relation: { keeper: 1 } },
      ),
    ],
  ),
  scene(
    "crisis",
    4,
    "所有副作用，同时生效",
    "断电的城市 · 22:10",
    "紧急广播",
    [
      "城市开始断电。原本可爱的代价不再只是文案：有人的烦恼在嘎嘎叫，有人的背景乐引来巡逻队，有人的口袋正往外掉面包屑。",
      "你发现能力不能替你解决所有问题。前面是最后一座桥，桥对面是决定明天归属的控制台。桥闸正在落下，你得决定向谁求助。",
    ],
    [
      c(
        "call-cat",
        "向猫董事长借一条秘密通道",
        "ally-cat",
        "猫派来专车，但你欠下的承诺也一起上了车。",
        { when: (s) => s.relations.cat >= 2 && !flag(s, "broke-cat") },
      ),
      c(
        "call-driver",
        "呼叫 0 路车，让司机接应",
        "ally-driver",
        "司机把末班车开上桥，车灯为你照出一条路。",
        { when: (s) => s.relations.driver >= 1 },
      ),
      c(
        "call-clerk",
        "请小余打开应急员工通道",
        "ally-clerk",
        "小余带着自己的工牌赶来，决定承担这次开门的后果。",
        { when: (s) => s.relations.clerk >= 1 && !flag(s, "betrayed-clerk") },
      ),
      c(
        "cross-alone",
        "不再借谁的承诺，自己走过桥",
        "ally-alone",
        "你选择步行，没有人替你承担这一次风险。",
        { flags: ["alone"] },
      ),
    ],
  ),
  scene(
    "ally-cat",
    4,
    "欢迎乘坐纸箱专车",
    "桥下 · 集团物流通道",
    "猫董事长",
    [
      "专车是一只会移动的巨大纸箱。猫说环保，你觉得主要是舒服。它把你承诺过的事一件件列在爪印便签上，没有催债，只问哪一件你真的打算做。",
    ],
    [
      c(
        "honor-cat",
        "把今晚留下的承诺写进合作协议",
        "cost",
        "你确认回来见猫，并承认纸箱订单是自己的责任。",
        { flags: ["kept-cat", "boxes-promised"], relation: { cat: 1 } },
      ),
      c(
        "use-cat",
        "先过桥，再把合作协议扔下车",
        "cost",
        "你利用了猫的援助，再次离开。猫没有追，只收回了控制台的公司权限。",
        { flags: ["broke-cat"], remove: ["cat-seat"], relation: { cat: -3 } },
      ),
    ],
  ),
  scene(
    "ally-driver",
    4,
    "有人在终点等",
    "桥上 · 0 路末班车",
    "末班车司机",
    [
      "司机没问你是不是拯救城市的人，只问：“人齐了吗？”后排坐着那些你可能帮过，也可能匆匆路过的人。",
      "杯套里藏着的纸、仪表盘上的月亮、终点等着的女儿，都让这辆车有了不肯停下的理由。",
    ],
    [
      c(
        "return-for-driver",
        "一起到终点，不让任何人再白等",
        "cost",
        "你陪司机完成最后一趟接送；车票会在最终时刻为你保留。",
        { flags: ["kept-driver", "bus-ticket"], relation: { driver: 1 } },
      ),
      c(
        "drop-early",
        "请他放下自己，先把其他人送走",
        "cost",
        "你让出了车票，司机先带乘客离开；公共路线仍被保住。",
        { flags: ["public-bus", "helped-citizens"], relation: { driver: 1 } },
      ),
    ],
  ),
  scene(
    "ally-clerk",
    4,
    "离职前最后一次打卡",
    "员工应急通道",
    "管理处实习生",
    [
      "小余刷开门，工牌显示“权限即将到期”。你问她怕不怕，她说：“怕。但我不想让最后一条工作记录是‘已劝退申请人’。”",
    ],
    [
      c(
        "leave-together",
        "让她先提交辞职，再一起离开",
        "cost",
        "小余把辞职信放进已受理的窗口，你履行了带她出来的承诺。",
        { flags: ["clerk-free", "kept-clerk"], relation: { clerk: 1 } },
      ),
      c(
        "keep-record",
        "和她留下公开操作记录",
        "cost",
        "你们为这次开门留下可追溯的依据，重写规则不再只是口号。",
        { flags: ["hearing", "employee-evidence"], relation: { clerk: 1 } },
      ),
    ],
  ),
  scene(
    "ally-alone",
    4,
    "不是英雄的过桥方式",
    "桥面维修道",
    "自己的脚步",
    [
      "你从维修道往前挪，下面是满城尚未兑现的承诺。没有配乐，鞋底也不怎么体面。",
      "你路过一辆卡住的轮椅。控制台还亮着，再多停一会儿可能错过最后的操作时间。",
    ],
    [
      c(
        "stop-for-stranger",
        "停下来，先把轮椅推过桥",
        "cost",
        "你没能第一个到控制台，但有人会替你证明这座城仍值得拥有明天。",
        { flags: ["helped-citizens", "bridge-witness"] },
      ),
      c(
        "reach-console",
        "先抵达控制台，再打开桥闸",
        "cost",
        "你赶上了控制台的最后登录时限，保留了一次私人通行权限。",
        { flags: ["private-ticket"] },
      ),
    ],
  ),
  scene(
    "cost",
    4,
    "奇迹不是免费续订",
    "控制台前 · 23:48",
    "小卖部店主",
    [
      "店主从一台自动售货机里钻出来，围裙上都是螺丝。“找到这里就好。机器不是许愿池，想重开明天，需要拿一样真正属于你的东西抵押。”",
      "你可以交回一项能力，注销全部能力，或者保留能力并承担一张长期账单。选项没有标准答案，但下一幕真的会少掉你交出的东西。",
    ],
    [],
  ),
  scene(
    "midnight",
    5,
    "最后一班明天",
    "午夜天台 · 23:59",
    "城市控制台",
    [
      "屏幕亮起。猫的担保书、居民的证词、那通家的电话，以及你签过或没签过的名字，终于汇集到这里。",
      "没有人再问你想成为哪一种人。控制台只问：你打算把明天交到谁手里？",
      "这次选择之后，城市会真的朝那个方向走。",
    ],
    [
      c(
        "end-common",
        "把明天归还全城，今晚的小事也算数",
        "end-common",
        "你选择恢复所有居民的明天。",
      ),
      c(
        "end-company",
        "接受猫的职位，进入纸箱集团",
        "end-company",
        "你以人类代表的身份签下集团协议。",
        {
          when: (s) =>
            flag(s, "cat-seat") &&
            s.relations.cat >= 2 &&
            !flag(s, "broke-cat"),
        },
      ),
      c(
        "end-sunday",
        "用注销的全部能力，换大家六小时休息",
        "end-sunday",
        "你不再续订奇迹，而让整座城多出一段属于自己的时间。",
        { when: (s) => flag(s, "all-returned") },
      ),
      c(
        "end-home",
        "拿起家门钥匙，先完成自己的归途",
        "end-home",
        "你把最后一次选择留给那盏一直亮着的灯。",
        {
          when: (s) =>
            flag(s, "home-key") || flag(s, "home-map") || has(s, "door"),
        },
      ),
      c(
        "end-train",
        "登上没有目的地的 0 路车",
        "end-train",
        "你把不知道也没关系，写进了下一张车票。",
        { when: (s) => flag(s, "bus-ticket") || flag(s, "public-bus") },
      ),
      c(
        "end-rewrite",
        "让市民重新签字，重写默认规则",
        "end-rewrite",
        "你选择让同意真正发生，而不再由系统默认。",
        {
          when: (s) =>
            flag(s, "hearing") &&
            (s.relations.clerk >= 1 || flag(s, "public-evidence")) &&
            !flag(s, "betrayed-clerk"),
        },
      ),
      c(
        "end-dream",
        "用梦境接住尚未准备好醒来的人",
        "end-dream",
        "你为来不及告别的人留下一场可以续播的梦。",
        { when: (s) => has(s, "dream") && flag(s, "dream-shelter") },
      ),
      c(
        "end-keeper",
        "接过围裙，成为明天的店主",
        "end-keeper",
        "你选择留下，为下一个犹豫的人留着灯。",
        { when: (s) => flag(s, "keeper-clue") && s.relations.keeper >= 1 },
      ),
    ],
  ),
];

const abilityContent: [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
][] = [
  [
    "cat",
    "猫开的秘密通道",
    "猫站长把告示翻过来：“人类通道已关，猫道正常运营。”你问通行费，它说纸箱四百个。你心里骂了一句，它立刻回答：“涨到四百零一。”",
    "答应分批交纸箱，走猫道",
    "认真记下这份荒诞但有效的纸箱订单。",
    "不赊账，替猫站长搬一次货",
    "你没有欠纸箱，而是用劳动换到通行。",
  ],
  [
    "save",
    "那阵拨号音",
    "你说“我保证给每个人明天”，发现自己根本做不到，立刻撤回。站务员忘了原话，却记住了拨号音：“你是不是已经在这里保证过什么？”",
    "承认自己刚才夸大了能力",
    "站务员记住了你的诚实，而不是一个无效保证。",
    "换一句小一点的承诺：我先找出口",
    "你给出一个当天就能完成的承诺。",
  ],
  [
    "weather",
    "一米之内，天气尚好",
    "地铁口下起了室内暴雨。你头顶晴朗，身后所有人都在一米之外淋雨。一个小孩问：“你的太阳，能不能往这边挪一点？”",
    "慢慢走，和大家挤在一米晴天里",
    "你们像一把移动的伞，谁也没被单独留在雨里。",
    "先去打开排水口，再折回来接人",
    "你淋湿了鞋，却把晴天变成了所有人的出口。",
  ],
  [
    "dream",
    "梦境广告还剩十五秒",
    "你在站台闭眼，进入出口设计师的梦。广告是“宇宙保险，末日不赔”。广告结束，你看见他把紧急出口藏进了童年游乐场。",
    "沿着旋转木马，找回出口图纸",
    "你取回出口图，也发现梦能暂时收留无处可去的人。",
    "先把梦里迷路的小孩带出来",
    "你记住了梦中的安全角落，那里可以容纳更多人。",
  ],
  [
    "teleport",
    "欢迎光临，禁止入内",
    "你瞬移到闸机后。响亮的欢迎光临惊醒了巡逻员。他让你演示怎么在最严禁声的区域里“安静地瞬移”。",
    "坦白能力副作用，申请带人通行",
    "巡逻员忍着笑给你登记，欢迎光临被写进特别通行备注。",
    "假扮欢迎广播，给后面的人打掩护",
    "你引开巡逻员，其他人找到空隙过了闸机。",
  ],
  [
    "bread",
    "应急口粮与现场痕迹",
    "你从口袋掏面包安抚排队的人。面包屑掉了一路，巡逻员顺着屑找过来，问是不是发生了碳水走私。",
    "分他一只，说明大家只是饿了",
    "一场检查变成临时早餐，闸机前没有人再空着肚子。",
    "用面包屑给后来的人标出出口",
    "你把副作用留成了一条能跟随的路。",
  ],
  [
    "plant",
    "仙人掌不想客气",
    "站台装饰绿植终于忍无可忍：“出口就在我后面，你们为什么老拿我当背景？”仙人掌补充：“因为人类看不懂长刺的提示。”",
    "道歉并把盆搬到阳光里",
    "植物告诉你后台入口，还请求你照看失物层的幼苗。",
    "请它们把出口消息沿根系传出去",
    "整条地铁的盆栽接力指路，绿植第一次有了话语权。",
  ],
  [
    "pause",
    "六小时与百分之一",
    "你拉长一个周日，所有屏幕一起跳到 1% 电。没有导航，也没有搜索。离线的世界忽然只剩下你和站务员画在纸上的地图。",
    "关机，带大家看纸质地图",
    "你把多出来的时间用来找一条不依赖屏幕的路。",
    "坐下来，听站务员把整条线讲完",
    "你第一次知道，每一站的名字都来自一件真实发生的事。",
  ],
  [
    "music",
    "请勿在站内播放心动",
    "你盯着出口想起一个人，背景乐突然放成告白现场。整座站台看向你，包括巡逻员。“告白可以，”他说，“别堵消防通道。”",
    "把音乐变成疏散节拍",
    "人群跟着节拍前进，尴尬变成了一次有序撤离。",
    "关不掉就唱完，给大家一场临时演出",
    "你让等待的人笑了，巡逻员也没有再赶你。",
  ],
  [
    "ghost",
    "透明的人，不透明的外套",
    "你隐身十分钟，外套却仍悬在空中。一个孩子惊呼鬼，保洁阿姨说：“鬼也别挡拖地。”你把外套挂到路标上，出口顿时显眼起来。",
    "公开解释，别让别人因你害怕",
    "你现身带路，小余在检查记录里写下“没有危险”。",
    "借透明的十分钟去推开后门",
    "你从里面打开后门，并把外套留成了醒目的标记。",
  ],
  [
    "luck",
    "今日幸运：没有踩到",
    "宇宙给了你今日好运：你没有踩到站台上的一滩可疑物。你正想投诉，却发现蹲下系鞋带的人指着那滩水里倒映的出口箭头。",
    "相信这点小好运，沿箭头找路",
    "你把不起眼的幸运用成了真的线索。",
    "把箭头擦出来，让所有人都看见",
    "幸运不再只属于你，后来的人不必等宇宙发放配额。",
  ],
  [
    "future",
    "别信穿鞋猫",
    "便利贴从袖子里掉出来，五个字歪歪扭扭：别信穿鞋猫。站长恰好穿着四只小皮鞋。他坚持收费，但不肯开收据。",
    "要求正式票据，核实猫的身份",
    "你拆穿冒牌站长，拿到了真实的员工通道图。",
    "绕开交易，提醒其他人不要付款",
    "你保住了大家的零钱，也让猫保安欠你一次说明。",
  ],
  [
    "sleep",
    "醒来请先整理发型",
    "你决定先睡三秒理清思路。醒来顶着一头像地铁线路图的乱发，巡逻员盯着你的头说：“等等，消失的那条换乘线就在这儿。”",
    "允许他画下来，公开失踪路线",
    "发型成了临时地图，你笑着让大家拍了下来。",
    "亲自带路，拒绝把照片传上网",
    "你保住隐私，同时陪大家找到了那条换乘线。",
  ],
  [
    "memory",
    "出口曾经在这里",
    "你投影出第一次坐地铁的记忆，童年锅盖头以 4K 大小铺满墙。站台上的人先笑，然后认出画面里那扇后来被广告盖住的门。",
    "留着尴尬投影，让大家找到出口",
    "你没有关掉过去，记忆给今天腾出了一条路。",
    "请大家别拍照，一起拆开广告牌",
    "你守住边界，也让记忆变成可用的线索。",
  ],
  [
    "door",
    "外卖员也需要出口",
    "一碗面准时穿门送达。外卖员坐下讲笑话：“什么车没有明天？今天的末班车。”没人笑，他小声问能不能顺路带他出去。",
    "听完笑话，和他一起找路",
    "你给冷笑话一个完整的听众，换来配送通道的地图。",
    "用第二份订单，把出口位置传给外面",
    "你在备注里留下求助，门外的人开始从另一侧开锁。",
  ],
  [
    "bird",
    "大风筝禁止逃票",
    "你喊出“我是大风筝”，全站抬头。你从天窗飞到通风平台，找到手动开关。巡逻员的扩音器追着喊：飞行也要看指示牌。",
    "从上方打开所有出口",
    "你没有只为自己飞走，而是从另一面打开了门。",
    "先把被困的小孩接到安全平台",
    "你把二十分钟飞行时间花在了一次具体的接送上。",
  ],
  [
    "duck",
    "烦恼请排队嘎叫",
    "你把出不去的焦虑变成小黄鸭。它立刻嘎嘎大叫，引来更多人的烦恼鸭。整个站台开始同步抗议，闸机识别成了超大声的紧急信号。",
    "留下听每只鸭为什么叫",
    "你没有急着消灭烦恼，鸭群愿意跟你一起行动。",
    "让鸭群带头，组织大家走紧急通道",
    "鸭子走得很慢，但没有人落单。",
  ],
  [
    "clean",
    "家务精灵重排出口",
    "小精灵把乱糟糟的站台收拾干净，还把路牌按颜色重新归类。出口箭头整整齐齐，都指向墙。它坚持这是视觉上最舒服的方向。",
    "和精灵协商，功能优先于好看",
    "精灵不太服气，但学会先问使用者需要什么。",
    "用整理好的工具，自己标回正确方向",
    "你负责路线，精灵负责照明，合作终于有了分工。",
  ],
];
for (const [
  id,
  title,
  text,
  label1,
  outcome1,
  label2,
  outcome2,
] of abilityContent) {
  const extra =
    id === "dream"
      ? ["dream-shelter"]
      : id === "plant"
        ? ["seed-clue"]
        : id === "future"
          ? ["fake-cat-known"]
          : id === "save"
            ? ["rewound"]
            : id === "duck"
              ? ["duck-friends"]
              : [];
  list.push(
    scene(
      `ability-${id}`,
      2,
      title,
      "以后再说站 · 能力试用区",
      products.find((p) => p.id === id)!.name,
      [
        text,
        "这是你买来的能力，也是随它一起发生的生活。你可以决定怎么使用它，而不是只能接受广告词。",
      ],
      [
        c(`use-${id}-care`, label1, "queue", outcome1, {
          flags: [
            `used-${id}`,
            "helped-citizens",
            ...extra,
            ...(id === "cat" ? ["box-debt"] : []),
          ],
          relation: id === "cat" ? { cat: 1 } : { driver: 1 },
        }),
        c(`use-${id}-solve`, label2, "queue", outcome2, {
          flags: [`used-${id}`, "public-path", ...extra],
          relation: { clerk: 1 },
        }),
      ],
    ),
  );
}
list.find((s) => s.id === "station")!.choices = [
  ...products.map((p) =>
    c(
      `try-${p.id}`,
      `${p.icon} 用「${p.name}」试一条不同的路`,
      `ability-${p.id}`,
      `你决定使用${p.name}，也接受它的副作用。`,
      { when: (s) => has(s, p.id), hint: p.side },
    ),
  ),
  c(
    "ordinary-exit",
    "不用能力，找一条所有人都能走的路",
    "ordinary",
    "你选择普通人的办法，没有能力也不会被挡在剧情外。",
  ),
];
const comboContent: {
  id: string;
  ids: string[];
  title: string;
  text: string[];
  choices: Choice[];
}[] = [
  {
    id: "cat-dream",
    ids: ["cat", "dream"],
    title: "猫导的最后一镜",
    text: [
      "你在梦里醒来，猫董事长坐在导演椅上。连续剧《人类，去开罐头》已经拍了十年，所有片尾都是你关门离开。",
      "它说今天可以重拍结尾。导演的爪子悬在场记板上，等你决定是留下，还是让那个画面终于继续。",
    ],
    choices: [
      c(
        "cat-retake",
        "不改过去，陪它拍完新的结尾",
        "crisis",
        "你没有伪造从未离开的过去，而是陪猫完成了一场新的告别。",
        {
          flags: ["cat-secret", "dream-shelter", "combo-cat-dream"],
          relation: { cat: 1 },
        },
      ),
      c(
        "cat-release",
        "把结尾交给它自己决定",
        "crisis",
        "你把主角的位置还给猫，它决定第一次独自走出镜头。",
        {
          flags: ["dream-shelter", "combo-cat-dream"],
          relation: { keeper: 1 },
        },
      ),
    ],
  },
  {
    id: "garden",
    ids: ["weather", "plant"],
    title: "一平方米避难所",
    text: [
      "幼苗说自己在失物层活了很久，从没见过真正的春天。你的晴天只有一米，带上它就挤不下太多人。",
      "仙人掌抱怨：“怎么又是最小的先被留下？”你可以抱着盆走，也可以把临时避难所留给它们。",
    ],
    choices: [
      c(
        "carry-seed",
        "抱着幼苗走出失物层",
        "crisis",
        "你带出了一株活物，答应明年陪它看看真正的春天。",
        {
          flags: ["seed-promise", "seed-safe", "combo-garden"],
          relation: { driver: 1 },
        },
      ),
      c(
        "share-garden",
        "让植物先在一米晴天里缓过来",
        "crisis",
        "你的能力成了公共花园，幼苗把第一片新叶送给你。",
        {
          flags: ["seed-safe", "helped-citizens", "combo-garden"],
          relation: { keeper: 1 },
        },
      ),
    ],
  },
  {
    id: "old-order",
    ids: ["teleport", "door"],
    title: "订单送往昨天",
    text: [
      "配送地址是十年前的家，备注写着“别放太多葱”。你瞬移到旧门口，看见外卖员正等一个还没学会说再见的人。",
      "门只能开一次。你可以给过去送一句话，也可以把这顿面带回今天。",
    ],
    choices: [
      c(
        "send-old-word",
        "送去一句“你没有做错什么”",
        "crisis",
        "你没有修改过去，只让那个版本的自己少等了一会儿。",
        { flags: ["home-key", "combo-old-order"] },
      ),
      c(
        "bring-noodles",
        "把热面带回今天，给家里打电话",
        "crisis",
        "你终于把一顿想象中的团圆，变成了今天可以赴的约。",
        { flags: ["home-key", "home-promise", "combo-old-order"] },
      ),
    ],
  },
  {
    id: "sky-show",
    ids: ["music", "bird"],
    title: "天空不许散场",
    text: [
      "你飞到城市上方，背景乐在楼群间响起。街上正准备告别的人停住了，好像这不是末日，而是一场还没到安可的演出。",
      "二十分钟飞行快用完了。你能继续独唱，也能把旋律交给地面的人。",
    ],
    choices: [
      c(
        "sky-chorus",
        "让整座城接唱，把舞台还给他们",
        "crisis",
        "你落地时音乐没有停止，居民自己接住了后半首歌。",
        { flags: ["helped-citizens", "collective", "combo-sky-show"] },
      ),
      c(
        "sky-moon",
        "为末班车照出通向月亮的路",
        "crisis",
        "你用最后几分钟飞行，为司机兑现那条月亮路线。",
        {
          flags: ["moon-route", "public-bus", "combo-sky-show"],
          relation: { driver: 1 },
        },
      ),
    ],
  },
  {
    id: "duck-march",
    ids: ["bread", "duck"],
    title: "嘎声反对",
    text: [
      "被丢弃的烦恼鸭组成抗议队，要求不能只因为难听就被静音。你掏出面包想安抚，它们开始讨论可颂的酥皮标准。",
      "领头的小鸭问：“我们是不是非得变得可爱，你们才愿意听？”",
    ],
    choices: [
      c(
        "hear-ducks",
        "不喂它们闭嘴，认真记录诉求",
        "crisis",
        "鸭群选你做临时记录员。你答应让它们在听证会上发声。",
        {
          flags: ["duck-promise", "hearing", "combo-duck-march"],
          relation: { clerk: 1 },
        },
      ),
      c(
        "feed-and-walk",
        "带上口粮，一起走到控制台",
        "crisis",
        "烦恼没有消失，但终于有人陪它们走完这段路。",
        {
          flags: ["duck-friends", "bridge-witness", "combo-duck-march"],
          relation: { driver: 1 },
        },
      ),
    ],
  },
  {
    id: "extra-hours",
    ids: ["pause", "sleep"],
    title: "多出来的六小时",
    text: [
      "你把周日拉长，又一不小心睡过去。醒来城市已经静音，只有小卖部的灯还亮着。店主独自在清点没有卖掉的明天。",
      "“能力不是我发明的。”他说，“都是上一任客人舍不得扔掉的如果。”他给你一杯不用赶着喝完的水。",
    ],
    choices: [
      c(
        "sit-keeper",
        "陪他坐一会儿，不把空白也填满",
        "crisis",
        "店主第一次在营业时休息，告诉你控制台抵押能力的方法。",
        {
          flags: ["keeper-clue", "combo-extra-hours"],
          relation: { keeper: 2 },
        },
      ),
      c(
        "ask-keeper",
        "问他有没有想去过的人生",
        "crisis",
        "他说想有一天从店外看日出。你记住了这句很小的愿望。",
        {
          flags: ["keeper-clue", "keeper-promise", "combo-extra-hours"],
          relation: { keeper: 2 },
        },
      ),
    ],
  },
];
for (const combo of comboContent)
  list.push(
    scene(
      `combo-${combo.id}`,
      3,
      combo.title,
      "能力交汇处 · 隐藏支线",
      "平行宇宙里的另一种你",
      combo.text,
      combo.choices,
    ),
  );
list.find((s) => s.id === "sidegate")!.choices = [
  ...comboContent.map((x) =>
    c(
      `enter-${x.id}`,
      `✦ ${x.title}`,
      `combo-${x.id}`,
      "你让两种能力碰在一起，推开了平时不存在的门。",
      { when: (s) => x.ids.every((id) => has(s, id)), hint: "专属组合支线" },
    ),
  ),
  c(
    "read-letter",
    "走进普通信件通道，找找自己的地址",
    "lost-letter",
    "你走向那封没有寄出的信。",
  ),
];
list.find((s) => s.id === "cost")!.choices = [
  ...products.map((p) =>
    c(
      `surrender-${p.id}`,
      `交还「${p.name}」，记住它带来的经历`,
      "midnight",
      `你交还了${p.name}。能力不再生效，但已经做过的事不会被抹去。`,
      {
        when: (s) => has(s, p.id),
        sacrifice: p.id,
        flags: ["paid-cost"],
        relation: { keeper: 1 },
      },
    ),
  ),
  c(
    "return-all",
    "注销全部能力，为所有人换一份时间",
    "midnight",
    "你把所有超能力退回，得到一份可以分给全城的六小时。",
    { flags: ["all-returned", "paid-cost"], relation: { keeper: 1 } },
  ),
  c(
    "keep-powers",
    "保留能力，亲自承担以后每月的账单",
    "midnight",
    "你保住了能力，也签下一张需要在明天继续偿还的账单。",
    { flags: ["power-debt"], relation: { keeper: 1 } },
  ),
];
const endingContent: [string, string, string, string][] = [
  [
    "common",
    "明天照常营业",
    "街道重新亮起来，人们没有集体变得更好，只是重新得到了自己做决定的时间。蛋糕店打开门，司机按了一声不那么着急的喇叭。",
    "你在小卖部门口贴了一张新纸条：“不用等人生准备好了，今天也可以来。”",
  ],
  [
    "company",
    "猫司实习生",
    "你的工牌终于印好了：纸箱集团，人类事务实习生。第一项工作是把“喵”翻译成董事会能理解的预算，而不是替猫决定所有人的去留。",
    "猫在你桌上放了一个旧纸箱。它说是办公用品，你知道不是。",
  ],
  [
    "sunday",
    "把周日留给所有人",
    "六小时落在城市上空，没有会议邀请，也没有最后通牒。所有屏幕只剩 1% 电，人们只好抬头，认一认身边人的样子。",
    "你再也听不懂猫了。它蹭了蹭你的裤脚，这一次你没有急着翻译。",
  ],
  [
    "home",
    "最后一单，送给自己",
    "你没有在天台发表演说。你把钥匙握在掌心，走回那扇没有改过地址的门。锅里的面已经坨了一点，但没有人要你为晚到道歉。",
    "你把手机上的“有空回家”删掉，改成了一个具体日期。",
  ],
  [
    "train",
    "未知站，请下车",
    "0 路车的终点不再叫“以后再说”。司机把终点牌翻过来，背面是乘客一起写的地址。有人想看海，有人只想坐到月亮升起。",
    "你没有得到一份完美路线图。你得到了一群可以商量下一站的人。",
  ],
  [
    "rewrite",
    "默认选项：由我决定",
    "小余亲手删除那个默认勾选框。此后每一份抵押都必须被认真解释，每一句同意都可以撤回。系统比以前慢了，但少了很多替人决定的按钮。",
    "新规则第一页写着：不作选择，不等于放弃明天。",
  ],
  [
    "dream",
    "今晚允许未完待续",
    "你没有把所有人叫醒。有些告别需要时间，有些故事还没找到词。梦里的车站重新开门，广告依旧烦人，但这次每个人都有座位。",
    "你成为夜班放映员。片尾不写永远幸福，只写：明天可以接着讲。",
  ],
  [
    "keeper",
    "宇宙拐角的新店主",
    "你接过那条围裙。旧店主终于从店外看见一次日出，像一个第一次不需要赶来开门的普通人。",
    "清晨，第一个客人走进来，说想买一种永不后悔的能力。你想了想，先给他倒了杯水。",
  ],
];
for (const [id, title, a, b] of endingContent)
  list.push({
    ...scene(
      `end-${id}`,
      5,
      title,
      "天亮以后 · 你选择的明天",
      "人生档案",
      [a, b],
      [],
    ),
    ending: id,
  });
export const scenes: Record<string, Scene> = Object.fromEntries(
  list.map((s) => [s.id, s]),
);
export const sceneCount = list.length;
export const endings = endingContent.map(([id, title]) => ({ id, title }));

export function start(loadout: string[]): State {
  const clean = restoreBasket(JSON.stringify({ version: 1, ids: loadout }));
  if (!clean.length) throw new Error("先选至少一件能力，再走进这一天。");
  return {
    loadout: clean,
    node: "opening",
    flags: [],
    relations: { cat: 0, driver: 0, clerk: 0, keeper: 0 },
    sacrificed: [],
    history: [],
    journal: [],
  };
}
export function choices(s: State) {
  return scenes[s.node].choices.filter((c) => !c.when || c.when(s));
}
export function choose(s: State, id: string): State {
  const option = choices(s).find((c) => c.id === id);
  if (!option) throw new Error("这个选择不属于当前场景，或条件尚未满足。");
  const next: State = {
    ...s,
    node: option.next,
    flags: [
      ...new Set([
        ...s.flags.filter((f) => !option.remove?.includes(f)),
        ...(option.flags ?? []),
      ]),
    ],
    relations: { ...s.relations },
    sacrificed: [...s.sacrificed],
    history: [...s.history, id],
    journal: [
      ...s.journal,
      {
        scene: scenes[s.node].title,
        choice: option.label,
        outcome: option.outcome,
      },
    ],
  };
  for (const [person, delta] of Object.entries(option.relation ?? {}))
    next.relations[person as Person] += delta!;
  if (option.sacrifice) next.sacrificed.push(option.sacrifice);
  if (option.flags?.includes("all-returned"))
    next.sacrificed = [...next.loadout];
  if (!scenes[next.node]) throw new Error(`缺失场景：${next.node}`);
  return next;
}
export function save(s: State) {
  return JSON.stringify({ version: 1, loadout: s.loadout, history: s.history });
}
export function load(raw: string | null): State | null {
  try {
    const v = JSON.parse(raw ?? "null");
    if (
      v?.version !== 1 ||
      !Array.isArray(v.loadout) ||
      !Array.isArray(v.history) ||
      v.history.length > 30
    )
      return null;
    if (!v.loadout.every((id: unknown) => typeof id === "string")) return null;
    let s = start(v.loadout);
    if (s.loadout.length !== v.loadout.length) return null;
    for (const id of v.history) {
      if (typeof id !== "string") return null;
      s = choose(s, id);
    }
    return s;
  } catch {
    return null;
  }
}
export function relationship(value: number) {
  return value >= 3
    ? "信任"
    : value >= 1
      ? "愿意帮忙"
      : value < 0
        ? "有裂痕"
        : "尚不熟悉";
}
export function epilogue(s: State): string[] {
  const lines: string[] = [];
  if (flag(s, "stolen"))
    lines.push(
      flag(s, "contract")
        ? "猫记得公文包还在你手里。合同没有因为天亮就自动归还。"
        : flag(s, "driver-custody")
          ? "司机替你保管过合同。那只写着多喝热水的杯套，成了这场调查的证物。"
          : "合同已离开你的手；无论公开还是归还，猫都记得你是怎样拿到它的。",
    );
  lines.push(
    flag(s, "broke-cat")
      ? "猫撤下你的第九把椅子。下次见面，你们得重新学习如何交谈。"
      : s.relations.cat >= 2
        ? "猫给你留了一把椅子。你不必每天来，但它不再假装那只是办公用品。"
        : "猫仍在寻找一种不必买下城市，也能留住朋友的办法。",
  );
  lines.push(
    flag(s, "kept-driver")
      ? "你陪司机抵达终点。女儿上车时，他终于直接说了想念。"
      : flag(s, "daughter-waiting")
        ? "司机的女儿还在终点等。你发去一条提醒，他把车头转向了那盏灯。"
        : flag(s, "public-bus")
          ? "司机保留了公共线路。以后不必证明人生成功，才配拥有一个座位。"
          : "司机继续开车。仪表盘上的月亮还在等一个具体的约定。",
  );
  lines.push(
    flag(s, "betrayed-clerk")
      ? "小余因为被公开姓名而停职。真相没有替她免除代价，她也没有接受你的感谢。"
      : flag(s, "clerk-free")
        ? "小余走出了管理处。她的第一天休假没有安排，只约了你吃一碗面。"
        : s.relations.clerk >= 1
          ? "小余把你的查阅编号保留下来。她终于有了一份值得亲手归档的工作。"
          : "小余仍在窗口替人检查勾选框。你现在知道，玻璃后面不是一台机器。",
  );
  if (flag(s, "all-returned"))
    lines.push(
      "你不再拥有任何超能力。已经打开的门、认识的人和留下的承诺仍然存在。",
    );
  else if (s.sacrificed.length)
    lines.push(
      `你不再拥有${s.sacrificed.map((id) => products.find((p) => p.id === id)!.name).join("、")}。能力已经退回，经历没有被退款。`,
    );
  return lines;
}
export function promises(s: State): string[] {
  const items: string[] = [];
  if (flag(s, "box-debt") || flag(s, "boxes-promised"))
    items.push("纸箱订单还没交齐。猫接受分期，不接受假装忘记。");
  if (flag(s, "cat-promise") && !flag(s, "kept-cat"))
    items.push(
      flag(s, "broke-cat")
        ? "你曾答应回去见猫，却撕掉了合作协议。这是一个被你亲手打破的承诺。"
        : "你答应今晚回去见猫。天亮并不会替你完成这次见面。",
    );
  if (flag(s, "driver-promise") && !flag(s, "kept-driver"))
    items.push("你答应陪司机到终点。车还在路上，记得把这件事做完。");
  if (flag(s, "clerk-promise") && !flag(s, "kept-clerk"))
    items.push(
      flag(s, "betrayed-clerk")
        ? "你曾答应带小余出来，最后却公开了她的姓名。那封辞职信还在你手里。"
        : "你答应带小余离开管理处。把她的辞职信交到能真正受理的地方。",
    );
  if (flag(s, "birthday-promise")) items.push("来年这个生日，你说过还要回来。");
  if (flag(s, "seed-promise"))
    items.push("陪幼苗看看真正的春天，不止一平方米。");
  if (flag(s, "duck-promise"))
    items.push(
      scenes[s.node].ending === "rewrite"
        ? "听证会已经成立，记得给小黄鸭留出发言时间。"
        : "你答应让小黄鸭的诉求被听见，事情尚未办完。",
    );
  if (flag(s, "home-promise") && scenes[s.node].ending !== "home")
    items.push("家里给你留着灯，你说过今天回去。");
  if (flag(s, "keeper-promise") && scenes[s.node].ending !== "keeper")
    items.push("陪店主从店外看一次日出。");
  if (flag(s, "power-debt"))
    items.push("保留超能力的月账单，由明天的你亲自偿还。");
  return items.length
    ? items
    : ["没有额外签下的承诺。你仍可以主动去见一个人。"];
}
export function archiveText(s: State): string {
  const node = scenes[s.node];
  return [
    "平行人生档案",
    "《明天暂停营业》",
    `结局：${node.title}`,
    "",
    ...node.text,
    "",
    "带来的能力：" +
      s.loadout.map((id) => products.find((p) => p.id === id)!.name).join("、"),
    "",
    "他们后来怎样了",
    ...epilogue(s),
    "",
    "尚未完成的事",
    ...promises(s),
    "",
    "这一天，你作过的选择",
    ...s.journal.map(
      (j, i) => `${i + 1}. ${j.scene}\n${j.choice}\n${j.outcome}`,
    ),
    "",
    "纯属脑洞，概不预测人生。",
  ].join("\n");
}
