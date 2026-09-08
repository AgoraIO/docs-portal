# AI 文档路径分析与改进建议

## 结论摘要

这四条观察整体成立，但证据强度不同：

| 编号 | 判断 | 优先级 | 说明 |
| --- | --- | --- | --- |
| 1 | Quickstart 的前置判断和任务分流不足 | P0 | 回到首页、入门和核心概念页，说明用户在“是否适合、先准备什么、下一步去哪”上仍有决策成本。 |
| 2 | 首页到 Quickstart 的产品确认链路偏弱 | P0 | 首页入口是有效的获客入口，但当前把“评估产品”和“开始集成”合并成了一次点击，容易造成先集成后确认。 |
| 3 | RTC 链路可作为 IA 模板 | P1 | 这更像一个可复用的设计模式，而不是需要修复的缺陷；但仅凭转移次数还不能证明它的完成率更高。 |
| 4 | API Reference 与指南的双向连接不足 | P0 | Quickstart 已经能去 API Reference，但 Conversational AI API overview 当前主要是 API 清单，没有把读者带回对应的实现指南。 |

## 数据解释边界

当前只提供了页面间转移次数，没有会话数、独立用户数、停留时间、任务完成事件或转移顺序的完整分布。因此：

- `214` 和 `47` 适合用来判断入口分布，不应直接解释成用户数或失败数。
- “回跳”是摩擦信号，不等于每次都是失败；部分用户可能只是主动查阅概念或首页导航。
- “RTC 链路健康”需要用到达 quickstart 后的成功运行、离开率和耗时来验证；目前更稳妥的表述是“RTC 的层级结构值得复用”。

后续分析应优先补充按会话去重的指标：入口来源、quickstart 首次运行成功、首次成功耗时、返回上一级比例，以及 API Reference → 指南的回流率。

## 1. AI Quickstart 前置判断不够清楚

### 问题判断

这是最明确的内容与 IA 问题。当前英文 AI overview 已经解释了 Voice Agent 的四层结构并区分 App 与 Device，但 Quickstart 顶部只有：

> If you are new to Agora, read Core concepts first...

随后直接进入 Skills、CLI、登录和 starter 项目。页面没有在首屏明确回答：

1. 这条路径适合什么场景，不适合什么场景；
2. App、专用设备、RTC 原生集成和 REST/API 集成应如何选择；
3. 开始前需要哪些账号、项目和运行环境；
4. 跑通 demo 后是进入 Build、模型/最佳实践，还是进入 API Reference。

因此出现 `Quickstart → 文档首页` 或 `Quickstart → 文档入门 / Core concepts` 并不意外。它说明用户需要离开任务页重新建立上下文，而不是说明链接本身一定错误。

### 建议

在 Quickstart 标题下增加一个固定的“先确认路径”区块，内容控制在首屏：

- **适合这条 quickstart**：要在 Web、移动端、桌面端或带后端的 App 中快速跑通 Voice Agent；希望使用官方 starter 和 CLI。
- **不适合这条 quickstart**：专用硬件走 Device Kit；已有 RTC/Signaling 应用并只想接入客户端 toolkit，走对应 Build/SDK 指南；只想调用服务端能力，直接看 Conversational AI REST API。
- **开始前准备**：Agora 账号、项目、可用的 Conversational AI 服务、支持的本地运行环境，以及登录 Console/CLI 的权限。由 CLI 自动生成的资源要明确标注“自动完成”，不要让用户猜测是否需要手动创建。
- **选择入口**：用 3—4 个并列按钮或卡片提供“最快跑通 / 了解架构 / 接入已有 RTC 应用 / 查看 API”。“最快跑通”仍保持一键进入，不增加强制漏斗。

页面结尾将下一步拆成三条明确路径：

- **继续构建**：会话生命周期、对话行为、运行时事件；
- **调优和上线**：模型、延迟、音频、区域和安全；
- **查 API**：REST API、Server SDK、Client Toolkit。

同时保留一个显式的“返回 Voice Agent overview”链接，让回到上层成为有意导航，而不是用户自行寻找首页。

## 2. 首页到 AI Quickstart 太直接

### 问题判断

`文档首页 → AI Quickstart` 有 214 次，而 `AI 产品首页 → AI Quickstart` 只有 47 次，前者约为后者的 **4.6 倍**。这证明首页的 AI CTA 很强，也说明大量用户没有经过产品概览和场景确认。

这不意味着应该删除首页入口：对已经确定需求的用户，直达 Quickstart 是有价值的。真正的问题是首页把两类用户混在了一个 CTA 中：

- 已经知道要做 Voice Agent 的用户，希望立即跑通；
- 仍在评估 Agora、RTC、Conversational AI 和模型关系的新用户，需要先确认产品边界。

### 建议

把首页的 “Build an Agent / Build for Apps” 改成**双路径入口**，而不是把 Quickstart 设为唯一目的地：

- **先了解 Voice Agent** → `/en/ai`（产品概览、App/Device 分流、能力模型）；
- **直接跑通 App quickstart** → `/en/ai/get-started/quickstart`。

卡片描述应标注受众和结果，例如“已确定构建 App 中的 Voice Agent，五分钟跑通 starter”。在首页继续保留直达按钮，避免给熟悉用户增加一步。

AI overview 顶部则增加“你应该从哪里开始”的决策卡，承接首页的评估型用户。这样形成：

