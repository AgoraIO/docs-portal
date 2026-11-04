# CNQA-003／010／014 入口与 OpenAPI 复核

复核目标：`codex/cn-newdoc-html-api-migration`，固定基线 `ae8fe94cb`。

| 问题 | 当前结论 | 本轮处理 |
| --- | --- | --- |
| CNQA-003 平台入口 | 历史故障已有公共 query-route、路由 loader、首屏规范化及独立平台入口修复。RTM 概览已直链 Swift 独立页。 | 不重复修改路由；复核现有测试、实际 Swift 页面和生成出口。 |
| CNQA-010 认证示例 | 仍存在。81 个声明认证的接口中，云录制 7 项已有 Authorization 参数；其余 74 项仅声明 security，生成器未把认证声明应用于示例。 | 在实际代码生成入口按有效 security 添加认证信息，不修改源参数定义。 |
| CNQA-014 RTC 参数 | 基线已有兼容适配，四页的 8 处参数名称、必填标记和说明已显示；查询用户状态保留不支持 String 用户名限制。未声明类型显示 unknown。 | 不重复恢复参数；现有 PR #1355 另有隐藏未声明类型占位的修复，本 PR 不覆盖其内容。 |

## 认证修复

Fumadocs 11.2.2 的默认请求示例仅从 parameters 构造请求，未读取 securitySchemes。云录制因此因显式参数保留 Header，其余接口丢失声明中的认证。

新适配器遵循 operation.security 优先于 document.security；空数组或匿名替代方案不添加认证。每次使用一个 OR 方案，并完整应用该方案的 AND 要求。支持当前来源需要的 HTTP Basic，同时覆盖 Bearer／OAuth、header/query/cookie API key；已有 Header 按大小写不敏感检查，不覆写显式示例。保留 x-codeSamples 的原有优先级。

在源码与页面中均使用真实请求示例生成链路回归：修改前 RTC 查询用户状态用例因为缺少 Authorization 失败；修改后 cURL、Python/Requests、Node.js/Fetch 均显示 `Basic <credentials>`。全部 81 个声明认证的中文接口的每个公开代码 tab 均通过认证和不重复 Header 检查。匿名覆盖、引用 scheme、AND／OR、已有 Header、输入不变另有单元验证。

## 入口与参数验证

- 现有 query-route、路由守卫、参数覆盖和云录制例子四组测试共 124 项通过。
- 浏览器：保存 Android 偏好后直接打开 RTM `?platform=swift`，最终进入 `/quick-start/swift`；选中 Swift，正文包含 Xcode，没有 Gradle 步骤；刷新、从概览 Swift 入口进入、后退／前进后仍显示对应正文。
- RTC 13 个、RTM 8 个非 Android 平台共有 21 份独立 Markdown 生产产物，全部存在且不含未处理的平台标签。Swift 产物对应 Swift 正文。
- 浏览器确认 RTC 查询用户状态的 appid、uid、channelName、必填状态及不支持 String 用户名的说明；参数覆盖测试检查所有中文 lane，生成 Markdown 中也保留该信息。
- 开发服务器的 21 平台浏览器矩阵曾因导航超时中断。改用完整生产构建产物，并按部署方式将中文无语言前缀 URL 映射到 /zh-CN 后，21 个非 Android 入口全部通过：每次先保存 Android 偏好，再打开带 platform 的 URL，最终独立路径、平台状态与页面平台正文对应。浏览器记录见本地 platform-matrix.json；这是本地生产产物复验，不是线上部署复验。

## 验证边界

- `bun run test --maxWorkers=2 --testTimeout=20000`：339 个文件通过、1 个跳过；5,650 项通过、6 项跳过。
- `bun run types:check`、变更 TS/TSX 的 Biome、`git diff --check` 通过。
- 本地实际 RTC 页面 cURL 已显示 Authorization；未向业务服务发请求。
- `VITE_DOCS_REGION=cn bun run build` 完整通过：6,174 份页面数据、7,446 份机器出口、7,210 份路由 HTML。
- 本 PR 未部署，不代表新站线上复验完成。诊断日志、截图、生成出口清单在 ignored `.agent/artifacts/cnqa/`。
