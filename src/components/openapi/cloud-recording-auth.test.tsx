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

it('generates all seven Cloud Recording request languages with Basic Auth from the maintained source', async () => {
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

  const rail = await screen.findByTestId('openapi-examples-rail');
  const examples = rail.querySelector(
    '.openapi-request-examples',
  ) as HTMLElement;
  const tabs = within(examples).getAllByRole('tab');
  expect(tabs).toHaveLength(7);
  for (const tab of tabs) {
    fireEvent.mouseDown(tab);
    await waitFor(() => expect(tab).toHaveAttribute('aria-selected', 'true'));
    await waitFor(() => {
      const panel = within(examples).getByRole('tabpanel');
      expect(panel).toHaveTextContent('Authorization');
      expect(panel).toHaveTextContent('Basic <credentials>');
      expect(panel).toHaveTextContent('cloud_recording/acquire');
    });
  }
});
