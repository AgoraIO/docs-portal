# Agora CLI CN AI Build Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add accurate Agora CLI `--region cn` guidance to the Chinese Conversational AI build docs where it simplifies setup, readiness checks, credentials, RTM prerequisites, and webhook configuration.

**Architecture:** Keep the CLI guidance as optional setup paths, not as a replacement for agent runtime code. Put the full reusable CN project setup flow in `start-stop-agent.mdx`, add the full CLI webhook path in `handle-runtime-events/webhooks.mdx`, and use short references from RTM-dependent feature pages to avoid repeating command blocks. Do not introduce shared MDX snippets in v1 because this repo does not currently use a shared include pattern in `content/docs/zh-CN/ai`.

**Tech Stack:** Fumadocs MDX under `/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build`, Agora CLI command surface verified from `/Users/yejiayi/Downloads/cli`, Markdown syntax from `/Users/yejiayi/Documents/docs-portal/docs/agents/markdown-authoring-standard.md`.

---

## Findings To Encode

| Area | Use Agora CLI CN? | Docs to update | Exact behavior to document |
| --- | --- | --- | --- |
| CN login and project selection | Yes | `start-stop-agent.mdx` | Use `agora login --region cn`; this persists the CN control-plane region. |
| New CN ConvoAI project setup | Yes | `start-stop-agent.mdx` | Use `agora project create ... --feature rtc --feature convoai --rtm-data-center CN`; `convoai` also enables RTM through project creation. |
| Existing project readiness | Yes, partly | `start-stop-agent.mdx` and RTM-dependent pages | Use `agora project use`, `agora project feature status`, and `agora project doctor --feature convoai`; keep Console instructions for missing App Certificate, RESTful API credentials, temporary RTC Token, or existing-project RTM data-center changes. |
| App ID / App Certificate | Yes | `start-stop-agent.mdx`, optionally custom model pages | Use `agora project env --format shell --with-secrets` or `agora project env write <path> --with-secrets`; warn that App Certificate stays server-side. |
| RTM prerequisite in client component pages | Yes, as a pointer | `event-notifications.mdx`, `transcripts.mdx`, `send-multimodal-messages.mdx`, `interrupt-agent.mdx` | Replace “在控制台启用 RTM 服务” as the only path with “新项目可用 CLI 创建并启用；已有项目仍需确认 RTM 服务和数据中心”。 |
| Webhook configuration | Yes | `handle-runtime-events/webhooks.mdx`, mention from `short-term-memory.mdx` if needed | Add `agora project webhook events --feature convoai` and `agora project webhook create --feature convoai ... --delivery-region cn`; explain returned `secret` is used for signature verification. |
| Quickstart scaffolding | Optional, do not add broadly | Only if `start-stop-agent.mdx` adds a short note | `agora init` / `quickstart` helps create starter repos, but these build pages are feature docs, not quickstarts. Prefer linking to quickstart rather than expanding this path here. |
| Agent session operations | No | All files | Do not claim CLI starts, stops, interrupts, updates, or reads ConvoAI sessions; keep Agents SDK and REST examples. |
| Token, Customer ID / Secret, model provider keys | No | `start-stop-agent.mdx`, custom model pages | CLI does not replace Customer ID/Secret, temporary RTC Token, production token server, LLM/TTS/ASR provider credentials, or custom LLM service deployment. |

## Task 1: Update The Main CN Project Setup Path

**Files:**
- Modify: `/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/start-stop-agent.mdx`

- [ ] **Step 1: Replace the top prerequisite credential block with a CLI-first optional path**

  In `## 前提条件`, keep the existing third-party LLM/TTS and RTC client prerequisites, but add this block before the manual Console bullets:

  ````mdx
  如果你使用 Agents SDK，推荐先通过 [Agora CLI](/zh-CN/introduction/agora-cli) 准备中国区项目、开通功能并导出服务端凭据：

  ```bash
  agora login --region cn
  agora project create conv-ai-cn-demo --feature rtc --feature convoai --rtm-data-center CN
  agora project use conv-ai-cn-demo
  agora project doctor --feature convoai
  agora project env --format shell --with-secrets
  ```

  如果你已经有项目，可以改用以下命令选择项目并检查开通状态：

  ```bash
  agora login --region cn
  agora project use <project-name-or-id>
  agora project feature status convoai
  agora project doctor --feature convoai
  agora project env --format shell --with-secrets
  ```

  `agora project env --with-secrets` 会输出 App ID 和 App Certificate。App Certificate 只能用于服务端；不要写入客户端代码或公开仓库。
  ````

