# 百炼问答接口代码验证

## 范围与交付

日期：2026-10-16。工作树 `/Users/yuzhuopeng/.codex/worktrees/cn-ai-bot-kb-demo/docs-portal`，分支 `codex/cn-ai-bot-kb-demo`，本轮基线 `65a30a3c1`。

用户要求先写好百炼接入接口，本轮沿用已批准总体架构，在既有问答编排器上增加检索/模型适配器，未创建新架构或云资源：

- `createBailianAnswer`：workspace host 的知识检索服务 + 千问 JSON 生成，注入 fetch 以便不访问云端的协议测试。
- `/api/ai/answer` 增加显式 `AI_BOT_MODE=bailian`，服务端读取 corpus/bindings/Key；保留 local-demo、默认关闭和 production 禁用。
- 共享响应支持 `mode: bailian`；客户端校验和 UI 区分本地摘录、百炼回答、无依据。
- 新增完整配置/边界说明 `docs/ai-kb/bailian-answer.md`。

普通搜索、Meili 索引、文档级上传/增量同步、88块预览、原始 CN-NEWDOC 工作区均未修改。本轮不自动启用云端模式；没有创建/发布/导入/检索或模型调用，没有读取凭据，没有 push、merge 或部署。

## 官方协议核实

实时读取官方文档（供应商示例不是账号实测）：

1. https://help.aliyun.com/zh/model-studio/knowledgesearch
2. https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-chat-completions
3. https://help.aliyun.com/zh/model-studio/rag-api-overview

采用有详细请求/响应字段的 `/api/v1/indices/knowledge/search`，要求已发布 agent_id 及绑定的 KB；不根据概览中的旧 `/rag/index/retrieve` 路径猜测协议。模型采用同 workspace 北京 host 下 `/compatible-mode/v1/chat/completions`，JSON 模式、非流式、固定允许的 Qwen 型号。

## 已实现的边界

- bindings 的 scope、全体来源身份、hash、远端文档 ID 唯一性全部校验，失效配置在发网络请求前失败。
- 远端 metadata 必须匹配 workspace/KB/受管 doc_id，正文从 metadata.content 取；不信远端 URL，不用带展示前缀的 text。
- 既有编排器继续检查精确原文子串和产品/平台/版本/类型，未通过的证据不会传给模型。零证据不生成；仅从本地 corpus 返回引用。
- JSON 模型响应必须完整结束且引用已存在的证据 ID，错误/截断/密钥回显拒绝。模型理解正确性不由引用校验保证。
- 固定 HTTPS workspace host、redirect:error，不自动重试；支持不同检索/模型 Key，不返回原始供应商错误正文。上游响应限制 2 MiB，传递 AbortSignal、取消停滞流，沿用总 15 秒时限。

## 验证记录

- 新适配器测试先缺模块 RED，16 项 GREEN；随后补响应上限/停滞流取消，共17项通过。
- HTTP 新模式测试先 503 RED，再真实 Request + 注入网络返回200 GREEN，验证模式、引用与两次调用；缺配置/production零上游调用。
- 百炼页面提示用例先错误显示本地模式 RED，后改按已返回模式/状态展示为 GREEN。客户端接受 bailian，继续拒绝未知模式。
- 最终相关测试：18文件、195项通过（`src/lib/ai-answer src/lib/ai-kb scripts/ai-kb src/components/search`）。
- `bun run types:check` exit 0。
- `bun run build:service` exit 0，后端服务成功生成。本轮未重建全站静态文档。
- 完整 `bun run test`：2983项，2944通过、37失败、2跳过。按文件/fullName与Phase1已记录37项基线比较，新增0、消失0；仓库整体门禁仍红。
- 10个变更TS/TSX文件Biome检查exit0，无错误；原有测试字符串有1条info。`git diff --check`通过。
- 独立只读review无Critical/Important；独立5文件54项通过。其建议的覆盖增强中，已补响应上限/流取消；非法UTF8、单独模型Key的专门用例留待后续增强，未发现对应缺陷。

## 决策与待验证事项

- 使用官方当前已记录的知识检索服务接口；代价：后续需要单独已发布的检索服务ID，不能只填KB ID。账号能否用、费用与权限尚未核实，本轮不创建资源。
- 本地来源映射和精确原文是保守门槛；代价：云端Markdown规范化可能导致有效内容被拒绝。本轮不松开来源检查换取演示成功，需真实样本证据后再设计规范化。
- 云端筛选尚未核实，先本地后置筛选；代价：有条件查询可能因远端有限结果而漏召回，不等同完整平台过滤能力。
- production继续关闭；代价：后续部署前仍需身份认证/限流设计和云端E2E，不能仅配置Key上线。
- 增量CLI的实际检索verifier仍未接入，保持verifying门槛；本轮新增问答适配器不把上传状态自动改为成功。真实导入/召回回执、文档ID映射、模型效果和全量CI/CD另行验收。
