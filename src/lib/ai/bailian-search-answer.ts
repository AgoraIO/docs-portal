import type {
  SearchDocsInput,
  SearchDocsOutput,
  SearchDocsTool,
} from '../search/search-docs-tool';

export const defaultBailianBaseUrl =
  'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
};

type ToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};

type ChatCompletion = {
  choices?: Array<{
    message?: {
      role?: 'assistant';
      content?: string | null;
      tool_calls?: ToolCall[];
    };
  }>;
};

type ToolChoice = 'auto' | 'required';

export type AnswerCitation = {
  title: string;
  url: string;
  headingPath: string[];
};

export type BailianAnswer = {
  answer: string;
  citations: AnswerCitation[];
};

export type BailianSearchAnswerService = {
  ask(question: string): Promise<BailianAnswer>;
};

type BailianSearchAnswerConfig = {
  apiKey: string;
  model: string;
  searchDocs: SearchDocsTool;
  baseUrl?: string;
};

const toolDefinition = {
  type: 'function',
  function: {
    name: 'search_docs',
    description:
      'Search the selected Chinese documentation knowledge base. Use this before answering documentation questions.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'The documentation question or exact API keywords. Keep product names and platform names from the user question.',
        },
        product: {
          type: 'string',
          description:
            'Optional product filter. Only set it when the user explicitly names a product; otherwise omit it.',
        },
        platform: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Optional platform filter. Use values such as web, android, ios, java, or expo only when the user specifies one.',
        },
        version: {
          type: 'string',
          description:
            'Optional version filter. Only set it when the user explicitly names a version; otherwise omit it.',
        },
        audience: { type: 'string', enum: ['developer', 'customer-support'] },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
};

const systemPrompt = [
  '你是中文文档问答助手。',
  '回答前必须调用 search_docs。只检索当前 Agora 中文文档知识库，不要猜测或改写产品名称。',
  '只能依据 search_docs 返回的文档片段回答，不要编造 API 参数或行为。',
  '如果检索结果不足以回答，请明确说文档片段不足，并建议用户查看引用链接。',
  '回答应简洁，并说明适用的平台或版本（如果文档提供了这些信息）。',
].join('\n');

export function createBailianSearchAnswer({
  apiKey,
  model,
  searchDocs,
  baseUrl = defaultBailianBaseUrl,
}: BailianSearchAnswerConfig): BailianSearchAnswerService {
  if (!apiKey || !model) {
    throw new Error('Bailian requires a server-side API key and model');
  }

  return {
    async ask(question) {
      const normalizedQuestion = question.trim();
      if (!normalizedQuestion) throw new Error('question must not be empty');
      if (normalizedQuestion.length > 2000) {
        throw new Error('question is too long');
      }

      const initialMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: normalizedQuestion },
      ];
      const initial = await requestChat({
        apiKey,
        baseUrl,
        model,
        messages: initialMessages,
        tools: [toolDefinition],
        tool_choice: 'required',
      });
      const initialMessage = getAssistantMessage(initial);
      const toolCalls = initialMessage.tool_calls ?? [];

      if (!toolCalls.length) {
        return {
          answer: initialMessage.content?.trim() || '暂时无法生成回答。',
          citations: [],
        };
      }

      const results: SearchDocsOutput['results'] = [];
      const toolMessages: ChatMessage[] = [];
      for (const toolCall of toolCalls) {
        if (
          toolCall.type !== 'function' ||
          toolCall.function.name !== 'search_docs'
        ) {
          throw new Error('unsupported tool call');
        }
        const input = parseSearchDocsArguments(toolCall.function.arguments);
        const output = await searchDocs.searchDocs(input);
        results.push(...output.results);
        toolMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(output),
        });
      }

      const final = await requestChat({
        apiKey,
        baseUrl,
        model,
        messages: [
          ...initialMessages,
          {
            role: 'assistant',
            content: initialMessage.content ?? null,
            tool_calls: toolCalls,
          },
          ...toolMessages,
        ],
      });
      const finalMessage = getAssistantMessage(final);
      const citations = deduplicateCitations(results);
      return {
        answer: appendCitations(
          finalMessage.content?.trim() || '暂时无法生成回答。',
          citations,
        ),
        citations,
      };
    },
  };
}

async function requestChat({
  apiKey,
  baseUrl,
  model,
  messages,
  tools,
  tool_choice,
}: {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: ChatMessage[];
  tools?: [typeof toolDefinition];
  tool_choice?: ToolChoice;
}): Promise<ChatCompletion> {
  let response: Response;
  try {
    response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        ...(tools ? { tools, tool_choice } : {}),
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new Error('Bailian service unavailable');
  }
  if (!response.ok) throw new Error('Bailian service unavailable');
  try {
    return (await response.json()) as ChatCompletion;
  } catch {
    throw new Error('Bailian returned an invalid response');
  }
}

function getAssistantMessage(response: ChatCompletion) {
  const message = response.choices?.[0]?.message;
  if (!message) throw new Error('Bailian returned no answer');
  return message;
}

function parseSearchDocsArguments(value: string): SearchDocsInput {
  let input: unknown;
  try {
    input = JSON.parse(value);
  } catch {
    throw new Error('invalid search_docs arguments');
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('invalid search_docs arguments');
  }
  const candidate = input as Partial<SearchDocsInput>;
  if (typeof candidate.query !== 'string' || !candidate.query.trim()) {
    throw new Error('invalid search_docs arguments');
  }

  const normalized: SearchDocsInput = {
    query: candidate.query.trim(),
  };
  if (typeof candidate.product === 'string' && candidate.product.trim()) {
    normalized.product = candidate.product.trim();
  }
  if (Array.isArray(candidate.platform)) {
    const platforms = candidate.platform
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    if (platforms.length) normalized.platform = [...new Set(platforms)];
  }
  if (typeof candidate.version === 'string' && candidate.version.trim()) {
    normalized.version = candidate.version.trim();
  }
  if (
    candidate.audience === 'developer' ||
    candidate.audience === 'customer-support'
  ) {
    normalized.audience = candidate.audience;
  }
  return normalized;
}

function deduplicateCitations(
  results: SearchDocsOutput['results'],
): AnswerCitation[] {
  const seen = new Set<string>();
  return results.flatMap((result) => {
    if (seen.has(result.url)) return [];
    seen.add(result.url);
    return [
      {
        title: result.title,
        url: result.url,
        headingPath: result.headingPath,
      },
    ];
  });
}

function appendCitations(answer: string, citations: AnswerCitation[]): string {
  if (!citations.length) return answer;
  const links = citations
    .map((citation) => `- [${citation.title}](${citation.url})`)
    .join('\n');
  return `${answer}\n\n参考文档：\n${links}`;
}
