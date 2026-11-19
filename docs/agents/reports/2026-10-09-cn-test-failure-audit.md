# 中文搜索修改后的 35 项测试失败审计

## 结论与对照

审计基线为 mentor 提交 `1c20dbc61`，不是另一个包含本轮修改的工作区。通过 git archive 提取到 `/private/tmp/cn-test-baseline-WxZBzZ`；仅复用已安装 node_modules，未复制本轮源代码、环境密钥或构建产物。Vitest 在基线目录自行生成 MDX 集合。

| 运行 | 文件结果 | 测试结果 | 日志 |
| --- | --- | --- | --- |
| mentor 干净源码基线 | 13 失败 / 180 通过 | 35 失败 / 1697 通过 / 2 跳过 | /tmp/cn-mentor-clean-baseline-tests.log |
| 当前搜索修改 | 13 失败 / 182 通过 | 35 失败 / 1721 通过 / 2 跳过 | /tmp/cn-search-final-suite.log |

比较完整 `文件 > describe > it` 名称：当前新增失败 0、基线失败消失 0。所有 35 项均在未修改的 mentor 源码上重现。此结论说明它们不是本轮 FAQ/索引策略/章节提取修改新增的测试失败，不能据此证明代码整体没有其他回归，也不能把已有失败都当作可忽略。

## 按全部失败文件审计

以下 13 个文件合计 35 项；每项完整名称保留在同目录 `2026-10-09-cn-search-suite-failures.md`。

