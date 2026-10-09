# 中文资源账号引导：现有认证与身份接入调查

调查日期：2026-10-09。范围：中文文档到中文 SSO / `console.shengwang.cn`；英文不在首期范围。本文记录可核实事实及缺失契约，不代表完整功能已实现或真实账号联调已通过。

## 结论

**已有中文文档登录代码可以作为接入线索，但不能直接证明下载引导到 Console 的闭环成立。** 旧站登录依赖同源 `/api/userinfo` 与 `/api/oauth`，不是单靠打开短信登录页；旧站把 `companyId` 用作 PostHog person ID，也不能直接照搬成此次账号身份口径。

2026-10-09 补充：用户建议在 `codex/cn-bailian-demo` 的 API service 中重新实现文档认证接入。该分支已经支持文档与 API 同仓库、分别部署；现有 service 的本地构建与健康检查通过。因此不再以找到旧站认证网关代码为前置依赖，下一项应核实中文 SSO 上游契约与 Console 会话 / 归因，然后在本仓库实现回调、会话与 userinfo。

本次读取第一方仓库源码及用户提供的浏览器内 SSO 接入文档；没有执行登录、注册、导出用户 cookie / 凭据、调用受认证 Console 接口或修改外部系统。**尚未验证当前生产响应、cookie 属性、SSO 注册结果、Console 身份或埋点接收端。**

## 来源与固定版本

