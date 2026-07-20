import { describe, expect, it } from 'vitest';
import { createMarkdownLlmsIndex } from './llms-index';

describe('llms index', () => {
  it('links agents directly to absolute Markdown pages', () => {
    expect(
      createMarkdownLlmsIndex({
        baseUrl: 'https://docs.agora.io',
        docsIndex: [
          '- [Quickstart](/en/ai/get-started/quickstart)',
          '- [External](https://example.com/guide)',
        ].join('\n'),
        openApiPages: [
          {
            title: 'Start agent',
            url: '/en/api-reference/api-ref/conversational-ai/join',
          },
        ],
      }),
    ).toBe(
      [
        '- [Quickstart](https://docs.agora.io/en/ai/get-started/quickstart.md)',
        '- [External](https://example.com/guide)',
        '',
        '- [Start agent](https://docs.agora.io/en/api-reference/api-ref/conversational-ai/join.md)',
        '',
      ].join('\n'),
    );
  });
});
