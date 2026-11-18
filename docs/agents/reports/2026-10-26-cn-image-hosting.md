# 中文站图片图床承接检查（2026-10-26）

## 当前托管范围

1,010 张旧图床图片沿用现有地址。其中一张含外部依赖的 SVG 已确认展示正常，继续使用现有引用。剩余主要工作为 3 张本地图上传与引用替换，以及 1 张 HTTP 410 图片找回或替换。机器证据保留 2026-10-26 检查时的资源状态；上述 SVG 展示结论来自后续确认，未新增自动化浏览器验证记录。

## 本轮结论

**本轮补齐了中文 MD/MDX 正文图片引用清单、逐资源访问与文件检查，以及 12 张图片的内容抽样；图床承接仍不能判定通过。**

在排除已停止发布的文件后，扫描到 **426 个含图文件、1,764 处图片引用、1,014 个唯一资源**。这些正文引用中没有 `assets-docs.agora.io` 地址；1,010 个资源来自 `web-cdn.agora.io`，1 个来自 `wd.imgix.net`，3 个仍是本地 `/img/` 引用。现有 `web-cdn.agora.io` 图片保留原地址。

发现一张图片两次请求均返回 **HTTP 410**，影响两处 API 正文；另有 3 张本地图待上传及 6 张 PNG 的响应头待规范。此次检查没有上传、覆盖或替换正文引用；实际迁移项的目标地址、上传结果和内容比较记录待执行后补充。

## 范围与口径

- 基线提交：`536a6f22621afe0e0657f2f0ad655ee5f42dfd6f`。扫描当前工作区 `content/docs/zh-CN/**/*.{md,mdx}`，共 6,719 个文件；按仓库 `isRetiredCnDocsPath` 排除 942 个文件，剩余 5,777 个候选发布文件。文件 SHA-256 已保留在清单中。
- 停用内容的 289 处图片引用保留在清单里，并标记 `retired: true`，不计入本轮正文分母。没有用导航是否可见代替发布排除规则。
- Markdown/MDX AST 扫描排除代码、注释和 frontmatter；覆盖 Markdown 图片、`DocsImage`、`InlineImage`、封面、二维码、组件数据中的图片字面量及 `video.poster`。解析失败为 0，非字面量图片属性待解析项为 0。视频和 iframe 单列为非图片，不发起图片检查。
- `platform` 记录 `PlatformStructured` / `PlatformInline` 的显式上下文；文件路径和其他组件中的平台仍以原文为准。**1,764 是源码引用实例数，不是页面平台投影数。**
- 独立补查平台图标和 `KtvDownloadResources`：27 个源码声明、24 个唯一资源；4 个二维码资源已包含在正文资源分母中，额外增加 20 个平台图标。合并去重共检查 1,034 个资源。
- 本轮不代表英文站、所有运行时动态资源、站点 Logo/OG/字体、部署环境或全站浏览器视觉全检。未对任意 MDX 表达式做执行求值，也未展开全部平台投影。OpenAPI YAML 的图片语法补搜未发现 Markdown/图片标签引用；这不等于已对生成页面进行 DOM 全检。

## 逐资源检查结果

2026-10-26 北京时间约 11:25—11:32 执行。匿名请求，不带登录 Cookie 或 Referer；远程图片使用 GET 获取完整响应体，而不是只检查 HEAD。最多 8 并发，单请求 25 秒上限，配置 1 次重试及 25 MiB 文件上限；本次没有遗留网络错误或大小上限项。

| 检查项 | 本次结果 | 结论边界 |
| --- | --- | --- |
| 正文远程资源 GET | 1,011 个：1,010 个 HTTP 200，1 个 HTTP 410 | 单一执行环境的当次结果，不是中国各地域可用性证明 |
| 正文本地资源 | 3 个文件存在且解码成功 | 不证明已上传图床，也不证明部署后的 URL 返回正确 |
| 正文栅格图内容 | 874 个解码成功，含上述 3 个本地文件 | Pillow 校验并解码；动画逐帧读取，不等于内容语义全检 |
| 正文 SVG | 139 个 XML 解析成功，根元素为 SVG | 未逐张进行浏览器渲染；其中 1 个含外部依赖 |
| 指定图床正文引用 | 0 处 | 未观察到正文切换；不能据此证明存储桶里没有对应资源 |
| 运行时平台图标 | 19 个 `assets-docs.agora.io/images/` 图标及 1 个旧站 Windows 图标，均 HTTP 200、SVG 结构有效 | 能证明这些资源当次存在，不能补充历史上传回执 |
| KTV 运行时二维码 | 4 个唯一资源解码成功，均使用 `web-cdn.agora.io` | 与正文资源重叠，未重复增加唯一资源数 |
| 语义/内容抽样 | 12 张，详见下节 | 不推广为 1,014 个资源全部内容正确 |

