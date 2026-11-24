# 中文迁移至今 hotfix 复查（2026-11-24）

这次复查又确认两处迁移遗漏，不能沿用上一轮抽查的结果宣布“没有其他遗漏”。已补 Android 自定义视频采集的 #2013 内容，以及白板 Web Globals 的 #2121 动态配置公开类型索引。两处分别按一项完整内容缺口统计，不把每个缺句计成独立缺陷。#2013 位于原八月 hotfix checkpoint 清单之前，后续局部同步不能证明它已覆盖；#2121 则是 API 页面存在但额外入口丢失，单查文件数无法发现。

## 固定范围

- 旧站起点：`a324595cb997e8c729ff18ebf4150d7e4f2b8763`，首次迁移日期 2026-07-05 之前的 first-parent 终点。
- 旧站终点：`b9aa4166a265ad2693ced2ce36ea4a7d5e21e826`（0.0.546，2026-11-17）。本轮通过 GitHub API 确认其仍是 master 最新提交。
- 新站基线：`main@e31ca1ac6e99b776e41a18f3fffc5a6705f2dac2`，已包含 #1520。#1519 按独立修复快照判断，不重复提交其修改；收尾时确认已于 2026-11-24 11:00:01（北京时间）合并。
- 交付补丁已重放到 `main@bc8e2a84a`（包含 #1519、#1520）；新增主线差异仅为 #1519 的三个已单独核查文件。重放后 282 项回归和类型检查再次通过。
- 共枚举 **175 个 first-parent 提交、110 个实际合入 PR、2645 个变化源路径**。175 项中有 59 个 Release 计数提交；这些不要求复制成新站产品版本。
- GitHub 合入记录与 mergeCommit SHA 全部对齐。#2035、#2097 实际就在 first-parent 历史中，但提交标题没有 PR 编号；#2066 只是 #2067 提交标题内的关联编号。不能仅用标题正则生成 hotfix 清单。

| 文件类别 | 变化源路径数 | 核查方式 |
| --- | ---: | --- |
| Markdown/MDX 内容 | 633 | 源改动与最终源交叉，过滤已经被后续版本覆盖或隐藏的旧句；追踪共享展开、路径重组和最新目标正文 |
| OpenAPI | 5 | 固定源 YAML 对照维护源，排除注释、命名和 callout 结构变化 |
| 生成 HTML | 1460 | 依据 migration provenance/历次台账定位目标；从正文差异中过滤旧站 head/nav/footer、生成器包装，再复核剩余候选 |
| 平台/导航元数据 | 465 | 历次迁移台账与当前路径、版本、共享 SDK 数据和回归检查交叉，不逐字复制旧站可执行元数据 |
| 资产/旧站实现 | 82 | 记录归属与原排除决定，避免将版本计数、站点代码、内部计划误报成发布内容遗漏 |

这是全时期提交/文件清单与差异筛查，配合高风险候选复核；不是对每个 SDK 参数与服务端实现的等价证明，也不是当前生产部署验收。自动直接映射之外包含隐藏英文镜像、共享字典、导航、生成辅助页和产品聚合页，不能把“没有同名目标文件”直接算缺失。

## 本次补齐

### 源 #2013：Android 自定义视频采集

旧站在 7 月 6 日增加的以下内容没有完整进入新站：

- 推荐使用 `io.agora.base.VideoFrame`，说明与 `AgoraVideoFrame` 重载的区别及 Texture 支持范围。
- 单路场景启用外部视频源、使用默认轨道 `customVideoTrackId=0`；多路场景才显式创建独立轨道。
- 单路默认轨道的完整加入频道示例。
- 默认轨道与显式创建轨道的不同释放方式。
- 两个遗漏的 API 入口。

修复只在 `content/docs/zh-CN/realtime-media/rtc/build/video/custom-video-source.mdx` 的 Android 块内。9 个 Java 代码块在去除旧 Tab 公共缩进后与固定源一致；其他平台块逐字不变。保留原五个编号步骤及其 ID，在前面增加不编号的发布模式选择小节，避免插入新步骤后改变 iOS 等兄弟平台的标题后缀和旧链接。浏览器确认编号步骤 ID 唯一、旧 Android 入口仍指向正确位置。

### 源 #2121：白板 Web 动态配置公开类型入口

