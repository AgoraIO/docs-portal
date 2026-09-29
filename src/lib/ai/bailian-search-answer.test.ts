import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  SearchDocsOutput,
  SearchDocsTool,
} from '../search/search-docs-tool';
import { createBailianSearchAnswer } from './bailian-search-answer';

const searchOutput: SearchDocsOutput = {
  results: [
    {
      id: 'section-1',
      title: 'manualSOS',
      content: '通过 RTM 向智能体发送手动 SoS 信令。',
      url: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
      headingPath: ['ConversationalAIAPI 类', 'manualSOS'],
      score: 1,
    },
  ],
};

const searchDocs: SearchDocsTool = {
  searchDocs: vi.fn(async () => searchOutput),
};

describe('createBailianSearchAnswer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses search_docs between two Bailian chat completions and appends citations', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  role: 'assistant',
                  content: null,
                  tool_calls: [
                    {
                      id: 'call-1',
                      type: 'function',
                      function: {
                        name: 'search_docs',
                        arguments: JSON.stringify({
                          query: 'manualSOS',
                          platform: ['web'],
                        }),
                      },
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  role: 'assistant',
                  content: 'manualSOS 用于发送手动 SoS 信令。',
                },
              },
            ],
          }),
          { status: 200 },
        ),
      );
    const service = createBailianSearchAnswer({
      apiKey: 'bailian-secret',
      model: 'qwen-plus',
      searchDocs,
    });

    const result = await service.ask('如何调用 manualSOS？');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer bailian-secret',
          'Content-Type': 'application/json',
        },
      }),
    );
    expect(searchDocs.searchDocs).toHaveBeenCalledWith({
      query: 'manualSOS',
      platform: ['web'],
    });
    const secondRequest = JSON.parse(
      String(fetchMock.mock.calls[1]?.[1]?.body),
    );
    expect(secondRequest.messages.at(-1)).toEqual({
      role: 'tool',
      tool_call_id: 'call-1',
      content: JSON.stringify(searchOutput),
    });
    expect(secondRequest.messages.at(-1).content).not.toContain(
      'bailian-secret',
    );
    expect(result.answer).toContain('manualSOS 用于发送手动 SoS 信令。');
    expect(result.answer).toContain(
      '[manualSOS](/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos)',
    );
    expect(result.citations).toEqual([
      expect.objectContaining({ url: searchOutput.results[0].url }),
    ]);
  });

  it('requires document search and normalizes model-generated filters', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  role: 'assistant',
                  content: null,
                  tool_calls: [
                    {
                      id: 'call-2',
                      type: 'function',
                      function: {
                        name: 'search_docs',
                        arguments: JSON.stringify({
                          query: 'removeHandler Android',
                          product: '',
                          platform: ['Android'],
                        }),
                      },
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  role: 'assistant',
                  content: '检索到 removeHandler。',
                },
              },
            ],
          }),
          { status: 200 },
        ),
      );
    const service = createBailianSearchAnswer({
      apiKey: 'bailian-secret',
      model: 'qwen-plus',
      searchDocs,
    });

    await service.ask('如何在 Android 平台调用 removeHandler？');

    const firstRequest = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(firstRequest.tool_choice).toBe('required');
    expect(searchDocs.searchDocs).toHaveBeenCalledWith({
      query: 'removeHandler Android',
      platform: ['android'],
    });
  });

  it('returns a direct model answer without searching when no tool call is requested', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                role: 'assistant',
                content: '你好，我可以帮你查文档。',
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const service = createBailianSearchAnswer({
      apiKey: 'bailian-secret',
      model: 'qwen-plus',
      searchDocs,
    });

    await expect(service.ask('你好')).resolves.toEqual({
      answer: '你好，我可以帮你查文档。',
      citations: [],
    });
    expect(searchDocs.searchDocs).not.toHaveBeenCalled();
  });

  it('rejects unknown tool calls and hides provider error details', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                role: 'assistant',
                content: null,
                tool_calls: [
                  {
                    id: 'call-1',
                    type: 'function',
                    function: { name: 'read_all_documents', arguments: '{}' },
                  },
                ],
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const service = createBailianSearchAnswer({
      apiKey: 'bailian-secret',
      model: 'qwen-plus',
      searchDocs,
    });

    await expect(service.ask('读取所有文档')).rejects.toThrow(
      'unsupported tool call',
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
