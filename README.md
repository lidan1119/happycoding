# ✳ 平行人生小卖部

用 100 枚人生币购买超能力，每件附赠荒诞副作用。18 件商品、6 个隐藏组合、可下载的人生小票。纯静态中文网页，无账号、后端或 API 密钥，数据只保存在本机浏览器。

## 本地开发

需要 Node.js 24 和 npm。

```sh
npm ci --cache /tmp/happycoding-npm
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

预算与组合逻辑测试位于 `tests/shop.test.ts`；商品与文案位于 `src/shop.ts`，界面位于 `src/main.ts` 和 `src/style.css`。构建产物为 `dist`，使用相对资源路径，适配 GitHub Pages 项目子目录。PNG 由浏览器 Canvas 本地生成，复制权限不足时提供手动复制文本框。

## GitHub Pages

在仓库 Settings → Pages → Build and deployment 中将 Source 设为 **GitHub Actions**。推送 `main` 会运行 `.github/workflows/pages.yml`，通过测试、类型检查和构建后自动部署。也可在 Actions 页手动运行 Deploy to GitHub Pages。

预期项目地址为 `https://lidan1119.github.io/happycoding/`；只有部署成功后该地址才可使用。首次开启 Pages 需要仓库管理权限，私有仓库还取决于账户套餐。不要将预期地址当作已上线证明。

## 验证

规则测试覆盖预算边界、件数上限、重复选购、移除退款、缓存清理、组合可达性、结果确定性和小票内容。发布时需额外用真实浏览器在项目子路径完成手机及桌面选购、结账和 PNG 导出，再访问实际 Pages 地址确认上线。

规划见 `openspec/changes/parallel-life-shop/`。
