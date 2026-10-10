# 中文账号服务真实联合验证

2026-10-09，使用用户授权的测试账号与已注册的 confidential client `docs`，通过 Chrome 验证本地文档账号服务、生产中文 SSO、中文 Console 和 Docs Portal(CN) PostHog 项目。凭据仅保存在忽略的本地环境文件；本文不记录密码、secret、token、授权码或真实账号标识。

## 已验证事实

- 注册的 `http://localhost:3000/api/oauth` 可完成真实授权与服务端 token / basic-info 交换。
- 真实回调除了 code / state，还带有 32 位十六进制 `loginId`。服务已兼容该字段，不将其用于 person 识别或转交给 token 接口；回归测试与真实 HTTP 契约替身覆盖此行为。
- 同源浏览器请求 `/api/userinfo` 返回 HTTP 200 / `authenticated`，只包含 accountUid、companyId 和 expiresAt。
- `target=rtm` 实际进入 `https://console.shengwang.cn/product/RTM2?tab=config`。页面显示 RTM 功能配置及已启用状态；`/api/v2/check-login` 和 `/api/v2/layout` 返回 200。验证过程未修改项目或服务配置。
- Console 身份接口与文档 userinfo 的 companyId 相同。Console layout 的 user.id / user.accountId 均不等于 SSO accountUid。
- Chrome 的 Docs Portal(CN) PostHog 项目 ID 为 **509917**，ingestion host 为 `https://us.i.posthog.com`。实际 Activity 列表收到 `docs_account_auth_succeeded` 与 `docs_console_redirected`，两者使用相同账号 person ID。认证事件保留 flow_id、resource_type=sdk、resource_id=signaling、source_path=/zh-CN/reference/sdks、platform=web、console_target=rtm、target_kind=service 和实际 target_url。浏览器和服务端本地配置指向同一项目。
- 真实验证 flow 为 `59015af0-39b0-4083-9205-a64e5ec3e523`。这次流程没有浏览器匿名 ID，因此没有验证 `$identify` 合并。

## 身份与闭环边界

从中文 Console 实际 `/decide/` 请求读取的 PostHog distinct_id 等于 companyId，不等于 accountUid 或 Console user.id / accountId。Console 使用 `ph.agora.io` 和另一 ingestion key；不能将其与 Docs Portal(CN) 项目当成同一个数据集。当前 Console 的 person 表达组织；文档采用 accountUid 作为 person、companyId 作为 cid group，暂时只能按组织核对，不能声明跨系统账号身份已对齐。需在 Console 侧确认可联结的账号标识及其与 SSO accountUid 的转换，并提供 flow 联结契约。

用户随后核实并确认一个账号可以对应多个 cid，撤回“都按 cid”的建议。本次没有将运行代码改为 cid person。账号与企业上下文继续分开：跨企业仍是同一账号，同一企业内不同账号仍分别识别；companyId 仅表示授权时的上下文，不能充当稳定账号标识。新增契约回归覆盖账号 A 的 cid 456 → 789，以及 cid 789 下账号 A → B；该回归是上游替身，未验证真实 Console 的账号切换行为。

浏览器已证明本次实际到达 RTM 页面，但服务器的 `docs_console_redirected` 只证明发出跳转。Console 尚未接收文档 flow_id 并产生实际落地事件，因此可查询漏斗仍未完整闭环。其他资源映射和完整跨系统账号关联仍待完成。

初次 raw API 服务端事件被 PostHog 按请求来源补充 GeoIP，不能作为用户位置。发送端现补充 `$geoip_disable=true` 与 `$is_server=true`，沿用 [PostHog 对服务端 GeoIP 的建议](https://posthog.com/docs/libraries/node#geoip-properties)。修改后再次完成真实认证，flow `ec80bf91-2475-4c84-b1c0-10a8d6f28f58` 的实际接收事件显示 GeoIP disabled=true，回归验证亦覆盖该属性。

本地 Chrome 直接导航到部分 JSON 响应时出现 `ERR_BLOCKED_BY_CLIENT`；同源页面 fetch userinfo 正常，合法 OAuth 302 也正常。本次未更改浏览器安全设置。状态验证临时页面不进入提交。

## 首个 RTM SDK 前端切片

同日补充 `/zh-CN/reference/sdks` RTM Android 2.3.0 直接下载验证：保留官方原生 ZIP 链接，点击后原页出现可跳过 dialog，登录按钮在新标签页经过真实 SSO 到达 RTM 功能配置；原页保持 SDK 下载页面，userinfo 返回 authenticated。本文只证明资源动作触发，没有用浏览器完成文件下载作为验收终点。

项目 509917 Activity 的真实 EventsQuery 响应中，最终复验 flow `951975e6-8837-4fdd-aa9a-da955948d5f4` 同时包含下列记录：

| 事件 | 事实与身份 |
| --- | --- |
| `docs_resource_action_started` | 浏览器匿名身份触发 RTM Android 下载 |
| `docs_account_guidance_shown` | 可见原页实际展示引导 |
| `docs_account_login_clicked` | 选择登录新标签页 |
| `$identify` | 服务端账号身份 + 对应浏览器 `$anon_distinct_id` |
| `docs_account_auth_succeeded` | 真实 SSO / basic-info 成功，可信 accountUid |
| `docs_console_redirected` | 后端发出 RTM 功能配置跳转 |

各业务事件共享同一 flow、resource=signaling、platform=android、version=2.3.0-rtm-sdk-android。最终真实接收的前端事件没有 `$current_url` 或 `$referrer`，匿名关联事件也正常收到。已验证真实匿名关联事件接收；尚未据此证明 PostHog person 历史合并或 Console 项目身份已经对齐。可按 `properties.flow_id` 查询这些事件并逐阶段核对，不把 `docs_console_redirected` 当作落地事件。

前端回归覆盖查询 pending 时原生链接不被取消、隐藏原页不假曝光、重复下载不漂移上下文、一次跳过、登录自动关闭、focus 后可信会话更新、首帧前点击、英文 / 其他嵌入路径排除。analytics 回归覆盖同账号跨 cid、不同账号共享 cid、旧身份清除及 SDK 最终出站字段过滤。全套测试仍有原基线的 35 个失败，失败集合逐项一致，没有新增失败；类型检查和定向测试通过。

尚需继续实现 Demo / 全产品映射、导航栏账号 UI、认证错误恢复，并在 Console 接收 flow 与提供实际落地事件、核实 SSO accountUid ↔ Console accountId 契约。staging 上线后验证实际公开域名的同源代理、回调和 Cookie；这些不阻止当前本地切片开发。没有修改 Jenkins 或执行部署。
