# 源 #2074 ConvoAI 2.12 完整缺口实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. 使用已经完成的 23 文件只读准备，按固定 source 有效 hunk 补齐，不仅修最初审计样本。实现可以隔离并行，full/build/preview 由主控独占排队；提交后规格、质量分开复核。

**Goal:** 补齐源 #2074 的 SDK、三端客户端 API、共享安装消费者和 REST think 缺失，不回退 #2101 后续有效内容，不带入独立源 #2063 修复。

**Architecture:** 沿用 Markdown/MDX、既有 Tabs 和 OpenAPI lane；不改业务代码、渲染器、operationId 或导航结构。源内部设计文档与旧 JSX 不搬运。补齐 canonical transcripts 中源已渲染的包安装选项，保留现有源码集成作为另一选项，以既有三个 TabsContent 内的 Markdown 小标题/代码表达，不新造组件或嵌套平台切换。

**Tech Stack:** MDX/GFM、Vitest、js-yaml、现有 OpenAPI 源与导出、Bun。

## 固定来源、完整分类与写集

源 `cf942e1c63405f9330d371c8210e440179fe9608`，范围终点 `5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`；目标记录新树实际 base。以下 `API/` = `content/docs/zh-CN/api-reference/conversational-ai/`，`AI/` = `content/docs/zh-CN/ai/`。

内容写集共 25 文件：

1. `API/agent-python/index.mdx`
2. `API/agent-typescript/index.mdx`
3. `API/android/iconversationalaiapi.mdx`
4. `API/android/struct.mdx`
5. `API/android/overview.mdx`
6. `API/ios/conversationalaiapi.mdx`
7. `API/ios/struct.mdx`
8. `API/ios/overview.mdx`
9. `API/web/conversationalaiapi.mdx`
10. `API/web/struct.mdx`
11. `API/web/enum.mdx`
12. `API/web/overview.mdx`
13. `AI/release-notes.mdx`
14. `AI/build/harden-and-optimize/audio-setup.mdx`
15. `API/rest-api/best-practice/audio-settings.mdx`
16. `AI/build/shape-the-conversation/interrupt-agent.mdx`
17. `API/rest-api/user-guides/interrupt-agent.mdx`
18. `AI/build/handle-runtime-events/event-notifications.mdx`
19. `API/rest-api/user-guides/listen-agent-events.mdx`
20. `AI/build/shape-the-conversation/manual-turn-control.mdx`
21. `API/rest-api/user-guides/realtime-sub.mdx`
22. `AI/build/send-multimodal-messages.mdx`
23. `API/rest-api/user-guides/send-multimodal-message.mdx`
24. `AI/build/transcripts.mdx`
25. `content/openapi/conversational-ai/rest-api.zh-CN.yaml`

另新增 `src/lib/convoai-pr2074-sync.test.ts`（SDK/共享/REST）和 `src/lib/convoai-pr2074-client-sync.test.ts`（客户端），以及 `docs/agents/reports/2026-10-19-hotfix-pr2074-fix.md`。如需要合理拆分测试，先说明具体结构，不新造生产辅助逻辑。

明确不写：Go API（各 hunk 已覆盖）、Android/iOS enum（完整）、两篇新指南（rest-tool 的 14 个代码块与 filler 的 8 个代码块/长表格已核对终点完整）、meta（两个入口已有）、英文、内部 spec、公共 YAML 副本、运行时。原承接词可选静态回退/50 词/trigger.mode 等已由 #2101 修正，禁止回退。

## Task 1：SDK 与术语

- [ ] 先对真实受审小节新增 RED 检查；不使用全文只出现某个类型名即通过的断言。
- [ ] Python 两处源改的“垫词配置”改“承接词配置”；公开别名补 `FillerWordsContentGeneratedConfig` 和 `LlmToolConfig/LlmToolFunctionConfig/LlmToolFunctionParametersConfig/LlmToolExecutionConfig/LlmToolServerConfig`。
- [ ] Python think 小节按 source 补三个状态 append 的完整行为及三 action 示例，替换旧 inject-only 示例；保持已经正确的 Type aliases 中 #2101 Think 常量与上下文说明，不用旧版覆盖。
- [ ] Python 通用 LLM 表恢复 template_variables 序列化到 `llm.template_variables`、占位引用及随后完整模板/工具开关说明；CustomLLM 单独补 `template_variables` 和 `tools` 两行，不能在另一张表命中就算完成。
- [ ] TS 两处源改的“填充词”改“承接词”；公开别名补 `FillerWordsContentGeneratedConfig/FillerWordsContentMode/LlmTool/LlmToolFunction/LlmToolServer/LlmToolExecution` 及 tools/MCP 共用 withTools(true) 控制。
- [ ] TS LLM vendor 表补 `tools | LlmTool[] | No`，表后补声明工具用途、同步 GET/POST 端点、与 MCP 共用开关的 source 说明。
- [ ] release-notes 仅 source 修改的旧版本两处“垫词”改“承接词”，不全局替换历史 SDK 版本或其他术语。
- [ ] Python asr.keywords 后续修正保持，FengmingSTT 小节不改；TS FengmingSTT 也不改。未合入 #1221 的修复不能夹带，合并组合时应与其兼容。

## Task 2：客户端完整方法、结构与概览

