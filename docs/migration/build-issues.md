# Migration build issues

本文件记录迁移完成后本地 build 暴露的问题。这里先记录证据和可疑迁移模式，不在本文件内直接修复内容。

## 2026-07-06 build 记录

- 时间：2026-07-06 10:24:27 CST
- 分支：`codex/migration-control-spec`
- 命令：`bun run build`
- 结果：失败，退出码 `1`
- 失败阶段：`build:app:static`
- 关键输出：
  - `openapi:sync` 完成。
  - `docs:static-payload` 完成，生成 `2991` 个 payload 文件和 `3162` 个 machine-readable 文件。
  - `vite build` 转换 `9281` 个模块后失败，用时 `4m 24s`。
  - Vite/Fumadocs 报告 `42` 个 MDX 编译错误。

## 初步归类

- 遗留 HTML 属性未转换为 MDX/JSX 合法写法，例如 `id=onMessageEvent` 缺少引号，`class` 仍保留为 HTML 属性。
- 列表项内嵌 `<Accordions>`/`<Accordion>`，缩进或闭合结构不符合 MDX AST，导致组件在 `listItem` 结束前未闭合。
- 表格或 Slot 中残留 HTML `<li>...</li>`，被 MDX 当成真实 JSX 标签解析后与 `<Slot>` 闭合关系冲突。
- `<Tabs>`/`<TabsContent>` 迁移不完整，出现未开启 `TabsContent` 却关闭 `</TabsContent>` 的结构。
- `<Slot for="...">` 被放在表格外，触发当前 Slot 组件规则：`<Slot name="..."> must be used inside a table cell.`
- 部分文档残留不完整的 JSX/HTML 标签或表达式，例如 `Unexpected closing slash`、未闭合 `{`、异常 `=`。

## 具体问题清单

