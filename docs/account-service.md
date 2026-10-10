# 中文文档账号服务

认证服务复用本仓库的独立 Node API service；文档页面仍由静态托管提供。网关把同一公开 origin 的 `/api/*` 转发给 service，并保留原始 Host 和协议。服务只接受配置的 `DOCS_AUTH_ORIGIN`，不根据客户端提供的回调或转发头选择 SSO 回调地址。

接入依据为 [SSO OAuth 授权接入指南](https://confluence.agoralab.co/pages/viewpage.action?pageId=1485177164)（2026-08-05 更新，2026-10-09 读取）及 [中文账号资源接口](https://sso-open.shengwang.cn/api-docs/v1/customer)。采用 confidential client：authorize 获取 code，服务端以 form-urlencoded 的 `client_id`、`client_secret`、`code`、`redirect_uri` 换 token，再以 Bearer token 请求 `/api/v0/customer/company/basic-info`。该 SSO 的 confidential client 当前不支持 PKCE；public client 的 PKCE / loopback 流程不适用于此服务。

## SSO 注册与运行配置

申请 confidential client，scope 为 `basic_info`，回调为 `<中文文档公开 origin>/api/oauth`；回调必须与注册值完全一致。生产和测试分别申请、配置。不要把 secret 放入 `VITE_*`、浏览器、跟踪事件或代码库。

| 私有运行变量 | 用途 |
| --- | --- |
| `DOCS_AUTH_ORIGIN` | 文档公开 origin，不带路径、query 或 hash |
| `SSO_CLIENT_ID` / `SSO_CLIENT_SECRET` | 申请得到的 confidential client 凭据 |
| `DOCS_AUTH_SESSION_PASSWORD` | 至少 32 字符的随机会话密钥，所有实例使用相同值；由部署平台保存和注入 |
| `DOCS_AUTH_ENV` | `production`（默认）、`staging` 或 `local` |
| `SSO_ORIGIN` | 可覆盖默认中文 SSO 授权 origin |
| `SSO_RESOURCE_ORIGIN` | 可覆盖默认中文账号资源 origin |
| `DOCS_CONSOLE_ORIGIN` | 默认 `https://console.shengwang.cn`；联调时可配置目标环境 |
| `DOCS_POSTHOG_HOST` / `DOCS_POSTHOG_KEY` | 一起配置，发送服务端事件；必须核对文档浏览器使用的 PostHog 项目和环境 |

生产默认 SSO 为 `https://sso.shengwang.cn`，资源为 `https://sso-open.shengwang.cn`；staging 默认分别为 `https://sso-staging.shengwang.cn` 和接入指南列出的 `http://sso-open.staging.shengwang.cn`。HTTPS 是默认要求；`local` 仅接受 loopback 文档 origin，允许本地契约替身使用 HTTP。

未提供完整认证配置时，账号接口返回 503 / `unknown`；静态页面、健康检查及搜索服务继续独立工作。未配置 PostHog 时不发送服务端事件，也不保存待发送记录。监控认证接口错误及 `[docs-auth] Event delivery failed` 日志；`/api/health` 仅代表进程存活。

构建和运行沿用 [service 部署说明](./search-service.md)：`bun run build:service`，运行整个 `.output`，在启动时注入配置。浏览器产物不包含认证后端或运行时 secret。

## API 与会话

| API | 行为 |
| --- | --- |
| `GET /api/auth/login` | 冻结流程，设置加密的浏览器上下文 cookie，302 到 SSO authorize；state 有效期五分钟 |
| `GET /api/oauth?code=…&state=…` | 验证加密上下文与 state，交换一次性 code、读取可信身份，建立会话并 302 到允许的 Console 目标；兼容 SSO 附带的 `loginId`，不将其作为用户 ID |
| `GET /api/userinfo` | 200 返回 `authenticated`、`user: {accountUid, companyId}` 和 `expiresAt`；401 返回 `unauthenticated`；服务异常为 503 / `unknown` |
| `POST /api/logout` | 要求与文档一致的 Origin，清除当前浏览器的文档 cookie；仅退出文档会话 |

会话复用 TanStack Start 已有的加密 / 签名 cookie 能力，不增加包、数据库或外部存储。HTTPS cookie 使用 `__Host-`、HttpOnly、Secure、SameSite=Lax 和 Path=/，禁用框架的 session header 读取。每个 state 有独立的五分钟上下文 cookie，回调后清除；文档会话 cookie 只保存最小账号 / 组织 ID 和过期时间，userinfo 不返回 name、email、phone 或 token。SSO access / refresh token 不写入 cookie，在回调获取身份后丢弃；文档会话最多两小时且不超过本次 access token 有效期，过期后重新发起 SSO 授权。

`authenticated` 表示本服务仍有效的文档会话，不代表实时查询到 SSO 或 Console 的其他会话。SSO 全局退出不会即时清除此文档会话；需要统一退出 / 即时撤销时，另按接入指南的 loginId / AdminAPI 契约扩展。Console 会通过 SSO 建立自己的会话，需要真实联合验证，文档 cookie 不转交给 Console。

回调验证 state 与对应的加密 cookie，code 的一次性消费由 SSO 执行，不使用进程内锁。已清除上下文的浏览器重复 callback 会失败；并发或携带旧上下文的重放由 SSO 拒绝重复 code。SSO 拒绝授权或上游失败不建立新会话，不向浏览器暴露上游响应或凭据。换 code 后若身份查询失败，需要重新发起登录；不承诺丢失回调响应后的事务恢复。

退出清除当前浏览器 cookie。此方案没有服务端撤销表，复制的旧会话 cookie 在有效期内仍可使用；不提供统一撤销、跨设备退出或持久事件补发。若后续需求需要这些能力，应先确认现有平台能提供什么，而不是自行增加基础设施。

## 下载引导接入边界

login 接受 `flow_id`（UUID）、`target`、`resource_type`（`sdk` / `demo` / `account`）、`resource_id`、`source_path`、`platform`、`version`、`anonymous_id`。SDK / Demo 流程必须提供 flow、resource 和中文 source path；只接受明确参数，拒绝重复参数和任意 redirect URI。普通账号入口可省略流程，由服务生成 flow ID。

当前目标白名单只有：

| target | 中文 Console 路径 | 文档来源 |
| --- | --- | --- |
| `rtm` | `/product/RTM2?tab=config` | `content/docs/zh-CN/realtime-media/rtm/reference/release-notes.mdx` |
| `conversational-ai` | `/product/ConversationAI?tab=Playground` | `content/docs/zh-CN/ai/index.mdx` |
| `home` | `/` | 明确标为 fallback，不计为对应服务转化 |

其他 SDK / Demo 产品要补充真实映射与验证，不能以 home 代替所有已知产品。

当前首个前端切片为 `/zh-CN/reference/sdks` 的实时消息 RTM 直接下载。保留原生下载链接，不等待 userinfo、SSO 或 PostHog；原页随后显示配置引导弹窗，登录入口在新标签页继续。有效文档会话抑制引导；初次查询、过期或未知状态不延迟下载，返回原页的 focus / visibility 会重新查询同源 userinfo。每个标签页 session 最多一次实际曝光，只有 dialog 在可见原页显示才记入；存储不可用时使用内存兜底。用户继续下载其他平台不会改写已经冻结的 flow、资源、平台或版本。

弹窗展示触发下载时冻结的 SDK 平台与版本，并说明下一步是登录控制台，获取 App ID 并开通 RTM 服务。初始焦点落在右侧主操作“登录并前往控制台”，点击后在新标签页继续原流程；左侧“稍后再说”关闭引导。右上角关闭、点击遮罩与 Esc 关闭已禁用。两种选择都不影响原生 SDK 下载。

这一切片尚未覆盖 Demo、其他产品 / SDK 嵌入页、导航栏账号状态与退出 UI，以及认证错误后的友好恢复交互。浏览器前端与认证 API 必须在同一公开 origin 联调；staging 用来验证网关、Secure Cookie、正式回调与配置，不是本地实现前端的前置条件。当前未发布。

## 可信事件与验证

事件在回调请求内直接发送给 PostHog，每条最多尝试三次、每次超时两秒，重试复用同一个 UUID。发送失败不阻止认证成功，输出不含凭据的失败日志；不创建后台队列，也不保证进程终止或接收端持续不可用后的补发。原文档页关闭不影响已到达后端的回调事件；这不等于具备持久投递保证。`accountUid` 为文档服务 person ID，`companyId` 单独作为组织和 `cid` group；仍需核对中文 Console 的实际 identity / PostHog 项目，不能据此声称已经对齐。

2026-10-09 用户确认一个账号可以对应多个 cid，撤回将 cid 作为唯一身份的建议。账号识别始终采用可信 SSO 返回的 `accountUid`，公司切换不拆分账号，同一公司中的不同账号不合并。`companyId` 是本次授权时的企业上下文快照；可以由可信上游确定，但不能替代稳定账号标识或证明 Console 当前选择的企业。只写入每次事件的企业属性 / group，不用它覆盖账号身份。文档会话有效期内 Console 切换企业不会自动刷新此快照。

SSO 字段 `accountUid` 与 Console 字段 `accountId` 的转换仍需通过接口契约核实，不能仅凭字段名称或 cid 相同认定相等。跨系统关联应保留账号、cid 和 flow 三种不同维度。

- `docs_account_auth_succeeded`：成功换 token 并读到可信身份，包含冻结的 flow 和目标；SSO 未返回登录 / 注册 / 会话复用分类，所以 `auth_type=unknown`。
- `docs_console_redirected`：服务发出了 Console 跳转，**不代表实际到达或完成开通**。
- `$identify`：在浏览器提供有效匿名 ID 时关联此匿名身份与可信账号；需与浏览器配置同一个 PostHog 项目。
- `docs_account_auth_failed`：有效上下文发生授权、token、userinfo 或会话写入失败，保留资源 / 平台 / 版本并记录失败阶段及受控 reason，不包含上游原始错误。
- `docs_resource_action_started`：原生 RTM SDK 下载动作被触发，不代表文件下载完成。
- `docs_account_guidance_shown`：可见原页内的实际 dialog 曝光。
- `docs_account_guidance_dismissed`：选择“稍后再说”跳过；右上角关闭、点击遮罩和 Esc 关闭已禁用。选择登录后的自动关闭不算跳过。
- `docs_account_login_clicked`：选择单独的登录入口，不代表认证成功。

前端只用仍有效的可信 userinfo 识别账号；未知 / 过期状态触发业务事件时先清除残留的 PostHog 已识别身份，避免把事件归给上一账号。最终出站 `before_send` 对这些业务事件和浏览器 `$identify` 使用批准字段白名单，去掉 SDK 默认附加的 URL、query、hash、referrer 和 person 初始归因属性；保留 SDK 传输必需的公开项目 `token` 和匿名关联标识。这与仅保留在服务端的 SSO token / secret 是不同字段。

实际 `console_landed` 应由 Console 产生并与 flow 联结；原文档页关闭不影响服务端认证事件。服务端事件不会补造 dialog 展示、用户点击下载或注册成功。

```sh
# 使用实际框架会话 API；SSO / PostHog 是契约替身
bun run test src/lib/auth/auth-api.server.test.ts

# 构建后真实 HTTP 服务与 cookie，SSO / PostHog 是本地契约替身
bun run build:service
node --experimental-strip-types scripts/auth/verify-auth-service.ts
```

上述脚本不会访问真实 SSO、Console 或 PostHog。2026-10-09 已另用已注册的 `docs` client 完成 localhost 真实联合验证，记录见 [联调证据](./agents/reports/2026-10-09-cn-account-service-real-verification.md)。上线环境仍需配置精确回调与网关，并验证完整前端流程。
