# 英文产品文档 API Reference 认证链接修复设计

## 背景

Speech-to-Text 产品文档中的部分页面仍然链接到旧的产品内 `reference/restful-authentication` 页面。RTMP Gateway 还有一处已经跳到 API Reference、但仍使用隐藏旧页面 `restful-authentication` 的链接。这些目标都不再是对应产品当前 API Reference 的 canonical route，因此用户会从产品文档进入失效或过时的目标。

仓库现有文档规范要求：跨产品或跨目录跳转使用带 locale 的站点根路径，例如 `/en/api-reference/api-ref/...`；完整域名仅用于外部链接，近邻产品页面才使用 `../...` 形式的路径相对链接。本次遵循该规范。

## 目标

- 修复英文产品文档中指向旧认证页的全部同类链接。
- 将每个产品的认证入口指向当前 API Reference 导航中的 canonical route。
- 保留原有链接文本和文档内容，只更新链接目标。
- 使用仓库规范的站点根路径，不使用 `https://docs.agora.io/...` 完整域名。
- 通过链接审计和类型检查验证没有引入新的内容问题。

## 非目标

- 不修改中文文档。
- 不修改 `content/docs/en/api-reference/**` 下的 API Reference 页面内容或导航。
- 不修改 `content/openapi/**`、生成文件或站点运行时代码。
- 不迁移仍然有效的产品内 `reference/*` 页面，例如 release notes、error codes 或其他产品指南。
- 不处理与本次认证页迁移模式无关的既有断链或锚点问题。

## 排查范围

排查输入为 `content/docs/en` 下的 Markdown 和 MDX 产品文档，重点匹配旧的 `reference/restful-authentication` 链接，并核对已经指向 API Reference 但仍使用隐藏旧认证 route 的链接。基于当前仓库检查结果，共发现 12 个文件、26 处候选引用，全部位于 `content/docs/en/realtime-media`。

API Reference 源文件名不完全一致，因此不能做简单的字符串替换。修复时使用以下显式产品映射：

| 产品 | API Reference canonical route |
| --- | --- |
| Speech-to-Text | `/en/api-reference/api-ref/speech-to-text/authentication` |
| Cloud Recording | `/en/api-reference/api-ref/cloud-recording/authentication` |
| Media Pull | `/en/api-reference/api-ref/media-pull/restful-authentication` |
| Media Push | `/en/api-reference/api-ref/media-push/restful-authentication` |
| RTMP Gateway | `/en/api-reference/api-ref/rtmp-gateway/authentication` |

Cloud Transcoding 和 Agora Analytics 的英文产品入口当前已经使用各自的 API Reference 路由。本次会核查它们，但不做无必要改动。

## 改动方案

### Worktree 和分支

从 `main` 创建独立 worktree：

`/Users/yejiayi/.codex/worktrees/docs-portal/product-api-ref-links`

使用分支：

`codex/fix-product-api-ref-links`

### 内容更新

逐个检查候选引用，按来源产品应用映射表，仅替换 Markdown/MDX 链接的 href。链接文本、段落、标题、代码示例和页面结构保持不变。

更新后的链接示例：

```md
[RESTful authentication](/en/api-reference/api-ref/speech-to-text/authentication)
```

RTMP Gateway 和 Speech-to-Text 等存在隐藏旧页面或同名历史页面的产品，目标以 `meta.json` 中可见的 API Reference canonical 页面为准，不以旧文件名推导目标。

其中 RTMP Gateway 的 `media-gateway-features.md` 已使用 API Reference 根路径，但仍指向隐藏的 `/restful-authentication`；该处也统一修正为 `/authentication`。Media Pull 和 Media Push 的 `restful-authentication` 页面仍在各自 API Reference 导航中可见，因此保留该 route。

## 验证方案

修改完成后在修复 worktree 中执行：

1. `git diff --check`，检查空白字符和补丁格式。
2. 定向搜索 `content/docs/en`，确认产品文档中不再残留旧的 `reference/restful-authentication` 引用。
3. `bun run docs:links`，确认本次涉及的源文件和目标路由没有新增链接问题。
4. `bun run types:check`，确认文档内容能正常参与 Fumadocs 输出生成和 TypeScript 类型检查。

仓库当前的 `bun run docs:links:strict` 基线会因已有 API Reference 锚点问题退出码为 1，因此该命令的既有失败不作为本次变更的失败依据；验证记录会区分本次修改与预先存在的问题。

## 验收标准

- 26 处旧认证页引用或过时认证 route 全部指向映射表中的正确 API Reference 路由。
- Speech-to-Text 示例链接最终指向 `/en/api-reference/api-ref/speech-to-text/authentication`。
- 所有修改后的 API Reference 链接均不包含完整域名。
- 修改仅发生在确认的 12 个英文产品文档文件中。
- 链接文本和文档语义不变。
- 定向检查、`bun run docs:links`、`bun run types:check` 和 `git diff --check` 均通过，或对既有无关失败作出明确记录。
