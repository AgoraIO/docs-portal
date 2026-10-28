# 五个待补页面的本地源文件核查

> 后续范围决定：用户已确认这 27 个源头空文档不再处理。以下保留当时核查证据；当前待办以[后续事项清单](./cn-doc-link-follow-up.md)为准。

核查源仓库：`shengwang-doc-source`。

源仓库本地分支为 `master`，核查时提交为 `427a27358`（Release 0.0.535）。仅核查用户指定的五页，22 个原始 Doxygen 空正文页面不在本轮范围内。

## 结论

五个对应源文件均已找到，但该仓库当前内容和本地可见 Git 历史没有可恢复的完整正文。因此不能将这五页作为“找到源后即可补齐”的页面，也不能认定为迁移时漏掉了完整正文。

| 页面 | 源文件（相对于源仓库根目录） | 当前源内容 | 历史核查 |
| --- | --- | --- | --- |
| C# 虚拟节拍器 | `html-docs/rtc/Csharp/API/toc_rhythmplayer.html` | 只有标题、导航及空 `refbody`；无方法正文。 | 12 条文件历史，正文均为空。 |
| C# 摄像头管理 | `html-docs/rtc/Csharp/API/toc_mobile_camera.html` | 只有标题、导航及空 `refbody`；无方法正文。 | 12 条文件历史，正文均为空。 |
| C# 人脸检测 | `html-docs/rtc/Csharp/API/toc_face_detection.html` | 只有标题、导航及空 `refbody`；无方法正文。 | 12 条文件历史，正文均为空。 |
| HarmonyOS MusicCollection | `html-docs/rtc/HarmonyOS/API/class_musiccollection.html` | 仅“音乐资源列表的详细信息。”；ArkTS 声明代码块和详细说明区均为空。 | 7 条文件历史；部分旧版另有“自从 v4.1.0”，仍没有类型定义或成员说明。 |
| 弹幕玩法发版说明 | `docs/danmaku/overview/release-notes.mdx` | 标题“更新历史”和一句导语；没有版本、日期或变更条目。 | 3 条文件历史；可读取版本均只有相同导语。 |

API 平台来源与版本由 `docs-api-reference/rtc/_platforms_.meta.js` 确认：C# (Windows) 使用 `./Csharp`，当前版本为 v4.2.0；HarmonyOS 使用 `./HarmonyOS`，当前版本为 v4.6.3。

## 补充证据

- 源 HTML 的正文通过 `main` 区域提取并排除 `h1` 标题，避免将通用侧边栏当作页面正文。
- `tmp/dist/` 中对应 C# Markdown 副本也只有标题，MusicCollection 副本仅有同一句简介。
- C# 的节拍器配置类型和枚举虽然存在，API 概览也仍有方法名称，但它们不包含这三个空页所需的方法正文。
- HarmonyOS 的音乐回调说明存在，但不能据此推定一个没有声明的 MusicCollection 类型结构。
- 弹幕页的两个新增提交 `6f2ea3219`、`dc3c0b0ec` 都只加入同一句导语；另一个历史提交删除了该文件。当前侧栏中的更新历史入口也处于注释状态。

本轮没有修改这五个页面的正文，也没有关闭对应的待补内容项。要补成可发布内容，仍需 C# v4.2.0 对应 API 原文、HarmonyOS MusicCollection 的明确类型定义，以及弹幕玩法的实际版本变更记录。

机器可读证据位于工作树忽略目录 `.agent/artifacts/cn-links/source-recovery/source-history.json`，记录源仓库提交、当前正文提取结果，以及逐文件的本地历史版本检查结果。
