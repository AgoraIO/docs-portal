# docs-portal 对外贡献流程调研

调研日期：2026-11-06。本文记录公开项目的一手做法与本仓库的草稿建议，不代表已批准的团队承诺。来源为官方贡献指南、官方仓库模板及 GitHub 产品文档；模板链接指向可变化的默认分支。

## 已有基础

本地仓库已有 [CONTRIBUTING.md](../../../CONTRIBUTING.md)、[PR 模板](../../../.github/PULL_REQUEST_TEMPLATE.md) 和 [Issue 模板目录](../../../.github/ISSUE_TEMPLATE)。本次应补齐面向外部贡献者的入口与路径，而非从零建立流程。

当前文档问题表单要求填写现有页面 URL，适合纠错，但对“还没有对应页面”的文档需求不够友好。[内部规则](../issue-tracker.md)以 Issue 管理需求，外部 PR 不进入同一套需求分诊；这与欢迎外部提交修正文档的 PR 可以并存。

## 三个项目的实际做法

| 项目 | 已核实的做法 | 对本仓库的启发 |
| --- | --- | --- |
| GitHub Docs | 贡献指南列出接受的内容类型，并提供在浏览器中修改错字、失效链接的路径；Issue 表单要求页面链接与需要修改的部分，并询问使用场景、预期结果。PR 模板要求解释原因和改动，检查技术准确性、CI 与预览。 | 明确接受什么；围绕读者遇到的问题设计字段；技术准确性和预览比泛化的开发者清单更有用。 |
| Microsoft Learn | 快速编辑指南把小错、遗漏的修改写成浏览器编辑、fork、创建 PR、内容团队审核的完整路径；大规模贡献建议本地编辑。其贡献指南仓库的 PR 模板解释构建检查、人工 review 和合并步骤。 | 给第一次贡献的人一条无需先搭环境的小改路径；说明提交后会发生什么。 |
| Kubernetes Website | 指南说明多数文档工作从 Issue 开始，贡献者随后提交 PR。Bug 模板收集问题、建议方案、待修改页面；Feature 模板询问需要增加什么以及原因；PR 模板询问改什么、为什么，并可关联解决的 Issue。 | 文档缺口先讲清读者任务与范围；模板保持短；需求讨论与提交改动分别承担职责。 |

来源：

- GitHub Docs：[贡献指南](https://github.com/github/docs/blob/main/.github/CONTRIBUTING.md)、[内容改进表单](https://github.com/github/docs/blob/main/.github/ISSUE_TEMPLATE/improve-existing-docs.yaml)、[PR 模板](https://github.com/github/docs/blob/main/.github/PULL_REQUEST_TEMPLATE.md)。
- Microsoft Learn：[浏览器快速编辑指南](https://learn.microsoft.com/en-us/contribute/content/how-to-write-quick-edits)、[贡献指南仓库 PR 模板](https://github.com/MicrosoftDocs/Contribute/blob/main/.github/PULL_REQUEST_TEMPLATE.md)。后者只代表该仓库，不能推断所有 Microsoft Learn 产品仓库都使用相同模板。
- Kubernetes：[提出内容改进](https://kubernetes.io/docs/contribute/suggesting-improvements/)、[Bug 模板](https://github.com/kubernetes/website/blob/main/.github/ISSUE_TEMPLATE/bug-report.md)、[Feature 模板](https://github.com/kubernetes/website/blob/main/.github/ISSUE_TEMPLATE/feature-request.md)、[PR 模板](https://github.com/kubernetes/website/blob/main/.github/PULL_REQUEST_TEMPLATE.md)。

注意：这些项目没有统一的“所有小改都不用 Issue”规则。GitHub Docs 的贡献指南提供小改入口，但其 PR 模板仍建议没有关联 Issue 时先创建 Issue。下面的小改规则是针对 docs-portal 的建议，不能当作这些项目的一致惯例。

## 建议的最小流程

1. **文档错误或不清楚：**提交文档 Issue，描述页面或主题、读者卡在哪里、预期说明。知道怎么改时可直接提交小 PR，不必补一个只用于关联的 Issue。
2. **新文档、文档缺口或大幅重写：**先开文档需求 Issue，描述想完成的任务、适用产品／平台／SDK 版本及现有内容缺什么；允许没有现成 URL。维护者先确认范围，再动笔。
3. **站点异常：**使用站点问题表单，补充页面、操作、实际／预期结果及必要的环境信息。与文案纠错分开，避免让所有报告者填写复现步骤。
4. **提交 PR：**说明改了什么、为什么、影响页面与语言、验证结果。小改可在浏览器提交，并诚实写明未运行的检查；涉及渲染、路由或 API 的改动仍执行现有专项要求。
5. **维护者响应：**公开说明会做分诊、补充信息、内容 review 与合并决定。没有团队共识前，不承诺固定响应时限、自动认领或合并即上线。

落地建议为一份清晰的 `CONTRIBUTING.md`、现有表单的小幅调整和简洁 PR 说明。维护者分诊细节继续留在内部流程文档；外部贡献者不需要先理解 `ready-for-agent` 等标签。

## GitHub 机制与验收边界

- Issue 表单放在 `.github/ISSUE_TEMPLATE/*.yml`；`config.yml` 配置选择器、联系入口和空白 Issue。模板与选择器配置合入默认分支后才对新建 Issue 生效。`blank_issues_enabled: false` 不会让有 Write 及以上权限的维护者失去空白入口。[官方配置说明](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)
- PR 模板可以放在 `.github/PULL_REQUEST_TEMPLATE.md`，合入默认分支后生效；多个 PR 模板通过 `template` 查询参数选择，不能假设会出现与 Issue 相同的选择器。[官方 PR 模板说明](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)
- YAML Issue 表单不适用于 PR。表单提交后转为可编辑的 Markdown Issue 正文；标签必须在仓库中已存在，表单才能自动添加。模板适合帮助提交信息，不能替代 review 或承诺流程执行。[官方表单语法](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)

草稿阶段可检查 YAML、字段和文档链接；正式上线验收应在默认分支合入后，检查真实 Issue 选择器及 PR 预填内容。本记录随贡献流程草稿提交评审，不改变正式贡献规则。

## 建议请余卓朋 review 的问题

- 是否认可“小纠错直接 PR，新主题或大改先 Issue”？
- 首版已确定面向中英文用户；请检查双语指南与表单的要求是否一致。
- 谁负责首次分诊、技术事实确认和内容 review，如何衔接现有发布流程？
- 普通 SDK 使用咨询应引导到哪个已确认的支持入口？

这些问题应由团队确认，不从外部项目的流程直接照搬负责人、时限或支持渠道。
