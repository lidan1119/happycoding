# Life shop specification

## ADDED Requirements

### Requirement: 明示商品能力与代价
系统 SHALL 展示至少 18 件商品，每件具有稳定 ID、名称、分类、正整数价格、能力和副作用。购买前 SHALL 能读取完整代价，支持触屏和键盘。

#### Scenario: 浏览货架
- WHEN 玩家首次进入
- THEN 显示 100 币、空购物篮及可操作商品，且不要求登录或密钥。

### Requirement: 购物约束
系统 SHALL 限制总金额不超过 100 币、商品不重复、最多 5 件，并实时显示总价与余额。

#### Scenario: 无法购买
- WHEN 加入商品会超出预算或件数限制
- THEN 显示原因，购物篮和金额保持不变。

#### Scenario: 移除商品
- WHEN 玩家移除已选商品
- THEN 余额精确恢复对应价格，该商品可再次购买。

### Requirement: 可解释的结账结果
系统 SHALL 阻止空篮结账，并在非空结账后显示所选商品、各项价格、总价、余额、故事及声明「纯属脑洞，概不预测人生」。系统 SHALL 提供至少 6 个组合规则，相同商品集合产生相同故事。

#### Scenario: 命中隐藏组合
- WHEN 已选商品包含某组合全部必需商品
- THEN 结果揭示对应剧情；多个命中按固定优先级最多显示 2 个。

#### Scenario: 没有隐藏组合
- WHEN 未命中任意组合
- THEN 仍生成与选择有关的完整保底故事。

### Requirement: 保存和重玩
系统 SHALL 支持下载完整中文 PNG 小票、复制文字结果和重新游玩。下载内容 SHALL 与屏幕结算一致。

#### Scenario: 复制权限不可用
- WHEN 浏览器拒绝剪贴板访问
- THEN 显示可手动选择复制的文本，不显示虚假成功。

### Requirement: 健壮性及无障碍
系统 SHALL 在本地存储不可用时保持可玩；从缓存恢复时重新验证 ID、金额和件数。主要操作 SHALL 可用键盘完成，状态提示 SHALL 可由屏幕阅读器读取，减少动态效果偏好 SHALL 被尊重。

#### Scenario: 损坏的缓存
- WHEN 缓存格式错误或包含不合法选择
- THEN 安全丢弃不合法状态，以有效购物篮或初始状态启动。

### Requirement: 静态部署
系统 SHALL 在 GitHub Pages 项目子路径下运行，不依赖后端、运行时密钥或第三方 AI 服务。

#### Scenario: 发布后访问
- WHEN 访问实际 Pages 地址并刷新
- THEN 页面和本地资源加载成功，可以完成选购、结账和导出。
