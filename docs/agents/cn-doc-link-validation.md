# 中文文档全量链接检查

检查工具运行在独立工作树，覆盖 `content/docs/zh-CN/**` 的 Markdown/MDX、导航元数据、共享 include、平台内容、中文 OpenAPI 正文与扩展正文，以及渲染后生成的链接、图片、媒体和下载地址。

## 使用方法

依赖：仓库要求的 Bun/Node 环境。完整浏览器检查还需要 `agent-browser` 和它使用的 Chromium（`agent-browser install`）。工具使用独立临时浏览器会话，不复用个人登录状态。

```bash
bun install --frozen-lockfile

# 快速生成全部源码引用清单，不请求公网
bun run docs:links:cn --out .agent/artifacts/cn-links/static

# 完整中文构建，然后核对生成页面、资源与锚点
bun run docs:links:cn:built --build --out .agent/artifacts/cn-links/built

# 对与本次构建相符的预览部署执行完整检查
bun run docs:links:cn:full --origin https://YOUR-PREVIEW-HOST --out .agent/artifacts/cn-links/full
```

也可以把构建和完整检查放在一次命令中：

```bash
bun run docs:links:cn:full --build --origin https://YOUR-PREVIEW-HOST
```

`YOUR-PREVIEW-HOST` 是待测试部署的域名，需要替换。默认 `--match artifact` 要求线上整份 HTML 的 SHA256 与当前构建相同；错误页面、空壳或不匹配产物不会判定通过。

如果 staging 只有 canonical 域名、全局脚本产物等部署信息不同，可以显式按文档内容比较：

```bash
bun run docs:links:cn:full --build --match content \
  --origin https://YOUR-PREVIEW-HOST --out .agent/artifacts/cn-links/content
```

本仓库 staging 的内容比较命令为：

```bash
bun run docs:links:cn:full --build --match content \
  --origin https://cn-preview.example \
  --out .agent/artifacts/cn-links/staging
```

`--match content` 要求静态正文非空且不是 skeleton，正文指纹、实际文档标题、预期最终地址及已有 canonical 路径一致。指纹保留正文原始 HTML、文章 H1 和页面 title；链接、资源地址、ID、隐藏面板和代码空白变化都会导致不匹配。仅全局 head 中的部署域名或 bundle 变化不影响内容指纹。

报告分别保留 `artifactMatches` 和 `contentMatches`；内容一致而整份 HTML 不同会记录 `artifactMatches: false`、`contentMatches: true`。这只能证明被比较的文档内容相同，不能证明 staging 来自同一提交，也不能证明应用脚本行为相同。交互状态、HTTP 和浏览器验证、源码引用覆盖及构建来源证据仍须完整，内容模式不会豁免这些缺口。

`--build` 自动设置 `VITE_DOCS_REGION=cn`，拒绝 `DOCS_DEV_SCOPE`、`TSS_PRERENDER_PATHS` 等局部构建环境，并记录源输入与构建输出摘要。仅手动运行过 `bun run build` 的旧目录没有这份证据，使用 `--build` 重新生成。`--build` 只支持标准 `dist/client` 输出。

本地服务也可以作为 `--origin http://127.0.0.1:端口`，但必须实际提供生产规则下的中文公开路由。普通 SPA fallback 静态服务器可能把所有地址都返回同一份 HTML，这种服务会被报告为不匹配。本地通过不能替代真实部署的路由检查。

## 平台查询参数兼容

多平台正文的旧链接 `页面?platform=ios` 按发布清单转换为对应的平台路径，例如 `页面/ios`。规则覆盖所有已发布平台及已有别名，明确的平台路径优先，其他查询参数及 hash 保留。不支持的平台不会生成新路径；SDK 下载页、搜索页等业务筛选参数不属于此转换范围。

静态站在创建路由器、复用预渲染数据之前规范化首次访问的 URL，站内导航使用同一映射。平台路径必须来自当前构建的 `docs-routes.json`，不能仅根据平台注册名称猜测页面支持范围。

