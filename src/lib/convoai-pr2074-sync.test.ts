import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';
import type { OpenAPIV3 } from 'openapi-types';
import { describe, expect, it } from 'vitest';

const apiRoot = 'content/docs/zh-CN/api-reference/conversational-ai';
const aiRoot = 'content/docs/zh-CN/ai';

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

function between(content: string, start: string, end: string) {
  const first = content.indexOf(start);
  const last = content.indexOf(end, first + start.length);
  expect(first, start).toBeGreaterThanOrEqual(0);
  expect(last, end).toBeGreaterThan(first);
  return content.slice(first, last);
}

const installationPages = [
  `${aiRoot}/build/harden-and-optimize/audio-setup.mdx`,
  `${aiRoot}/build/shape-the-conversation/interrupt-agent.mdx`,
  `${aiRoot}/build/handle-runtime-events/event-notifications.mdx`,
  `${aiRoot}/build/shape-the-conversation/manual-turn-control.mdx`,
  `${aiRoot}/build/send-multimodal-messages.mdx`,
  `${apiRoot}/rest-api/best-practice/audio-settings.mdx`,
  `${apiRoot}/rest-api/user-guides/interrupt-agent.mdx`,
  `${apiRoot}/rest-api/user-guides/listen-agent-events.mdx`,
  `${apiRoot}/rest-api/user-guides/realtime-sub.mdx`,
  `${apiRoot}/rest-api/user-guides/send-multimodal-message.mdx`,
];

describe('ConvoAI source PR 2074 Agents SDK contracts', () => {
  it('uses the published filler terminology in both Python parameter tables', () => {
    const page = read(`${apiRoot}/agent-python/index.mdx`);
    expect(page).toContain(
      '| `filler_words` | `Optional[FillerWordsConfig]` | `None` | 等待 LLM 响应期间播放的承接词配置 |',
    );
    expect(page).toContain(
      '| `filler_words` | `Optional[FillerWordsConfig]` | 承接词配置 |',
    );
  });

  it('lists the Python generated filler and custom tool aliases in Type aliases', () => {
    const section = between(
      read(`${apiRoot}/agent-python/index.mdx`),
      '### Type aliases',
      '## AgentSession',
    );
    for (const name of [
      'FillerWordsContentGeneratedConfig',
      'LlmToolConfig',
      'LlmToolFunctionConfig',
      'LlmToolFunctionParametersConfig',
      'LlmToolExecutionConfig',
      'LlmToolServerConfig',
    ]) {
      expect(section).toContain(`\`${name}\``);
    }
  });

  it('demonstrates append for all three Python think states in the think section', () => {
    const section = between(
      read(`${apiRoot}/agent-python/index.mdx`),
      '### `think(text, ...)`',
      '#### `get_history()`',
    );
    for (const state of ['listening', 'thinking', 'speaking']) {
      expect(section).toContain(`on_${state}_action='append'`);
    }
    expect(section).toContain('该值不会打断当前交互');
    expect(section).toContain(
      '分别等待当前用户回合、LLM 推理或 TTS 播报完成后处理该指令',
    );
  });

  it('explains Python LLM template serialization and runtime placeholders', () => {
    const section = between(
      read(`${apiRoot}/agent-python/index.mdx`),
      '### LLM vendors',
      '#### CustomLLM',
    );
    for (const text of [
      '序列化到 `llm.template_variables`',
      '{{template_variables.<name>}}',
      '{{args.<name>}}',
      '{{tool_call_id}}',
      'server.headers',
      'server.body',
      '不需要配置 `template_variables`',
      'SDK 才会启用 `tools` 和 `mcp_servers`',
    ]) {
      expect(section).toContain(text);
    }
  });

  it('documents Python CustomLLM template_variables and tools in its own table', () => {
    const section = between(
      read(`${apiRoot}/agent-python/index.mdx`),
      '#### CustomLLM',
      '### TTS vendors',
    );
    expect(section).toContain(
      '| `template_variables` | `Dict[str, str]` | No | `None` |',
    );
    expect(section).toContain(
      '| `tools` | `List[Dict[str, Any]]` | No | `None` |',
    );
    expect(section).toContain('`with_tools(True)`');
  });

  it('uses the published filler terminology in TypeScript options and builders', () => {
    const page = read(`${apiRoot}/agent-typescript/index.mdx`);
    expect(page).toContain(
      '| `fillerWords` | `FillerWordsConfig` | `undefined` | 在等待 LLM 响应期间播放的承接词配置 |',
    );
    expect(page).toContain(
      '| `withFillerWords(fillerWords)` | `FillerWordsConfig` | 设置承接词配置 |',
    );
  });

  it('lists TypeScript generated filler and tool aliases beside their shared switch', () => {
    const section = between(
      read(`${apiRoot}/agent-typescript/index.mdx`),
      '### Type aliases',
      '## AgentSession',
    );
    for (const name of [
      'FillerWordsContentGeneratedConfig',
      'FillerWordsContentMode',
      'LlmTool',
      'LlmToolFunction',
      'LlmToolServer',
      'LlmToolExecution',
    ]) {
      expect(section).toContain(`\`${name}\``);
    }
    expect(section).toContain('`llm.tools` 与 MCP server 配置相互独立');
    expect(section).toContain('`withTools(true)`');
  });

  it('documents TypeScript LLM tools and synchronous endpoint behavior', () => {
    const section = between(
      read(`${apiRoot}/agent-typescript/index.mdx`),
      '### LLM vendors',
      '### TTS vendors',
    );
    expect(section).toContain('| `tools` | `LlmTool[]` | No |');
    expect(section).toContain('同步 `GET` 或 `POST` 请求');
    expect(section).toContain(
      '`withTools(true)` 同时适用于 `tools` 和 MCP server 配置',
    );
  });
});