```text
文档首页
├─ 先了解产品 → AI overview → 选择 App / Device → Quickstart
└─ 已确定方案 → App Quickstart
```

建议同时给 CTA 增加 `source=docs-home`、`source=ai-overview` 等可分析标记，分开观察两条入口的成功率，而不是只看转移量。

## 3. RTC 链路可以作为模板

### 可复用的模式

RTC 的推荐结构是：

```text
能力大类 / 产品集合 → 产品 overview → 产品 quickstart → API / Build / Best practices
```

它把“我在找什么产品”和“我现在要写什么代码”分开，适合新用户，也不会阻塞熟悉用户，因为 overview 内仍可以提供直达 quickstart 和 API 的卡片。

### 应用到 AI 的方式

将 AI 结构统一成：

```text
Conversational AI / Voice Agent overview
→ App 或 Device 路径选择
→ 对应 quickstart
→ Build、Best practices、Models、Reference
```

仓库中的 `content/docs/en/ai/index.mdx` 已具备部分基础（能力分层和 App/Device 两条路径），下一步重点不是再增加一篇泛介绍，而是把“选择路径”放到 overview 和 quickstart 的共同导航契约中，并确保产品页、首页、侧边栏的名称一致。

需要注意：不要仅凭 `158`、`132` 两个绝对转移次数宣称 RTC 已验证成功。应补充 quickstart 完成事件、首次成功耗时和后续 API/Build 点击，才能把它从“结构模板”升级为“效果模板”。

## 4. API Reference 与指南缺少双向连接

### 问题判断

当前 Quickstart 的 Next steps 已能链接到：

- Build：`start-stop-agent`、模型集成、最佳实践；
- Conversational AI API Reference：`/en/api-reference/api-ref/conversational-ai`。

但 `content/docs/en/api-reference/api-ref/conversational-ai/index.mdx` 主要内容是 API 基础、REST API 清单和 Client Toolkit 清单，没有“适合谁、先读什么、由哪篇指南驱动”的入口。用户从 Quickstart 进入 API 后，容易停留在参数查阅或回到首页重新找指南。

### 建议

在 API Reference 做三层互链：

1. **Reference overview 顶部**：增加“第一次使用 Conversational AI？”提示，链接到 AI overview 和 Quickstart；同时说明这里假定读者已经有项目和基本会话概念。
2. **API 分组/操作页**：在每个高频 endpoint（Start、Stop、Update、Query、Interrupt、History）附近增加“使用场景”和“对应指南”。例如 Start/Stop 指向 `build/start-stop-agent`，运行时事件指向 `build/handle-runtime-events/*`。
3. **指南页回链**：每篇 Build/Best practices 在前置条件或代码后增加“相关 API”链接，尽量深链到具体 operation，而不是只链到 API 根目录。

推荐使用统一的上下文块，而不是手写散落链接：

```text
你正在查看 API Reference。
如果你还没有跑通基本流程，请先看 Voice agent quickstart。
如果你要实现完整功能，请看 Manage agent sessions。
```

这能同时满足“查参数”和“回到任务流程”两种意图。

## 分阶段实施方案

### P0：降低首次进入摩擦

1. 在 AI Quickstart 首屏加入适用范围、前置资源、App/Device/API 分流。
2. 在 AI overview 与文档首页同时提供“先了解产品”和“直接跑通”两个入口。
3. 在 Conversational AI API overview 增加 Quickstart、AI overview 和核心 Build 指南回链。

### P1：建立稳定的跨页导航契约

1. 为高频 API operation 建立“对应指南”映射；为 Build 指南补“相关 API”。
2. 统一首页、AI overview、Quickstart 的命名（Voice Agent、Conversational AI、App/Device）。
3. 在 Quickstart 结尾提供 Build / Production / API 三条下一步路径，并保留返回 overview。

### P2：用行为数据验证改动

1. 记录入口来源、Quickstart 首次成功、返回上层、API → 指南和指南 → API 事件。
2. 观察 `backtrack_rate`、`quickstart_success_rate`、`time_to_first_success`、`api_to_guide_return_rate`。
3. 按新用户/回访用户、App/Device、直接入口/overview 入口分段，必要时对首页双 CTA 做小流量实验。

## 验收标准

- 新用户在 Quickstart 首屏能回答“适不适合、要准备什么、跑通后去哪”。
- 已确定方案的用户仍能从文档首页一键进入 Quickstart；评估型用户能一键进入 AI overview。
- Conversational AI API overview 和高频 operation 页至少有一条回到 Quickstart/Build 的上下文链接；对应指南至少有一条到具体 API 的链接。
- 所有新增链接通过现有 docs journey/link integrity 检查，不引入失效路由。
- 发布后以会话级指标验证回跳率下降、首次成功率和 API/指南双向回流提升，而不是只比较页面转移总量。

## 建议优先修改的文件

- `content/docs/en/introduction/index.mdx`：首页双 CTA。
- `content/docs/en/ai/index.mdx`：产品概览和路径选择。
- `content/docs/en/ai/get-started/quickstart.mdx`：首屏前置判断、资源清单和三路下一步。
- `content/docs/en/api-reference/api-ref/conversational-ai/index.mdx`：Reference → Guide 回链和使用前提示。
- `content/docs/en/ai/build/**`、`content/docs/en/ai/best-practices/**`：Guide → 具体 API 深链。
- `src/lib/docs-journeys.test.ts`：补充 AI overview、Quickstart、API Reference 的双向连接断言。
