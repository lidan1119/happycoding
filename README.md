# ✳ 平行人生小卖部 · 明天暂停营业

100 枚人生币，买下超能力，再带着它们过一场不太正常的一天。小票是入场券，故事由你的选择继续。

React + TypeScript + Three.js 的纯静态中文叙事游戏。无需账号、后端或 AI API 密钥。剧情与存档都在本地浏览器，不上传任何玩家数据。

## 游玩

1. 在小卖部选择最多 5 种能力，预算 100 币。
2. 结账打印入场券，点击 **去过这一天**。
3. 在全屏夜城中阅读逐段对话，点击 **继续** 推进，或 **直接行动** 前往决策。
4. 选择会改变场景、角色关系、证据归属和结局条件。交还的能力不会再出现于后续选项。
5. 场景建筑、招牌和车辆可点击观察；也可用 **环顾四周** 阅读同类环境细节。**行囊与足迹** 查看能力、人物关系、选择日志和已发现结局。
6. 结局生成完整人生档案，支持 PNG 下载、文字复制和用同样能力重新选择。退出冒险去逛商店不会删除进度；开启新冒险会确认替换当前进度。

内容包括 5 幕、65 个场景、18 种能力事件、6 条可选组合支线和 8 个核心结局。单局最多 16 次决策，仅经历其中一条路线。不同路线会汇合，但记住偷窃、归还、背叛和承诺；并非每次游玩都会看到全部内容。

## 本地开发

需要 Node.js 24 与 npm。

```sh
npm ci --cache /tmp/happycoding-npm
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

`npm run dev` 启动开发服务器；`npm run preview` 预览构建后的 `dist`。实际监听地址由终端输出。云环境内的回环地址仅用于内部验证，不是公开访问链接。

- `src/main.tsx`：React 商店、入场券及应用状态。
- `src/AdventureView.tsx`：全屏游戏 HUD、逐段对话、行动选项、行囊弹窗及结局。
- `src/World.tsx`：懒加载的 Three.js 五幕场景、视差与场景观察，管理 GPU 资源生命周期。
- `src/Portrait.tsx`：本地 SVG 人物立绘。
- `src/adventure.ts`：场景图、条件选择、状态、前情回响、结局、日志和存档验证。
- `src/shop.ts`：商品、预算和能力组合。
- `src/export.ts`：本地 Canvas 中文图片导出，动态换行并限制大画布尺寸。

无 WebGL、图形模块加载失败或关闭动态效果时仍可完整游玩。存储不可用会提示不要关闭页面；存档损坏或不兼容时安全丢弃。剧情存档只记录能力和选择序列，恢复时重放并验证每一步，不信任缓存中的关系、旗标或任意文案。结局图鉴独立保留在当前浏览器，不跨设备同步。

## 验证

`npm test` 包含 18 项测试：购物边界、18 种能力事件、组合条件、证据交接、背叛后果、牺牲能力、承诺、存档防篡改及场景图完整性。固定种子的 6,000 局模拟覆盖 65 个场景与全部 8 结局，检查无死路并在 16 次决策内结束。

可复跑浏览器验收：先 `npm run build`，再 `python3 tests/browser_smoke.py`。需要 Python Playwright 和系统 Chromium（或 Playwright 已安装的 Chromium）。脚本自动启动临时静态服务器，截图默认保存在 `/tmp/parallel-life-browser`。

浏览器验收使用系统 Chromium：生产产物挂在 `/happycoding/` 下，分别走完猫合作与偷合同路线，验证逐段对话、环境观察、存档刷新、图鉴、手机无横向溢出、键盘取消重开、PNG 档案、复制失败回退，以及禁用 WebGL 和 localStorage 的可玩性。

## GitHub Pages

Settings → Pages → Build and deployment 的 Source 设为 **GitHub Actions**。推送 `main` 后 `.github/workflows/pages.yml` 运行测试、类型检查、构建和 Pages 部署；也可以在 Actions 手动运行 **Deploy to GitHub Pages**。

项目预期地址：`https://lidan1119.github.io/happycoding/`。需要 Actions 部署成功后再访问。相对资源路径支持项目子目录，无须服务器路由重写。

剧情规划和验收规格见 `openspec/changes/tomorrow-closed/`。已知发布限制：当前云实例访问 GitHub API 和 Pages 域名被环境策略拒绝，Git 推送可用；应以 GitHub Actions 和浏览器实际访问结果确认上线，不能将成功推送等同于部署成功。

## 把家搬到地球另一边

从首页点「地球的另一边」，或在开发服务器打开 `/earth.html`。可搜索约 1,250 个城市、拖动并点击地球，或填写经纬度。穿过地心后可复制能够重开同一落点的结果链接。支持浏览器减少动效设置，WebGL 不可用时可在平面地图上选点。

城市、陆地与海岸采用 Natural Earth v5.1.2 的 1:50m 数据。水域距离为沿球面的最近海岸距离，受海岸线分辨率限制，小岛与狭窄水道可能无法识别。数据编译脚本为 `scripts/prepare-earth-data.py`，地表纹理来自 Three.js 示例。部署使用已有的 GitHub Pages 工作流，工作流结束前会请求发布后的地球页面。
