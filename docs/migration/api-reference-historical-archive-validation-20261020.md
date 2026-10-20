# API Reference 历史归档外链验证（2026-10-20）

## 范围与方法

- 按已确认方案排除 RTC React 两个版本系列，对 43 个平台的 219 个历史选项、214 个去重 URL 发起实际 GET 请求，跟随重定向，10 路并发，每个请求超时 12 秒。
- 固定地址依据 `api-reference-historical-archive-inventory-20261020.md`；原清单仅基于源码推导，本报告补充线上可达性检查。
- 201 个不同 URL 返回 HTTP 200 且未跳到 404；13 个不同 URL 跳到 `https://doc.shengwang.cn/404`，尽管最终 HTTP 状态也为 200。不能单凭状态码判断入口有效。
- 本轮没有超时或连接错误。结果是本次检查时的状态，不保证未来可达性。
- HTTP 可达不等于 SDK 内容版本已逐页核验；未声称 201 个页面的内容版本全部匹配。
- 为遵守已确认的清单映射，本次保留失效项原地址，未猜测归档编号、替换版本或静默删除选项。以下 13 项需要在发布前确认修复或下线策略。

## 跳到旧站 404 的入口

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

## 完整请求结果

全部 214 个 URL 的状态码、最终地址和页面标题见同目录 `api-reference-historical-archive-url-check-20261020.json`。

## 本地接入与回归验证

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
