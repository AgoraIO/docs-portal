import { readFile } from 'node:fs/promises';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { OpenAPIPageProps } from 'fumadocs-openapi/ui';
import { load } from 'js-yaml';
import { expect, it } from 'vitest';
import { FumadocsOpenApiContent } from './FumadocsOpenApiContent';

it('generates the three legacy Cloud Recording clients with Basic Auth from the maintained source', async () => {
  const document = load(
    await readFile(
      'content/openapi/cloud-recording/cloud-recording.zh-CN.yaml',
      'utf8',
    ),
  ) as Extract<OpenAPIPageProps, { payload: unknown }>['payload']['bundled'];
  render(
    <FumadocsOpenApiContent
      locale="zh-CN"
      pageProps={{
        operations: [
          { method: 'post', path: '/v1/apps/{appid}/cloud_recording/acquire' },
        ],
        payload: { bundled: document },
      }}
    />,
  );

  await screen.findByTestId('openapi-examples-rail');
  for (const language of ['cURL', 'Python/Requests', 'Node.js/Fetch']) {
    fireEvent.click(
      within(
        globalThis.document.querySelector(
          '.openapi-request-examples',
        ) as HTMLElement,
      ).getByRole('combobox', { name: /Code language|代码语言/i }),
    );
    const option = await screen.findByRole('option', { name: language });
    fireEvent.pointerDown(option, { pointerType: 'mouse' });
    fireEvent.click(option, { detail: 1 });
    await waitFor(() => {
      const code = globalThis.document.querySelector(
        '.openapi-request-examples pre',
      );
      expect(code).toHaveTextContent('Authorization');
      expect(code).toHaveTextContent('Basic <credentials>');
      expect(code).toHaveTextContent('cloud_recording/acquire');
    });
  }
});