| # | 文件 | 错误 |
| --- | --- | --- |
| 1 | `content/docs/zh-CN/api-reference/rtm/toc-configuration/configuration.cpp.mdx` | `250:83` Unexpected character `o` before attribute value; likely unquoted HTML attribute in table cell. |
| 2 | `content/docs/zh-CN/api-reference/rtm/toc-configuration/configuration.mdx` | `253:87` Unexpected character `o` before attribute value; likely unquoted HTML attribute in table cell. |
| 3 | `content/docs/zh-CN/api-reference/rtm/toc-configuration/configuration.swift.mdx` | `237:83` Unexpected character `d` before attribute value; likely unquoted HTML attribute in table cell. |
| 4 | `content/docs/zh-CN/realtime-media/fusion-cdn/webhook/enable-ncs.mdx` | `35:4-37:18` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 5 | `content/docs/zh-CN/realtime-media/marketplace/integrate-extensions/faceunity-ar.mdx` | `496:1-498:17` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 6 | `content/docs/zh-CN/realtime-media/marketplace/integrate-extensions/audio-moderation-api.mdx` | Unexpected end of file in expression; expected closing brace for `{`. |
| 7 | `content/docs/zh-CN/realtime-media/rtm/overview/migration-guide.mdx` | Unexpected character `m` before attribute value; likely unquoted HTML attribute. |
| 8 | `content/docs/zh-CN/realtime-media/rtmp-gateway/webhook/enable-ncs.mdx` | `30:6-30:18` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 9 | `content/docs/zh-CN/realtime-media/speech-to-text/webhook/receive-webhook.mdx` | `37:6-37:18` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 10 | `content/docs/zh-CN/realtime-media/whiteboard/fastboard-sdk/conversion-webhook.mdx` | Unexpected closing tag `</li>`; expected corresponding closing tag for `<Slot>` at `425:1-425:55`. |
| 11 | `content/docs/zh-CN/realtime-media/media-pull/webhook/enable-event-notification.mdx` | `30:6-30:18` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 12 | `content/docs/zh-CN/realtime-media/whiteboard/whiteboard-sdk/conversion-webhook.mdx` | Unexpected closing tag `</li>`; expected corresponding closing tag for `<Slot>` at `402:1-402:55`. |
| 13 | `content/docs/zh-CN/solutions/game-voice/user-guides/spatial-audio-wwise.mdx` | `631:4-631:16` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 14 | `content/docs/zh-CN/solutions/game-voice/overview/billing.mdx` | `75:5-75:17` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 15 | `content/docs/zh-CN/solutions/chatroom/uikit/get-started/quick-integration.mdx` | `825:5-825:17` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 16 | `content/docs/zh-CN/solutions/iot-apaas/advanced-features/alarm.android.ios.device-c.mdx` | `118:73-118:108` Expected closing tag for `<PlatformInline>` before end of `paragraph`. |
| 17 | `content/docs/zh-CN/solutions/meeting/get-started/configure-meeting.mdx` | `27:5-27:17` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 18 | `content/docs/zh-CN/solutions/meeting/get-started/integrate-meeting.mdx` | `377:5-377:17` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 19 | `content/docs/zh-CN/realtime-media/media-push/webhook/enable-ncs.mdx` | `30:6-30:18` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 20 | `content/docs/zh-CN/realtime-media/online-ktv/auikaraoke/advanced-features/lyrics-syncing.mdx` | `19:3-19:15` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 21 | `content/docs/zh-CN/solutions/voip-call/webhook/receive-webhook.mdx` | `37:6-37:18` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 22 | `content/docs/zh-CN/realtime-media/online-ktv/auikaraoke/get-started/integrate.mdx` | `133:4-133:16` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 23 | `content/docs/zh-CN/realtime-media/rtc/advanced-features/extensions/virtual-background.mdx` | Unexpected closing slash `/` in tag; expected an open tag first. |
| 24 | `content/docs/zh-CN/realtime-media/online-ktv/ktv-scenario/advanced-features/lyrics-syncing.mdx` | `19:3-19:15` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 25 | `content/docs/zh-CN/introduction/usage-analytics/overview/release-notes.mdx` | Unexpected closing slash `/` in tag; expected an open tag first. |
| 26 | `content/docs/zh-CN/introduction/usage-analytics/rtc/api-limits.mdx` | Unexpected closing slash `/` in tag; expected an open tag first. |
| 27 | `content/docs/zh-CN/introduction/usage-analytics/rtc/call-search/overview.mdx` | Unexpected closing tag `</li>`; expected corresponding closing tag for `<Slot>` at `77:1-77:37`. |
| 28 | `content/docs/zh-CN/introduction/usage-analytics/rtc/data-insight/basic.mdx` | Unexpected closing slash `/` in tag; expected an open tag first. |
| 29 | `content/docs/zh-CN/realtime-media/online-ktv/online-ktv-sdk/advanced-features/lyrics-syncing.mdx` | `19:3-19:15` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 30 | `content/docs/zh-CN/realtime-media/rtc/basic-features/audio-quick-start.mdx` | `5557:5-5557:17` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 31 | `content/docs/zh-CN/realtime-media/recording/cloud-recording/get-started/quick-start-go.mdx` | `26:5-26:17` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 32 | `content/docs/zh-CN/realtime-media/recording/cloud-recording/get-started/quick-start-java.mdx` | `26:5-26:17` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 33 | `content/docs/zh-CN/realtime-media/recording/cloud-recording/get-started/quick-start-nodejs.mdx` | `26:5-26:17` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 34 | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx` | `1812:1-1812:15` Unexpected closing tag `</TabsContent>`; expected corresponding closing tag for `<Tabs>` at `1806:1-1806:33`. |
| 35 | `content/docs/zh-CN/realtime-media/recording/cloud-recording/user-guides/mix-mode/set-composite-layout.mdx` | Unexpected character `=` before name; expected a valid JSX name character. |
| 36 | `content/docs/zh-CN/realtime-media/rtc/best-practice/playing-url.mdx` | Expected closing tag for `<Slot>` at `99:5-99:44` before end of `listItem`. |
| 37 | `content/docs/zh-CN/realtime-media/recording/cloud-recording/webhook/enable-ncs.mdx` | `30:6-30:18` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 38 | `content/docs/zh-CN/realtime-media/rtc/webhook/receive_webhook.mdx` | `45:6-45:18` Expected closing tag for `<Accordions>` before end of `listItem`. |
| 39 | `content/docs/zh-CN/realtime-media/marketplace/create-extensions/publish.mdx` | `<Slot name="..."> must be used inside a table cell.` |
| 40 | `content/docs/zh-CN/realtime-media/sdk-extensions/metakit/quick-start.mdx` | `<Slot name="..."> must be used inside a table cell.` |
| 41 | `content/docs/zh-CN/realtime-media/online-ktv/auikaraoke/get-started/run-github-project-backend.mdx` | `<Slot name="..."> must be used inside a table cell.` |
| 42 | `content/docs/zh-CN/solutions/chatroom/uikit/get-started/run-github-project-backend.mdx` | `<Slot name="..."> must be used inside a table cell.` |

## 代表性证据

- `configuration.cpp.mdx:250` 中有 `<code ... id=onMessageEvent>`，`id` 值未加引号，是 JSX/MDX 非法属性语法。
- `fusion-cdn/webhook/enable-ncs.mdx:35-38` 中列表项内缩进后接 `<Accordions>`，Fumadocs MDX 在 `listItem` 结束前找不到合法闭合。
- `usage-analytics/rtc/call-search/overview.mdx:77-79` 中 `<Slot>` 内残留 `</li><li>`，导致 Slot/HTML 标签闭合关系错乱。
- `rtc/get-started/quick-start.mdx:1806-1814` 中 `<Tabs>` 后直接出现 markdown heading，随后关闭 `</TabsContent>`，Tabs 结构不完整。
- `marketplace/create-extensions/publish.mdx:43-50` 中 `<Slot for="...">` 单独放在表格后，违反当前 Slot 只能在表格单元格内使用的规则。

## 后续建议

1. 优先批量修复重复模式：`Accordions` 位于 list item 内、表格外 `Slot`、HTML `<li>` 残留、未加引号 HTML 属性。
2. 每修复一类后重新运行 `bun run build`，因为当前 build 可能在首批 42 个 MDX 错误后仍隐藏后续错误。
3. 修复内容文件前按 `docs/agents/markdown-authoring-standard.md` 核对允许的 MDX primitives 和表格/列表续行规则。