9 个 DynamicConfig 类型 API 页面均存在，但源 Globals 页新增的“动态配置公开类型”索引未迁入。补回对应标题和 9 个本地类型链接；不改类型定义、签名或其他已有内容。链接检查和浏览器点击 DynamicConfigState 已验证目标页面。

## 本轮排除的候选

- 内容审核 #2017 的托管鉴权、控制台和示例问题：#1519 已有对应修订；#1520 的参数约束和录制费用提示已在本轮 main 基线中。
- 10 月 19 日报告的 20 项不完整覆盖：历史修复均已合入旧中文分支。本轮重新运行 22 个 hotfix 回归文件，共 282 项通过；不再把那 20 项当作当前未修项，也不把回归通过视为整页内容保真。
- RTM 场景页由平台子文件合并为平台块；Cloud Proxy 内容移到网络配置；小程序能力集中在兼容性、快速开始和对应 API。按实际落点判断。
- ConvoAI 的 vendor/client/avatar/MCP server 中文术语、本地链接标题与参数表 Slot 分拆属于目标表达变化，相关参数、前提和示例仍可定位。
- 新站 Android/iOS 4.7.1 示例和包体积取代旧源 4.7.0 信息；保留新站更新。源 31.69/13.15 MB 的历史数据也仍在共享 SDK 目录中。
- 生成 API 的返回值/参数拆成独立块、旧站导航包装、Doxygen 邮箱混淆和指数表示，不作为字段丢失。C++ DataStream 可靠性说明、Csharp/Unreal Token 重入流程、RTSA License 说明均已找到对应正文。
- 下载入口检查了 50 个不同包文件名。两条 RTM C++ 文件名的差异来自 `%2B` 编码；两条 RTSA 1.9.2 地址属于已退休 Java SDK 的旧下载卡；当前退休说明和 ProductSdkDownloads 回归均明确不再展示该版本；两条 avatar ZIP 是 API 示例地址，不能作为丢失 SDK 下载包处理。本轮未宣称所有外部包实际下载成功。

## 源文档问题

上一轮已创建并回读的 DF-090～DF-095 继续有效：Gateway 共享 Webhook 示例与字段表、RTC Web 旧回退示例、录制 AV1/MP4 冲突、纯音频 MP3 冲突、旧录制 start URL、英文 STT 字段名。它们不能通过迁移补丁擅自改变服务契约。本轮没有据词面差异新增同类重复任务。

