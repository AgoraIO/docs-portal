# 独立文档搜索页

已确认：首版只有文档搜索，AI 只作后续设计预留。采用结果优先的完整列表，沿用现有文档站视觉系统，以代码实现已确认的线框。访问者模式为 Operate。

## Direction contract

THESIS: 开发者从关键词或错误码出发，筛选适用产品与平台，直达文档章节。完整结果列表是页面主体。

OWN-WORLD: 继承文档站 MiSans、浅色背景 #fbfaf7、正文 #0e0f12、次级表面 #f4f2ec 及深色主题的语义变量。沿用标准 shadcn 控件；采用 Aceternity 的轮换提示、共享布局选中态与跟随高亮，适配键盘和减少动态效果偏好。

STORY: 输入关键词，查看真实命中，缩小筛选范围，打开正确章节。搜索词与条件可分享，返回后恢复。首次进入提供示例和最近浏览，错误与无结果有各自恢复操作。

FIRST VIEWPORT: 共享全站导航后，18px 标题与 44px 搜索框同排；类型、产品、平台、版本和章节总量合为一排工具栏。1280×720 首屏至少完整呈现 3 条真实结果。结果以产品路径、同排标题与命中章节、两行摘要构成；平台和版本位于路径行右侧，其他命中按需展开。主体最大宽度 1120px。手机搜索框改为独占一行，类型与筛选按钮同排，保留触控尺寸和底部筛选抽屉。

FORM: 结果优先，沿用原结构候选第 1 项，seed fc89dbac。用户授权实现并要求采用 Aceternity 组件和设计思路，随后指出首版过于臃肿、空间浪费，要求 compact 重设计。本轮以连续紧凑列表替代大标题、多排工具区及分散结果元信息；保留站点视觉系统和搜索行为。标志性交互为键盘与指针均可驱动的结果行共享高亮；搜索词提交后保留。

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## 首版边界

中文独立搜索路由 `/zh-CN/search`，兼容 `/search`。筛选与分页同步 URL，通过同域 `/api/search` 查询 Meilisearch 公开索引，服务端持有检索凭据。分页总量是章节命中数，每页同文档章节合并；不把章节总量冒充文档篇数。版本和产品选项来自真实索引元数据。

不显示 AI 入口、回答面板或占位区域，不发起问答请求。原有问答 Demo 保留为可显式启用的能力。未来 AI 共用搜索上下文，桌面按需展开问答区，手机切换视图；登录或关闭问答后恢复搜索状态。本期不实现登录或多轮会话。

## Aceternity 来源

