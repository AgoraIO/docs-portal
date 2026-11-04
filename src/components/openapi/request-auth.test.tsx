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

it('CNQA-010 generates the three legacy RTC clients with Basic Auth from the maintained source', async () => {
  const document = load(
    await readFile('content/openapi/rtc/channel-management.zh-CN.yaml', 'utf8'),
  ) as Extract<OpenAPIPageProps, { payload: unknown }>['payload']['bundled'];
  render(
    <FumadocsOpenApiContent
      locale="zh-CN"
      pageProps={{
        operations: [
          {
            method: 'get',
            path: '/dev/v1/channel/user/property/{appid}/{uid}/{channelName}',
          },
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
  expect(tabs.map((tab) => tab.textContent)).toEqual([
    'cURL',
    'Python/Requests',
    'Node.js/Fetch',
  ]);
  for (const tab of tabs) {
    fireEvent.mouseDown(tab);
    await waitFor(() => expect(tab).toHaveAttribute('aria-selected', 'true'));
    await waitFor(() => {
      const panel = within(examples).getByRole('tabpanel');
      expect(panel).toHaveTextContent('Authorization');
      expect(panel).toHaveTextContent('Basic <credentials>');
      expect(panel).toHaveTextContent('/channel/user/');
    });
  }
});