- [ ] 新增逐平台/逐方法/逐结构 RED 检查，先观察缺失行为失败。
- [ ] Android speak/think 保持签名，恢复 completion 成功 error=null/失败非 null，并分别明确 RTM 发布成功不代表播报/LLM 处理完成。
- [ ] iOS speak/think 修正误复制的 Kotlin completion 表类型为 `@escaping (ConversationalAIAPIError?) -> Void`；恢复 RTM agentUserId 全局唯一、nil/错误回调语义和非处理完成声明，保留正确 Swift 签名。
- [ ] Web speak/think 明确初始化传入 rtmEngine，Promise 仅反映发布成功，不代表播报或推理完成。
- [ ] 三端 SpeakMessage/ThinkMessage 成员说明逐字段按 source 恢复默认值、类型与交叉链接；特别保留 metadata=null/nil 不写 RTM 消息的区别。iOS 表用 `Bool`、`[String: String]?`，不留 Android 的 Boolean/Map。Web 补整张缺失成员表，不仅接口签名。
- [ ] 保留各平台真实枚举差异：Web Speak 默认 `INTERRUPTED`，Android `INTERRUPT`，iOS `.interrupt`；Think 客户端 thinking 默认 `IGNORE/.ignore`，不能套 REST 的 interrupt。
- [ ] 三端 overview 各补 speak/think 两行 canonical 方法链接，逐项验证真实锚点。
- [ ] Web enum 的三状态各补用途描述；Android/iOS enum 已完整不改。其他方法/结构不得复制重排或用 source 全页覆盖。

## Task 3：共享安装闭包与结构

- [ ] 六个 source `<Integrate/>` 消费者映射到上表 11 目标页；十页当前安装区五组 2.9.0 定点改 2.10.0：Maven、CocoaPods、SPM tag、Vanilla 包、React 两包。不替换历史 release-notes 或任意全页版本字符串。
- [ ] canonical transcripts 当前只有源码集成，补回 source 包集成选项：在现有 Android/iOS/Web TabsContent 内用 Markdown 小标题/代码加入对应 2.10.0 安装方式，再保留原手动拷贝源码和链接。不要新嵌套平台 Tabs；新围栏语言采用项目支持项，按作者标准对齐标签和段落。
- [ ] 仅 transcripts 的实际 iOS 结构展开处补 `MessageModels.swift`（消息模型/枚举）、`MessagePayloadBuilder.swift`（RTM 载荷构造器），将 ConversationalAIAPI.swift 描述收窄为 API 接口；其余结构不重排。源其他五处只是 import 无 `<Structure/>` 调用，不给十页生造结构副本。
- [ ] 对每个安装章节限定平台作用域检查 source 五种方式与版本，保留手动源码替代项；验证新结构项归属 iOS，而不是全页名字命中。

## Task 4：REST think 仅 12 个有效叶子

- [ ] 用 js-yaml 读真实维护 YAML，按 `/v2/projects/{appid}/agents/{agentId}/think` 的 operation 对象写 RED 检查。
- [ ] 三 action 各补 append 的 source 描述、enum、default 和示例，其他 YAML 保持：

```ts
expect(listening.enum).toEqual(['inject', 'interrupt', 'append', 'ignore']);
expect(thinking.enum).toEqual(['interrupt', 'append', 'ignore']);
expect(speaking.enum).toEqual(['interrupt', 'append', 'ignore']);
expect([listening.default, thinking.default, speaking.default]).toEqual([
  'interrupt', 'interrupt', 'ignore',
]);
expect(example).toMatchObject({
  on_listening_action: 'append',
  on_thinking_action: 'append',
  on_speaking_action: 'append',
});
```

- [ ] 描述保留三个状态各自等待/不打断的原语义，不以客户端默认值统一 REST。既有 #2101 的 20 词、静态回退、上下文限制正向保护；不复制 source 旧 YAML、改 operationId 或英文。

## 验证与交付

- [ ] install frozen；相关既有 OpenAPI/内容基线通过；新检查先 RED 再最小补齐 GREEN。记录所有 source 23 文件有效 hunk→目标对应，内部 spec 排除明确。
- [ ] 全部受改 MDX 实际编译、GFM/平台/Slot 语法、链接与 fragment；新增测试 Biome；types；源外正文和不写文件保持检查；diffcheck。
- [ ] OpenAPI 维护源校验、现有 source/lanes/markdown 回归、`bun run openapi:sync`，确认公共副本 ignored 且中文 think 源/生成 Markdown/搜索文本均有 append。
- [ ] **先通知主控 ready，禁止自行启动 full/build/preview。** 主控批准独占全量，再完成规格与质量两阶段审查。
- [ ] 主控统一安排构建和浏览器验收：使用实际 lane canonical `/zh-CN/api-reference/api-ref/conversational-ai/think`，验证三 action enum/default、示例、MDX客户端类型/默认值/共享安装呈现与截图；记录真实构建范围和任何基线阻塞，未验证项不得写成已通过。
- [ ] 独立修复记录含 source SHA/base、完整 23→25 映射、source 不同默认值和后续覆盖边界、红绿与测试计时。通过后精确提交，由主控建 PR，不自动合并或部署。

## 后续 #2101 分工

#2074 只补公开别名一次，保留既有 #2101 常量和必配静态回退；#2101 后续只补 TS 缺失的 context/history 范围/默认值和 `generatedConfig`→source `generated_config` 的同段标识，不重复添加本项工具别名。组合验证发现冲突必须由主控处理，不用整页覆盖另一项成果。
