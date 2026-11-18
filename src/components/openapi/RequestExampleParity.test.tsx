import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { load } from 'cheerio';
import type { OpenAPIPageProps } from 'fumadocs-openapi/ui';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, it } from 'vitest';
import legacyQueries from '@/lib/openapi/fixtures/legacy-cn-request-queries.json';
import { createLocalizedOpenApiSource } from '@/lib/openapi/fumadocs-source.server';
import { FumadocsOpenApiContent } from './FumadocsOpenApiContent';

const chinesePages = new Map<string, OpenAPIPageProps>();

beforeAll(async () => {
  const source = await createLocalizedOpenApiSource();
  for (const file of source.files) {
    if (file.type !== 'page' || !file.path.startsWith('zh-CN/')) continue;
    const props = await file.data.getOpenAPIPageProps();
    if (!props.operations?.length) continue;
    chinesePages.set(
      `/${file.path.replace(/^zh-CN\//, '').replace(/\.mdx?$/, '')}`,
      props,
    );
  }
}, 30_000);

afterEach(cleanup);

function urlFromCode(code: string) {
  const shellUrl = code.match(/^curl -X [A-Z]+ '([^']+)'/);
  if (shellUrl) return shellUrl[1];
  const literal = code.match(
    /(?:--url |url = |fetch\()("(?:\\.|[^"\\])*")/,
  )?.[1];
  if (!literal) throw new Error(`No request URL in generated code: ${code}`);
  return code.startsWith('curl ')
    ? literal.slice(1, -1).replace(/\\(["\\$`])/g, '$1')
    : (JSON.parse(literal) as string);
}

function queryFromCode(code: string) {
  return Object.fromEntries(
    new URLSearchParams(urlFromCode(code).split('?')[1]),
  );
}

it('matches independently captured legacy URLs and queries on every published Chinese endpoint', () => {
  expect([...chinesePages.keys()].sort()).toEqual(
    legacyQueries.pages.map((page) => page.route).sort(),
  );
  const differences: unknown[] = [];
  for (const { route, urlTemplate, query } of legacyQueries.pages) {
    const props = chinesePages.get(route);
    if (!props) throw new Error(`Missing Chinese endpoint: ${route}`);
    const $ = load(
      renderToStaticMarkup(
        <FumadocsOpenApiContent locale="zh-CN" pageProps={props} />,
      ),
    );
    const code = $('.openapi-request-examples pre').first().text();
    const actual = queryFromCode(code);
    const actualTemplate = urlFromCode(code).split('?')[0];
    if (
      JSON.stringify(Object.entries(actual).sort()) !==
      JSON.stringify(Object.entries(query).sort())
    ) {
      differences.push({ route, expected: query, actual });
    }
    if (actualTemplate !== urlTemplate) {
      differences.push({
        route,
        expectedUrl: urlTemplate,
        actualUrl: actualTemplate,
      });
    }
  }
  expect(differences).toEqual([]);
}, 30_000);

it.each([
  '/api-reference/api-ref/conversational-ai/list',
  '/api-reference/api-ref/speech-to-text/list',
  '/api-reference/api-ref/agora-analytics/call-list',
  '/api-reference/api-ref/agora-analytics/realtime-usage-top20',
])('keeps the legacy query in all three clients on %s', async (route) => {
  const props = chinesePages.get(route);
  const expected = legacyQueries.pages.find((page) => page.route === route);
  if (!props || !expected) throw new Error(`Missing fixture: ${route}`);
  render(<FumadocsOpenApiContent locale="zh-CN" pageProps={props} />);
  for (const [language, prefix] of [
    ['cURL', 'curl --request'],
    ['Python/Requests', 'url = '],
    ['Node.js/Fetch', 'fetch('],
  ]) {
    const selector = await screen.findByRole('combobox', {
      name: /Code language|代码语言/i,
    });
    fireEvent.click(selector);
    const option = screen.getByRole('option', { name: language });
    fireEvent.pointerDown(option, { pointerType: 'mouse' });
    fireEvent.click(option, { detail: 1 });
    await waitFor(() => {
      const code =
        document.querySelector('.openapi-request-examples pre')?.textContent ??
        '';
      expect(code).toContain(prefix);
      expect(queryFromCode(code)).toEqual(expected.query);
      expect(urlFromCode(code).split('?')[0]).toBe(expected.urlTemplate);
    });
  }
});

it('retains standard parameter examples in the English renderer', () => {
  const props = {
    operations: [{ method: 'get', path: '/items' }],
    payload: {
      bundled: {
        openapi: '3.1.0',
        info: { title: 'English query sampling', version: '1' },
        servers: [{ url: 'https://example.com' }],
        paths: {
          '/items': {
            get: {
              parameters: [
                {
                  in: 'query',
                  name: 'state',
                  example: '1',
                  schema: { type: 'string', default: '2' },
                },
              ],
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      },
    },
  } as unknown as OpenAPIPageProps;
  const $ = load(
    renderToStaticMarkup(
      <FumadocsOpenApiContent locale="en" pageProps={props} />,
    ),
  );
  expect(
    queryFromCode($('.openapi-request-examples pre').first().text()),
  ).toEqual({ state: '1' });
});
