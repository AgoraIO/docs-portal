# CN-NEWDOC 中文文档旧站到新站迁移审计报告

生成日期：2026-07-15  
审计对象：旧站中文文档迁移至新站中文文档  
新站基线：`docs-portal` 分支 `CN-NEWDOC`，提交 `f1479f4fb4f63c7be0d19481fc70a87d842a0a15`  
旧站基线：`shengwang-doc-source` 分支 `master`，提交 `0a34f7bcc84ce1f77a8c18c7b1ddbe7ff51f9ffd`  
审计口径：仅覆盖中文文档迁移，包括中文页面、中文 API Reference、中文 OpenAPI/API 页面、导航结构、平台分类、页面组件和静态资源引用。

本报告不审计英文文档，也不判断中英文内容一致性。英文源稿、英文 API Reference 草稿和英文同步差异不纳入本次中文迁移结论。

## 1. 审计概览

### 1.1 审计目标

本次审计目标是确认旧站中文文档迁移到新站后，已纳入本轮中文发布范围的内容是否完整、正确、可追溯，并识别不迁移、暂缓迁移和需要后续决策的内容范围。

重点检查项包括：

- 旧站中文页面到新站中文页面的迁移闭环。
- 标题、正文、代码块、表格、图片、链接、附件和页面元信息的保真情况。
- 产品线、平台、API Reference、OpenAPI、导航结构和页面组件的迁移状态。
- `blocked`、`deferred`、`dropped`、`not_required` 等非完成项的归因是否清晰。
- 发布前仍需验证的风险点。

### 1.2 审计范围

| 范围 | 审计对象 |
| --- | --- |
| 旧站中文内容 | 旧站 `docs`、`docs-api-reference`、`shared`、`html-docs` 中与中文迁移相关的内容 |
| 新站中文内容 | 新站 `content/docs/zh-CN/**` |
| 导航结构 | 新站一级目录、产品目录、平台目录、API Reference 目录和 `meta.json` 导航 |
| 平台分类 | Android、iOS、Web、macOS、Windows、Flutter、React Native、Unity、Electron 等平台 |
| 页面组件 | Callout、Tabs、CodeTabs、平台 variants、Cards、Steps、Accordion、API reference 和示例代码组件 |
| 静态资源 | 图片、附件、视频、下载资源和页面引用资源 |
| OpenAPI/API 文档 | `content/openapi` 源文件、API Reference 页面和生成类 API 页面 |

### 1.3 审计方法

| 方法 | 用途 |
| --- | --- |
| 全量映射核查 | 核对旧路径、新路径、重定向状态、迁移状态和审计状态 |
| 自动化内容保真检查 | 对已迁移页面进行正文、标题、代码块、表格、链接和平台投影比对 |
| 结构化统计 | 按产品线、平台、文档类型、迁移状态和审计状态统计 |
| 人工复核 | 对平台差异、组件变化、API Reference 和高风险页面进行抽样确认 |
| 风险分级 | 按影响范围、严重程度、发生概率和可修复性归类 |
| 可追溯性矩阵 | 将旧站来源、新站目标、迁移状态、审计结果和后续动作绑定 |

## 2. 总体审计结论

当前中文迁移主范围已经完成闭环。纳入本轮中文重定向发布范围的 1859 条迁移映射均已完成迁移并通过内容保真审计。

| 指标 | 数量 | 结论 |
| --- | ---: | --- |
| 迁移映射总量 | 2574 | 覆盖中文迁移控制范围 |
| 本轮中文重定向迁移范围 | 1859 | 全部完成 |
| 已完成迁移 | 1859 | 100% 完成 |
| 已完成审计 | 1859 | 100% 完成 |
| 审计通过 | 1859 | 100% 通过 |
| 内容保真异常 | 0 | 未发现阻塞性异常 |
| Legacy JSX 残留 | 0 | 未发现阻塞性残留 |

结论：

- 本轮中文重定向迁移范围内的页面已经完成迁移、审计和结果闭环。
- 当前未进入完成状态的内容主要属于 `blocked`、`deferred`、`dropped`、`not_required` 和少量 `ready`，这些不应直接视为中文站内容缺失。
- `blocked` 代表无法安全迁移，需要产品 IA、API lane 或归属决策。
- `deferred` 代表本轮暂不迁移，通常是未进入 active redirect 对、shared 片段、FAQ/basics/HTML API 待 IA 决策，或英文 API Reference 稿。
- 从内容迁移角度看，中文主迁移范围已达到可发布标准；正式发布前仍应完成链接、构建、类型检查和 OpenAPI 产物验证。

