# API Reference 历史归档外链验证（2026-10-20）

## 当前状态：13 项已验证覆盖已应用

- 已按用户批准的 [URL 覆盖清单](./api-reference-archive-url-overrides-20261020.json)，以 `newPlatform + sdkVersion` 精确替换 11 份平台元数据中的 13 个 `href`。版本标签、ID、path、current、219 个历史选项和 214 个去重 URL 均未改变；React 两系列仍不处理。
- 应用后于 2026-10-20 16:10（Asia/Shanghai）重新 GET 全部 214 个当前菜单 URL：214/214 返回 HTTP 200、零重定向、未检测到 404 或网络错误。完整结果见 [覆盖后请求结果](./api-reference-historical-archive-url-check-after-overrides-20261020.json)。
- 13 个替代入口的同平台、同 SDK 版本证据来自用户提供的 [调查与浏览器复核记录](./api-reference-archive-404-investigation-20261020.md)，复核时间为 16:06；RTC Web 两项另有精确正文标题证据。未将其他 201 个页面的 HTTP 可达性表述为内容版本全部核验。
- 原始 master 映射和首轮 13 个软 404 的结果继续保留用于追溯，不是当前菜单的目标地址。下文首轮记录不代表仍存在 13 个未修复入口。

### 覆盖修复回归验证

- 聚焦清单/覆盖测试：61 项通过；先确认原配置产生 24 个预期失败，再只修改 13 个 href 后通过。
- `bun run test --maxWorkers=4`：236 个测试文件通过，3142 项通过、2 项跳过。
- 首次默认并发的完整测试有两项既有 Markdown/链接集成测试超时（非断言失败）；没有修改无关测试或提高超时阈值。降低并发后，两份相关文件 130 项全部通过，随后完整 4-worker 测试全部通过。
- `bun run types:check`、改动测试文件的 Biome、`git diff --check` 均通过；独立只读审核通过。
- 后台 zh-CN 预览实际检查 RTC Web 菜单：v4.24.1 使用 `0.0.405`，v4.23.0 使用 `0.0.234`，均仍为安全新标签页链接；GET 返回的两项页面标题也精确匹配批准清单。
- 没有运行生产构建，也没有将 201 个未逐页检查的版本宣称为内容已全部核验。

## 首轮检查范围与方法（修复前记录）

- 按已确认方案排除 RTC React 两个版本系列，对 43 个平台的 219 个历史选项、214 个去重 URL 发起实际 GET 请求，跟随重定向，10 路并发，每个请求超时 12 秒。
- 固定地址依据 `api-reference-historical-archive-inventory-20261020.md`；原清单仅基于源码推导，本报告补充线上可达性检查。
- 201 个不同 URL 返回 HTTP 200 且未跳到 404；13 个不同 URL 跳到 `https://doc.shengwang.cn/404`，尽管最终 HTTP 状态也为 200。不能单凭状态码判断入口有效。
- 本轮没有超时或连接错误。结果是本次检查时的状态，不保证未来可达性。
- HTTP 可达不等于 SDK 内容版本已逐页核验；未声称 201 个页面的内容版本全部匹配。
- 首次接入保留了失效项原地址，未猜测归档编号、替换版本或静默删除选项。以下 13 项现已按后续验证的覆盖清单修复；表格仅保留源地址的失效证据。

## 首轮跳到旧站 404 的源入口（现已覆盖）

| 新站平台 | SDK 版本 | 清单归档入口 |
| --- | --- | --- |
| `conversational-ai/ios` | v1.7.0 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0454/api-ref/convoai/ios/ios-component/overview) |
| `conversational-ai/android` | v1.7.0 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0454/api-ref/convoai/android/android-component/overview) |
| `conversational-ai/web` | v1.7.0 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.454/api-ref/convoai/typescript/web-component/overview) |
| `rtc/web` | v4.24.1 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.379/api-ref/rtc/javascript/overview) |
| `rtc/web` | v4.23.0 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.345/api-ref/rtc/javascript/overview) |
| `rtc/mini-program` | v2.6.0 | [归档入口](https://doc-archive.shengwang.cn/archive/v0.0.166/api-ref/rtc/mini-program/overview) |
| `rtc/harmonyos` | v4.4.1 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.216/api-ref/rtc/harmonyos/API/rtc_api_overview) |
| `rtm/flutter` | v2.2.1 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.202/api-ref/rtm2/flutter/toc-configuration/configuration) |
| `whiteboard/whiteboard-sdk/android` | v2.16.81 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.136/api-ref/whiteboard/android/overview) |
| `whiteboard/whiteboard-sdk/ios` | v2.16.88 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.136/api-ref/whiteboard/ios/docs/headers/Agora-Interactive-Whiteboard-Objective-C-Overview) |
| `whiteboard/whiteboard-sdk/web` | v2.16.49 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.125/api-ref/whiteboard/javascript/overview) |
| `rtc-server-sdk/cpp` | v4.4.30 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.289/api-ref/rtc-server-sdk/cpp/overview) |
| `rtc-server-sdk/cpp` | v4.2.31 | [归档入口](https://doc-archive.shengwang.cn/archive/0.0.172/api-ref/rtc-server-sdk/cpp/overview) |

## 已知疑点的核验

- macOS/C++ v4.6.2 的 `0.0.519` 均可访问，页面标题为“API 概览”。
- RTM Web v2.1.3 的旧 `/rtm2/web/` 入口可访问，页面标题为“初始配置”。
- ConvoAI 的 `0.0454`、小程序的 `v0.0.166`、RTC HarmonyOS v4.4.1 的小写路径确实跳到了 404；没有据此擅自猜测另一个路径或版本。

## 首轮完整请求结果（修复前）

全部 214 个 URL 的状态码、最终地址和页面标题见同目录 `api-reference-historical-archive-url-check-20261020.json`。

## 首次接入与回归验证（覆盖修复前）

- `bun run test`：236 个测试文件通过；3128 项通过、2 项跳过。
- `bun run types:check`：通过。
- `bun run lint`：退出码 0；存在 20 条既有 warning 和 5 条 info，未为本任务修改无关文件。
- 改动的 9 个代码/测试文件单独运行 Biome：通过，无诊断。`git diff --check` 通过。
- 未运行生产构建；不以类型检查代替生产构建结论。
- 独立规格与代码质量审核通过。
- 桌面实测 RTC Android：13 个选项，只有 current 在本站；v4.6.0 点击打开旧站归档新标签页，列表可滚动。
- 移动导航实测 RTM Web：13 个选项，历史项使用 `_blank` 与 `noopener noreferrer`；v2.1.3 保留旧 `/rtm2/web/` 路径，选择后移动导航关闭。
- 白板 Web 实测：current 加 4 个历史项；React wrapper 与底层 Web SDK 两个页面均未新增版本菜单。
- 录制 Legacy：原页面位于 `legacy/(current)`，原父导航的 `legacy/*` 引用不能独立建立侧栏。移除旧版本项后，通过真实 legacy 子目录和独立无版本 scope 元数据恢复原类名导航；没有恢复 Legacy 版本项、删除源页面或更改 URL。
- 桌面截图仅保留在忽略目录 `.agent/artifacts/api-history/`；没有提交 QA 图片。