describe('ConvoAI source PR 2074 expanded shared content', () => {
  it.each(installationPages)(
    'updates all five installation methods in %s',
    (path) => {
      const page = read(path);
      const first = page.indexOf(
        "implementation 'io.agora.agents:agora-agent-client-toolkit:",
      );
      const react = page.indexOf(
        'pnpm add agora-agent-client-toolkit@',
        page.indexOf('- React', first),
      );
      const last = page.indexOf('\n', react);
      expect(first).toBeGreaterThanOrEqual(0);
      expect(react).toBeGreaterThan(first);
      const section = page.slice(first, last);
      for (const text of [
        'io.agora.agents:agora-agent-client-toolkit:2.10.0',
        "pod 'agent-client-toolkit-swift', '2.10.0'",
        'tag `2.10.0`',
        'pnpm add agora-agent-client-toolkit@2.10.0',
        'pnpm add agora-agent-client-toolkit@2.10.0 agora-agent-client-toolkit-react@2.10.0',
      ]) {
        expect(section).toContain(text);
      }
      expect(section).not.toContain('2.9.0');
    },
  );

  it.each([
    [
      'android',
      [
        '#### Maven',
        'io.agora.agents:agora-agent-client-toolkit:2.10.0',
        '#### 源码集成',
        'io.agora.conversational.api',
        'agent-client-toolkit-kotlin/tree/v2.10.0/',
      ],
    ],
    [
      'ios',
      [
        '#### CocoaPods',
        "pod 'agent-client-toolkit-swift', '2.10.0'",
        '#### Swift Package Manager',
        'tag `2.10.0`',
        '#### 历史源码参考',
        '2.2.0 版本的历史源码',
        '不应作为 2.10.0 组件直接拷贝集成',
        'Conversational-AI-Demo/tree/v2.2.0/',
      ],
    ],
    [
      'web',
      [
        '#### Package Manager',
        'pnpm add agora-agent-client-toolkit@2.10.0',
        'agora-agent-client-toolkit-react@2.10.0',
        '#### 源码集成',
        'conversational-ai-api',
      ],
    ],
  ] as const)(
    'keeps package versions and verified source references for transcripts %s',
    (platform, required) => {
      const installation = between(
        read(`${aiRoot}/build/transcripts.mdx`),
        '### 集成组件',
        '### 初始化组件',
      );
      const section = between(
        installation,
        `<TabsContent value="${platform}">`,
        '</TabsContent>',
      );
      for (const text of required) expect(section).toContain(text);
      expect(section).toContain('<Card');
    },
  );

  it('keeps the iOS component model and payload files in the structure tab', () => {
    const structure = read(`${aiRoot}/build/transcripts.mdx`).split(
      '### 组件结构',
    )[1];
    const section = between(
      structure,
      '<TabsContent value="ios">',
      '</TabsContent>',
    );
    expect(section).toContain('- `ConversationalAIAPI.swift` — API 接口\n');
    expect(section).toContain('- `MessageModels.swift` — 消息模型和相关枚举');
    expect(section).toContain(
      '- `MessagePayloadBuilder.swift` — RTM 消息载荷构造器',
    );
  });

  it('renames the historical filler feature without changing its release facts', () => {
    const page = read(`${aiRoot}/release-notes.mdx`);
    const section = between(page, '#### 承接词功能 (Beta)', '### 改进');
    expect(section).toContain('新增 `filler_words` 字段，用于配置承接词功能');
    expect(section).toContain('承接词功能可在 LLM 响应等待时播报承接词');
  });
});

describe('ConvoAI source PR 2074 REST think schema', () => {
  function payload() {
    const document = yaml.load(
      read('content/openapi/conversational-ai/rest-api.zh-CN.yaml'),
    ) as OpenAPIV3.Document;
    const request = document.paths[
      '/v2/projects/{appid}/agents/{agentId}/think'
    ]?.post?.requestBody as OpenAPIV3.RequestBodyObject;
    return request.content['application/json'];
  }

  it.each([
    [
      'listening',
      ['inject', 'interrupt', 'append', 'ignore'],
      'interrupt',
      '不打断当前用户输入',
    ],
    [
      'thinking',
      ['interrupt', 'append', 'ignore'],
      'interrupt',
      '不打断当前 LLM 推理',
    ],
    [
      'speaking',
      ['interrupt', 'append', 'ignore'],
      'ignore',
      '不打断当前 TTS 播报',
    ],
  ] as const)(
    'publishes the %s action enum, default, and append semantics',
    (state, values, fallback, description) => {
      const properties = (payload().schema as OpenAPIV3.SchemaObject)
        .properties;
      const action = properties?.[
        `on_${state}_action`
      ] as OpenAPIV3.SchemaObject;
      expect(action.enum).toEqual(values);
      expect(action.default).toBe(fallback);
      expect(action.description).toContain(description);
      expect(action.description).toContain('独立的 user 消息追加到上下文');
    },
  );

  it('demonstrates append in all three example actions', () => {
    const example = payload().examples?.[
      'Example 1'
    ] as OpenAPIV3.ExampleObject;
    expect(example.value).toMatchObject({
      on_listening_action: 'append',
      on_thinking_action: 'append',
      on_speaking_action: 'append',
    });
  });
});
