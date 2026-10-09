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

从中文 Console 实际 `/decide/` 请求读取的 PostHog distinct_id 等于 companyId，不等于 accountUid 或 Console user.id / accountId。Console 使用 `ph.agora.io` 和另一 ingestion key；不能将其与 Docs Portal(CN) 项目当成同一个数据集。当前 Console 的 person 表达组织，会合并同组织不同成员；文档采用 accountUid 作为 person、companyId 作为 cid group，暂时只能按组织核对，不能声明跨系统 person 已对齐。需在 Console 侧确认、修正人员身份并提供 flow 联结契约。

浏览器已证明本次实际到达 RTM 页面，但服务器的 `docs_console_redirected` 只证明发出跳转。Console 尚未产生带文档 flow_id 的落地事件，因此可查询漏斗仍未完整闭环。下载非阻断 dialog、展示 / 跳过埋点、匿名关联、跨标签会话更新及其他资源目标映射尚待接入。

初次 raw API 服务端事件被 PostHog 按请求来源补充 GeoIP，不能作为用户位置。发送端现补充 `$geoip_disable=true` 与 `$is_server=true`，沿用 [PostHog 对服务端 GeoIP 的建议](https://posthog.com/docs/libraries/node#geoip-properties)。修改后再次完成真实认证，flow `ec80bf91-2475-4c84-b1c0-10a8d6f28f58` 的实际接收事件显示 GeoIP disabled=true，回归验证亦覆盖该属性。

本地 Chrome 直接导航到部分 JSON 响应时出现 `ERR_BLOCKED_BY_CLIENT`；同源页面 fetch userinfo 正常，合法 OAuth 302 也正常。本次未更改浏览器安全设置。状态验证临时页面不进入提交。
