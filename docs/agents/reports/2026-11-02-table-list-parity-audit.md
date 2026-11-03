# 表格内列表排查与修复（2026-11-02）

已完成中文 10 个源文件、21 处单元格的列表恢复，使用现有表格 Slot 与 Markdown 同级列表。正文、价格、配额、代码标识、限制说明及链接保持不变。

本修复分支还包含最初 RTC 套餐包表格的 9 处恢复，合计 10 个源文件、30 处单元格，其中在站 7 页共 18 处，隐藏/下线保留源码 3 份共 12 处。下方编号与逐处前后截图对应后续站内排查确认的 21 处。

## 发布范围更正

前次静态扫描没有排除注释和已下线目录，不能将 10 个源文件全部视为在站页面。实际范围：

- 在站：7 页、9 处（cn-03 至 cn-11）。
- 注释隐藏：小班课、一对一教学两份源码，各 1 处（cn-01、cn-02）。旧表格及新增 Slot 定义仍在原 MDX 注释内。
- 已下线保留：MetaKit 一份源码，Android/iOS 各 5 处（cn-12 至 cn-21）。仍被 `retired-cn-docs.mjs` 排除。
- 隐藏和已下线内容的截图使用临时本地 MDX 预览，使用实际应用与相同渲染器。临时预览源文件已删除，没有改动发布配置、下线规则或导航。

## 逐处完成清单

表中位置为修复后的 Slot 占位行；每个编号对应独立的修改前图、修改后图、并排对比图及完整视口上下文。