每个成功资源记录实际格式、字节数、SHA-256、尺寸或 SVG viewBox；远程记录状态码、Content-Type、最终地址、检查时间和耗时。所有远程主资源本次均未发生重定向。

已核对 `src/components/mdx.tsx`：正文图片组件直接使用传入的 `src`，本轮未发现将旧图床地址自动改写成指定图床的逻辑。

## 明确发现及后续处理

### 1. 一张图片失效，影响两处正文

以下引用均指向同一 `wd.imgix.net` 屏幕共享选项截图：

- `content/docs/zh-CN/api-reference/rtc/react-sdk/web-sdk/interfaces/screenvideotrackinitconfig.mdx:32`
- `content/docs/zh-CN/api-reference/rtc/web/interfaces/screenvideotrackinitconfig.mdx:54`

初次 GET 与独立复测均为 **410 / text/plain**。正文使用它解释默认选中的共享内容类型，属于实际阅读内容，不是代码示例。建议优先找回原图或核定替代截图，确认内容后上传，并同步修复两处引用；当前没有可证明等价的替代图，不能通过猜 URL 关闭此项。

### 2. 三个正文资源仍使用本地路径

| 引用位置 | 当前资源 | 已做检查 |
| --- | --- | --- |
| `introduction/quickstart.mdx:108` | `/img/console/delete-workspace.png` | 文件存在，PNG 解码，注销入口画面抽样一致 |
| `realtime-media/rtsa/build/project-preparation/license.mdx:76` | `/img/rtsa/preauthorization.png` | 文件存在，PNG 解码，License 预授权画面抽样一致 |
| `realtime-media/rtc/reference/downloads/android.mdx:115` | `/img/rtc/agoralab-android-qrcode.png` | 文件存在，PNG 解码，二维码可识别 |

表中位置相对于 `content/docs/zh-CN/`。这些是正文截图或下载二维码，下一步需要上传并替换引用，记录实际目标地址与哈希比较。

二维码解码为 AgoraLabs Android APK 直链，文件名包含 `v2.2_20250102_153423`，当次 HEAD 返回 200。没有下载或安装 APK，也没有确认其是否仍是当前推荐版本。该二维码目标不同于卡片的 Codebox 页面链接，但仅凭这种差异不能判定为错图。

### 3. 六张 PNG 的 Content-Type 为 application/octet-stream

涉及资源末段：`1619428543085`、`1638759333663`、`1657121618456`、`1665472394773`、`1675666246094`、`1680256324257`，共 **11 处正文引用**。它们均为 HTTP 200，实际 PNG 校验及解码成功。

列为响应头待规范项，不判成图片加载失败。上传或整理资源元数据时设置正确的 `image/png`，并复验浏览器展示。

### 4. 一张 SVG 仍依赖外部签名资源

`https://web-cdn.agora.io/doc-cms/uploads/1715394881627-设置背景图.svg` 内有两处对同一 `cdn.processon.com` 图片的引用，地址带 `e` 和 `token` 参数。影响：

- `content/docs/zh-CN/api-reference/cloud-recording/restful/user-guides/mix-mode/set-composite-layout.mdx:335`
- `content/docs/zh-CN/realtime-media/cloud-recording/build/recording-modes/mix-mode/set-composite-layout.mdx:269`

主 SVG 为 200，外部图片独立 GET 也为 200。后续已确认该图展示正常，继续沿用现有引用。网络检查仅记录当次可达性；审计证据保留去除查询值的依赖地址及查询串哈希，不复制签名值。

## 内容抽样记录

采用定向样本，覆盖 3 个本地资源、控制台截图、AI 服务开通、RTM/RTC 示例、云录制目录、返回通用 MIME 的 PNG、Demo 封面与 WebP。检查下载/本地文件的实际画面，并与对应正文及组件文案对照；没有重新验收页面布局。