另新增并回读确认 [DF-096](https://rcnxnwjad4la.feishu.cn/record/MSLDrsjazeMdvKcqI2mctODLnHh)：源 #2013 指南的 `setExternalVideoSource` 链接使用 `api_imediaengine_setexternalvideosource`，固定源 HTML 无此锚点，实际为 `api_irtcengine_setexternalvideosource`。本次新站补丁已用正确目标；旧源任务状态为“待修改”。

历次台账中的图床上传、外部归档标题、源日期/契约疑义与共享移动端工具栏待办没有在本轮被默认为解决；这些不计入本轮新增的两处正文迁移遗漏。

## 验证与限制

- 历史 hotfix 回归：22 文件 / 282 项通过。
- `bun run types:check`、中文 API source gate 通过，source gate 为 0 new / 0 known duplicate headings / 0 obsolete allowances。
- 两页以实际中文 preset 完整编译；两页共 518 个链接接受定向检查，未发现无效站内目标或缺失锚点。
- 本地 Chrome 桌面 1440×1000、手机 390×844：新增流程与类型索引可见，无整页横向溢出；验证旧步骤锚点、类型链接和平台边界。
- 本轮未执行全站生产构建、全量浏览器 API 矩阵、SDK 运行或原生产 URL 修复验收。不声称“全站零缺陷”或“所有 hotfix 均已上线”。

原始 source/main 指纹、175 项提交、2645 项源文件分类、候选筛查、110 项 GitHub PR 原始清单和日志保存在本地 ignored `.agent/hotfix-parity-audit/`。下面按实际合入时间列出完整 PR 清单；“未新增确认遗漏”仅是本轮检查结果，不是逐行正确性担保。

## 110 个实际合入源 PR

| 源 PR | 合入日期（UTC） | 源变更路径数 | 本轮结论 |
| --- | --- | ---: | --- |
| [#2017](https://github.com/AgoraIO/shengwang-doc-source/pull/2017) Content moderation | 2026-07-06 | 34 | #1519 独立修复；#1520 已合并；本批不重复 |
| [#2013](https://github.com/AgoraIO/shengwang-doc-source/pull/2013) Update videoframe | 2026-07-06 | 6 | 确认新遗漏；本次补齐 Android 接入方式和流程 |
| [#2028](https://github.com/AgoraIO/shengwang-doc-source/pull/2028) 优化 RTC Web 防火墙域名提示文案 | 2026-07-07 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2029](https://github.com/AgoraIO/shengwang-doc-source/pull/2029) docs: update RTC mini program domain allowlist | 2026-07-07 | 4 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2030](https://github.com/AgoraIO/shengwang-doc-source/pull/2030) docs: clarify Android spatial audio profile setup | 2026-07-07 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2032](https://github.com/AgoraIO/shengwang-doc-source/pull/2032) docs: update getPlaybackDevices Safari support | 2026-07-07 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2033](https://github.com/AgoraIO/shengwang-doc-source/pull/2033) docs: update RTC Windows toolchain note | 2026-07-09 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2034](https://github.com/AgoraIO/shengwang-doc-source/pull/2034) Caseby update | 2026-07-09 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2035](https://github.com/AgoraIO/shengwang-doc-source/pull/2035) docs: update Agora Web SDK 4.24.6 release notes | 2026-07-13 | 8 | 无编号提交已按 merge SHA 纳入；目标内容已核对 |
| [#2036](https://github.com/AgoraIO/shengwang-doc-source/pull/2036) docs: update ConvoAI toolkit source links | 2026-07-15 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2037](https://github.com/AgoraIO/shengwang-doc-source/pull/2037) Manual sos eos toolkit | 2026-07-16 | 21 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2039](https://github.com/AgoraIO/shengwang-doc-source/pull/2039) docs: update Spatius avatar params | 2026-07-21 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2040](https://github.com/AgoraIO/shengwang-doc-source/pull/2040) Convoai initialize toolkit update | 2026-07-21 | 6 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2042](https://github.com/AgoraIO/shengwang-doc-source/pull/2042) docs(convoai): only show Basic Auth for HTTP authentication | 2026-07-21 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2043](https://github.com/AgoraIO/shengwang-doc-source/pull/2043) llm.greeting_interruptable-fix | 2026-07-21 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2038](https://github.com/AgoraIO/shengwang-doc-source/pull/2038) Codex/convoai v2.10 rest release notes | 2026-07-21 | 5 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2044](https://github.com/AgoraIO/shengwang-doc-source/pull/2044) Agent sdk qs fix | 2026-07-23 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2045](https://github.com/AgoraIO/shengwang-doc-source/pull/2045) Codex/convoai agent sdk api reference update | 2026-07-26 | 6 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2046](https://github.com/AgoraIO/shengwang-doc-source/pull/2046) xfyun temporary hidden | 2026-07-26 | 4 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2031](https://github.com/AgoraIO/shengwang-doc-source/pull/2031) docs: update online KTV billing rules | 2026-07-27 | 4 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2006](https://github.com/AgoraIO/shengwang-doc-source/pull/2006) first draft | 2026-07-27 | 46 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2047](https://github.com/AgoraIO/shengwang-doc-source/pull/2047) Agora agent sdk fixes | 2026-07-28 | 3 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2049](https://github.com/AgoraIO/shengwang-doc-source/pull/2049) Update quick-start-agent.mdx | 2026-07-28 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2048](https://github.com/AgoraIO/shengwang-doc-source/pull/2048) Cloud transcoder tool | 2026-07-28 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2041](https://github.com/AgoraIO/shengwang-doc-source/pull/2041) DOC-4952 STT 7.2.3 文档更新 | 2026-07-29 | 4 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2052](https://github.com/AgoraIO/shengwang-doc-source/pull/2052) fix iOS background audio guidance (DF-002, DF-003) | 2026-07-29 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2054](https://github.com/AgoraIO/shengwang-doc-source/pull/2054) docs: update SnapshotConfig position constraints (DF-011) | 2026-07-29 | 8 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2053](https://github.com/AgoraIO/shengwang-doc-source/pull/2053) [DF-017] 修复 Android onConnectionStateChanged reason 列表层级 | 2026-07-29 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2057](https://github.com/AgoraIO/shengwang-doc-source/pull/2057) [DF-004] Update native connection failure recovery | 2026-07-31 | 4 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2058](https://github.com/AgoraIO/shengwang-doc-source/pull/2058) docs: update custom TTS agent references | 2026-07-31 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2061](https://github.com/AgoraIO/shengwang-doc-source/pull/2061) docs: update speech-to-text 7.2.3 release note | 2026-08-03 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2062](https://github.com/AgoraIO/shengwang-doc-source/pull/2062) Update Web SDK to v4.24.7 | 2026-08-04 | 8 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2060](https://github.com/AgoraIO/shengwang-doc-source/pull/2060) [DF-015] Fix screen capture track publishing docs | 2026-08-04 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2064](https://github.com/AgoraIO/shengwang-doc-source/pull/2064) Update STT landing page demo link | 2026-08-05 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2065](https://github.com/AgoraIO/shengwang-doc-source/pull/2065) Fix audio moderation callback wording | 2026-08-05 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2063](https://github.com/AgoraIO/shengwang-doc-source/pull/2063) docs: add public ConvoAI v2.11 ASR keywords updates | 2026-08-11 | 7 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2068](https://github.com/AgoraIO/shengwang-doc-source/pull/2068) fix: correct Android video codec library names | 2026-08-11 | 3 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2070](https://github.com/AgoraIO/shengwang-doc-source/pull/2070) docs: sync LogConfig file path guidance | 2026-08-13 | 8 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2072](https://github.com/AgoraIO/shengwang-doc-source/pull/2072) docs: clarify metadata truncation in C++ API | 2026-08-13 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2073](https://github.com/AgoraIO/shengwang-doc-source/pull/2073) fix: clarify HarmonyOS RTC log file path | 2026-08-17 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2067](https://github.com/AgoraIO/shengwang-doc-source/pull/2067) docs(rtm): rtm web 2.3.0 (#2066) | 2026-08-18 | 23 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2076](https://github.com/AgoraIO/shengwang-doc-source/pull/2076) feat: clarify beauty material scope | 2026-08-21 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2077](https://github.com/AgoraIO/shengwang-doc-source/pull/2077) docs: sync metadata truncation note across RTC APIs | 2026-08-21 | 8 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2075](https://github.com/AgoraIO/shengwang-doc-source/pull/2075) feat: clarify yidun ticket details | 2026-08-24 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2069](https://github.com/AgoraIO/shengwang-doc-source/pull/2069) docs: add RTM2 mini program docs | 2026-08-31 | 40 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2082](https://github.com/AgoraIO/shengwang-doc-source/pull/2082) docs(rtc): update Web SDK to v4.24.8 | 2026-08-31 | 8 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2085](https://github.com/AgoraIO/shengwang-doc-source/pull/2085) docs: update RTC 4.6.4 Android and iOS docs | 2026-09-01 | 7 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2086](https://github.com/AgoraIO/shengwang-doc-source/pull/2086) UPDATE releasenote | 2026-09-01 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2087](https://github.com/AgoraIO/shengwang-doc-source/pull/2087) modify description | 2026-09-01 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2088](https://github.com/AgoraIO/shengwang-doc-source/pull/2088) fix: update Web SDK string UID link | 2026-09-02 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2084](https://github.com/AgoraIO/shengwang-doc-source/pull/2084) docs: update RTC 4.6.4 Flutter and RN docs | 2026-09-02 | 11 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2089](https://github.com/AgoraIO/shengwang-doc-source/pull/2089) fix: update DF-048 datastream API HTML | 2026-09-02 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2090](https://github.com/AgoraIO/shengwang-doc-source/pull/2090) Romove macOS 15 Sequoia Beta | 2026-09-04 | 13 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2083](https://github.com/AgoraIO/shengwang-doc-source/pull/2083) docs: add RTSA 1.10.1 release notes and performance benchmarks | 2026-09-07 | 84 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2096](https://github.com/AgoraIO/shengwang-doc-source/pull/2096) docs: refresh RTSA C v1.10.1 security-fixed downloads | 2026-09-07 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2097](https://github.com/AgoraIO/shengwang-doc-source/pull/2097) docs(rtm2): add duplicate instance guidance | 2026-09-10 | 1 | 无编号提交已按 merge SHA 纳入；目标内容已核对 |
| [#2099](https://github.com/AgoraIO/shengwang-doc-source/pull/2099) docs: update License SKU products | 2026-09-10 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2074](https://github.com/AgoraIO/shengwang-doc-source/pull/2074) docs(convoai): add v2.12 release documentation | 2026-09-14 | 23 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2102](https://github.com/AgoraIO/shengwang-doc-source/pull/2102) docs(convoai): align 112 event metrics schema | 2026-09-16 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2106](https://github.com/AgoraIO/shengwang-doc-source/pull/2106) docs: update video moderation prerequisites | 2026-09-16 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2105](https://github.com/AgoraIO/shengwang-doc-source/pull/2105) [DF-066] Update media push transcoding pricing | 2026-09-16 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2103](https://github.com/AgoraIO/shengwang-doc-source/pull/2103) docs: update RTSA license preauthorization | 2026-09-16 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2107](https://github.com/AgoraIO/shengwang-doc-source/pull/2107) Update quick-start-agent.mdx | 2026-09-17 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2109](https://github.com/AgoraIO/shengwang-doc-source/pull/2109) docs: clarify cloud recording robot fees | 2026-09-18 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2101](https://github.com/AgoraIO/shengwang-doc-source/pull/2101) docs(convoai): publish v2.13 filler words docs | 2026-09-18 | 6 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2110](https://github.com/AgoraIO/shengwang-doc-source/pull/2110) docs(smart-doorbell): hide aPaaS solution content | 2026-09-20 | 3 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2108](https://github.com/AgoraIO/shengwang-doc-source/pull/2108) docs: add Android Gradle Maven CDN guidance | 2026-09-21 | 5 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2112](https://github.com/AgoraIO/shengwang-doc-source/pull/2112) fix: update content moderation snapshot billing link | 2026-09-21 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2113](https://github.com/AgoraIO/shengwang-doc-source/pull/2113) [AUTO] fix: point RTC 4.6.2 API archive to available version | 2026-09-22 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2114](https://github.com/AgoraIO/shengwang-doc-source/pull/2114) docs: correct VoIP encryption mode enum values | 2026-09-22 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2094](https://github.com/AgoraIO/shengwang-doc-source/pull/2094) feat: regenerate RTC 4.7.0 API reference HTML | 2026-09-22 | 46 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2098](https://github.com/AgoraIO/shengwang-doc-source/pull/2098) docs: add RTC Native 4.7.0 release notes draft | 2026-09-22 | 15 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2115](https://github.com/AgoraIO/shengwang-doc-source/pull/2115) [DF-073] Correct cloud recording captureInterval range | 2026-09-30 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2091](https://github.com/AgoraIO/shengwang-doc-source/pull/2091) Cloud recording raw update | 2026-10-09 | 12 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2116](https://github.com/AgoraIO/shengwang-doc-source/pull/2116) docs: clarify realtime audio and video blocklist behavior | 2026-10-09 | 11 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2118](https://github.com/AgoraIO/shengwang-doc-source/pull/2118) docs: fix mini program event parameters | 2026-10-10 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2056](https://github.com/AgoraIO/shengwang-doc-source/pull/2056) [DF-012] Update renew token callback docs across platforms | 2026-10-10 | 12 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2122](https://github.com/AgoraIO/shengwang-doc-source/pull/2122) docs(rtc): prepare Web SDK 4.24.9 docs | 2026-10-14 | 9 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2119](https://github.com/AgoraIO/shengwang-doc-source/pull/2119) docs: update RTM API usage limits | 2026-10-14 | 3 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2124](https://github.com/AgoraIO/shengwang-doc-source/pull/2124) docs: remove unsupported Top N Console note | 2026-10-14 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2125](https://github.com/AgoraIO/shengwang-doc-source/pull/2125) docs: specify POST method in license curl examples | 2026-10-19 | 5 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2127](https://github.com/AgoraIO/shengwang-doc-source/pull/2127) Update Dockerfile | 2026-10-19 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2128](https://github.com/AgoraIO/shengwang-doc-source/pull/2128) fix: 修正历史 API 归档链接 | 2026-10-20 | 5 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2111](https://github.com/AgoraIO/shengwang-doc-source/pull/2111) docs(rtc): add HarmonyOS 4.6.3 release notes | 2026-10-21 | 266 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2126](https://github.com/AgoraIO/shengwang-doc-source/pull/2126) Codex/release docs convoai v2.14 | 2026-10-22 | 7 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2129](https://github.com/AgoraIO/shengwang-doc-source/pull/2129) docs(convoai): 补充 v2.14 被打断轮次的播放时长字段（TEN-7965） | 2026-10-22 | 3 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2121](https://github.com/AgoraIO/shengwang-doc-source/pull/2121) docs: merge R&D Whiteboard and Fastboard updates | 2026-10-27 | 1269 | 确认新遗漏；本次补齐 Web Globals 的 9 类型入口 |
| [#2131](https://github.com/AgoraIO/shengwang-doc-source/pull/2131) docs: 补齐 Whiteboard 和 Fastboard API 历史版本入口 | 2026-10-28 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2134](https://github.com/AgoraIO/shengwang-doc-source/pull/2134) docs: fix media pull video profile reference links | 2026-10-30 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2133](https://github.com/AgoraIO/shengwang-doc-source/pull/2133) docs: 同步 AI 工具包文档并新增 AI 快速接入与 CLI 指南 | 2026-10-30 | 330 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2136](https://github.com/AgoraIO/shengwang-doc-source/pull/2136) docs: clarify screen source enums across platforms | 2026-10-30 | 12 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2139](https://github.com/AgoraIO/shengwang-doc-source/pull/2139) docs: fix Legacy recording API version display | 2026-10-30 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2135](https://github.com/AgoraIO/shengwang-doc-source/pull/2135) docs: hide unsupported Stream Channel guidance on mini program | 2026-10-30 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2140](https://github.com/AgoraIO/shengwang-doc-source/pull/2140) docs: restore API feedback fixes lost during regeneration | 2026-10-30 | 4 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2143](https://github.com/AgoraIO/shengwang-doc-source/pull/2143) docs: remove disabled dual stream behavior release notes | 2026-11-02 | 5 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2132](https://github.com/AgoraIO/shengwang-doc-source/pull/2132) docs: 更新 Linux Server C++ SDK 4.4.33 文档 | 2026-11-03 | 202 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2144](https://github.com/AgoraIO/shengwang-doc-source/pull/2144) docs: 调整内容审核检查项并补充副歌片段计费说明 | 2026-11-05 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2145](https://github.com/AgoraIO/shengwang-doc-source/pull/2145) docs(convoai): 调整快速开始页鉴权说明 | 2026-11-05 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2138](https://github.com/AgoraIO/shengwang-doc-source/pull/2138) docs(cloud-recording): 完善 v2 迁移、Webhook 与文件命名说明 | 2026-11-06 | 7 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2150](https://github.com/AgoraIO/shengwang-doc-source/pull/2150) 删除 RTC 服务端 SDK 4.4.33 的 connectionIp 接口变更说明 | 2026-11-10 | 2 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2151](https://github.com/AgoraIO/shengwang-doc-source/pull/2151) 补充违规音频复核步骤及脱敏截图 | 2026-11-10 | 3 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2146](https://github.com/AgoraIO/shengwang-doc-source/pull/2146) docs(rtm2): 添加在线体验入口和 Web 场景最佳实践 | 2026-11-10 | 19 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2142](https://github.com/AgoraIO/shengwang-doc-source/pull/2142) docs(convoai): 更新 v2.15 语音供应商及 Agents SDK 文档 | 2026-11-11 | 5 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2155](https://github.com/AgoraIO/shengwang-doc-source/pull/2155) docs(cloud-recording): 补充互动白板页面录制 forceCanvas 配置 | 2026-11-12 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2147](https://github.com/AgoraIO/shengwang-doc-source/pull/2147) docs(rtc): 完善 iOS/macOS SDK 集成与下载说明 | 2026-11-16 | 10 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2157](https://github.com/AgoraIO/shengwang-doc-source/pull/2157) docs: 同步 AI 快速接入工具包介绍与 SDK 说明 | 2026-11-16 | 1 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2152](https://github.com/AgoraIO/shengwang-doc-source/pull/2152) docs(rtc): release Web SDK 4.24.10 documentation and downloads | 2026-11-16 | 79 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2153](https://github.com/AgoraIO/shengwang-doc-source/pull/2153) docs(rtm2): 补齐五个平台的语聊房和 1V1 呼叫邀请最佳实践 | 2026-11-17 | 22 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2148](https://github.com/AgoraIO/shengwang-doc-source/pull/2148) docs(rtm2): Native 2.3.1 在线状态查询文档 | 2026-11-17 | 40 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
| [#2159](https://github.com/AgoraIO/shengwang-doc-source/pull/2159) docs(rtm2): 修正 2.3.1 发布日期并补齐 CocoaPods 依赖说明 | 2026-11-17 | 13 | 本轮未新增确认遗漏；按最终源/当前目标筛查 |