- [Placeholders And Vanish Input](https://ui.aceternity.com/components/placeholders-and-vanish-input)：采用轮换提示，提交保留输入，移除粒子消散。
- [Animated Tabs](https://ui.aceternity.com/components/tabs)：采用共享布局选中背景，保留标准控件的键盘语义。
- [Card Hover Effect](https://ui.aceternity.com/components/card-hover-effect)：共享高亮适配文档结果行，并支持键盘聚焦。

## 实现与集成记录

文档保留决定：FINISH 按 Impeccable `reference/new-work.md` 第 5 节保留固定原文。第 7 节对普通扩展的具体规则要求对照完成实现与既有系统、保留文件并报告所检查的证据。本轮由新上下文的 documenter 对照 compact 实现与既有系统，结果为 `complete-preserve`，见 [compact 文档报告](../../.impeccable/review/compact-documentation-report.md)。不创建新的 `DESIGN.md` 或系统 sidecar；[原版文档报告](../../.impeccable/review/documentation-report.md) 仅保留为历史记录。

实现入口为 `src/routes/$locale/search.tsx`，仅发布中文路由；`src/routes/search.tsx` 在 CN 站点保留查询参数并重定向。共享 `DocsShell` 的 search 布局沿用导航和页脚，搜索主体使用 `src/components/search`。快捷搜索的「查看全部搜索结果」携带关键词、产品范围与平台条件；原问答 Demo 的 `enableAi` 默认为 false。

页面样式集中在 `src/styles/search.css`，通过 `src/styles/app.css` 导入。全局颜色、MiSans 字体与本地 Button、NativeSelect、ToggleGroup、Sheet 等控件保持既有定义。搜索页的源代码尺寸为最大宽度 1120px、标题 18px、结果标题 16px、摘要 14px；桌面搜索框 44px，结果行上下内边距各 14px。639px 以下切换筛选抽屉，搜索框 52px，按钮触控尺寸保持 44px。这些是本页实现记录，不作为新的全站设计规范。

URL 状态包含 `q`、`product`、`platform`、`version`、`type` 和 `page`。每页查询 20 个章节命中，在该页内合并同文档章节；章节链接保持普通锚点。清空关键词同时清除输入草稿、更新 URL 的关键词并重置到第 1 页，保留适用性筛选，回到示例与最近浏览区域。

新增 `motion` 14.0.0 支持已确认的三个 Aceternity 适配：空白且未聚焦时每 5 秒轮换提示，单选类型使用共享选中背景，结果行共享指针与键盘聚焦高亮。提交保留输入；减少动态效果时停用轮换并把过渡时长设为零。

## 验证与限制

当前 compact 版完成评审为 [compact-finish-review.md](../../.impeccable/review/compact-finish-review.md)，结论 `ship`，覆盖本轮密度调整和响应式结果状态，五项 contract 章节齐全，无 material fixes。上一版 [finish-verdict.md](../../.impeccable/review/finish-verdict.md) 曾给出 ship，但用户随后明确否定其密度；该结论及 `desktop.jpg`、`desktop-viewport.jpg`、`mobile.jpg`、`user-1280.jpg` 仅作为旧版历史。原清空关键词问题已修复并由回归测试与旧版 `cleared-state.jpg` 佐证。

本轮 compact 实现方报告：`DocsSearchPage`、`cn-search-page`、`search-page-state`、`DocsSearchDialog` 共 38 个相关测试、`bun run types:check` 和 4 个变更源文件的 Biome 检查通过。实机验证覆盖 RTC + Web 筛选得到 9 个章节匹配、2 个文档分组及 URL 同步，清除筛选，第 2 页与第 1 页切换，其他命中章节展开，清空关键词回到初始状态，再点击 Token 示例恢复搜索。1440、1280、800、390px 宽度均测得无水平溢出；单次布局 detector 返回 `[]`，未重跑。documenter 对照源码与已有截图，没有重复这些行为检查或测试。

本轮未重跑全套测试、全仓 lint 或生产构建。前一实现阶段的全套快照为 1715 个用例，1678 通过、35 失败、2 跳过，早于新增清空回归测试；失败位于既有内容、路由及旧布局用例，其中 3 个旧 DocsShell 失败已用 HEAD 源代码复现。全仓 lint 仍有既有错误。文档记录不把这些限制表述为全套检查通过，也不扩展修复范围。

前一实现阶段在 CN 配置下运行 `bunx vite build`，客户端、SSR、Nitro 与常规 prerender 成功，但构建开始于最终清空修复之前，不能作为本轮 compact 版生产构建证明。清空修复另由类型检查、测试与开发环境验证。完整静态部署流水线未验证：`build:app:static` 尝试缺少预生成的文档路由 manifest 前置产物。兼容入口 `/search?q=Token` 在前一阶段验证为 HTTP 307 到 `/zh-CN/search?q=Token`。

本地 Meilisearch 验证语料为 25 篇文档、723 个章节，不代表生产全量覆盖。首版没有新增问答或登录 UI；未来仅预留共用查询上下文、按需问答视图及认证后的搜索状态恢复设计。本轮截图来自浏览器捕获，仅作验收证据；未生成新的交付位图，标志与字体沿用既有资产。深色、加载、错误和无结果恢复行为由源码对照，未宣称本轮全部有截图。

## Compact 重设计

用户反馈原版「太臃肿了，不够 compact，空间也很浪费」。本轮移除大标题下的说明、重复的筛选标签与 Enter 提示，把类型和适用性筛选收进同一排；桌面所选条件由原下拉直接表达，不再另占一排标签。移动端保留条件标签，因为筛选控件在抽屉内。结果去掉文件图标和重复页标题路径，同排展示文档与首个命中章节；平台、版本改为行内文字，其他命中只保留一个展开入口。

实测同一 Token 查询、同一 1280×720 视口：第一条结果起点从 472px 前移到 248px；前两条的单条高度从约 248px 降至约 146px。首屏从约 1 条完整结果增至 3 条，第四条开始露出。桌面与手机布局符合本轮 contract；800px 平板上的章节总量自然换到第二行，筛选仍可见。

本轮新的完整完成评审给出 `ship`；新的文档对照结果为 `complete-preserve`。原 seed `fc89dbac` 仅是先前结果优先结构候选的历史标识，早期会话与方向记录可佐证，未保留原始 launcher roll 日志；本轮不声明新的 visual-world assignment。

| 本轮证据 | 尺寸 | 用途 |
| --- | --- | --- |
| [compact-desktop.jpg](../../.impeccable/review/compact-desktop.jpg) | 1440×2365 | 桌面完整结果列表 |
| [compact-desktop-viewport.jpg](../../.impeccable/review/compact-desktop-viewport.jpg) | 1440×900 | 桌面首屏 |
| [compact-mobile.jpg](../../.impeccable/review/compact-mobile.jpg) | 390×1989 | 手机完整列表与筛选入口 |
| [compact-tablet.jpg](../../.impeccable/review/compact-tablet.jpg) | 800×1907 | 平板工具栏换行 |
| [compact-user-1280.jpg](../../.impeccable/review/compact-user-1280.jpg) | 1280×2342 | 用户宽度完整列表 |
| [compact-mobile-filtered.jpg](../../.impeccable/review/compact-mobile-filtered.jpg) | 390×844 | 手机已选 RTC + Web 条件与两组结果 |
| [compact-search-page.jpg](../../.impeccable/review/compact-search-page.jpg) | 1280×720 | 用户窗口裁剪，完整呈现 3 条结果 |

全部证据通过独立 reviewer 的 capture-valid 检查。当前验收结论见 [compact 完成评审](../../.impeccable/review/compact-finish-review.md)，既有系统保留决定与源码比较见 [compact 文档报告](../../.impeccable/review/compact-documentation-report.md)。

生产服务与索引发布合约见 [search-service.md](../search-service.md)。静态页面和 Start API 服务分别构建，索引准备和激活供外部发布项目调用。
