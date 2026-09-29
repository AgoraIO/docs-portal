import { describe, expect, it, vi } from 'vitest';
import {
  type AskDocsService,
  createAskDocsRequestHandler,
} from './ask-docs-server';

describe('createAskDocsRequestHandler', () => {
  it('supports browser CORS preflight requests', async () => {
    const handler = createAskDocsRequestHandler({
      ask: vi.fn(),
    });

    const response = await handler(
      new Request('http://localhost/api/ask-docs', {
        method: 'OPTIONS',
        headers: { Origin: 'http://127.0.0.1:3003' },
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
      'POST',
    );
  });

  it('returns the answer and citations for a question', async () => {
    const service: AskDocsService = {
      ask: vi.fn(async () => ({
        answer: 'manualSOS 用于发送手动 SoS 信令。',
        citations: [
          {
            title: 'manualSOS',
            url: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
            headingPath: ['ConversationalAIAPI 类', 'manualSOS'],
          },
        ],
      })),
    };
    const handler = createAskDocsRequestHandler(service);

    const response = await handler(
      new Request('http://localhost/api/ask-docs', {
        method: 'POST',
        body: JSON.stringify({ question: '如何调用 manualSOS？' }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    await expect(response.json()).resolves.toEqual({
      answer: 'manualSOS 用于发送手动 SoS 信令。',
      citations: [expect.objectContaining({ title: 'manualSOS' })],
    });
    expect(service.ask).toHaveBeenCalledWith('如何调用 manualSOS？');
  });

  it('rejects malformed requests and does not leak provider errors', async () => {
    const service: AskDocsService = {
      ask: vi.fn(async () => {
        throw new Error('secret Bailian response body');
      }),
    };
    const handler = createAskDocsRequestHandler(service);

    await expect(
      handler(new Request('http://localhost/api/ask-docs', { method: 'GET' })),
    ).resolves.toMatchObject({ status: 405 });
    await expect(
      handler(
        new Request('http://localhost/api/ask-docs', {
          method: 'POST',
          body: JSON.stringify({}),
        }),
      ),
    ).resolves.toMatchObject({ status: 400 });
    const response = await handler(
      new Request('http://localhost/api/ask-docs', {
        method: 'POST',
        body: JSON.stringify({ question: 'manualSOS' }),
      }),
    );
    expect(response.status).toBe(502);
    await expect(response.text()).resolves.not.toContain('Bailian response');
  });
});
