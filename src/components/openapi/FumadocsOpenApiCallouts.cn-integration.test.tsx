import { render, screen } from '@testing-library/react';
import type { OpenAPIPageProps } from 'fumadocs-openapi/ui';
import { describe, expect, it } from 'vitest';
import { FumadocsOpenApiContent } from './FumadocsOpenApiContent';

type Document = Extract<
  OpenAPIPageProps,
  { payload: unknown }
>['payload']['bundled'];

function makeNoticePageProps(
  type: string | undefined,
  deprecated = false,
  description?: string,
): OpenAPIPageProps {
  return {
    showTitle: false,
    operations: [{ method: 'get', path: '/notices' }],
    payload: {
      bundled: {
        openapi: '3.2.0',
        info: { title: 'Notices API', version: '1.0.0' },
        paths: {
          '/notices': {
            get: {
              deprecated,
              'x-docs-callouts': [{ type, markdown: 'Operation notice' }],
              'x-docs-sections': [
                {
                  type: 'callout',
                  variant: type,
                  position: 'after-response-body',
                  markdown: 'Section notice',
                },
              ],
              parameters: [
                {
                  name: 'sample',
                  in: 'query',
                  schema: {
                    type: 'string',
                    description,
                    'x-docs-callouts': [{ type, markdown: 'Field notice' }],
                  },
                },
              ],
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      } as unknown as Document,
    },
  };
}

describe('OpenAPI callout coverage', () => {
  it('preserves the 注意 caption for a legacy untyped operation caution', async () => {
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={makeNoticePageProps(undefined)}
      />,
    );
    const notice = await screen.findByText('Operation notice');
    const callout = notice.closest('.docs-callout');
    expect(
      callout?.querySelector(':scope > div:last-child > p'),
    ).toHaveTextContent(/^注意$/);
    expect(callout?.getAttribute('style')).toContain('--color-fd-warning');
  });
});