- [ ] **Step 2: Keep a manual fallback list and narrow it**

  After the CLI block, keep a short manual fallback list:

  ````mdx
  如果你不使用 CLI，仍可以在[声网控制台](https://console.shengwang.cn/)完成以下准备：

  - 为项目开通对话式 AI。
  - 获取 App ID 和 App Certificate。
  - 在 RESTful API Basic Auth 场景下获取 Customer ID 和 Customer Secret。
  - 在直接传入 `token` 的 RESTful API 场景下生成 RTC 临时 Token，生产环境请改由业务服务端签发 Token。
  ````

- [ ] **Step 3: Do not change the start/stop implementation examples**

  Leave the Agents SDK and REST API `join` / `leave` examples as-is. Add no CLI command that implies starting or stopping an agent session.

- [ ] **Step 4: Verify the file syntax**

  Run:

  ```bash
  rg -n "agora login --region cn|project doctor --feature convoai|project env --format shell --with-secrets|Customer ID|RTC 临时 Token" /Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/start-stop-agent.mdx
  ```

  Expected: all CLI commands and remaining manual-only credentials are present.

## Task 2: Add Short CLI References To RTM-Dependent Client Feature Pages

**Files:**
- Modify: `/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/handle-runtime-events/event-notifications.mdx`
- Modify: `/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/transcripts.mdx`
- Modify: `/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/send-multimodal-messages.mdx`
- Modify: `/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/shape-the-conversation/interrupt-agent.mdx`

- [ ] **Step 1: Update each RTM prerequisite bullet**

  Replace bullets that only say “已在控制台为项目启用 RTM 服务” with wording like this:

  ````mdx
  - 已为项目启用 RTM 服务，并在 App 中实现基本的实时消息功能。新建中国区项目时，你可以参考[启动和停止智能体](/zh-CN/ai/build/start-stop-agent)中的 Agora CLI 命令启用 RTM 和对话式 AI；已有项目请在[声网控制台](https://console.shengwang.cn/)确认 RTM 服务和数据中心配置。请参考[实现收发消息](/zh-CN/realtime-media/rtm/get-started/quick-start)。
  ````

  For `transcripts.mdx`, apply the same wording in all platform-specific prerequisite lists where the current RTM bullet repeats.

- [ ] **Step 2: Do not add repeated full command blocks to these pages**

  Keep these pages focused on component integration, callback registration, RTM subscription, and message handling. The only CLI addition should be the prerequisite pointer to `start-stop-agent.mdx`.

- [ ] **Step 3: Preserve runtime configuration requirements**

  Keep the existing instructions that the agent session must include:

  ```text
  advanced_features.enable_rtm: true
  parameters.data_channel: "rtm"
  ```

  These are request/session settings, not CLI setup, so they must remain near each page's “智能体加入频道” section.

- [ ] **Step 4: Verify RTM prerequisite coverage**

  Run:

  ```bash
  rg -n "Agora CLI|start-stop-agent|advanced_features\\.enable_rtm|parameters\\.data_channel|声网控制台" /Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/handle-runtime-events/event-notifications.mdx /Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/transcripts.mdx /Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/send-multimodal-messages.mdx /Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/shape-the-conversation/interrupt-agent.mdx
  ```

  Expected: each page points to the CLI setup path and still contains the RTM session parameters where applicable.

## Task 3: Add A CLI Webhook Configuration Path

**Files:**
- Modify: `/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/handle-runtime-events/webhooks.mdx`
- Optionally modify: `/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/shape-the-conversation/short-term-memory.mdx`

- [ ] **Step 1: Add CLI method before manual Console configuration**

  Under `## 开通消息通知服务`, add a subsection before the existing Console steps:

  ````mdx
  ### 使用 Agora CLI 配置 Webhook

  如果你已安装 Agora CLI，可以在中国区登录后列出对话式 AI 可订阅事件，并创建 Webhook 配置：

  ```bash
  agora login --region cn
  agora project use <project-name-or-id>
  agora project webhook events --feature convoai
  agora project webhook create \
    --feature convoai \
    --url https://example.com/convoai/webhook \
    --events <event-key-or-id>[,<event-key-or-id>] \
    --delivery-region cn
  ```

  命令返回的 `secret` 是 Webhook 签名密钥，请保存到服务端密钥管理系统，并用于后续[验证签名](#验证签名)。如果省略 `--delivery-region`，在 `--region cn` 登录状态下 CLI 会默认使用 `cn` 投递区域。
  ````

- [ ] **Step 2: Rename manual flow as Console alternative**

  Change the existing `### 1. 启用并配置服务` heading to `### 在控制台配置 Webhook`, then keep the manual steps for users who prefer the Console.

- [ ] **Step 3: Keep health check, HTTPS, IP whitelist, and signature sections**

  Do not remove these sections. Add one sentence after the CLI command block:

  ````mdx
  无论使用 CLI 还是控制台，你的服务器都必须支持 HTTPS、在健康检查中及时返回 200，并按需处理 IP 白名单和签名验证。
  ````

  Keep the IP whitelist REST API explanation because the CLI create path currently sets `useIpWhitelist` to false and does not expose a whitelist flag.

- [ ] **Step 4: Optionally point short-term memory to the Webhook CLI path**

  In `short-term-memory.mdx`, near the sentence about history callback through message notification service, add:

  ````mdx
  如需通过 CLI 配置该回调，请参考[接收 Webhook 事件](/zh-CN/ai/build/handle-runtime-events/webhooks#使用-agora-cli-配置-webhook)。
  ````

  Only add this if the generated anchor is confirmed by the docs router. If anchor generation is uncertain, link to `/zh-CN/ai/build/handle-runtime-events/webhooks` without the hash.

- [ ] **Step 5: Verify webhook commands and limitations**

  Run:

  ```bash
  rg -n "project webhook events --feature convoai|project webhook create|--delivery-region cn|secret|HTTPS|健康检查|IP 白名单|验证签名" /Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/handle-runtime-events/webhooks.mdx
  ```

  Expected: CLI path exists and manual operational requirements remain.

## Task 4: Add Lightweight Credential References To Custom Model Pages

**Files:**
- Modify: `/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/custom-model-integration/custom-llm.mdx`
- Modify: `/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/custom-model-integration/audio-output.mdx`

- [ ] **Step 1: Add a prerequisite sentence, not a full setup flow**

  In each `## 前提条件` section, add:

  ````mdx
  - 已准备中国区对话式 AI 项目凭据。你可以参考[启动和停止智能体](/zh-CN/ai/build/start-stop-agent)中的 Agora CLI 命令导出 App ID 和 App Certificate。
  ````

- [ ] **Step 2: Do not imply CLI manages custom model services**

  Keep the existing custom OpenAI-compatible service implementation, model endpoint, output modality, RAG, and metadata sections unchanged. Add no CLI command for deploying, testing, or hosting the custom LLM/audio-output service.

- [ ] **Step 3: Verify the limited scope**

  Run:

  ```bash
  rg -n "Agora CLI|App ID|App Certificate|自定义|CustomLLM|output_modalities" /Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/custom-model-integration/custom-llm.mdx /Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build/custom-model-integration/audio-output.mdx
  ```

  Expected: pages reference CLI only for project credentials and still focus on custom model integration.

## Task 5: Do Not Add CLI Claims To Unsupported Runtime Operations

**Files:**
- Check all files under `/Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build`

- [ ] **Step 1: Search for accidental unsupported CLI claims**

  Run:

  ```bash
  rg -n "agora .*join|agora .*leave|agora .*interrupt|agora .*history|agora .*update|临时 Token.*agora|Customer.*agora|模型.*agora|TTS.*agora|LLM.*agora" /Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build
  ```

  Expected: no hits that claim CLI can run agent sessions, generate temporary RTC Tokens, manage Customer ID/Secret, or configure model providers.

- [ ] **Step 2: Confirm supported command coverage only**

  Run:

  ```bash
  rg -n "agora login --region cn|agora project create|agora project use|agora project doctor|agora project env|agora project webhook" /Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build
  ```

  Expected: hits appear only in `start-stop-agent.mdx`, `handle-runtime-events/webhooks.mdx`, and limited prerequisite references in custom/RTM feature pages.

## Final Verification

- [ ] Run Markdown syntax-oriented checks:

  ```bash
  rg -n "::::|<TabItem|PlatformTabs|CodeTabs|待补充|占位" /Users/yejiayi/Documents/docs-portal/content/docs/zh-CN/ai/build
  ```

  Expected: no new invalid syntax or placeholders from this change.

- [ ] Run type generation and TypeScript validation:

  ```bash
  bun run types:check
  ```

  Expected: command exits with status 0.

- [ ] If any docs-shell or MDX rendering issue appears around the edited pages, run the local dev server and inspect affected routes:

  ```bash
  bun run dev
  ```

  Expected: edited pages render, code fences are highlighted, and links resolve.

## Assumptions And Defaults

- Use `agora login --region cn` in Chinese docs; do not rely on default `global`.
- Use `--rtm-data-center CN` only on `agora project create` / `agora init` flows where the CLI exposes that flag.
- For existing CN projects with RTM disabled or wrong data center, keep a Console fallback unless the CLI gains an existing-project RTM data-center flag.
- Treat App Certificate as server-only and never show it in client-side env names.
- Keep Customer ID / Customer Secret, temporary RTC Tokens, production Token servers, model provider API keys, custom model hosting, and agent session API calls outside the CLI simplification scope.