## 3. 迁移前后数据量对比

### 3.1 新站中文文档数据量

| 指标 | 数量 |
| --- | ---: |
| `content/docs/zh-CN` Markdown/MDX 页面 | 5106 |
| `content/openapi` YAML/JSON 源文件 | 31 |
| `public` tracked 文件 | 32 |
| `public/openapi` tracked YAML/JSON | 0 |

说明：`public/openapi` 为生成产物路径，发布前需要通过 OpenAPI 同步和构建流程确认产物生成正常。

### 3.2 新站中文一级目录分布

| 一级目录 | 页面数 |
| --- | ---: |
| `api-reference` | 4234 |
| `realtime-media` | 488 |
| `solutions` | 315 |
| `ai` | 46 |
| `introduction` | 23 |

### 3.3 旧站源数据量

| 旧站目录 | 文件总数 | Markdown/MDX | HTML | YAML/JSON |
| --- | ---: | ---: | ---: | ---: |
| `docs` | 1904 | 1737 | 0 | 0 |
| `docs-api-reference` | 456 | 384 | 0 | 0 |
| `shared` | 37 | 37 | 0 | 0 |
| `html-docs` | 10324 | 3 | 8542 | 26 |

说明：旧站原始文件数量不等于本轮必须迁移数量。迁移范围以中文站 IA、重定向策略、产品归属和 API 文档发布策略共同确定。

## 4. 迁移状态汇总

### 4.1 当前迁移状态

| 状态 | 数量 | 外部解释 |
| --- | ---: | --- |
| completed | 1859 | 已迁移、已审计、已通过 |
| deferred | 527 | 本轮暂缓，不属于当前中文重定向发布必要范围 |
| blocked | 86 | 缺少目标 IA、产品归属或 API lane 决策，不能安全迁移 |
| dropped | 86 | 已明确不迁移 |
| not_required | 12 | 本轮不需要迁移 |
| ready | 4 | 可处理但未纳入本轮完成范围 |

### 4.2 当前审计状态

| 状态 | 数量 |
| --- | ---: |
| completed | 1859 |
| not_required | 625 |
| not_started | 90 |

| 审计结果 | 数量 |
| --- | ---: |
| pass | 1859 |
| not_applicable | 715 |

解释：

- 所有纳入本轮中文重定向迁移范围的 1859 条记录均已完成审计并通过。
- `not_required` 和 `not_applicable` 主要对应暂缓、忽略、已删除或本轮无需迁移的内容。
- 后续治理重点是确认 `blocked` 和 `deferred` 中是否有内容需要进入下一轮迁移，而不是修复当前主迁移范围。

## 5. Blocked 内容为什么不迁

`blocked` 共 86 条。此类内容并非技术漏迁，而是缺少足够确定的目标 IA、产品归属或 API lane。若在未确认前直接迁移，可能导致内容进入错误产品目录、错误 API Reference lane，或把示例/测试内容发布到正式中文站。

### 5.1 Blocked 按处理状态

| 处理状态 | 数量 | 说明 |
| --- | ---: | --- |
| ignore | 70 | 明确不进入本轮迁移，多为示例、dummy、无目标产品目录 |
| defer | 16 | 暂缓，主要为 API Reference 或 OpenAPI lane 需要进一步决策 |

### 5.2 Blocked 按来源类型

| 来源类型 | 数量 | 说明 |
| --- | ---: | --- |
| docs | 56 | 普通文档，但目标产品 IA 未确认，或属于测试/示例目录 |
| docs-api-reference | 23 | API Reference 源，但缺少已批准目标目录或 lane |
| openapi | 7 | 无法安全推断 OpenAPI lane |

### 5.3 Blocked 按产品线

| 产品线 | 数量 | 主要原因 |
| --- | ---: | --- |
| agora-product | 36 | 示例目录，没有真实目标产品目录 |
| dummy-product | 24 | Dummy/测试内容，不进入正式中文新站 |
| recording | 15 | API Reference 归属或中文目标目录未确认 |
| flexible-classroom | 8 | Dummy 或 API target 未批准，需要产品/API owner 决策 |
| iot-apaas | 1 | 旧产品入口 IA 未确认 |
| multi-usecase | 1 | 目标 IA 未确认 |
| toybox | 1 | 目标 IA 未确认 |