- 中文旧站：`AgoraIO/shengwang-doc-source`，`master` 在调查时为 `ebe508362d57fe179a9daeaa46b230d887d8ade1`。已阅读其 [AGENTS.md](https://github.com/AgoraIO/shengwang-doc-source/blob/ebe508362d57fe179a9daeaa46b230d887d8ade1/AGENTS.md)，只做源码调查。
- 当前文档站：`AgoraIO/docs-portal`，本地 `HEAD` 为 `1c20dbc61cf64363b0da51d56195ef03f32ce0da`；下面引用与当前读取内容一致的固定版本。
- 海外参考：本地 `AgoraIO/ng-console`，`HEAD` 为 `5d378d4b0435ea0edf920ca2fa99535fd1e0bc62`。它仅说明已有的海外实现，**不是中文 Console 的身份契约证据**。

## 1. 正式旧站入口与普通登录页是两种路径

旧站常量定义生产文档 origin 为 `https://doc.shengwang.cn`，内部站为 `https://doc-internal.shengwang.cn`；普通 SSO 入口常量是 `https://sso.shengwang.cn/cn/v5/login/with-sms`。[常量来源](https://github.com/AgoraIO/shengwang-doc-source/blob/ebe508362d57fe179a9daeaa46b230d887d8ade1/data/constant.ts#L7-L20)

`NavLogin` 在生产文档站和内部站使用 OAuth 授权入口，参数为：

| 参数 | 旧站源码行为 |
| --- | --- |
| 生产 authorize | `https://sso.shengwang.cn/api/v0/oauth/authorize` |
| 内部站 authorize | `https://staging-sso.agora.io/api/v0/oauth/authorize` |
| `response_type` | `code` |
| `client_id` | `docs` |
| `scope` | `basic_info` |
| `redirect_uri` | 当前文档 origin 加 `/api/oauth` |
| `state` | 当前完整 `location.href` |

这个 builder 使用字符串拼接；源码不包含资源目标、`flow_id`、匿名 PostHog ID 或一次性归因记录。登录按钮在上述两个 origin 上直接改变当前页面 `location.href`；其他 origin 则 `window.open` 普通短信登录入口。[builder 与登录分支](https://github.com/AgoraIO/shengwang-doc-source/blob/ebe508362d57fe179a9daeaa46b230d887d8ade1/src/components/login/NavLogin.tsx#L59-L81) AI 搜索入口重复使用同一 OAuth builder，进一步确认这是旧站现有模式。[搜索入口](https://github.com/AgoraIO/shengwang-doc-source/blob/ebe508362d57fe179a9daeaa46b230d887d8ade1/src/components/search/GlobalSearch.tsx#L605-L632)

**适用边界：** 这些是前端源码所发出的请求；不能据此声称 `state` 已有 CSRF 校验、任意新 origin 可以使用 `client_id=docs`、SSO 会接受任意 Console URL 或 flow 字段、注册与认证完成已有可信通知。上述行为需要接入方确认及运行时验证。

## 2. 已登录状态依赖旧站同源认证网关

`NavLogin` 只在生产文档站 / 内部站挂载时查询状态。它调用 `axios.request({url: '/api/userinfo'})`，以 `res.data.name` 是否存在判断成功，并保存整个返回对象。代码没有为此请求设置跨域 `withCredentials`、cookie 名称 / domain / SameSite，也没有区分未登录与网络失败；失败都返回 `false`。[请求与状态判断](https://github.com/AgoraIO/shengwang-doc-source/blob/ebe508362d57fe179a9daeaa46b230d887d8ade1/src/components/login/NavLogin.tsx#L14-L56)

第一次状态查询失败后，代码在隐藏 iframe 打开上述 OAuth 登录 URL，5 秒后将 iframe 导航到 `about:blank` 并再次查询 `/api/userinfo`。**源码是在尝试同步现有 SSO 会话，不能证明所有浏览器都允许这一 iframe / cookie 路径。** 它也没有 visibility / focus / 跨标签登录完成后的持续刷新逻辑。[会话同步尝试](https://github.com/AgoraIO/shengwang-doc-source/blob/ebe508362d57fe179a9daeaa46b230d887d8ade1/src/components/login/NavLogin.tsx#L14-L39)

登出则调用同源 `/api/logout?currentUri=<location.href>`，收到 `redirectUri` 后 reset PostHog 并导航。[登出实现](https://github.com/AgoraIO/shengwang-doc-source/blob/ebe508362d57fe179a9daeaa46b230d887d8ade1/src/components/login/NavLogin.tsx#L83-L93)

**目前没有取得网关的服务端实现或部署归属。** 对该固定版本的递归文件树及 `userinfo`、`/api/oauth` 代码搜索，找到的是前端消费者；生产 Nginx 配置展示的是静态 OSS/CDN 内容代理，未列出认证 handler。因此可以确认旧前端依赖这些 endpoint，不能确认 endpoint 实际由哪个网关 / 服务处理、回调如何换取会话及重定向。[固定版本部署配置](https://github.com/AgoraIO/shengwang-doc-source/blob/ebe508362d57fe179a9daeaa46b230d887d8ade1/deploy/prod/docs.nginx.conf#L18-L64)、[固定版本文件树](https://github.com/AgoraIO/shengwang-doc-source/tree/ebe508362d57fe179a9daeaa46b230d887d8ade1)

调查范围具体包括递归树中的 `src/`、`deploy/`、`doc-cms/`、候选 `server/` / `api/` 目录，以及仓库代码搜索 `userinfo`、`/api/oauth`、`posthog`。读取了 `deploy/docs.nginx.conf`、`deploy/prod/docs.nginx.conf`、`deploy/README.md`、`deploy/Dockerfile`；树中的 `doc-cms/` 仅列出 `docker-compose.yml`，未读取其中可能包含的环境配置。以上搜索范围不覆盖未提供的独立认证服务仓库。

当前 portal 的文档页面保留静态部署决策，但同一固定版本已经引入独立 Node API service，不能仅凭页面部署 ADR 推断仓库不能实现认证后端。`docs/search-service.md` 明确同域 `/api/*` 转发给 service，登录可后续扩展；`router.service.ts` 独立选择 API 路由，Vite service target 使用 Nitro `node-server`，不打包文档页面、不预渲染。[服务说明](https://github.com/AgoraIO/docs-portal/blob/1c20dbc61cf64363b0da51d56195ef03f32ce0da/docs/search-service.md#L1-L20)、[路由入口](https://github.com/AgoraIO/docs-portal/blob/1c20dbc61cf64363b0da51d56195ef03f32ce0da/src/router.service.ts#L1-L22)、[service 配置](https://github.com/AgoraIO/docs-portal/blob/1c20dbc61cf64363b0da51d56195ef03f32ce0da/vite.config.ts#L78-L113)

本地执行 `VITE_DOCS_REGION=cn bun run build:service` 成功，独立启动 `.output/server/index.mjs` 后 `GET /api/health` 返回 200；未配置搜索环境时 `GET /api/search?q=Token` 返回 503。测试服务已停止。该记录证明现有 API service 可构建运行；后续认证接口的本地验证与实际接入边界见 [账号服务说明](../../account-service.md)。

补充第一方线索：`AgoraIO/cli` 固定版本 `d4170521bdee6a4ae70da5adb1c60ecb4503d8ed` 的中文 OAuth 使用 `https://sso.shengwang.cn`，authorize 与 token 路径为 `/api/v0/oauth/authorize` 和 `/api/v0/oauth/token`。CLI 使用自己的 `agora_web_cli` client、PKCE S256、form-urlencoded authorization_code 换取 token；这不能证明 `docs` client 使用同样的认证方式或 scope，也没有提供文档所需的可信账号信息接口。[CN host 与 client](https://github.com/AgoraIO/cli/blob/d4170521bdee6a4ae70da5adb1c60ecb4503d8ed/internal/cli/auth.go#L25-L32)、[授权请求](https://github.com/AgoraIO/cli/blob/d4170521bdee6a4ae70da5adb1c60ecb4503d8ed/internal/cli/auth.go#L62-L73)、[token 请求](https://github.com/AgoraIO/cli/blob/d4170521bdee6a4ae70da5adb1c60ecb4503d8ed/internal/cli/auth.go#L508-L547)

## 3. 身份字段已经存在分歧

旧站 `UserInfo` 类型列出 `name`、`email`、`phone` 和 `accountUid`；它没有声明 `companyId`。但 `NavLogin` 实际调用 `posthog.identify(res.data.companyId, {name: res.data.companyId})`。这证明**类型中的账号字段和实际 person 识别字段不一致**，不证明生产 `/api/userinfo` 返回了哪些字段。[类型](https://github.com/AgoraIO/shengwang-doc-source/blob/ebe508362d57fe179a9daeaa46b230d887d8ade1/src/contexts/UserInfoContext.tsx#L3-L8)、[实际 identify](https://github.com/AgoraIO/shengwang-doc-source/blob/ebe508362d57fe179a9daeaa46b230d887d8ade1/src/components/login/NavLogin.tsx#L41-L51)

作为海外参考，ng-console 的 `identify` 使用 `accountUid ?? userId` 识别人，`cid` 另做组织 group。这不能用来宣称中文 Console 已采用相同规则，但说明不应仅因字段名字近似就将公司 ID 与用户 ID 替换使用。[海外实现](https://github.com/AgoraIO/ng-console/blob/5d378d4b0435ea0edf920ca2fa99535fd1e0bc62/src/lib/observability/facade.ts#L208-L225)

需从中文 SSO / Console 获得脱敏的字段契约：规范 person ID、企业 ID、用户与成员关系、旧 `companyId` 含义、是否有 ID 转换、文档匿名身份如何与账号关联。新功能无需复制旧站返回的联系方式，也不能照搬将整个 `userInfo` 发送到事件的做法；旧 AI 搜索事件确实发送整个 `userInfo`，此次实现应明确批准字段。[旧搜索事件](https://github.com/AgoraIO/shengwang-doc-source/blob/ebe508362d57fe179a9daeaa46b230d887d8ade1/src/components/search/GlobalSearch.tsx#L616-L620)

## 4. 有埋点基础，没有此次闭环的接收和关联契约

旧站只在 `SITE_ENV=prod` 注入 PostHog，配置 host 为 `https://us.i.posthog.com`、`person_profiles: 'identified_only'`；源码内有公共 ingestion key，本文不复制其值。SPA 路由变化发送 `$pageview`。[旧初始化](https://github.com/AgoraIO/shengwang-doc-source/blob/ebe508362d57fe179a9daeaa46b230d887d8ade1/docusaurus.config.js#L132-L142)、[旧 pageview](https://github.com/AgoraIO/shengwang-doc-source/blob/ebe508362d57fe179a9daeaa46b230d887d8ade1/src/theme/Root.tsx#L32-L39)

当前 portal 通过 `VITE_POSTHOG_KEY` 开启 PostHog，host 可由 `VITE_POSTHOG_HOST` 指定，否则也是 US host；启用 autocapture、history-change pageview，使用 `localStorage+cookie`，关闭 session recording。现有自定义业务函数只上报文档反馈；该模块没有此次流程的事件字典、身份识别或跨系统上下文恢复。[当前 portal 模块](https://github.com/AgoraIO/docs-portal/blob/1c20dbc61cf64363b0da51d56195ef03f32ce0da/src/lib/analytics/posthog.ts#L13-L67)

相同 ingestion host 不足以确认相同项目。当前 portal 的部署 key 对应哪个项目、中文 Console 是否使用 PostHog及哪个项目、认证成功由谁上报、匿名 ID 是否跨域共享或显式联结，均尚未确认。不能以自动 pageview / autocapture 代替 `flow_id` 关联的认证完成与实际服务落地证据。

## 5. 下一步需要落实的接入产物

| 产物 | 已有线索 | 仍需交付的精确内容 |
| --- | --- | --- |
| 自建认证接入 | 现有 API service；旧站 `client_id=docs` 与同域接口；CLI 的中文 token 路径 | `docs` client 的 token 认证方式及可信账号信息接口；CN portal 正式 / 测试 origin；callback allowlist；可用测试 endpoint |
| 登录状态契约 | 旧站以 `/api/userinfo` 的 `name` 判定 | 文档可用状态 endpoint、凭据机制、最小字段、未登录 / 未知 / 失败语义、跨标签更新策略 |
| 认证与归因回调 | OAuth code 回到旧文档 `/api/oauth`，`state=location.href` | 谁保存和恢复 `flow_id` 与资源目标；允许字段 / 编码 / 有效期；原页关闭后仍可完成；去重；可信登录 / 注册 / 会话复用结果 |
| 中文 person 身份 | 旧类型 `accountUid`；实际 identify `companyId` | 中文 Console 规范用户 ID 和组织 ID；SSO 返回字段的转换；匿名到 person 的关联责任方 |
| 接收与漏斗查询 | 两个文档站均有 PostHog 基础 | CN portal / SSO / Console 的项目与环境标识（无需暴露密钥）；每个阶段的上报方；flow 查询或联结查询；实际落地 / 准备 / 兜底分类 |

建议先用 **一条确定 SDK 资源 → 可跳过引导 → 真实 CN 认证 → 指定 Console 落点 → 同一 flow 查询** 建立最小完整切片。补齐以上契约才能写出可执行的跨系统验收；只实现 dialog、跳转或客户端模拟回调，不能认定闭环完成。

## 调查限制

源码事实与运行时事实分别记录：本文核实了第一方源码和接入文档，生产 / 非生产账号、cookie、回调、Console 页面访问和 PostHog 查询尚未做联合测试；服务映射由另一份需求产物处理。未找到服务端实现只代表本次仓库范围中的调查结果，不证明不存在外部网关。

## 6. 用户提供的 SSO 接入指南核实

通过用户 Chrome 读取 [SSO OAuth 授权接入指南](https://confluence.agoralab.co/pages/viewpage.action?pageId=1485177164)（2026-08-05 更新，2026-10-09 读取）及其链接的 [中文 customer API](https://sso-open.shengwang.cn/api-docs/v1/customer)，未执行 Swagger 请求。

- WebServer / confidential client 必须使用 client secret，当前不支持 PKCE；CLI / native public client 的 S256 / loopback 规则不能套用。回调 URI 必须与注册值完全一致。
- authorize 为 `/api/v0/oauth/authorize`；token 为 `/api/v0/oauth/token`，以 form-urlencoded 传入 grant_type、client_id、client_secret、code、redirect_uri。scope `basic_info` 覆盖账号 / 项目基本资料。
- Bearer token 调用 `/api/v0/customer/company/basic-info`，直接返回 accountUid、companyId、userId 等字段；文档会话只采用最小 accountUid / companyId，不返回联系方式或 token。`user-auth` 的 userUid 示例是邮箱，不能据此作为 person ID。
- 文档没有给出可信的登录 / 注册 / SSO 会话复用分类，认证事件先使用 unknown；也没有证明中文 Console 的 PostHog identity 与文档已经对齐。
- 生产 SSO 为 `https://sso.shengwang.cn`，资源为 `https://sso-open.shengwang.cn`；staging 分别为 `https://sso-staging.shengwang.cn` 和指南所列 `http://sso-open.staging.shengwang.cn`。

用户明确要求不引入 Redis 或其他技术栈。实现复用当前 TanStack Start 的加密 cookie 会话，不新增依赖或存储组件；不会将无存储方案描述为具备持久事件补发或统一会话撤销。client key / secret 由用户申请，不阻断本地契约实现；真实 SSO / Console / PostHog 接收验证仍须明确区分。
