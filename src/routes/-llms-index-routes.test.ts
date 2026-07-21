import { isNotFound } from '@tanstack/react-router';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/llms-index.server', () => ({
  getRuntimeMachineReadableDocsIndexes: async () => [
    {
      content:
        '# Agora Documentation\n\n- [AI](https://docs.example.com/llms/ai.txt)\n',
      path: '/llms.txt',
    },
    {
      content:
        '# AI\n\n- [Quickstart](https://docs.example.com/en/ai/quickstart.md)\n',
      path: '/llms/ai.txt',
    },
  ],
}));

import { Route as LlmsSectionRoute } from './llms/$';
import { Route as LlmsRootRoute } from './llms[.]txt';

describe('llms index routes', () => {
  it('serves the generated root index', async () => {
    const response = (await getGetHandler(LlmsRootRoute)({
      params: {},
    } as never)) as Response;

    await expect(response.text()).resolves.toContain('/llms/ai.txt');
  });

  it('serves first-level section indexes in runtime development', async () => {
    const response = (await getGetHandler(LlmsSectionRoute)({
      params: { _splat: 'ai.txt' },
    } as never)) as Response;

    await expect(response.text()).resolves.toContain('/en/ai/quickstart.md');
  });

  it('rejects unknown or non-index section paths', async () => {
    for (const section of ['missing.txt', 'ai.md']) {
      try {
        await getGetHandler(LlmsSectionRoute)({
          params: { _splat: section },
        } as never);
      } catch (error) {
        expect(isNotFound(error)).toBe(true);
        continue;
      }

      throw new Error(`Expected ${section} to reject with notFound`);
    }
  });
});

function getGetHandler(route: { options: { server?: unknown } }) {
  return (
    route.options.server as {
      handlers: {
        GET: (context: never) => Promise<unknown> | unknown;
      };
    }
  ).handlers.GET;
}
