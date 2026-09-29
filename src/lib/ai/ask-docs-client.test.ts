import { afterEach, describe, expect, it, vi } from 'vitest';
import { askDocs } from './ask-docs-client';

describe('askDocs', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts a question and returns the answer with citations', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          answer: '请调用 manualSOS。',
          citations: [
            {
              title: 'manualSOS',
              url: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
              headingPath: ['ConversationalAIAPI 类', 'manualSOS'],
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(
      askDocs('如何调用 manualSOS？', 'http://127.0.0.1:8788'),
    ).resolves.toEqual({
      answer: '请调用 manualSOS。',
      citations: [
        {
          title: 'manualSOS',
          url: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
          headingPath: ['ConversationalAIAPI 类', 'manualSOS'],
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8788/api/ask-docs',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: '如何调用 manualSOS？' }),
      }),
    );
  });

  it('rejects empty questions and provider failures with safe errors', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    await expect(askDocs('   ', 'http://127.0.0.1:8788')).rejects.toThrow(
      'question must not be empty',
    );
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockResolvedValue(new Response('{}', { status: 502 }));
    await expect(
      askDocs('如何调用 manualSOS？', 'http://127.0.0.1:8788'),
    ).rejects.toThrow('AI service unavailable');
  });
});
