# 中文 OpenAPI 与旧源内容对比

## 2026-11-12 合并目标分支后的范围

本分支已合并目标 `codex/cn-newdoc-html-api-migration` 的 `36b3d92ea`。目标已通过其他合并恢复参数兼容、鉴权 scheme 引用和未声明类型的通用显示规则，因此下文的 11 月 2 日记录是历史审计，不代表这些改动仍是当前 PR 的独有差异。

当前剩余修改为：补回水晶球与控制台 `info.description` 中的两处 HTTP 鉴权教程引用，保留本审计记录，并补充“无类型的继承／引用参数不丢失、不编造类型、不修改输入”的回归测试。共享 OpenAPI 渲染文件与当前目标分支保持逐字一致，沿用目标的 `typeSpecified` 机制，不重复引入原 PR 的私有缺失 schema 标记。

冲突验证与原 PR 的验证结果分开记录；本次处理不构成新的生产发布或独立人工验收。

本次使用 Node 26.13.0 / Bun 1.4.4 验证：类型检查通过；OpenAPI 专项 27 个文件、415 项通过；全量测试 365 个文件、5993 项通过（另 1 文件、15 项跳过）。变更测试的 Biome、相对目标的差异空白检查及 OpenAPI 资源同步通过。API 源检查为 `PASS_WITH_DEBT`：0 个新增问题，保留目标中已登记的 2 个重复标题。未重新进行全站构建或发布验收。

审计日期：2026-11-02。本次按用户要求列出遗漏，不修改这些新发现的问题。

后续处理（2026-11-02）：用户随后要求先补齐鉴权链接。本分支已恢复第 2 节列出的全部 6 处 security scheme 教程引用，以及水晶球、控制台概述中的 2 处重复引用；加上此前 RTC 的 1 处，共恢复 9 处引用。均指向新站已有指南，HMAC 使用当前章节锚点。下文保留初审时的发现与证据，参数显示和 PPT 通用说明问题仍待处理。

第二次后续处理（2026-11-02）：用户确认公共参数兼容方案并要求修复与前后截图。现已在渲染适配层恢复第 1 节全部 13 个参数：仅在缺少 schema 时补充临时无约束 schema，并在参数字段行隐藏未声明的类型；原 YAML 与输入 payload 不变。新增真实源参数覆盖及继承参数、组件引用、null schema、类型留空、既有类型和输入不变回归检查，共 15 项通过。独立代码审查未发现实质问题。PPT 通用说明仍未修改。

截图图册位于 ignored `.agent/artifacts/openapi-before-after/index.html`：8 组参数区前后对照，加上 6 组鉴权区前后对照，共 28 张原始页面截图和 14 张左右对照图。鉴权修复前版本来自 Git 基线 `3110fcacf`；参数修复前截图已经包含此前鉴权链接修复。截图仅裁剪并排，页面文字未改写。

修复验证：`bun run test --maxWorkers=2 --testTimeout=20000` 全量 316 个文件通过，4998 项通过、2 项跳过；默认并发下大文档用例曾超时，降低并发后通过。`bun run types:check`、4 个变更 TS/TSX 文件的 Biome 检查和 `git diff --check` 均通过。截图图册全部 14 张对照图均已验证可加载，且修复后的目标区块完整显示。

## 基线与范围

