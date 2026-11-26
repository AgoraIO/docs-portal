# 中文旧站增量同步（2026-11-10）

PR：[docs-portal #1407](https://github.com/AgoraIO/docs-portal/pull/1407)，目标为中文建设分支；草稿待审，不是生产发版。

## 固定范围与状态

旧站 `AgoraIO/shengwang-doc-source/master` 从 `72dd878e3703f154f26d9fb1bf5274b465a6c2cb`（0.0.537）同步至固定终点 `b5f0771fd840b2e6c45b28357c206bbe94129767`（0.0.542）。逐项核对 18 个 first-parent 提交、13 个内容 PR、569 个净变化源文件，不按 PR 编号推断顺序。

上批 [#1338](https://github.com/AgoraIO/docs-portal/pull/1338) 于 2026-10-30 实际合并为 `3110fcacf2ccb5ad5ce55743109f428506496637`，其源终点成为本轮有效起点。目标固定于中文建设分支 `codex/cn-newdoc-html-api-migration` 的 `86876707fc1865cfee4e447e2b2c183c650f8b00`；工作分支 `codex/cn-master-hotfix-20261110`。主工作区未提交文档保留，旧站内容只读。

本轮尚未合并或生产部署；实际合并后，下一轮才可从固定 0.0.542 终点继续。机器状态见 [批次 JSON](./cn-master-sync-20261110.json)、[逐源台账](./cn-master-sync-20261110-ledger.json)、[统一断点](./cn-hotfix-checkpoint.md)。

## 逐 PR 处置

| 源 PR | 新站处置 |
| --- | --- |
| [#2134](https://github.com/AgoraIO/shengwang-doc-source/pull/2134) | Media Pull 帧率、码率的输出视频参考链接指向新站已有参考页。 |
| [#2133](https://github.com/AgoraIO/shengwang-doc-source/pull/2133) | introduction 已完整覆盖四篇 AI 工具正文；216 个代理、110 个旧侧栏沿用集中入口及隐藏/退役产品决定，不复制产品正文。 |
| [#2136](https://github.com/AgoraIO/shengwang-doc-source/pull/2136) | 补齐 12 平台视频源枚举屏幕采集说明，保留原锚点、链接。 |
| [#2139](https://github.com/AgoraIO/shengwang-doc-source/pull/2139) | 保留 Legacy 独立版本范围；33 个 C++ Legacy 页用同一静态 Fumadocs include 标明 1.x–3.x、不适用 4.x并链接当前 API；未复制旧渲染器或扩张到 Java。 |
| [#2135](https://github.com/AgoraIO/shengwang-doc-source/pull/2135) | 仅移除 RTM 小程序平台不支持的 Stream Channel 内容。 |
| [#2140](https://github.com/AgoraIO/shengwang-doc-source/pull/2140) | 恢复 Android 网络重连、C++/macOS 屏幕目录、HarmonyOS LogConfig 源修正。 |
| [#2143](https://github.com/AgoraIO/shengwang-doc-source/pull/2143) | 删除五平台已禁用双流行为说明，保留版本折叠、原锚点及其他正文。 |
| [#2132](https://github.com/AgoraIO/shengwang-doc-source/pull/2132) | RTC Server C++ 4.4.33：完整 Metadata API、配置/NTP、索引、版本与归档；新指南、示例目录、发版和两架构下载入口；Java 保持 4.4.32。 |
| [#2144](https://github.com/AgoraIO/shengwang-doc-source/pull/2144) | 六份 KTV 计费副本补副歌规则；内容审核移除源已撤销的验签检查项。 |
| [#2145](https://github.com/AgoraIO/shengwang-doc-source/pull/2145) | 同步 AI 快启鉴权措辞及两条删除，保留其余 Token/示例和链接。 |
| [#2138](https://github.com/AgoraIO/shengwang-doc-source/pull/2138) | 六篇云录制指南和 OpenAPI：raw 迁移、serviceScene、stranded、移除事件 33、截图模式、AAC/MP3 命名。 |
| [#2150](https://github.com/AgoraIO/shengwang-doc-source/pull/2150) | 使用最终源，不恢复已删除的 connectionIp 发版说明。 |
| [#2151](https://github.com/AgoraIO/shengwang-doc-source/pull/2151) | 补违规音频复核步骤和两张原始脱敏截图，使用正确列表结构及新站服务开通链接。 |

## 保留与排除

采用源前、源后、目标三方对照，只补真实增量。没有改变共享渲染器、导入器、依赖或 QA 规则。API 独立源保真与迁移规范审查通过；初审发现的类索引两个入口和 Legacy 逐页提示遗漏已修复后独立复核。

搜索索引、成员辅助页和源码视图逐项分类。目标已有的 `classes.mdx` 已更新，未作为辅助页跳过；`annotated`/`hierarchy` 没有既有目标文章，不另造重复入口。旧站构建计数及未公开的 `_release-notes-en.cpp.mdx` 不发布为新文章，英文站未改动。新旧入口的完整 301 映射仍遵循独立重定向工作，本批不新增整站重定向规则。

## 图片、下载与历史入口

两张截图的源 Git 字节原样保存在 `public/img/content-moderation/`，用于正式正文，不是 QA 截图。本机无中文 OSS 工具，先用本地资源并登记待上传；没有猜测 CDN 地址、读取凭据或调用 Global S3 流程。收到实际图床 URL 后才能替换并验证。交接见 [images.tsv](./cn-master-sync-20261110-images.tsv)。

两个 4.4.33 ZIP 均返回 HTTP 200、`application/zip`。历史入口 `/archive/0.0.539/api-ref/rtc-server-sdk/cpp/overview` 返回 HTTP 200、对应 API HTML；响应没有 4.4.32 字符串，SDK/归档配对依据源版本元数据，未独立确认归档内 SDK 版本。

## 验证记录

固定目标未改动基线：`bun run test --maxWorkers=2`，362 文件通过、1 跳过；5841 项通过、11 跳过、0 失败，202.42 秒。

API 局部检查：58 个文章 MDX 按当前配置编译通过；33 个 include 实际展开恰好一次；34 处新增本地链接及 1645 个显式 ID 无断链、丢失或新增重复；两 YAML 可解析且 operation 集合不变。首轮 API 源门禁为 0 新增重复、2 已知记录、0 过期豁免，不能写为既有债务全部清除。

最终全量测试为 5841 项通过、11 项跳过、0 失败（362 文件通过、1 跳过，214.08 秒）；类型检查通过，7037 篇表格结构零错误。新增指南平台徽标已按 titlePlatforms 约定修正后复核。四份旧内容断言已按源后要求更新，370 项定向检查通过；最后仅将测试正则的双空格写法改为等价量词以消除新增格式警告。完整 Lint 的 10 项错误、22 项警告、3 项提示与干净目标基线相同，未放宽规则。

最终提交的中文生产构建、API smoke 与受影响页面桌面/手机阅读记录在目标 PR 的验收区；它们与本地 source fingerprint 绑定。提交冻结前一次构建因修正测试正则格式告警而中断，未计为构建通过。源码及规范独立审查通过，API owner / release owner 的发布接受仍需另行记录。

## 待办与验收边界

继续携带上批动态配置 SVG 图床上传、HarmonyOS 0.2.11 源日期差异、历史 FastLogger 链接待办；本批新增两张审核截图的图床上传待办。

Android BANNED_BY_SERVER 源说明仍笼统使用 leaveChannel，其他段落区分 Ex 方法；Server 视频源枚举措辞也与单独更新的 RTC 平台有差异。本批分别保留权威源，由 API owner 决定后续语义统一。

自动检查与代理独立审查不代替 API owner 语义接受及 release owner 正式发布决定。本批准备可审查增量，不自动合并、发布旧站或部署生产。