审计同时比较最终 URL 的查询参数语义（包括重复值数量，忽略排列顺序）和声明的跳转规则。平台链接即使没有 hash，也要求浏览器从原始入口打开，验证最终规范路径、选中的平台及可见面板；有 hash 时还检查其保留及目标可见性。HTTP 返回相同 HTML、或只访问规范路径成功，都不足以证明旧入口有效。未执行浏览器验证时，这类链接保持 INCOMPLETE。

普通参数按 URL 字符串及多值保留，重复参数不会改写成单个 JSON 数组参数。单值搜索词 `q` 沿用站点既有的 JSON 引号编码兼容，例如 `q=110` 与 `q=%22110%22` 都表示搜索词 `110`；审计使用同一解码规则比较，其他参数没有这项例外。

## 结果含义

| 状态 / 退出码 | 含义 |
| --- | --- |
| PASS / 0 | 所有应检查页面覆盖完成，适用链接已验证，断链和待核查均为 0 |
| FAIL / 1 | 存在已确认问题；报告还可能同时有未确认项 |
| INCOMPLETE / 2 | 存在未验证链接、未覆盖状态、解析/构建/运行错误；不能视为全绿 |

源码和构建模式不做完整网络/浏览器验证，因此通常返回 INCOMPLETE / 2。这是诊断结果，不代表命令异常，也不等于“没有断链”。只有完整模式的 PASS 才能作为全量可达验收证据。构建或参数错误也会退出 2，并在终端指出原因。

不支持的动态 MDX 表达式、超过遍历上限的交互状态、认证/反爬/限流、超时、无法确定的外部锚点，都保留为待核查。mailto/tel/data/blob 等明确非 HTTP 行为单列为不适用。已退役源文件列入 excluded；发布页面指向退役内容仍需校验。

## 报告文件

每次检查在指定 `--out` 目录写入：

- `report.json`：全部引用、来源行列/结构指针、目标、状态、覆盖缺口、本地提交和检查时间；顶层 `match` 记录匹配策略，页面记录的 `artifactMatches`、`contentMatches`、`pathMatches` 保留各项比较结果。
- `report.md`：汇总及按目标/原因分组的问题预览（前 100 组、每组前 20 个来源）；完整引用保存在 JSON/CSV 中。
- `links.csv`：每条引用一行，方便筛选负责人和逐项处理。
- 完整模式另有 `network-evidence.json`、`browser-evidence.json`、`browser-targets.json`（对应阶段有运行时生成），记录网络和浏览器证据。

OpenAPI 链接包含 YAML JSON Pointer 和实际可定位行号；片段内的位置单独记为 `fragmentLine`/`fragmentColumn`，不冒充 YAML 坐标。生成 HTML 或浏览器生成链接没有原文行号时，报告对应生成文件/页面及状态。

例如查看确认问题和未验证原因：

```bash
jq '.match, .summary, .coverage' .agent/artifacts/cn-links/full/report.json
jq '[.records[] | select(.status == "broken")]' .agent/artifacts/cn-links/full/report.json
jq '.gaps' .agent/artifacts/cn-links/full/report.json
jq '[.records[] | select(.source == "page" and .artifactMatches == false and .contentMatches == true)] | length' .agent/artifacts/cn-links/full/report.json
```

所有本地报告都放在忽略的 `.agent/artifacts/` 下，不需要提交这些大型结果文件。

## 覆盖方式

1. AST 解析全部中文源文件，忽略代码与纯注释；保留 Markdown、引用/自动链接、HTML、JSX、静态对象、图片与 srcset 的每次引用。对无法解析/求值的内容记录缺口。
2. 复用应用的链接规范化及 OpenAPI lane 注册表；区分源文件路径、含 `/zh-CN` 的内部路由与无此前缀的公开路径。OpenAPI 相对链接使用所属 endpoint 的上下文。
3. 从发布路由清单枚举页面，包括孤立页面及平台路由，读取完整正文、资源与真实 DOM ID。把源链接和实际渲染结果核对，未观察到的源链接会报告缺口。
4. HTTP GET 按网络 URL 去重，保留查询参数和重定向链。404/410、软 404、页面身份不符、HTML 冒充资源等不会因状态码 200 而通过。DOM ID 原值和 URL fragment 仅进行正确的一次解码匹配。
5. 浏览器按有界状态图检查平台/标签页/折叠内容。深链接通过直接导航验证目标是否出现、可见；不会先替用户手动展开再声称深链接正常。

