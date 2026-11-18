# 中文解决方案概览：技术架构更新设计

## 目标与已确认范围

更新中文文档站的 9 个解决方案概览，让读者能从概览了解技术架构或跳转到现有详细说明。复用已有文档、原文和图片，不把详细架构文档完整复制进概览。

工作分支为 `codex/solution-overview-architecture`，从 `codex/cn-newdoc-html-api-migration` 的 `d45db741d792d24b5e38d57d6ecfee9a6dfdfd9b` 创建。所有修改在独立工作树完成，不修改原工作区。

## 内容改动

以下路径均相对于 `content/docs/zh-CN/solutions/`。

| 解决方案 | 概览文件 | 更新方式 |
| --- | --- | --- |
| 灵动课堂 | `flexible-classroom/index.mdx` | 新增「技术架构」简述，链接 `flexible-classroom/reference/capabilities-and-compatibility/tech-architect`。 |
| 一对一互动教学 | `one-to-one-classroom/index.mdx` | 新增「技术架构」简述，链接 `one-to-one-classroom/build/paas/architecture`。 |
| 一对 N 小班课 | `small-classroom/index.mdx` | 新增「技术架构」简述，链接 `small-classroom/build/paas/architecture`。 |
| 超级小班课 | `breakout-classroom/index.mdx` | 新增「技术架构」简述，链接 `breakout-classroom/build/paas/architecture`。 |
| 在线美术教学 | `art-class/index.mdx` | 在现有技术方案的说明和 SDK/服务表格中，为相关产品补链接，保留原文、架构图及 RTM 1.x 的版本表述。 |
| 在线音乐教学 | `online-music-class/index.mdx` | 在现有技术方案中，为 RTC、RTM、互动白板和云端录制补链接，保留 PaaS/aPaaS 区分及现有架构图。 |
| 平行操控 | `teleoperation/index.mdx` | 保留现有架构图，在架构段落补设备端、操控端、音视频传输与控制信令的职责和数据流说明，链接对应实现文档。 |
| 智能门铃 | `smart-doorbell/index.mdx` | 新增「技术架构」简述，链接 `smart-doorbell/build/paas-overview#方案架构`，不重复详细 SDK 职责表。 |
| 智能手表 | `smart-watch/index.mdx` | 在现有架构说明中为 RTSA Lite SDK 和 RTC SDK 补链接，保留 RTOS 与 Android 两种设备架构及图片。 |

新增跳转段落使用二级标题 `## 技术架构`，每段用一到两句话说明详细文档包含什么。已有技术方案或方案架构段落就地更新，保留原标题和锚点，不为统一标题名称引入链接兼容性变更。保留现有章节顺序、导航、开始构建卡片及其他概览内容。

## 信息来源与链接

- 跳转说明仅概括对应详细文档已经写明的内容。
- 美术和音乐教学中的产品链接复用课堂方案介绍已有的中文产品路由：RTC、RTM、Fastboard SDK 和云端录制。
- 智能手表的 SDK 链接复用现有智能门铃方案介绍中的 RTC 与 RTSA Lite 产品路由。
- 内部链接使用 `/zh-CN/...` 完整站内路径，核对目标文件和锚点确实存在；不添加未经核对的外部产品链接。
- 平行操控的说明必须先核对现有架构图，再与 `build/device-linux`、`build/operator-linux`、`build/operator-android` 的实现文档交叉检查。说明媒体流与控制信令分别承担什么，不把客户自行实现的设备控制逻辑写成声网 SDK 已实现的能力。
- 图中若有无法确认的职责或连线，不新增相应事实断言；不新增指标、平台承诺或功能承诺。

## 不在本次范围内

- 英文内容、其他解决方案、详细架构文档本身的重写。
- SDK 版本升级、导航重组、应用组件或样式修改。
- 新架构图、图片替换、产品能力扩展。
- 基线测试失败的修复。

## 验证与验收

1. 按 `docs/agents/markdown-authoring-standard.md` 检查标题、段落、图片和表格语法。
2. 对 9 个概览逐项核对本设计中的更新要求；不出现重复架构图或复制整篇详细文档。
3. 核对新增链接的目标文件、路由和锚点；平行操控的文字与图及现有实现文档一致。
4. 运行 `git diff --check` 和 `bun run types:check`。
5. 运行相关内容/链接检查，并运行 `bun run test`，与未修改工作树的基线结果对照；如出现新增失败，定位是否由本次内容修改引入。
6. 交付时说明改动文件、验证结果和仍存在的基线失败，不把有失败的全量测试描述为通过。

## 已完成的基线检查

在修改任何文档之前：

- `bun install --frozen-lockfile` 成功，工作树保持干净。
- `bun run types:check` 通过。
- `bun run test` 退出码为 1，输出报告 41 个失败，涉及导航、重定向、FAQ、内容回归等。用户已确认这些基线问题排除在本次修改范围外。

## 审核状态

用户已确认更新方式和基线问题的处理范围。本设计文档需经用户审核后再进入实施计划和内容修改。
