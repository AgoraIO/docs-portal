# 中文 API 参考 Sidebar 信息架构设计

## 背景

`/zh-CN/api-reference/api` 当前使用旧站产品体系，将全部 API 产品归入“实时互动基础能力”“实时互动扩展能力”“场景化解决方案”三组。新中文文档已经改为新的顶层 tab 和 tab 内分类，因此旧分组会让用户在产品文档与 API 参考之间切换时面对两套不同的分类语言。

本设计将 API 参考 sidebar 改为两层扁平结构：`分类 → 产品`。分类名称和产品归属对齐新中文文档，但不额外展示顶层 tab，以控制 sidebar 的缩进和浏览高度。

## 目标

- 用当前中文文档的信息架构替换旧站三组分类。
- 保持两层 sidebar，便于在窄栏中快速扫描产品。
- 让 sidebar、API 目录卡片和产品筛选使用一致的产品名称。
- 保持现有锚点跳转、滚动高亮、平台筛选和 API 类型筛选行为不变。

## 非目标

- 不改为 `顶层 tab → 分类 → 产品` 三层结构。
- 不移动 API 文档文件或修改现有 API 路由。
- 不改变 API 卡片的内容结构、筛选控件或响应式布局。
- 不从各 tab 的 `meta.json` 动态生成 sidebar 分类；本次仍使用显式、可审阅的分组数据。
- 不新增当前 API 目录中尚不存在的产品。

## 最终目录

分组和产品按以下顺序显示：

1. **对话式 AI 引擎**
   - 对话式 AI 引擎
2. **实时互动基础能力**
   - 实时互动 RTC
   - 实时消息 RTM
   - 即时通讯 IM
   - 媒体流加速 RTSA
3. **实时媒体处理**
   - 实时转录翻译
   - 云端录制
   - 本地服务端录制
   - 云端转码
   - 旁路推流
   - 输入在线媒体流
   - RTMP 网关
   - 融合 CDN 直播
4. **会议协作**
   - 智能云会议引擎
5. **监控与分析**
   - 水晶球
6. **扩展能力与生态**
   - RTC 服务端 SDK
   - 互动白板
7. **社交娱乐**
   - 在线 K 歌房
   - 1v1 私密房
8. **教育**
   - 灵动课堂
   - 在线美术教学
   - 在线音乐教学
   - PPT 转码服务
9. **智能硬件**
   - 微呼叫
   - 平行操控
10. **平台管理**
    - 控制台

该顺序先展示 AI 和实时互动能力，再展示解决方案，最后放置跨产品的平台管理 API。`控制台` 没有对应的新站产品 tab，因此使用“平台管理”作为清晰、面向任务的例外分类。

## 产品归属变化

与旧 sidebar 相比，主要变化如下：

- 对话式 AI 从“实时互动基础能力”独立为“对话式 AI 引擎”。
- 融合 CDN 直播从“实时互动基础能力”移动到“实时媒体处理”。
- 原“实时互动扩展能力”拆分为“实时媒体处理”“会议协作”“监控与分析”“扩展能力与生态”“智能硬件”“平台管理”。
- 原“场景化解决方案”拆分为“社交娱乐”“教育”，会议产品改归“会议协作”，微呼叫和平行操控改归“智能硬件”。
- 产品显示名对齐新站：`对话式 AI` 改为 `对话式 AI 引擎`，`私密房` 改为 `1v1 私密房`。

## 实现设计

### 分组数据

在 `src/lib/api-reference-navigation.ts` 中扩展 `ApiReferenceCapabilityGroup` 的分组 ID，并用最终目录替换现有三组数据。`productIds` 继续作为稳定标识，不使用产品显示名进行关联。

API 卡片正文继续调用现有 `orderProductsByCapability`，因此 sidebar 与正文产品卡片会自动共享新的分组顺序。

### Sidebar 呈现

在 `src/components/docs-shell/ApiReferenceProductNav.tsx` 中为十个分组配置与新站分类语义一致的 Lucide 图标。现有 `ProductNavGroup`、锚点链接和 active 状态样式保持不变。

筛选后没有可见产品的分组继续不渲染，避免出现空标题。

### 产品名称

更新 `src/lib/api-reference-cards-data.zh-cn.json` 中两个与新站不一致的产品显示名：

- `conversational-ai`: `对话式 AI 引擎`
- `private-room`: `1v1 私密房`

同时更新 `scripts/lib/api-center/navigation-runner.mjs` 中对应的规范化名称映射，避免以后重新生成 API 目录数据时恢复旧名称。现有产品 ID、链接和平台数据不变。

## 边界行为

- 平台筛选使某一分类下所有产品消失时，整个分类标题随之隐藏。
- 产品锚点仍使用 `api-reference-product-<productId>`，已有 URL hash 不变。
- 外部 IM API 链接继续保留在“即时通讯 IM”产品下。
- 只有一个产品的分类仍按统一的“分类 → 产品”样式呈现，不把分类标题改为链接。
- 移动端不显示这套独立产品 sidebar 的现有行为不在本次修改。

## 测试策略

扩展 `ApiReferenceProductNav.test.tsx` 和相关 API 目录测试，覆盖：

- 十个分类按最终顺序渲染。
- 每个产品只出现一次，并位于指定分类中。
- “对话式 AI 引擎”和“1v1 私密房”在 sidebar、产品卡片和筛选项中的名称一致。
- 平台筛选后空分类被隐藏，非空分类保留。
- 产品链接仍指向原有锚点，点击目录不会触发产品筛选。
- 滚动高亮和 `scrollIntoView` 行为保持不变。

完成实现后运行：

```bash
bun run test src/components/docs-shell/ApiReferenceProductNav.test.tsx src/components/docs-overview/ApiReferenceCards.test.tsx
bun run types:check
```

## 验收标准

- `/zh-CN/api-reference/api` sidebar 与“最终目录”完全一致。
- 页面正文产品卡片顺序与 sidebar 产品顺序一致。
- 不再显示“实时互动扩展能力”或“场景化解决方案”。
- 所有现有 API 入口、筛选和滚动定位功能可用。
- 相关测试和类型检查通过。