## 耗时和控制参数

全量运行可能较久，尤其是外网请求和交互内容。命令持续输出阶段进度。

```bash
bun run docs:links:cn:full --origin https://YOUR-PREVIEW-HOST \
  --concurrency 8 --timeout 10000 --retries 1 --max-states 128
```

- `--match artifact|content`：默认 `artifact`，严格比较整份 HTML；显式选择 `content` 时比较文档内容身份。两种模式均保留构建来源与覆盖检查。
- `--concurrency`：网络总并发；网络层还限制同主机并发。
- `--timeout`：单次请求/浏览器动作超时，毫秒。
- `--retries`：暂时性网络错误的额外重试次数。
- `--max-states`：每页浏览器状态上限；达到上限报告覆盖不完整，需要提高上限或处理对应页面。
- `--no-browser`：跳过浏览器，相关内容仍明确标为未验证，不可用来获得全量 PASS。
- `--html`、`--manifest`：读取已有构建路径；仍需匹配构建证据，不能拿别的提交产物冒充当前版本。

浏览器 CLI 可以通过 `CN_LINK_BROWSER_EXECUTABLE` 指定安装包自带的原生可执行文件（不是 Chrome 的路径）。本轮环境中，Node 包装入口在超时后可能遗留子进程，因此实际浏览器复核使用了原生 CLI。其他环境默认仍使用 PATH 中的 `agent-browser`。

外部服务的可达性只代表记录时间的观测结果。修复内容后重新构建并对对应预览部署复检；本工具不会自动修改链接，也不会把失败目标加入静默跳过名单。

## 开发验证

```bash
bun run test scripts/cn-link-inventory.test.ts scripts/cn-link-built.test.ts \
  scripts/cn-link-network.test.ts scripts/cn-link-browser.test.ts \
  scripts/cn-link-audit.test.ts scripts/cn-link-content-evidence.test.ts --maxWorkers=2
bun run test --maxWorkers=2
bun run types:check
```

网络用例使用本地 HTTP fixture；浏览器 collector 有 DOM 回归测试，真实 agent-browser 的状态遍历与深链场景另做本地 smoke 验证。不要将 fixture 通过描述为整站或公网所有链接通过。

## 提交 PR 前复核（2026-10-27）

工作分支已同步迁移分支 `af6819858`，保留上游最新页签、锚点及 API 链接。此前分批报告中的两个 RTM 基线测试失败已由上游修正；以下为同步后的实际结果：

- `bun run test --maxWorkers=2`：290 个测试文件通过，4,608 项通过、2 项跳过、0 项失败。
- `bun run types:check`：通过。
- `bun run lint`：通过，0 errors、19 warnings、5 infos。
- `git diff --check`：通过；独立复核未发现同步上游引入的整合回归。
- 最终修复及同步上游后未重跑完整生产构建，也未部署；分批浏览器证据不代替部署后全量审计。

历史遗留待办见 [#1310](https://github.com/AgoraIO/docs-portal/issues/1310)、[#1312](https://github.com/AgoraIO/docs-portal/issues/1312)、[#1311](https://github.com/AgoraIO/docs-portal/issues/1311)。27 个源头空页面按用户决定不处理，不计作验证通过。之前各批报告的测试数和待办描述是当时快照；当前待办以[后续事项清单](./cn-doc-link-follow-up.md)为准。

## 完整生产构建复核

在最新修复提交 `29e606410ed50fc613ccff27ad1d3298b17b1c5c` 上执行 `VITE_DOCS_REGION=cn bun run build`，完整命令退出码为 0。显式指定中文区域，覆盖中文站数据、客户端与服务端生产打包、预渲染及路由 HTML 生成。

- 静态数据：5,865 份。
- 机器可读文档：7,048 份。
- 路由 HTML：6,799 份。
- 非阻塞提示：插件耗时、大于 500 kB 的 chunk，以及 Git 历史不完整时保留文档更新时间快照。

此结果替代前文“未重跑完整生产构建”的状态。完整日志保存在忽略目录 `.agent/artifacts/cn-links/publish/build-final-cn.log`。构建通过不代表外链均可达；历史待办仍保持开放，尚未部署。