- 旧源：`/Users/yejiayi/Documents/shengwang-doc-source`，本地干净的 `master`，提交 `19cb0369130e52e427ea2a0706f0c10d26034868`。没有拉取远端，不代表远端最新状态。
- 目标：`codex/fix-rtc-basic-auth`，HEAD `3110fcacf2ccb5ad5ce55743109f428506496637`，包含本会话尚未提交的 RTC Basic Auth 链接恢复。
- 注册表中可与中文旧源对应的 YAML：15 组、176 个接口。其中融合 CDN 的 50 个接口已明确退役，排除后，实际发布范围为 **14 个 lane、126 个接口、421 个参数出现位置**。
- 按迁移 manifest 对应新旧源；弹幕互动额外匹配 `html-docs/danmaku/RESTful/danmaku.yaml`。英文专用 lane 不与中文旧源混比。
- 对比接口、参数、请求/响应属性、描述、鉴权说明和示例。解析本地 `$ref`，按参数的 `in + name` 对齐；排除数组顺序、`operationId` 重命名、旧 HTML 转 Markdown、描述迁入 `x-docs-sections` / `x-docs-callouts` 等形式差异。
- 旧响应键 `非 200` / `非 2XX` 与新 `default` 对齐；示例键 `Defalut` 与 `Default` 对齐。
- 这是源码内容审计，附参数渲染覆盖和 RTC 浏览器复现，不宣称已逐页完成所有视觉、搜索、Markdown 导出或断链检查。

## 1. 参数仍在 YAML，页面却不显示：8 个接口、13 个参数

| Lane | 页面末段 | 未显示的参数 | 参数位置 |
| --- | --- | --- | --- |
| `agora-analytics-rest` | `realtime-usage` | `dimension`、`dimensionValues` | query |
| `agora-analytics-rest` | `realtime-quality` | `dimensionValues` | query |
| `agora-analytics-rest` | `realtime-usage-top20` | `metric` | query |
| `media-pull-rest` | `update` | `playerid` | path |
| `rtc-rest-zh-cn` | `query-user-status` | `appid`、`uid`、`channelName` | path |
| `rtc-rest-zh-cn` | `query-user-list` | `appid`、`channelName` | path |
| `rtc-rest-zh-cn` | `query-host-list` | `appid`、`channelName` | path |
| `rtc-rest-zh-cn` | `query-channel-list` | `appid` | path |

这些参数在旧源和目标 YAML 中都存在，但没有 `schema`。旧站直接渲染名称和说明，新站依赖的 Fumadocs 在 `param.schema == null` 时跳过整项。

- 本地适配入口：`src/components/openapi/FumadocsOpenApiContent.tsx:373`，`adaptOpenApiParameterSchema` 对无 schema 的参数直接返回，未作兼容。
- 依赖跳过逻辑：`node_modules/fumadocs-openapi/dist/ui/operation/index.js:150`。
- 旧站渲染逻辑：`shengwang-doc-source/src/components/restful/OpenapiRender.tsx` 中的参数组件直接渲染 `param.name` 和 `param.description`。
- 页面实际影响：名称、说明、相关教程链接及适用的必填标记一起消失。例如 RTC `appid` 的“获取所有项目信息 API”链接，`uid` 暂不支持 String 用户名的限制，以及数据洞察 `dimensionValues` 双引号和逗号分隔要求。
- 浏览器已在 `/api-reference/api-ref/rtc/query-channel-list` 复现：“路径参数”标题下面为空，直接进入“查询参数”。

## 2. 其他 5 个 lane 仍缺鉴权教程引用

下表不重复计算本会话已经补回的 RTC security scheme 链接。