### 5.4 Blocked 原因归类

| 原因 | 数量 | 是否迁移 | 说明 |
| --- | ---: | --- | --- |
| 示例产品目录无正式目标 IA | 33 | 暂不迁 | 需要确认是否为真实产品内容 |
| Dummy/测试产品目录 | 13 | 不迁 | 不应进入正式中文站 |
| Recording API Reference 中文目标未确认 | 15 | 暂不迁 | 需要确认 API Reference 归属和目标目录 |
| OpenAPI lane 无法安全推断 | 7 | 暂不迁 | 需要 API owner 确认 lane、route prefix、operationId 策略 |
| Dummy API Reference | 4 | 不迁 | 测试内容，不进入正式站 |
| 示例 API Reference | 3 | 暂不迁 | 未确认是否属于真实产品 |
| flexible-classroom API/IA 未确认 | 8 | 暂不迁 | 需要产品 owner 判断是否保留 |
| 零散旧产品入口 IA 未确认 | 3 | 暂不迁 | 需要 IA 决策 |

Blocked 结论：

- 大部分 `blocked` 是有意不迁或不能安全迁，不是当前中文站内容缺失。
- 需要后续决策的重点是 OpenAPI lane、Recording API Reference 归属、Flexible Classroom 是否保留，以及少量旧产品入口 IA。
- 在 owner 明确前，不建议将 `blocked` 内容直接迁入新站。

## 6. Deferred 内容为什么不迁

`deferred` 共 527 条。此类内容全部属于本轮暂缓范围，含义是未进入当前中文 active redirect 迁移对，不作为本轮中文发布的必要迁移项。

### 6.1 Deferred 按来源类型

| 来源类型 | 数量 | 原因 |
| --- | ---: | --- |
| blank | 197 | 控制表保留项或非 active redirect 占位，不进入本轮迁移 |
| shared | 189 | shared 片段不是独立页面，只在被页面引用时展开或 include |
| docs-api-reference | 119 | 多为 API Reference 草稿或需要 API lane 决策 |
| docs | 22 | FAQ、basics、HTML API 等需要 IA 或分类决策 |

### 6.2 Deferred 按产品线

| 产品线 | 数量 | 说明 |
| --- | ---: | --- |
| blank | 197 | 非 active redirect/占位行 |
| shared | 189 | shared 片段，不作为独立页面迁移 |
| rtm2 | 90 | 多为 API Reference 草稿或非中文迁移范围内容 |
| rtc-server-sdk | 38 | 多为 API Reference 草稿或非中文迁移范围内容 |
| rtc | 10 | 多为 React API Reference 草稿 |
| cloud-recording | 2 | 暂缓项 |
| recording | 1 | 暂缓项 |

### 6.3 Deferred 明确原因

| 原因 | 数量 | 是否迁移 | 说明 |
| --- | ---: | --- | --- |
| FAQ taxonomy 未形成稳定中文目标树 | 110 | 暂不迁 | 需要决定 FAQ 是迁移、合并进产品文档，还是归档 |
| Generated HTML API 需要源/生成器/fragment/IA 确认 | 36 | 暂不迁 | 需要确认生成器、锚点保留策略和目标 API Reference IA |
| Basics 页面可能合并到 introduction/best-practices/reference | 14 | 暂不迁 | 需要 IA 决策，不能机械复制 |
| Shared snippets | 189 | 不作为独立页面迁移 | 仅在被目标页面引用时展开或 include |
| 非中文迁移范围的 API Reference 草稿 | 约 119 | 不纳入本次中文审计 | 不应作为中文页面缺失计算 |
| 非 active redirect/占位项 | 约 197 | 本轮不迁 | 没有进入当前迁移发布对 |

Deferred 结论：

- `deferred` 是范围控制，不是迁移失败。
- FAQ、basics、HTML API 如需后续迁移，应先完成 IA 和内容归并策略。
- shared 片段不能按“未迁页面”计算，因为它们不是独立页面。
- 非中文迁移范围的 API Reference 草稿不纳入本次中文审计结论。

## 7. Dropped、Not Required 和 Ready