12 个样本的画面主题或二维码目标类型与抽样上下文相符。样本包括注销工作空间、License 预授权、Android APK 二维码、AI 引擎启用、创建工作空间、产品功能配置、RTM 示例 UI、OSS quickstart 目录、Android 本地/远端视频布局、Web JOIN/LEAVE 示例、声动互娱封面、声网实验室界面。

此结论不包含全部 UI 的时效性、SDK/应用版本正确性、历史原图逐像素比对或同一资源的所有复用上下文。逐项观察保存在 [visual-samples.json](./2026-10-26-cn-image-hosting/visual-samples.json)。本地预览图保存在忽略目录 `.agent/artifacts/cn-image-hosting-20261026/`，未加入仓库。

## 清单与验收状态

| 图床承接检查项 | 本轮状态 |
| --- | --- |
| 中文 MD/MDX 图片字面量与已知组件图片引用清单 | 已建立，带文件、行、类型、显式平台、当前地址及停用标记 |
| 主资源存在性与文件内容格式检查 | 已执行，遗留 1 个 410 资源 |
| 图片语义正确性 | 12 个定向样本已检查，未全量完成 |
| 图床与本地正文资源范围 | 1,010 张旧图床图片保留现有地址；3 张本地图待上传；1 张失效图片待找回或替换 |
| 原引用 → 实际目标图床 URL 映射 | 实际迁移项待补齐；保留原地址的资源无需新增映射 |
| 上传回执及迁移前后内容一致性 | 实际迁移项待执行；现有资源哈希作为检查快照保留 |
| 引用替换及漏替换检查 | 实际迁移项尚未替换；旧图床图片继续沿用原引用 |
| 最终部署环境逐页/逐平台图片验证 | 未执行 |

机器清单中的 `migration.historicalOriginalReference`、`designatedTargetUrl`、`uploadReceipt` 在没有证据时为 `null`，`sourceTargetByteComparison` 为 `not-verified`。运行时指定图床图标只标记“当前已观察到指定 URL”，不冒充历史迁移记录。

证据入口：

- [inventory.json](./2026-10-26-cn-image-hosting/inventory.json)：扫描文件及哈希、全部引用、停用标记、解析与非图片记录、运行时声明。
- [resources.json](./2026-10-26-cn-image-hosting/resources.json)：1,034 个去重资源的逐项结果，以 `src` 关联引用。
- [attention.tsv](./2026-10-26-cn-image-hosting/attention.tsv)：检查时标记的 18 处正文引用快照；其中 SVG 复核项现已关闭，旧图床地址保留范围见文首。
- [rechecks.json](./2026-10-26-cn-image-hosting/rechecks.json)：410 独立复测及 SVG 外部依赖请求。
- [qr-check.json](./2026-10-26-cn-image-hosting/qr-check.json)：二维码解码及 APK HEAD 检查。
- [summary.json](./2026-10-26-cn-image-hosting/summary.json)：范围计数及 Git 基线。

## 复跑方式与验证

从仓库根目录执行。需要仓库现有 Node 依赖、curl 和安装 Pillow 的 Python；不读取 `.env*`，不调用上传脚本。以下命令只将新结果写入忽略目录，保留本报告快照：

```bash
mkdir -p .agent/artifacts/cn-image-hosting-20261026
node docs/agents/reports/2026-10-26-cn-image-hosting/scan.mjs
python3 docs/agents/reports/2026-10-26-cn-image-hosting/probe.py
python3 docs/agents/reports/2026-10-26-cn-image-hosting/probe.py runtime-inventory.json runtime-resources
```

如系统 Python 没有 Pillow，可使用桌面线程提供的 Python 依赖运行时。正文与运行时结果按 `src` 去重，不能直接相加。SVG 结构检查发现外部依赖时，仍需从本地响应体解析依赖并单独检查；语义抽样、二维码及异常复测不是上述两支脚本自动完成的项目。

本轮对扫描器再次运行，核对引用稳定性、1,764 处行号与原文地址、资源集合覆盖、去重键、源文件哈希、计数及本地资源哈希；并检查脚本语法和新增文本的空白错误。未修改应用或正文，没有运行应用单元测试、类型检查或生产构建；这些不能替代本维度的 HTTP/内容证据。