| 文件 / 数量 | 失败原因与证据 | 对普通搜索的影响 / 建议 |
| --- | --- | --- |
| routes/-docs-routing-guards.test.ts / 4 | 2 项 CN moved redirect 测试在默认 global 模式先触发 locale notFound，未进入 moved redirect。独立 `VITE_DOCS_REGION=cn ... -t 'redirects moved zh-CN'`：2 通过、18 跳过。1 项仍断言 Markdown 标题“使用 MCP 集成”，源标题已为“Agora MCP”。1 项要求 llms.txt 根目录包含 /en/，实现已把文档地址放进 /llms/* 子目录索引，根目录仅列子索引。 | 前 2 项是测试区域配置矛盾，不是中文页面新坏。标题断言需匹配现有文档；llms locale 应检查子索引及完整链路。不会直接阻止 Meilisearch 检索。 |
| docs-content-regressions.test.ts / 2 | Quickstart 仍有完整示例代码，但使用 `<Accordion title="Complete sample code for real-time Video Calling">`，测试要求旧 `###` 字面标题。另一项找到 12 处 CodeBlockTab 中的表格/说明正文，位于两套英文 supported-platforms 文档。 | 前者属语法预期漂移；后者是实际违反“代码面板只放代码”的内容契约，需确认并修内容。主要影响英文文档展示，不是本轮 CN 搜索变更。 |
| docs-content-render-regressions.test.tsx / 1 | 中文 AI quickstart 渲染结果未出现测试要求的“安装 Agora skills”标题。当前中文 AI 快速开始内容与这套 fixture 预期不一致；运行报找不到指定 heading，非 MDX 编译异常。 | 需确认测试应选哪个中文示例、该路由应提供什么正文。不能仅删除断言，也不能由单个旧 fixture 推断整个 MDX runtime 失效。未出现检索 API 故障证据。 |
| docs-journeys.test.ts / 1 | RTC reference/meta.json 已采用对象分组且没有顶层 release-notes 字符串；测试要求顶层直接出现该条。 | 要核对 release notes 实际导航归属，再更新结构检查或补导航；可能影响文档可发现性，不是新建索引的运行故障。 |
| docs-page.server.test.ts / 1 | 英文 OpenAPI sidebar 当前返回 join/leave/update/query 等端点列表，测试仍要求 /en/api-reference 根入口及 authentication。payload 和端点本身成功返回。 | 属 sidebar 契约差异；需确认是否应保留上述入口再判断改测试或改实现。不是 Meilisearch 检索失败。 |
| docs-single-folder-sections.test.ts / 1 | 测试全面禁止“目录仅含另一子目录”，扫描返回 28 处，包括 RESTful 和 `(current)` 版本包装目录。 | 部分为当前版本/平台目录的正常结构，不能无差别扁平化。需缩小规则、核对其他真实冗余；主要影响导航层级。 |
| product-api-reference-sidebar.test.ts / 6 | 测试仍从 solutions/meeting 取页面，但该位置不存在，会议产品在 realtime-media/meeting；另外弹幕/会议/KTV 元数据与旧“服务端 API 折叠组”预期不一致。 | 2 项直接由旧 meeting 路径引起；其余 4 项要确认 API 入口当前归属后修 fixture 或导航。影响入口导航，不代表搜索 API 没有这些文档。 |
| rtc-mini-program-client-content.test.ts / 3 | Client 源文件确实保留 Hierarchy/Index；on 重载没有测试要求的独立 Accordions 结构；ParameterList/ApiReturns 未统一采用 table 与“返回值”属性。 | 是内容格式与目标迁移标准未对齐，不能宣布只是测试过时。可能影响章节展示和重载阅读；本轮索引没有造成这种格式。 |
| zh-cn-product-ia-standard.test.ts / 5 | 2 项 speech-to-text 显示标题预期与当前“概览”“开发与集成”不同；1 项 cloud-recording 旧地址实际转到旧 user-guides 而非新 build 路径；1 项批量检查报告 116 条重定向/目标差异（不等于 116 个独立线上 404）；1 项 helper 把 meta.pages 全当 string，遇到 schema 已支持的 group 对象触发 page.replace TypeError。 | 标题需产品契约确认；helper 是明确的测试兼容问题。重定向差异需按实际路由/动态端点验证，其中有目标在文件层面不存在，不能直接忽略；影响旧链接和导航点击。 |
| zh-cn-product-navscope-content.test.ts / 1 | RTC overview 当前“实时互动 RTC”，测试断言“语音与视频 RTC”。 | 显示标题预期漂移；检索仍能运行。确认采用当前命名后再更新测试。 |
| DocsContent.test.tsx / 6 | 主栏同时渲染移动和桌面正文，兩处 docs-main-mobile-flow 使用同一 testid。测试期望一个正文/页脚和单一容器，findByTestId 报多元素；桌面 hidden lg:block 与旧单流布局预期矛盾。反馈测试首先卡在重复容器查询，未执行到反馈交互断言。 | 共同根因是布局契约不一致；重复 DOM/ID 是实际存在，不应仅改查询让测试变绿。浏览器是否错跳需另外验证。反馈交互本身尚未被这些失败证明损坏。 |
| DocsShell.test.tsx / 3 | 同一 DocsMainColumn 重复容器与桌面独立分支导致 footer/mobile-flow/class 断言失败。与上面 6 项共享实现根因。 | 属文档壳布局，不是独立的 3 个检索问题；可能影响搜索结果进入文档后的锚点定位。 |
| faq-content-sync.test.tsx / 1 | ios_background.mdx 仍引用 /img/rtc/ios-backgroundmodes.png，规则要求全部迁至 CDN；本地 public 文件存在。 | 是资源路径规范未迁移，不等于图片已 404；当前静态托管若发布对应文件可以展示。无需为此重建搜索索引。 |

## 与跨平台锚点问题的关系

DocsMainColumn 的移动/桌面两份正文是重复 DOM 的另一个来源。此前索引覆盖审计报告的跨 platform panel 重复 ID，不能仅由此解释全部，也不能把两个问题合并成一个已经证实的错跳根因。重复 ID 已观察到，实际跳转到错误平台仍需浏览器复现。

## 处理优先级

1. 独立确认旧链接重定向目标和搜索结果进入文档后的定位。目标缺失及重复 DOM/ID 最可能影响用户点击体验。
2. 维护测试契约：分别测试 global/cn；支持 meta 分组对象；更新已确认的标题、Accordion 和 llms 子索引断言。不要整文件跳过或放宽所有断言。
3. 对导航/API 入口、mini-program 内容格式和英文 CodeBlockTab 内容问题按对应模块处理，保留各自回归检查。

本轮仅审计并写报告，未修复上述实现、未修改测试、未调整泛词排名，也未更换或重建当前 Meilisearch 索引。当前页面搜索继续可用。泛词排序按用户要求暂停。