| 状态 | 数量 | 解释 |
| --- | ---: | --- |
| dropped | 86 | 已明确不迁移 |
| not_required | 12 | 本轮不需要迁移 |
| ready | 4 | 可处理但未纳入本轮 completed 范围 |

建议：

- `dropped` 和 `not_required` 应保留决策记录，不应作为缺失内容处理。
- `ready` 数量较少，建议在下一轮范围确认时单独评估。

## 8. 内容完整性审计

### 8.1 已确认完整的范围

| 范围 | 数量 | 结论 |
| --- | ---: | --- |
| 本轮中文重定向迁移范围 | 1859 | 全部完成 |
| 内容保真审计通过 | 1859 | 全部通过 |
| Legacy JSX 残留 | 0 | 未发现阻塞性残留 |
| 阻塞性内容缺失 | 0 | 未发现 |

### 8.2 不计入缺失的范围

| 范围 | 数量 | 原因 |
| --- | ---: | --- |
| blocked | 86 | 目标 IA、产品归属或 API lane 未确认，或属于示例/dummy/测试内容 |
| deferred | 527 | 不在本轮 active redirect 对，或为 shared/FAQ/basics/HTML API/API 草稿 |
| dropped | 86 | 已明确不迁移 |
| not_required | 12 | 本轮无需迁移 |

## 9. 内容正确性审计

已迁移的 1859 条记录完成内容保真检查，覆盖：

- 标题、正文、段落结构。
- 代码块、表格、列表和引用块。
- 内链、外链、锚点和资源引用。
- 旧站页面到新站页面的路径关系。
- 平台差异内容在新站中的投影结果。
- Legacy JSX 和旧组件残留。

审计限制：

- 自动化检查不能替代产品专家对 API 语义、参数含义、版本策略和业务限制的人工判断。
- 复杂表格、平台差异示例、API Reference 和产品入口页仍建议在发布前抽样人工查看。
- 链接、构建、类型和 OpenAPI 产物生成需要通过发布前验证命令单独确认。

## 10. 各平台迁移审计

| 平台 | 总数 | 已完成 | 审计通过 | 完成率 | 已完成范围通过率 |
| --- | ---: | ---: | ---: | ---: | ---: |
| android | 247 | 205 | 205 | 83.0% | 100.0% |
| ios | 218 | 208 | 208 | 95.4% | 100.0% |
| javascript | 139 | 126 | 126 | 90.6% | 100.0% |
| unity | 68 | 55 | 55 | 80.9% | 100.0% |
| electron | 58 | 57 | 57 | 98.3% | 100.0% |
| windows | 57 | 55 | 55 | 96.5% | 100.0% |
| macos | 55 | 53 | 53 | 96.4% | 100.0% |
| restful | 54 | 43 | 43 | 79.6% | 100.0% |
| flutter | 53 | 44 | 44 | 83.0% | 100.0% |
| cpp | 48 | 38 | 38 | 79.2% | 100.0% |
| rn | 48 | 47 | 47 | 97.9% | 100.0% |
| harmonyos | 46 | 38 | 38 | 82.6% | 100.0% |
| go | 43 | 42 | 42 | 97.7% | 100.0% |
| java | 35 | 34 | 34 | 97.1% | 100.0% |
| swift | 28 | 18 | 18 | 64.3% | 100.0% |
| python | 26 | 25 | 25 | 96.2% | 100.0% |
| unreal-cpp | 19 | 19 | 19 | 100.0% | 100.0% |
| unreal-blueprint | 16 | 16 | 16 | 100.0% | 100.0% |
| react | 13 | 10 | 10 | 76.9% | 100.0% |
| mini-program | 11 | 11 | 11 | 100.0% | 100.0% |
| typescript | 4 | 4 | 4 | 100.0% | 100.0% |

说明：已完成范围通过率仅针对完成迁移的平台记录计算。未完成的 `blocked` 和 `deferred` 属于范围决策项，不进入通过率分母。

## 11. 小组件迁移审计

### 11.1 组件总体状态

| 指标 | 数量 |
| --- | ---: |
| legacy 组件类型 | 226 |
| 已分类组件类型 | 7 |
| 需要持续复核组件类型 | 219 |
| 高风险组件类型 | 35 |
| 中风险组件类型 | 191 |

### 11.2 高频组件迁移规则