| Lane | 缺少的引用 | 目标源位置 | 旧源位置 |
| --- | --- | --- | --- |
| `agora-analytics-rest` | “使用 HTTP 认证” | `content/openapi/agora-analytics/analytics-rest-api.zh-CN.yaml:1424`，`components.securitySchemes.Authorization.description` | `html-docs/analytics/RESTful/restful-aa.yaml:1270` |
| `console-rest` | “使用 HTTP 认证” | `content/openapi/console/rest-api.zh-CN.yaml:231`，`components.securitySchemes.Authorization.description` | `html-docs/console/RESTful/console.yaml:253` |
| `media-pull-rest` | “实现 HTTP 基本认证” | `content/openapi/media-pull/media-pull.zh-CN.yaml:515`，`components.securitySchemes.Basic Auth.description` | `html-docs/media-pull/restful/media-pull.yaml:473` |
| `cloud-transcoding-rest-zh-cn` | “实现 HTTP 基本认证” | `content/openapi/cloud-transcoding/cloud-transcoding.zh-CN.yaml:813`，`components.securitySchemes.Basic Auth.description` | `html-docs/cloud-transcoder/RESTful/cloud-transcoder.yaml:748` |
| `cloud-transcoding-rest-zh-cn` | “实现 HTTP HMAC 认证”及如何生成字段值的引导句 | `content/openapi/cloud-transcoding/cloud-transcoding.zh-CN.yaml:818`，`components.securitySchemes.API Key.description` | 同旧源的 `components.securitySchemes.API Key.description` |
| `voip-callkit-rest` | “实现 HTTP 基本认证”及具体生成 `Authorization` 的引导句 | `content/openapi/voip-callkit/call.zh-CN.yaml:854`，`components.securitySchemes.Basic Auth.description` | `html-docs/voip-callkit/call.yaml:844` |

此外，水晶球和控制台 `info.description` 中也分别删掉了一处 HTTP 认证教程引用。它们属于同类重复位置，不另计为两个产品问题。

新站已有对应指南，可恢复入口：

- 水晶球、控制台：`/zh-CN/realtime-media/rtc/build/setup-and-access/http-basic-auth`。
- 输入在线媒体流：`/zh-CN/realtime-media/media-pull/build/http-basic-auth`。
- 云端转码：`/zh-CN/realtime-media/transcoding/build/http-auth`；HMAC 章节现名为“实现 HTTP HMAC 鉴权”，锚点应为 `#实现-http-hmac-鉴权`。
- 微呼叫：`/zh-CN/solutions/voip-call/build/http-basic-auth`。

这些缺口来自正文引用删除；认证方案本身仍在，不能表述为“鉴权功能缺失”。

## 3. PPT 转码 API 概述被压缩，通用调用说明缺少承接

旧源 `html-docs/conversion-ppt/RESTful/restful-ppt.yaml:5` 的 `info.description` 有完整 API 概述，目标 `content/openapi/ppt-conversion-service/rest-api.zh-CN.yaml:5` 只剩一句摘要。

| 旧源内容 | 当前核对结果 | 判断 |
| --- | --- | --- |
| 请求 Header 的 `Content-Type` 为 `application/json`；请求和响应为 JSON；请求 URL、包体区分大小写 | YAML 的媒体类型仍是 JSON，但未找到等价的 PPT API 通用文字说明 | 通用说明遗漏，尤其大小写约束值得补回 |
| 服务端只兼容部分请求格式；参数正确而请求失败时仍应检查格式 | 未找到目标 PPT API 或产品文档中的等价提示 | 提示内容遗漏 |
| AK、SK、SDK Token 仍通过互动白板获取 | `realtime-media/ppt-transcoding/build/setup-and-access/enable-service.mdx` 已解释白板服务及密钥关系 | 非全站内容丢失，但 API 入口不再引导 |
| 调用前开启文档转图片/网页服务、配置存储，并提供公网可访问 URL；链接“开通服务” | `enable-service.mdx` 和 `get-started/quick-start.mdx` 保留对应知识；7 个 PPT endpoint 均未承接这段公共前置说明，也没有 `x-docs-sections` / `x-docs-callouts` | API 阅读路径缺少前置条件与教程入口 |
| “响应状态码”入口 | endpoint 响应描述和 `api-ref/ppt-conversion-service/meta.json` 仍有入口 | 已承接，不算遗漏 |

旧源中另一个未被任何 endpoint 引用的 `components.parameters.uuid` 删去了“创建房间/获取房间信息”链接；这是未使用定义，不列为用户可见问题。

## 4. 排除的差异

