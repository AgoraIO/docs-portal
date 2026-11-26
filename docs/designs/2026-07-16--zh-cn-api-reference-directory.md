# 中文 API 参考目录页设计

## 目标

在中文文档的 `参考中心` 下，把 `SDK 下载` 后面的 API 导航拆成两个独立入口：

- `客户端 API`
- `服务端 API`

两个页面都使用简洁、高密度的卡片跳转模式，帮助开发者按产品和平台快速找到对应 API 文档。

## 非目标

- 不重构现有 `SDK 下载` 页面。
- 不替换现有产品参考分组和深层 API 参考页面。
- 不引入新的视觉体系、营销式 hero 或装饰性大卡片。
- 不在第一版自动扫描全部文件生成目录；先维护显式数据，便于审阅 IA 和链接准确性。

## IA 变化

在 `content/docs/zh-CN/api-reference/meta.json` 中调整顺序：

```json
"overview",
"sdks",
"client-api",
"server-api",
"---指南---"
```

新增页面：

- `content/docs/zh-CN/api-reference/client-api.mdx`
  - 路由：`/zh-CN/api-reference/client-api`
  - 标题：`客户端 API`
- `content/docs/zh-CN/api-reference/server-api.mdx`
  - 路由：`/zh-CN/api-reference/server-api`
  - 标题：`服务端 API`

`参考概览` 页面保留现有 `SDK 下载 / 产品参考 / 示例配方 / 常见问题` 四卡结构，不在本次强制加入新入口，避免首页卡片过密。后续如需要，可把 `产品参考` 拆成 `客户端 API` 和 `服务端 API` 两个入口。

## 用户行为

用户进入 `客户端 API` 或 `服务端 API` 后：

1. 看到紧凑说明，而不是 hero。
2. 可以用产品筛选缩小范围。
3. 可以用平台筛选缩小范围。
4. 点击卡片直接进入对应 API 文档。

页面默认显示全部条目；筛选无结果时显示空状态，并提供“清除筛选”操作。

## 页面结构

页面正文只放一个 MDX 组件：

```mdx
<ApiReferenceCards locale="zh-CN" type="client" />
```

或：

```mdx
<ApiReferenceCards locale="zh-CN" type="server" />
```

组件放在 `src/components/docs-overview/ApiReferenceCards.tsx`，并在 `getOverviewMDXComponents()` 注册。

## 卡片字段

每张卡片包含：

- 产品名：例如 `实时互动 RTC`
- 平台名：例如 `Android`
- API 类型：`客户端 API`、`服务端 SDK`、`RESTful API`
- 跳转链接：整张卡片可点击

可选字段：

- 标签：例如 `Web`、`Native`、`REST`
- 简短路径提示：例如 `/api-reference/rtc/android`

卡片不放长说明。卡片视觉应比概览页的 `SolutionCard` 更轻，接近列表型卡片。

## 筛选字段

第一版筛选字段：

- 产品：全部、对话式 AI、实时互动 RTC、实时消息 RTM、互动白板、云端录制、RTC 服务端 SDK、灵动课堂等。
- 平台：全部、Android、iOS、Web、Electron、Flutter、React Native、C++、C#、Swift、HarmonyOS、Unity、Unreal、Go、Java、Python、TypeScript、RESTful API 等。

筛选控件使用紧凑按钮组或原生 select，不使用大型搜索框作为主入口。页面不做全文搜索，只做目录筛选。

## 数据模型

新增显式数据文件：

```ts
src/lib/api-reference-cards-data.zh-cn.ts
```

建议类型：

```ts
export type ApiReferenceCardEntry = {
  apiType: 'client-api' | 'server-sdk' | 'restful-api';
  href: string;
  platform: string;
  platformId: string;
  product: string;
  productId: string;
};
```

第一版数据从 `content/docs/zh-CN/api-reference/meta.json` 现有产品参考分组整理，不做自动推断。

## 客户端 API 首批范围

客户端 API 页面收录面向客户端平台的 SDK/API：

- 对话式 AI：Android、iOS、Web
- 实时互动 RTC：Android、iOS、macOS、C++ 全平台、C# Windows、Electron、Unity、Flutter、React Native、Unreal、HarmonyOS、Web
- 实时消息 RTM：Android、iOS、Web、HarmonyOS、Unity、Flutter、React Native、C++、Swift
- 互动白板：Android、iOS、Web
- 会议：Android、iOS、Electron
- 私密房：Android、iOS
- 灵动课堂：Android、iOS、Web、Electron

## 服务端 API 首批范围

服务端 API 页面收录服务端 SDK 和 RESTful API：

- 对话式 AI：agent Go、agent Python、agent TypeScript、restclient Go、restclient Java、RESTful API
- RTC 服务端 SDK：Go、Python
- 云端录制：Go、Java、RESTful API
- 本地服务端录制：Java、C++
- 各 RESTful API：RTC、RTM、互动白板、融合 CDN、旁路推流、输入在线媒体流、云端转码、实时转录翻译、RTMP 网关、PPT 转码、控制台、水晶球、弹幕玩法、VoIP 呼叫服务等
- 灵动课堂 RESTful API

## 视觉原则

- 页面顶部只保留一行说明。
- 筛选区固定在内容顶部，不做浮动。
- 卡片使用 2-3 列响应式网格；移动端单列。
- 卡片高度稳定，文本不溢出。
- 卡片右侧使用箭头或外跳图标，和当前侧边栏跳转图标保持一致。
- 不使用大面积渐变、插画、hero 或嵌套卡片。

## 错误处理与边界情况

- 筛选结果为空：显示 `没有匹配的 API 文档`，提供清除筛选按钮。
- 链接不存在：通过测试覆盖显式数据中的内部链接。
- 同一产品平台存在多个入口：保留多张卡片，用 API 类型区分。
- RESTful API 平台统一使用 `RESTful API`，避免和具体编程语言混淆。

## 测试策略

新增或扩展测试：

- `ApiReferenceCards.test.tsx`
  - 渲染客户端页面卡片。
  - 渲染服务端页面卡片。
  - 按产品筛选。
  - 按平台筛选。
  - 空状态和清除筛选。
- 链接完整性测试
  - 确认所有内部 `href` 对应现有内容路由或已有链接规范。
- `types:check`
  - 确认 MDX 注册和页面编译通过。

## 关键假设

- `服务端 API` 包含两类内容：服务端 SDK 和 RESTful API。
- 第一版只做中文站。
- 第一版数据显式维护，后续如果目录稳定，再考虑从 `meta.json` 自动生成。