| 旧站组件 | 出现次数 | 分类 | 风险 | 新站处理 |
| --- | ---: | --- | --- | --- |
| `Td` | 57334 | table | 高 | 简单表格转 GFM；复杂表格人工复核 |
| `Tr` | 19006 | table | 高 | 同表格行规则 |
| `Admonition` | 6156 | callout | 中 | 转为 Fumadocs/Markdown callout |
| `ListTitle` | 5334 | custom-mdx | 中 | 分类后转 Markdown，不保留 legacy JSX |
| `Table` | 4120 | table | 高 | GFM 表格或受控 HTML/slot table |
| `PlatformFilter` | 3594 | platform-variant | 高 | 拆页或转 `PlatformStructured` / `PlatformInline` |
| `TabItem` | 2024 | tabs | 中 | 转 code fence tabs 或 Fumadocs Tabs |
| `Image` | 1277 | media | 中 | 转 Markdown image |
| `LinkCardV2` | 540 | landing-or-card | 高 | 转 Markdown links/lists 或 Cards |

组件迁移结论：

- 旧站组件不按同名组件保留，统一迁移为 Markdown/Fumadocs 原生或新站允许的表达方式。
- 表格、平台过滤和卡片类入口是主要展示风险。
- 已完成迁移范围未发现阻塞性 legacy JSX 残留，但复杂组件页面仍建议发布前抽样人工查看。

## 12. OpenAPI 与 API Reference

| 项目 | 当前状态 | 风险 |
| --- | --- | --- |
| OpenAPI 源文件 | 31 个 | 需要确认 lane、source-text 注册和生成链路 |
| OpenAPI 迁移记录 | 23 条 | 部分记录因无法安全推断 lane 暂缓 |
| `public/openapi` tracked 文件 | 0 个 | 需要通过 OpenAPI 同步流程生成 |
| HTML API 样本 | 已有代表性样本验证 | 样本通过，但非全量生成链路验证 |

OpenAPI 结论：

- 已完成迁移范围内的文档内容审计通过。
- 7 条 OpenAPI 相关记录因无法安全推断 lane 暂不迁移，不应机械落地。
- 发布前必须确认 OpenAPI 同步、endpoint 渲染、类型检查和构建结果。

## 13. 旧站 Hot-fix 漂移风险

旧站在 2026-07-06 至 2026-07-07 存在多条可能影响迁移结果的提交：

| 提交 | 时间 | 标题 | 影响路径 |
| --- | --- | --- | --- |
| `0a34f7bcc` | 2026-07-07 16:19 | docs: update RTC Windows toolchain note | `docs/rtc/resources.windows.mdx` |
| `01a2d92db` | 2026-07-07 15:44 | docs: clarify Android spatial audio profile setup | `docs/rtc/advanced-features/spatial-audio.android.mdx` |
| `b68d8efb7` | 2026-07-07 15:27 | docs: update RTC mini program domain allowlist | `docs/rtc/basic-features/firewall.mini-program.mdx` 等 |
| `ed176aed2` | 2026-07-07 14:28 | docs: refine RTC firewall domain tip | `docs/rtc/basic-features/firewall.javascript.mdx` |
| `ec2791bd8` | 2026-07-06 18:00 | Update videoframe | `docs/rtc/advanced-features/custom-video-source.android.mdx`、`html-docs/rtc/Android/API/*.html` |
| `01aa8d823` | 2026-07-06 17:59 | Content moderation | `docs/content-moderation/**`、`docs/marketplace/**`、`docs/shared/marketplace/**` |

建议：这些提交不改变当前已完成迁移范围的审计结论，但发布前应做定向 diff，确认是否存在需要同步到新站的内容修订。

## 14. 风险点分析

