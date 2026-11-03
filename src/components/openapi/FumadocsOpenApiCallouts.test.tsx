import { render, screen } from '@testing-library/react';
import type { OpenAPIPageProps } from 'fumadocs-openapi/ui';
import { describe, expect, it } from 'vitest';
import { FumadocsOpenApiContent } from './FumadocsOpenApiContent';

type Document = Extract<
  OpenAPIPageProps,
  { payload: unknown }
>['payload']['bundled'];

function makeNoticePageProps(
  type: string,
  deprecated = false,
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
  it.each([
    ['note', 'info'],
    ['info', 'info'],
    ['caution', 'warning'],
    ['warning', 'warning'],
    ['important', 'warning'],
    ['danger', 'error'],
    ['error', 'error'],
    ['tip', 'success'],
    ['success', 'success'],
    ['ok', 'success'],
    ['idea', 'idea'],
  ])(
    'preserves %s severity across REST callout locations',
    async (type, color) => {
      render(
        <FumadocsOpenApiContent
          locale="en"
          pageProps={makeNoticePageProps(type)}
        />,
      );

      for (const text of [
        'Operation notice',
        'Field notice',
        'Section notice',
      ]) {
        const notice = await screen.findByText(text);
        const callout = notice.closest('.docs-callout');
        expect(callout).toBeInTheDocument();
        expect(callout?.getAttribute('style')).toContain(`--color-fd-${color}`);
      }
    },
  );

  it('applies the shared style to the library-generated deprecation notice', async () => {
    render(
      <FumadocsOpenApiContent
        locale="en"
        pageProps={makeNoticePageProps('note', true)}
      />,
    );

    const notice = await screen.findByText('Deprecated');
    const callout = notice.closest('.docs-callout');
    expect(callout).toBeInTheDocument();
    expect(callout?.getAttribute('style')).toContain('--color-fd-warning');
  });
});