| 编号 | 文件与行 | 位置 | 发布状态 | 恢复条目数 |
| --- | --- | --- | --- | --- |
| cn-01 | [content/docs/zh-CN/solutions/small-classroom/index.mdx:43](../../../content/docs/zh-CN/solutions/small-classroom/index.mdx#L43) | 实现功能 | 注释隐藏 | 3 |
| cn-02 | [content/docs/zh-CN/solutions/one-to-one-classroom/index.mdx:43](../../../content/docs/zh-CN/solutions/one-to-one-classroom/index.mdx#L43) | 实现功能 | 注释隐藏 | 3 |
| cn-03 | [content/docs/zh-CN/solutions/chatroom/uikit/build/run-github-project-backend.mdx:59](../../../content/docs/zh-CN/solutions/chatroom/uikit/build/run-github-project-backend.mdx#L59) | `WHITELIST_TOKEN_APP_ID`、`WHITELIST_CHAT_ROOM_APP_ID`、`WHITELIST_RTC_KICK_OUT_AUTH_APP_ID` | 在站 | 3 |
| cn-04 | [content/docs/zh-CN/solutions/online-ktv/auikaraoke/build/manage-karaoke/run-github-project-backend.mdx:56](../../../content/docs/zh-CN/solutions/online-ktv/auikaraoke/build/manage-karaoke/run-github-project-backend.mdx#L56) | `WHITELIST_TOKEN_APP_ID`、`WHITELIST_CHAT_ROOM_APP_ID` | 在站 | 2 |
| cn-05 | [content/docs/zh-CN/api-reference/rtmp-gateway/restful/overview/product-overview.mdx:59](../../../content/docs/zh-CN/api-reference/rtmp-gateway/restful/overview/product-overview.mdx#L59) | 高可靠性 | 在站 | 2 |
| cn-06 | [content/docs/zh-CN/realtime-media/content-moderation/index.mdx:59](../../../content/docs/zh-CN/realtime-media/content-moderation/index.mdx#L59) | 直播间 | 在站 | 2 |
| cn-07 | [content/docs/zh-CN/realtime-media/rtmp-gateway/index.mdx:61](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/index.mdx#L61) | 高可靠性 | 在站 | 2 |
| cn-08 | [content/docs/zh-CN/realtime-media/rtc/reference/billing-strategy.mdx:140](../../../content/docs/zh-CN/realtime-media/rtc/reference/billing-strategy.mdx#L140) | 25K 分钟 | 在站 | 2 |
| cn-09 | [content/docs/zh-CN/realtime-media/rtc/reference/billing-strategy.mdx:141](../../../content/docs/zh-CN/realtime-media/rtc/reference/billing-strategy.mdx#L141) | 250K 分钟 | 在站 | 2 |
| cn-10 | [content/docs/zh-CN/realtime-media/rtc/reference/billing-strategy.mdx:142](../../../content/docs/zh-CN/realtime-media/rtc/reference/billing-strategy.mdx#L142) | 1,000K 分钟 | 在站 | 2 |
| cn-11 | [content/docs/zh-CN/realtime-media/usage-analytics/build/investigate-call-problems/overview.mdx:76](../../../content/docs/zh-CN/realtime-media/usage-analytics/build/investigate-call-problems/overview.mdx#L76) | 异常主播（Beta） | 在站 | 2 |
| cn-12 | [content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx:50](../../../content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx#L50) | android / 虚拟人 | 已下线保留 | 3 |
| cn-13 | [content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx:51](../../../content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx#L51) | android / Animoji | 已下线保留 | 3 |
| cn-14 | [content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx:52](../../../content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx#L52) | android / Sticker | 已下线保留 | 4 |
| cn-15 | [content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx:53](../../../content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx#L53) | android / 背景特效 | 已下线保留 | 2 |
| cn-16 | [content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx:54](../../../content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx#L54) | android / 灯光特效 | 已下线保留 | 7 |
| cn-17 | [content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx:674](../../../content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx#L674) | ios / 虚拟人 | 已下线保留 | 3 |
| cn-18 | [content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx:675](../../../content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx#L675) | ios / Animoji | 已下线保留 | 3 |
| cn-19 | [content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx:676](../../../content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx#L676) | ios / Sticker | 已下线保留 | 4 |
| cn-20 | [content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx:677](../../../content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx#L677) | ios / 背景特效 | 已下线保留 | 2 |
| cn-21 | [content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx:678](../../../content/docs/zh-CN/realtime-media/sdk-extensions/metakit/build/implement-core-features/quick-start.mdx#L678) | ios / 灯光特效 | 已下线保留 | 7 |

## 截图与校验

所有 QA 产物保存在忽略目录 `.agent/artifacts/table-list-fixes/`，不纳入 Git：

- `index.html`：21 处前后截图对比清单，图片可点击查看原图。
- `before/`、`after/`：42 张独立表格行截图及每处 DOM 校验数据。
- `before/viewport/`、`after/viewport/`：42 张完整视口截图，保留实际页面上下文。
- `comparison/`：21 张带编号、平台和发布状态说明的并排对比图。
- `contact-01.png` 至 `contact-07.png`：覆盖所有 21 处的视觉复核图，已逐张检查。
- `verification.json`：逐处核对文字（忽略分隔标点及列表换行）、代码标识和链接均不变，列表数量分别符合旧源。
- `manifest.json`：源文件、修改前位置、条目、截图编号、平台及发布状态映射。
- `table-list-comparisons.zip`：可独立解压浏览的完整截图对比包。

修改前、修改后均使用 1440 × 1200 视口与相同主题。表格行从真实浏览器截图按 DOM 位置裁切，不合成或重绘表格内容。列表恢复后表格的自动列宽及行高可能随内容自然变化。

## 验证结果

- `bun run types:check`：通过；在删除临时预览文件后重新运行并通过。
- `bun run test src/lib/mdx/remark-table-slots.test.ts src/components/mdx.test.tsx src/lib/retired-cn-docs.test.ts src/lib/voice-migration-guide-table-slots.test.ts`：4 个测试文件、174 项测试通过。
- 浏览器逐处核对：21 处均通过，从 0 个列表项恢复为清单中的数量；文字、链接和代码标识一致。
- 对比清单：21 个区块、42 张图片均成功加载。
- 独立源码复核：21 处 Slot 均唯一配对，定义紧随所属表格；列表内保持正确缩进；隐藏/下线状态保持不变。
- `git diff --check`：通过。

全量 `bun run test` 未通过：315 个测试文件中 300 个通过、15 个失败；4,913 项测试通过、72 项失败、2 项跳过。失败涉及 favicon、搜索、路由、OpenAPI、语言环境及机器可读输出。当前本地环境为中文部署，favicon 失败可独立复现：测试首项期待 Agora 图标，而当前实际为 Shengwang 图标。相关应用源码和配置本轮没有修改；未对这批完整测试失败逐项做基线归因，因此不将全量测试标为通过。

## 英文候选

英文的 77 页、950 个自动匹配候选本轮未改动，按用户确认先完成中文范围。原始匹配数据保存在 `.agent/artifacts/flattened-table-lists-audit.json`。候选仍需结合对应页面、注释、下线规则及平台语境复核，不能直接作为站内缺陷数量。

## 排查边界

初筛扫描 8,264 个中英文 Markdown/MDX 文件、309,760 个表格单元格，对照本机旧源库中的 6,958 个 Markdown/MDX 文件。算法以旧表格中的多项列表为入口，对整段文字匹配并排除已使用 Slot/HTML 列表的单元格。普通含分号句子及跨页面相似文字不视为问题；本地录制合流模式的两条单行命令已按本页旧源排除。该扫描不是穷尽性渲染审计。