| 风险 | 影响范围 | 严重程度 | 概率 | 证据 | 建议措施 |
| --- | --- | --- | --- | --- | --- |
| `blocked` 内容被误判为缺失 | IA 未确认内容、API Reference、OpenAPI | 中 | 中 | 86 条 blocked | 保持 blocked 决策记录，待 owner 明确后另行迁移 |
| `deferred` 内容被误纳入上线阻塞 | FAQ、basics、shared、HTML API、API 草稿 | 中 | 中 | 527 条 deferred | 明确 deferred 为范围控制项，不作为本轮 blocker |
| OpenAPI lane 不一致 | API Reference 和 OpenAPI 页面 | 高 | 中 | 7 条 OpenAPI blocked | 发布前由 API owner 确认 lane 和生成策略 |
| shared 片段误按页面统计 | shared 内容 | 中 | 中 | 189 条 shared deferred | 只在引用页面中核查展开结果 |
| 平台覆盖不一致 | 多平台页面 | 中 | 中 | 各平台完成率差异 | 发布前抽样检查低完成率平台 |
| 小组件渲染异常 | 表格、平台 variants、卡片、Tabs | 中 | 中 | 高风险组件 35 类 | 抽样检查复杂组件页面 |
| 链接或锚点失效 | 内链、外链、历史 URL | 高 | 中 | 需发布前链接验证 | 执行链接检查并修复 P0/P1 断链 |
| OpenAPI 产物未生成 | API endpoint 页面 | 高 | 中 | `public/openapi` 为生成产物路径 | 执行 OpenAPI 同步和构建 |
| 旧站 hot-fix 漂移 | 近期修订页面 | 中 | 中 | 2026-07-06 至 2026-07-07 旧站提交 | 发布前做定向 diff |

## 15. 审计发现表

| 编号 | 分类 | 问题描述 | 证据 | 严重程度 | 建议处理方 | 修复建议 | 优先级 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-001 | 迁移闭环 | 本轮中文重定向迁移范围已完成并通过审计 | 1859 条 completed/pass | 高 | 文档迁移负责人 | 保持映射表和审计结果归档 | P0 |
| F-002 | Blocked | 86 条内容缺少 IA、产品归属或 API lane 决策 | blocked 分类统计 | 中 | 产品 owner / API owner / IA owner | 明确是否迁移、归档或删除 | P1 |
| F-003 | Deferred | 527 条内容不在本轮 active redirect 迁移范围 | deferred 分类统计 | 中 | 文档 owner / 产品 owner | 作为后续范围决策项，不计入本轮缺失 | P1 |
| F-004 | Dummy/示例内容 | dummy-product、agora-product 多数不进入正式站 | 产品线归因 | 低 | 文档 owner | 保留不迁移决策记录 | P2 |
| F-005 | API Reference 草稿 | 非中文迁移范围 API 草稿不纳入本次审计 | API Reference 归因 | 低 | API owner | 另行确认是否有中文发布需求 | P2 |
| F-006 | Shared 片段 | shared 不是独立页面 | 189 条 shared deferred | 中 | 文档迁移负责人 | 在引用页面中核查展开效果 | P1 |
| F-007 | OpenAPI lane | 7 条 OpenAPI 无法安全推断 lane | OpenAPI blocked 统计 | 中 | API owner | 决定 lane、route prefix、operationId 策略 | P1 |
| F-008 | 发布验证 | 链接、构建、类型和 OpenAPI 产物仍需发布前确认 | 发布前验证清单 | 高 | 发布负责人 | 执行验证命令并修复阻塞项 | P0 |

## 16. 发布前建议

发布前建议至少完成以下验证：

```bash
bun run docs:links:strict
bun run docs:mdx-build-syntax
bun run openapi:sync
bun run types:check
bun run build
```

验收标准：

- 本轮中文重定向迁移范围保持 1859 条通过。
- 核心中文路径无 P0/P1 断链。
- OpenAPI 产物可以正常生成并被构建流程引用。
- 类型检查和生产构建通过。
- `blocked` 和 `deferred` 不作为本轮发布 blocker，除非产品 owner 明确要求纳入本轮上线范围。

## 17. 总体结论

本次中文文档迁移审计确认：`CN-NEWDOC` 本轮中文重定向迁移范围已完成，1859 条迁移记录全部完成审计并通过内容保真检查。

`blocked` 和 `deferred` 均不是迁移失败：

- `blocked` 表示缺少安全迁移所需的 IA、产品归属或 API lane 决策，或内容属于示例、dummy、测试、非正式发布范围。
- `deferred` 表示本轮暂不迁移，主要包括非 active redirect 项、shared 片段、FAQ taxonomy 未定、generated HTML API 待确认、basics 页面待合并策略和非中文迁移范围的 API 草稿。

因此，当前中文迁移主范围可以判断为已完成并具备发布条件。剩余 `blocked` 和 `deferred` 应作为后续范围决策、内容治理和 API lane 治理项处理，而不应作为当前中文迁移缺失项。
