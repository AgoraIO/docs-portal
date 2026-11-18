# 源 PR #2091：云端录制 API 指南副本补齐

日期：2026-10-19。工作分支：`codex/fix-hotfix-pr2091-copies`。轻量阶段先交付 `READY_WITHOUT_FULL`，随后按主控独占窗口授权完成全量回归；当前验证完成、待主控规格/质量双审，未 push、未创建 PR。

## 固定来源及写集

- 源 PR：[AgoraIO/shengwang-doc-source #2091](https://github.com/AgoraIO/shengwang-doc-source/pull/2091/files)，固定提交 `af693efea0f640e39659a64d230760abf7e79928`，只读 Git 对象，不读取源仓库环境配置或修改源工作区。
- 目标固定基线：`7c6c60ead44406e69906c5c3808cd489784aa89e`。此前 [docs-portal #1215](https://github.com/AgoraIO/docs-portal/pull/1215) 已同步产品主线、旧版页、Go、中文 raw YAML 与英文 v1 默认值，本次不重复修改。
- 仅修改两个正文文件：
  - `content/docs/zh-CN/api-reference/cloud-recording/restful/user-guides/individual-mode/set-individual.mdx`
  - `content/docs/zh-CN/api-reference/cloud-recording/restful/user-guides/manage-file/introduce-recorded-files.mdx`
- 对应主线分别为 `content/docs/zh-CN/realtime-media/cloud-recording/build/recording-modes/individual-mode/set-individual.mdx` 和 `build/manage-recorded-files/introduce-recorded-files.mdx`。本次使用固定目标基线内已同步的主线正文作为等价参考，两副本 body 与其逐字一致。
- API 标题分别为“实现单流录制”“录制文件介绍”；保留两个 API 页原 `_migration` 的 type/status/sourceUrl/sourcePath/generator/warnings，不复制主线 frontmatter。已逐字验证：副本 frontmatter 除 title 行外与基线完全相同。

## 完整源文件与 hunk 映射

检查了源提交的全部 12 个文件及实际变更。下表将源 hunk 分组映射到“已在基线承接”或“本次两个 API 副本遗漏”；不把已同步部分再次纳入写集。路径中 `产品/` 代表 `content/docs/zh-CN/realtime-media/cloud-recording/`，`API/` 代表 `content/docs/zh-CN/api-reference/cloud-recording/restful/`。

| 源文件 / hunk | 基线主线或既有承接 | API 副本本次处理 |
| --- | --- | --- |
| `docs-api-reference/cloud-recording/go-api/struct.go.mdx`：MaxVideoDuration 120 → 180 | `content/docs/zh-CN/api-reference/cloud-recording/go-api/struct.go.mdx` 已是 180 | 不改；既有测试保护 |
| `docs/cloud-recording/_en-only/cloud-recording.md`：约 2 → 3 小时、页面默认 120 → 180 | 英文 `content/openapi/cloud-recording/cloud-recording.en.yaml` 已承接 v1 默认值 | 不向英文引入中文 raw 模式，不改 YAML |
| `_sidebar_.meta.js`：更名“实现单流录制”、隐藏单流不转码项 | 产品 individual-mode `meta.json` 已只列 set-individual | API 副本标题同步；API 侧栏无需额外改动，证据见下 |
| `overview/release-notes.mdx`：2026.10.08 v1→v2 升级段落、两条历史记录转旧版链接 | 产品 `reference/release-notes.mdx` 已在，既有 9 项回归覆盖历史链接 | 不改发版页；新副本旧版入口指向已存在的产品 legacy 页 |
| `individual-mode/legacy-set-individual.mdx`：新增完整 v1 指南 | 产品同名 legacy 页已在，保留 individual/streamMode/旧请求示例 | 不再创建 API legacy 页，不改原旧版正文 |
| `individual-mode/set-individual.mdx`：标题、引言和新版/旧版 notice | 产品 set-individual 已在 | API set-individual 标题、引言、notice 及 canonical 旧版入口同步 |
| 同上：mode raw、移除 streamMode、streamTypes 0/1/2 的 HLS/MP3/MP4 组合与单独 mp3/mp4 不支持 | 产品配置表及原生 Tabs/Slot 已在 | API 副本完整同步相同配置及输出描述，不保留旧 default/standard 章节 |
| 同上：start 从 acquire 示例改 raw/start，stop 改 raw/stop，请求追加 mp4 | 产品请求示例已在 | API 副本同步请求示例、配置字段及 raw start/stop |
| 同上：单流直接 MP4 条件，Native orientationMode/DEGRADATION_PREFERENCE，Web detail，分辨率变化与合流替代方案 | 产品独立 MP4 小节已在 | API 副本同步全部小节，保留基线绝对链接 |
| 同上：stranded、删旧音视频编码输出/standard 注意事项、重组开发注意/相关文档/API/FAQ 标题 | 产品已在 | API 副本按主线 body 同步，包括 stranded 分支和现有 acquire/start/stop 参考 |
| `manage-file/legacy-introduce-recorded-files.mdx`：新增完整旧版命名/切片及示例 | 产品同名 legacy 页已在 | 只链接到已存在旧版页，不复制/修改旧版 |
| `manage-file/introduce-recorded-files.mdx`：新版 notice、raw 适用范围 | 产品新文件说明已在 | API 文件说明同步 notice、旧版入口、raw 边界 |
| 同上：H.264/H.265、VP8/VP9、AV1、纯音频各类文件名，codec/index/stream index/segment index、AV1 m4s/init、MP3 | 产品各 codec 分组、命名字段表和示例已在 | API 副本由 type/utc 旧命名更新为同一新命名，保留原生 Markdown/Slot |
| 同上：索引按 codec 分开、旋转/分辨率/编码器变化、MP4 3 小时/2GB、MP3 30～120 默认30、其他模式 HLS sliceDuration/MP4 maxVideoDuration | 产品切片小节已在 | API 副本按实际对应小节完整同步；180 分钟的 Go/YAML 定义不重复加到不适用的正文位置 |
| 同上：异常上传/HA 文件名、H.264/AAC M3U8 示例后缀 | 产品示例已在 | API 副本同步 codec 文件名及 bak0 示例 |
| `manage-file/playback.mdx`：合流 3 小时，页面默认3小时/配置值优先 | 产品 playback 已在 | 不改播放指南、任何旁支 API 副本或全站旧页 |
| `html-docs/cloud-recording/cloud-recording.yaml`：4 处删除 streamMode、3 处 mp4/mp3 示例、raw mode/snapshot、删 schema、3小时/180/stranded | 中文维护 YAML 已承接；既有测试解析 schema/示例验证 | 不改维护源或 public 副本 |
| `docs/superpowers/plans/2026-09-08-single-stream-mp4-limitations.md` 与 `specs/...design.md` | 源内部计划/设计，不是发布文档；以实际最终正文为准 | 不发布、不当作运行指令，不按内部草案补写最终正文没有的 SDK 版本/Seek 说明 |

## 导航与存量入口边界

- `API/meta.json` 使用显式 pages 白名单，没有 `set-individual-without-transcoding`，也没有 `...` 自动展开。上层 `content/docs/zh-CN/api-reference/cloud-recording/meta.json` 设置 `sidebarHidden: true`、只列 go-api/java-api；本次没有发现需要为源隐藏项扩展 meta 写集的证据。
- API 目录中没有 user-guides 下的独立 meta，不能为了清理 direct route 擅自增添导航机制。源未删除旧版/不转码页面，本次同样不删已隐藏的 direct legacy route。
- 两页现有入站 fragment 引用共 5 处，来自 `API/get-started/quick-start-go.mdx` 和 `API/user-guides/manage-file/convert-format.mdx`，使用 `#页面录制模式`、`#录制文件组成及命名规则`、`#服务器断网或进程被杀`。新正文仍保留这些章节，逐条按 slug 验证通过，不需要新增 redirect/runtime 或伪造锚点。

## RED → GREEN 与轻量验证

新增 `src/lib/cloud-recording-pr2091-api-copies-sync.test.ts`，按两页真实 MDX、适用章节和配置块断言，并对主线 body 一致性、API provenance 全部原字段与 warnings 原值、新/旧 notice、旧版目标文件及隐藏导航进行保护。

| 检查 | 结果 |
| --- | --- |
| `bun install --frozen-lockfile` | 成功，清单/锁文件未改 |
| 修改前既有 `cloud-recording-pr2091-sync.test.ts` | 1 文件、9/9 通过 |
| 新测试 RED（正文未改） | 11 项：**9 失败、2 通过**；失败来自副本正文/标题缺失，不是导入或路径错误 |
| 新测试 + 既有 #2091 回归 GREEN | 2 文件、**20/20 通过** |
| 独占完整 `bun run test --maxWorkers=4` | **退出码 0，222 文件通过、2876 测试通过、2 跳过（共2878）**；开始 18:42:09，总 **85.01 秒**；未改任何测试或 timeout |
| `bun run types:check` | 退出码 0 |
| 新测试 Biome | 1 文件通过 |
| 两修改 MDX `analyzeMdxBuildSyntax` | 2 文件均 0 问题 |
| 实际 MDX 编译 | 两页剥离 frontmatter 后，使用 @mdx-js/mdx + remark-directive + remarkDirectiveAdmonition（项目六类 callout、jsx:true）均编译通过 |
| 两页 `auditDocsLinks`（sourcePaths 仅两修改文件） | 共 38 条链接，含 13 处 fragment；invalidInternalLinks / missingHashLinks / missingRootLinks / missingRelativeMarkdownLinks 均为空；3 个外部链接未做网络可达性验证 |
| 存量入站 fragment 检查 | 上述 5 处、3 种锚点全部可定位 |
| provenance/body 自审 | API frontmatter 仅 title 可变，其余逐字保持；两副本 body 与固定基线主线逐字一致 |
| 写集保护 | 产品主线全目录、Go、维护 YAML、public、legacy、API meta 对 HEAD diff 均为 0；没有新增 include/redirect/runtime/历史页 |
| `git diff --check` | 通过 |

轻量阶段遵守主控排队约束，没有启动 full/build/preview；后续仅在明确授权的独占窗口运行上述完整测试，结束后立即通知释放窗口。测试日志仍有 Node `--localstorage-file`、`socket hang up` 和 happy-dom 禁止脚本加载等 stderr，但最终退出码 0、全部测试文件通过，不把通过表述为没有任何警告。**没有运行 build 或 preview**，不宣称已完成浏览器验收、独立双审、合入或线上发布；本地提交后交主控继续双审。

## 保留的源语义问题

源最终单流指南称 AV1 可直接生成 MP4，而文件命名页称 AV1 不支持 MP4；源发版说明称音频可直接指定 mp3，而配置表将单独 `["mp3"]` 标为不支持。此前主线同步记录已保留这些冲突，本次按已同步主线等价策略完整复制，不猜测产品事实或扩展修正。旧版指南的 acquire 请求示例也按旧版继续保留，不改成新 raw 请求。
