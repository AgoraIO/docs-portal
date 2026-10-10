# 中文 RTM 下载引导 rebase 验证

2026-10-10，将四个账号服务与下载引导提交重放到 `36323db8226b388a880a1bf0cddbee86b92535af`（目标分支 `codex/cn-newdoc-html-api-migration`，已包含 #1156）。使用独立分支 `codex/cn-rtm-account-guidance`，没有重放已 squash 合入的搜索历史。

目标分支将中文 SDK 下载入口移到了 `SdkDownloadCard`。保留新卡片，给实际原生下载链接增加通用回调，在产品层冻结 RTM 资源、平台和版本后触发引导。没有取消原生导航，也没有等待账号查询或事件发送。新增 RTC 直接下载及 RTM 包管理器链接的排除回归；更新旧下载按钮选择器。

## 验证结果

| 检查 | 结果 |
| --- | --- |
| 账号引导、下载目录、认证 API、浏览器埋点、搜索 API 定向测试 | 86 / 86 通过 |
| `bun run types:check` | 通过 |
| `bun run build:service` | 通过，包含认证、userinfo、退出、搜索与健康路由 |
| `node --experimental-strip-types scripts/auth/verify-auth-service.ts` | 通过：真实构建产物的 HTTP、加密 Cookie、SSO 与 PostHog 本地契约替身 |
| 修改的源码文件 Biome 检查 | 17 个文件通过 |
| `git diff --check` | 通过 |

HTTP 验证包括匿名 userinfo、授权回调与一次性 code、可信 accountUid / companyId、RTM Console 跳转、共享 flow 的三个服务端事件，以及退出后 userinfo 返回 401。这次未访问真实 SSO、Console 或 PostHog；此前真实联调事实见 [2026-10-09 记录](./2026-10-09-cn-account-service-real-verification.md)。

在目标提交的独立 checkout 中使用相同依赖运行基线，逐项比较 JSON 测试结果：

| 全仓检查 | 目标基线 | 本分支 |
| --- | --- | --- |
| Vitest 通过 | 2691 | 2713 |
| Vitest 失败 | 35 | 35 |
| Vitest 跳过 | 2 | 2 |
| Biome 错误 / 警告 / 提示 | 34 / 22 / 5 | 34 / 22 / 5 |

失败测试的文件与完整名称集合完全一致，没有新增失败。全仓检查仍未全绿，不能将定向验证表述为全仓通过。

Chrome 在中文部署模式下确认了新卡片点击后出现引导，平台 / 版本正确，主操作在新标签页登录，原页保留下载目录；桌面与移动布局截图作为 PR 证据保存。规范与需求两轴审查未发现本切片的合并阻塞。

本次只整合代码，没有部署或修改 Jenkins。公开环境仍需同源 `/api/*` 网关、已注册回调和私有运行配置。Console 实际落地事件、跨系统账号映射、其他资源入口与错误恢复仍是 [账号服务说明](../../account-service.md) 中列出的后续工作。
