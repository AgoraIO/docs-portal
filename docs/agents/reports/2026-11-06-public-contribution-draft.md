# docs-portal 对外贡献流程草稿

日期：2026-11-06。状态：供团队评审，以下建议尚未替换现有贡献指南或 GitHub 模板。

目标：让读者、客户开发者和同事都能通过 GitHub 提文档问题、补充需求或贡献修改，无须先了解仓库的开发流程。

## 现状与建议

基线说明：本 PR 基于默认分支 `main`。初稿同时参考了中文迁移分支的提交 `12fbdb428c4c6064c491bada447540e81aee4e86`；其中 API 验收规范、PR 专项验收和 `docs-feedback.ts` 尚未进入本次 `main` 基线。相关引用固定到该提交，属于待对齐的流程建议，不表示 `main` 已具备这些规则。

已通过 GitHub API 确认：`AgoraIO/docs-portal` 是公开仓库，默认分支为 `main`，已有 [CONTRIBUTING.md](https://github.com/AgoraIO/docs-portal/blob/main/CONTRIBUTING.md)、[4 个 Issue 表单及入口配置](https://github.com/AgoraIO/docs-portal/tree/main/.github/ISSUE_TEMPLATE)和 [PR 模板](https://github.com/AgoraIO/docs-portal/blob/main/.github/PULL_REQUEST_TEMPLATE.md)。本次不是从零建立流程。

目前需要补齐的地方：

- 贡献指南从本地环境搭建展开，没有给“我只想提个需求”的读者清晰路径。
- `docs-content.yml` 虽然接受 missing content，却要求必填已有页面 URL，无法自然表达“这个主题根本没有文档”。
- 没有明确小改是否需要关联 Issue、新文档何时先讨论、提交后由谁处理。
- 现有表单只有分类标签，没有自动附加仓库已使用的 `needs-triage`。
- PR 模板列出全部检查命令，但没有说明哪些与本次修改有关、哪些未执行及原因。
- 当前 fork PR 会被[部署工作流](../../../.github/workflows/vercel-deploy.yml)跳过预览部署，因此不能向外部贡献者承诺自动预览。

可选做法：

| 方案 | 收益 | 代价 |
| --- | --- | --- |
| 只补模板提示 | 改动最少，提交时能收集信息 | 提交前如何选择入口、提交后如何处理仍不清楚 |
| 简短贡献指南 + 调整现有模板（推荐） | 从提需求到 PR 审阅形成完整路径，复用已有文件 | 需要团队确认接收范围和维护职责 |
| 独立贡献者网站与自动分派系统 | 可承载大量贡献和多团队协作 | 当前尚无需求量与维护资源依据，首版不建议引入 |

首版面向中英文用户提供双语指引：保留英文 `CONTRIBUTING.md`，增加 `CONTRIBUTING.zh-CN.md` 并互相链接；README 的 Contributing 区域直接链接中英文指南及 Issue 选择器。表单采用简短双语标题和说明，允许中文或英文提交。

调研依据和不同项目的规则差异见[公开贡献流程调研](2026-11-06-public-contribution-research.md)。以下为本仓库的建议规则，不代表已经执行的服务承诺。

## 对外贡献指南正文（中文初稿）

本节可作为 `CONTRIBUTING.zh-CN.md` 的正文；发布时将仓库文件链接改为相对于根目录的链接，并同步英文版。

### 欢迎贡献

欢迎帮助我们改进 Agora / 声网文档。你可以报告错误、提出缺失文档的需求、建议更清楚的示例，或直接提交修改。提交 Issue 不需要搭建本地环境，也不要求你已经知道怎么修复。中文和英文反馈都欢迎。

### 选择适合的入口

先[搜索已有 Issue](https://github.com/AgoraIO/docs-portal/issues) 和 [PR](https://github.com/AgoraIO/docs-portal/pulls)。如果已有相同问题，可以在原讨论中补充你的使用场景。

| 你想做什么 | 怎么提交 |
| --- | --- |
| 文档有错误、过时、表述不清或步骤无法照做 | 在 [Issue 选择器](https://github.com/AgoraIO/docs-portal/issues/new/choose)选择 Documentation issue |
| 找不到某个主题、教程或示例 | 选择 Documentation issue，说明你想完成的任务；没有现成页面也可以提 |
| 文档站搜索、导航、显示或交互异常 | 选择 Docs site bug |
| 希望文档站增加功能或改善使用体验 | 选择 Feature request |
| 有文档阅读体验方面的意见，还无法定位具体问题 | 选择 Documentation feedback |
| 修复错字、死链或局部表达 | 可以直接提交 PR，无须先开 Issue |
| 新增主题、大幅改写文档、调整目录或改变网站行为 | 先开 Issue 对齐读者场景、范围和建议方案，再开始大规模修改 |

这里接收文档和文档站的改进。SDK、服务故障或账户问题请通过所使用产品的官方支持渠道处理；如果问题来自文档错误或说明缺失，也欢迎在这里提出文档 Issue，并引用可公开的相关信息。

不要在公开 Issue、PR、日志或截图中放入密钥、客户信息或未公开的资料。安全漏洞请按 [SECURITY.md](../../../SECURITY.md) 的私密报告指引处理。

### 怎样描述文档问题或需求

告诉我们你在使用哪个产品、平台及版本（如适用）、希望完成什么任务，以及被什么问题阻碍。

如果已有页面，请附页面链接和具体段落；如果没有，请描述缺失主题。知道正确写法时可以附建议、官方依据或可复现步骤，不确定时也可以只描述遇到的情况。

例如：

> 我想在 Android 项目中完成某产品的首次接入。现有快速开始写了初始化和调用步骤，但没有说明如何判断调用成功，也没有错误排查示例。希望补充成功时的预期结果和常见错误处理。相关页面：……；我使用的 SDK 版本：……。

### 怎样提交修改

1. 对于新主题或较大改动，先在 Issue 中确认范围。错字、死链和局部表达修正可以直接开始。
2. Fork 本仓库，从 `main` 创建分支。小幅文本修改也可以使用 GitHub 文件编辑器，按页面提示创建 fork 和 PR。
3. 在 `content/docs/en` 或 `content/docs/zh-CN` 下修改对应文档。找不到源文件时可以先提 Issue，由维护者帮助定位。
4. 按[Markdown 编写规范](../markdown-authoring-standard.md)编辑内容。新增或移动页面时检查附近的 `meta.json` / `meta.yaml` 导航配置及相关链接。
5. 检查修改，向本仓库的 `main` 提交 PR。说明改了什么、为什么、关联页面或 Issue，以及完成了哪些验证。尚在讨论的改动可以先开 Draft PR。

每个 PR 聚焦一个问题。涉及多个语言版本时，能同步修改就一起修改；不能同步时说明受影响的语言和差异，不要求贡献者为了提交单语言修正而完成另一语言的翻译。

API 参考内容或生成器的修改请遵循 [API reference quality contract（中文迁移分支）](https://github.com/AgoraIO/docs-portal/blob/12fbdb428c4c6064c491bada447540e81aee4e86/docs/api-reference-quality.md)，修改维护源文件，不直接改写生成页面或生成产物。维护者可帮助定位正确的修改入口。

### 本地预览与验证

提交需求不需要安装工具。如果需要本地编辑和预览，Node.js 和 Bun 版本以 [package.json](../../../package.json) 的 `engines`、`packageManager` 为准。在本地 clone 的仓库目录运行：

```bash
bun install
bun run dev
```

只检查某个文档子树时，可以使用范围预览，例如：

```bash
DOCS_DEV_SCOPE=en/ai/openai-realtime bun run dev:scope
```

根据修改选择验证方式，并在 PR 中如实记录：

| 修改类型 | 验证要求 |
| --- | --- |
| 错字、死链、局部文字 | 检查差异、目标链接和受影响页面；不能本地预览时注明，请维护者补充页面验证 |
| 新增文档、MDX 结构、图片或表格 | 预览受影响页面，检查导航、链接及布局；按影响范围补充构建检查 |
| 路由、搜索、共享组件、站点行为或其他较大改动 | 运行 `bun run test` 和 `bun run types:check`，并按影响范围运行 lint、build 及针对性检查 |
| API 参考内容、导入器、共享渲染及相关依赖 | 按 API reference quality contract 完成对应层的验证和独立验收 |

无法完成某项检查时，写明未执行的项目、原因和需要维护者协助的事项，不要勾选为通过。验证缺口需在合并前补齐。

现有工作流不会为外部 fork PR 自动部署预览。可提供本地检查结果，由维护者协调后续验证。可见改动要记录所查页面、浏览器、视口和结果；本地 QA 截图存放在忽略目录 `.agent/artifacts/`，不要提交到仓库或在 PR 中添加托管截图链接。用于正式文档的图片按文档资源规则处理。

更多命令说明见 [Development](../../development.md)。

### 提交之后

维护者先确认问题是否属于本仓库、是否重复，以及描述是否足够清楚。需要更多信息时，会在 Issue 或 PR 中说明缺少什么。明确的需求再确定内容负责人、处理范围及优先级；提交需求不等于已经安排实现或发布时间。

PR 审阅会关注技术准确性、读者能否照着完成任务、语言和格式，以及验证结果。根据反馈修改时，继续向同一 PR 推送即可。合并与文档上线是两个步骤，上线由维护者按发布流程安排。

不采纳、重复或转交其他渠道的请求，应说明原因或给出关联讨论，方便提交者继续跟进。

贡献内容遵循本仓库的 [Apache-2.0 许可证](../../../LICENSE)。

## 对外贡献指南正文（英文初稿）

本节与中文正文对应，可用于更新根目录的 `CONTRIBUTING.md`；发布时调整相对链接，并在两版顶部互链。

### Welcome

Help us improve the Agora / Shengwang documentation. You can report errors, request missing documentation, suggest clearer examples, or submit a change. You do not need a local development environment or a proposed fix to open an issue. We welcome issues and pull requests in English or Chinese.

### Choose a starting point

Search [existing issues](https://github.com/AgoraIO/docs-portal/issues) and [pull requests](https://github.com/AgoraIO/docs-portal/pulls) first. If someone has reported the same problem, add your use case to that discussion.

| What you want to do | Where to start |
| --- | --- |
| Report incorrect, outdated, unclear, or hard-to-follow content | Choose Documentation issue in the [issue selector](https://github.com/AgoraIO/docs-portal/issues/new/choose) |
| Request a missing topic, tutorial, or example | Choose Documentation issue and describe your task; an existing page URL is not required |
| Report broken search, navigation, rendering, or interactions | Choose Docs site bug |
| Suggest a feature or usability improvement for the docs website | Choose Feature request |
| Share reading feedback without a specific problem | Choose Documentation feedback |
| Fix a typo, broken link, or small wording problem | Open a PR directly; a separate issue is not required |
| Add a topic, substantially rewrite content, reorganize navigation, or change website behavior | Open an issue first to agree on the reader's needs, scope, and approach |

This repository accepts improvements to the documentation and its website. For SDK failures, service incidents, or account issues, use the official support channel for your product. If documentation is incorrect or missing, you can also open a documentation issue with information that is safe to share publicly.

Do not include credentials, customer information, or unpublished materials in public issues, PRs, logs, or screenshots. Report security vulnerabilities privately by following [SECURITY.md](../../../SECURITY.md).

### Describe a documentation problem or request

Tell us which product, platform, and version you use, where relevant; what you are trying to do; and what is stopping you.

For an existing page, include its URL and the relevant section. For a new topic, describe what is missing. Suggested wording, authoritative sources, and reproduction steps are helpful when available, but you can report a problem without knowing the solution.

For example:

> I am integrating a product into an Android application for the first time. The quickstart covers initialization and API calls, but does not explain how to confirm success or diagnose errors. Please add the expected result and common troubleshooting steps. Related page: …; SDK version: ….

### Submit a change

1. For new topics or larger changes, agree on the scope in an issue first. You can start small typo, link, or wording fixes directly.
2. Fork the repository and create a branch from `main`. For small text edits, you can use GitHub's file editor and follow its prompts to create a fork and PR.
3. Edit the relevant source under `content/docs/en` or `content/docs/zh-CN`. If you cannot find the source, open an issue and a maintainer can help locate it.
4. Follow the [Markdown authoring standard](../markdown-authoring-standard.md). When adding or moving pages, check nearby `meta.json` / `meta.yaml` navigation files and related links.
5. Check your changes and open a PR against this repository's `main` branch. Explain what changed and why, link related pages or issues, and report your verification results. Use a Draft PR for work still being discussed.

Keep each PR focused on one problem. Update both languages when you can; otherwise, describe the affected languages and any remaining differences. You do not need to translate another language before submitting a correction to one locale.

For API reference content or generators, follow the [API reference quality contract (Chinese migration branch)](https://github.com/AgoraIO/docs-portal/blob/12fbdb428c4c6064c491bada447540e81aee4e86/docs/api-reference-quality.md). Edit maintained sources rather than generated pages or artifacts. Maintainers can help identify the right source.

### Preview and verify

You do not need to install tools to request documentation. For local editing and preview, use the Node.js and Bun versions specified by `engines` and `packageManager` in [package.json](../../../package.json). From your local clone, run:

```bash
bun install
bun run dev
```

To preview one documentation subtree, use a scoped command such as:

```bash
DOCS_DEV_SCOPE=en/ai/openai-realtime bun run dev:scope
```

Choose checks that match your change and record what you actually verified:

| Change | Verification |
| --- | --- |
| Typos, broken links, or small wording fixes | Check the diff, link destinations, and affected pages. If you cannot preview locally, say so and request a maintainer's page check |
| New pages, MDX structures, images, or tables | Preview affected pages and check navigation, links, and layout; add build checks appropriate to the scope |
| Routes, search, shared components, website behavior, or other substantial changes | Run `bun run test` and `bun run types:check`, plus lint, build, and focused checks appropriate to the scope |
| API reference content, importers, shared rendering, or related dependencies | Complete the applicable checks and independent acceptance required by the API reference quality contract |

If you cannot run a relevant check, explain why and what help you need. Do not mark an unrun check as passing. Verification gaps must be addressed before merging.

The current workflow does not automatically deploy previews for PRs from external forks. Share local verification results so a maintainer can coordinate further checks. For visible changes, record the pages, browser, viewport, and findings. Store local QA screenshots under ignored `.agent/artifacts/`; do not commit them or add hosted screenshot links to the PR. Images intended for the published documentation follow the documentation asset rules.

See [Development](../../development.md) for further command details.

### What happens next

A maintainer checks whether the request belongs here, duplicates an existing issue, and has enough information to act on. If more details are needed, they will explain what to add. Once the scope is clear, maintainers identify a content owner and prioritize the work. Opening a request does not guarantee implementation or a publication date.

PR review covers technical accuracy, whether readers can complete the task, language and formatting, and verification results. Push revisions to the same PR. Merging and publishing are separate steps; maintainers coordinate publication through the release process.

Requests that are declined, duplicated, or redirected should receive an explanation or a link to the relevant discussion.

Contributions are licensed under this repository's [Apache-2.0 license](../../../LICENSE).

## GitHub 模板的具体调整草案

尽量沿用现有文件名和字段 ID，减少链接兼容性风险。首版不增加机器人、强制认领、自动关闭或响应时限。

### Documentation issue

沿用 `.github/ISSUE_TEMPLATE/docs-content.yml`，标题显示为 `Documentation issue / 文档问题与需求`，描述明确覆盖纠错和新增内容需求。标签建议为 `documentation`、`needs-triage`。

| 字段 ID | 显示内容 | 是否必填 | 调整 |
| --- | --- | --- | --- |
| `request-kind` | 问题类型 / Request type | 是 | 新增单选：内容错误或过时、说明不清、新增文档或示例、其他 |
| `page-url` | 相关页面 / Related page | 否 | 保留 ID，取消必填；提示“没有现成页面可留空” |
| `locale` | 文档语言 / Documentation language | 是 | 保留 English、Chinese、Both、Not sure |
| `problem` | 你想完成什么，遇到了什么问题？ / Task and problem | 是 | 保留 ID；明确可描述缺失主题，不需要提供修复方案 |
| `expected` | 希望补充或修正什么？ / Suggested improvement | 否 | 保留 ID；欢迎建议及依据，但不要求先完成设计 |
| `context` | 产品、平台、版本和其他信息 / Context | 否 | 保留 ID；鼓励提供公开的环境信息或相关链接 |

建议用于现有表单的关键替换片段：

```yaml
  - type: input
    id: page-url
    attributes:
      label: Related page / 相关页面
      description: Link the affected page if one exists. Leave blank for a new topic. / 已有页面请附链接；新增主题可留空。
      placeholder: https://docs.agora.io/...
    validations:
      required: false
```

### 其他表单和入口

| 文件 | 建议调整 |
| --- | --- |
| `site-bug.yml` | 保留复现步骤、实际/预期行为；补充双语说明和 `needs-triage` 标签；对于本地构建问题，页面字段允许填写命令或路由，不要求线上 URL |
| `feature-request.yml` | 明确用于文档站功能；新增文档主题引导到 Documentation issue；把 Proposed solution 改为可选，避免要求报告者先设计解决方案；加入 `needs-triage` |
| `feedback.yml` | 保留一般反馈入口，说明具体内容错误/缺失请选 Documentation issue；加入 `needs-triage` |
| `config.yml` | 增加贡献指南的 contact link；保留现有安全说明入口和 `blank_issues_enabled: false` |

文档页反馈代码（包含中文迁移分支的实现）会构造带 `title` / `body` 的 `/issues/new` 链接，见 [docs-feedback.ts](https://github.com/AgoraIO/docs-portal/blob/12fbdb428c4c6064c491bada447540e81aee4e86/src/lib/docs-feedback.ts) 和 [DocsPageFeedback.tsx](../../../src/components/docs-shell/DocsPageFeedback.tsx)。实际调整表单时需要手动验证这些入口是否保留预填信息，不能仅凭 YAML 能解析就认定兼容。首版草稿不改变网站反馈逻辑。

### PR 模板

保留 `.github/PULL_REQUEST_TEMPLATE.md` 在 `main` 中的现有变更分类，通用部分改为以下提示。中文迁移分支另有 API Reference Acceptance 专项，后续对齐时应保留其验收要求。普通文档小改可删除不适用章节。

```markdown
## Summary / 改动说明

<!-- 改了什么？读者原来遇到什么问题，修改后有什么改善？ -->

## Related issue or page / 相关 Issue 或页面

<!-- 有关联 Issue 时填写；错字、死链和局部表达修正不要求先开 Issue。 -->

## Verification / 验证

<!-- 写出实际执行的命令、检查页面和结果。未执行的相关检查请注明原因。 -->

- 已完成：
- 尚需协助：

## Locale and review notes / 语言及审阅说明

<!-- 受影响的语言、尚未同步的内容、需要内容负责人确认的事实。无则删除。 -->
```

## 维护者处理约定（评审建议）

沿用[现有标签](../triage-labels.md)，不另造状态体系：

1. 表单提交后附加 `needs-triage`，由维护者确认范围、重复项和信息完整性。
2. 缺少信息时转为 `needs-info`，明确需要补充的内容。
3. 范围明确后，按处理方式转为 `ready-for-agent` 或 `ready-for-human`；这些标签表示可执行，不承诺具体日期。
4. 不采纳的需求说明原因后关闭；修复的需求关联 PR，并说明是否还有发布或其他后续事项。

PR 按代码与内容审阅流程处理。[issue-tracker.md](../issue-tracker.md) 的 `PRs as a request surface: no` 指的是 triage 技能不把 PR 当需求队列，不能被解读为“不接受外部 PR”；建议在该文件补一句说明。

首版不承诺固定响应时限或自动发布，不新增外部贡献者需要承担的 CLA / DCO 签署要求，也不更改现有许可证。

## 请余卓朋重点评审

1. **接收范围**：是否同意接受中文和英文的纠错、新文档/示例需求和直接 PR，并采用“小改直接 PR，大改先 Issue”？
2. **维护职责**：谁负责首轮分流，产品事实不确定时如何找到内容负责人？是一个轮值入口，还是按产品分工？
3. **支持与安全入口**：产品支持与安全报告应链接哪个已确认的官方渠道？现有 `SECURITY.md` 尚未给出明确安全联系人，发布指南前需补实；草稿不臆造邮箱或网址。

## 落地与验收

评审通过后，同步更新中英文贡献指南、README 入口、四个表单、入口配置和 PR 模板，并补充 issue-tracker 的说明。安装版本说明应直接引用目标分支的 `package.json`：本次 `main` 基线为 Node.js `>=22.12.0`、`bun@1.4.3`；初稿参考的中文迁移分支为 Node.js `>=26.13.0`、`bun@1.4.4`。不要将某条分支的版本描述为整个仓库的统一要求。

上线前验证以下真实路径：

- 读者只有新增主题需求、没有页面链接，也能提交表单。
- 中文与英文读者都能理解入口，表单会附加已存在的分类和 `needs-triage` 标签。
- 外部贡献者能按指南创建 fork PR；小改不会被要求先开 Issue。
- 文档页反馈入口的预填内容仍可用。
- PR 模板能记录适用的验证结果，并保留 API 专项验收。
- 模板合入默认分支后，检查 GitHub Issue 选择器和新建 PR 的实际呈现。分支上的 YAML 解析不能替代此检查。

本 PR 只提交评审材料，正式贡献指南与 GitHub 模板的调整留待流程评审后实施。
