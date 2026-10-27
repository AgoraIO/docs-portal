# 文档帮助度反馈：点击“有 / 没有”后的交互调研

核查日期：2026-10-27。目标是比较反馈入口的后续交互，不对行业使用比例、转化率作推断。本次没有修改产品代码。

## 结论

样本呈现两种主要做法：正负评价共用轻量的补充说明；或按评价展示不同的原因。没有证据支持将“解决程度 + 易用性评分 + 问题原因”这一整套问卷作为每次正负评价后的共同默认流程。

有帮助的用户可以被问“什么有用”，或者只收到感谢与可选说明；负向用户可以被问“哪里需要改进”。不宜在用户刚点击“有”后，直接用“哪一步没有帮上忙”作为核心追问。后者是本项目当前交互需要调整的地方。

## 四个样本

| 样本与证据 | 点击“有”后 | 点击“没有”后 | 形式与填写要求 |
| --- | --- | --- | --- |
| [Microsoft Learn 官方指南与示例页](https://learn.microsoft.com/en-us/contribute/content/provide-feedback)，浏览器核查 | 5 项正向原因，涉及清晰度、完成任务、易于查找、有所收获、其他 | 5 项负向原因，涉及理解困难、步骤或代码无效、信息缺失、过时、其他 | Modal；原因可多选；文字选填；再提交。指南要求选择一个或多个原因，未实际提交校验 |
| [GitHub Docs 官方组件](https://github.com/github/docs/blob/9568e964d18d76267faf57050dc662c450a13214/src/events/components/Survey.tsx#L63-L92)，固定版本源码核查 | 先记录投票并感谢，提供可选文字和邮箱 | 相同的轻量补充表单，没有原因清单 | 页面内展开；可取消补充，初次投票保留。文字和邮箱均可不填 |
| [Cloudflare Docs 官方组件](https://github.com/cloudflare/cloudflare-docs/blob/1e95911c28821625cb96293b7ac66ff2011a563c/src/components/react/FeedbackPrompt.tsx#L10-L24)，固定版本源码核查 | 5 项正向原因：准确、易懂、解决问题、辅助产品选择、其他 | 4 项负向原因：难理解、错误、缺信息、其他 | 页面内展开；原因单选且必选；文字选填；通过 Turnstile 后提交 |
| [AWS 官方示例页](https://docs.aws.amazon.com/solutions/latest/deploy-to-done/feedback.html)及其内置反馈模板 | 感谢肯定，邀请补充哪里做得好 | 感谢指出问题，邀请补充如何改进 | 首次评价后可以选择 Feedback 进入进一步反馈；不是默认多组量表 |

Microsoft 的标准反馈无需 GitHub 账号，意见不公开展示；这是其站内接收链路的特性，不能直接套用到本项目当前的 GitHub Issue 跳转。[官方指南](https://learn.microsoft.com/en-us/contribute/content/provide-feedback#use-the-standard-experience)

AWS 的官方帮助说明也明确区分先投票、再补充详细意见两个步骤。[AWS re:Post 官方说明](https://repost.aws/knowledge-center/send-feedback-aws)

## 投票与详细反馈不是同一个完成条件

- GitHub Docs 在点击 Yes/No 时先记录投票，后续补充有单独发送动作，取消补充不会撤销已投的票。[组件实现](https://github.com/github/docs/blob/9568e964d18d76267faf57050dc662c450a13214/src/events/components/Survey.tsx#L63-L92)
- Cloudflare 的组件先切换表单分支，提交时才发送统计和反馈请求；这与“先记一票”的方案不同。其当前公开源码没有等待反馈请求成功就进入感谢状态，因此本项目不应据此将 UI 致谢等同于服务端收件成功。[提交实现](https://github.com/cloudflare/cloudflare-docs/blob/1e95911c28821625cb96293b7ac66ff2011a563c/src/components/react/FeedbackPrompt.tsx#L73-L97)

## 调研时的方案建议（历史记录）

以下建议反映调研时的讨论状态；后续交互与采集已迭代，请以 [当前反馈契约](../../analytics/feedback-form-v1.md) 为准。

保留用户已经确定的两个按钮，以及“点击后打开后续内容”的方向，改成两个有区别的分支：

1. **有：轻量肯定反馈。** 先感谢，提供可选补充说明；不默认展示问题原因。按当前用户偏好，不恢复已删除的正向原因清单。
2. **没有：定位问题。** 展示现有六项问题原因和补充说明，允许直接关闭，不强迫解释。
3. **保留但弱化附加量表。** 用户要求保留的四档解决情况和 1–5 分易用性评分，可以放到两个分支都能展开的“补充体验评价（选填）”中。这是建议，不代表已经调整界面。
4. **分开记录。** 帮助度投票、后续问卷、GitHub 跳转和真正的 Issue 创建，应按各自事实计数。点击“有”不能推定问题已完全解决；关闭后续弹窗也不能算没有投票。

调研当时的独立待办：统一弹窗的解决情况、评分和原因尚未接回原有埋点，详细文字仍预填到 GitHub Issue；这项研究不代表该链路已补齐。

## 核查方法与边界

- Microsoft：打开官方页，拒绝可选 cookies，待页面加载后拦截后续网络请求，再检查正负分支，没有点击 Submit。文本框 DOM 的 maxlength 为 999，与官方指南一致。
- GitHub、Cloudflare：读取官方仓库固定 commit 的组件和文案；未验证该 commit 与线上 CDN 部署完全一致，也没有提交反馈。
- AWS：读取官方说明与页面 HTML 中的正负反馈模板，未实际发送投票。不能据此断言所有 AWS 文档的实时 UI 都相同。
- 网页提取优先尝试 r.jina.ai；超时后使用 markdown.new 获取 Microsoft 文档与代理调查页面。动态交互以页面及官方源码补充核查。
- 原始证据位于忽略目录 `.agent/artifacts/feedback-research/`、`.agent/artifacts/feedback-research-sources/`；源码核查笔记位于 `.agent/artifacts/docs-feedback-patterns-sources.md`。