- 没有发现整条 operation 从新 YAML 或注册表中漏迁；规范化后没有发现请求/响应字段、参数定义或示例主体的实质删除。
- 云端录制、云端转码、RTC、白板等长描述与注意事项已迁入 `x-docs-sections` / `x-docs-callouts`。例如 builderToken 的 5 分钟有效期、获取后 2 秒内创建、RTC 规则 ID 保存与超时建议、白板截图废弃提醒，仍有正文承接。
- RTMP 网关的“最佳实践”链接删除已有明确的历史批准记录：`docs/agents/reports/2026-07-17-openapi-zh-link-review.md` 的 Approved Removals。
- ConvoAI 的 `Defalut` 示例改名 `Default`，示例内容仍在；云端转码示例只把尖括号占位符改为普通占位符。
- ConvoAI `llm.input_modalities.items.default: text` 元数据被移除，但该字段描述仍明确写着 `["text"]` 为默认值。记录为 schema 元数据差异，不列为教程内容遗漏。
- RTC 概述被压缩，但调用频率约束保留在 `content/docs/zh-CN/realtime-media/rtc/reference/quota.mdx`，认证和响应码指南也仍在。
- 融合 CDN 仍有 50 条注册与旧源对应，属于已退役产品；不把不发布算作迁移遗漏，不建议恢复上线。

## 5. 全量 lane 结论

| Lane | 接口数 | 本次结果 |
| --- | ---: | --- |
| `convoai` | 10 | 未确认新增实质遗漏；有默认值元数据差异，见上文 |
| `cloud-recording-rest` | 7 | 未确认新增遗漏 |
| `speech-to-text-rest` | 5 | 未确认新增遗漏；错误响应改名为 `default` |
| `agora-analytics-rest` | 14 | 3 个接口共 4 个参数不显示；缺 HTTP 认证教程入口 |
| `console-rest` | 6 | 缺 HTTP 认证教程入口 |
| `ppt-conversion-rest` | 7 | API 通用数据格式/排错提示缺失，前置条件缺少入口承接 |
| `danmaku-rest` | 9 | 未确认新增遗漏 |
| `media-pull-rest` | 5 | 1 个参数不显示；缺 HTTP 认证教程入口 |
| `media-push-rest` | 7 | 未确认新增遗漏 |
| `rtc-rest-zh-cn` | 9 | 4 个接口共 8 个参数不显示；scheme 认证链接已在本会话恢复 |
| `cloud-transcoding-rest-zh-cn` | 8 | 缺 Basic Auth 和 HMAC 两个教程入口 |
| `media-gateway-rest-zh-cn` | 14 | 未确认新增遗漏；历史批准删除不算问题 |
| `voip-callkit-rest` | 6 | 缺 HTTP 认证教程入口 |
| `whiteboard-rest` | 19 | 未确认新增遗漏 |

## 6. 验证与已有修复线索

- 从真实 YAML 遍历并展开全部 126 个接口的 421 个参数，找到 13 个无 schema 的参数出现位置。
- 临时使用已有远程跟踪分支中的参数覆盖测试验证当前实现：14 个 lane 中 11 个通过，水晶球、输入在线媒体流、RTC 3 个失败，与静态检查和浏览器复现一致。这是审计复现失败，不是本次修改引入的失败。
- 测试与审计脚本、JSON、日志保存在 ignored `.agent/artifacts/openapi-parity/`；临时测试已移出 `src`。
- 发现本地远程跟踪分支 `origin/codex/cn-doc-content-parity-fixes` 已含提交 `57bf17e6c5c8578583705f9b1bf28f762ca0ea54`（`fix: restore missing REST API parameters and auth links`）。它覆盖参数隐藏和鉴权入口恢复，当前分支尚不包含。后续修复可优先复核和复用，避免重复实现；本次没有合并或挑拣该提交。
- 本轮仅新增审计报告，未修改新发现问题的源 YAML 或渲染器；原有 RTC 链接修复保持待提交状态。
