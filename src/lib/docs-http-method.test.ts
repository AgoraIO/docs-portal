import { describe, expect, it } from 'vitest';
import { withDocsHttpMethods } from './docs-http-method';
import type { DocsSidebarPageNode } from './docs-tree';

const url = '/en/api-reference/example';
const page = (suffix = ''): DocsSidebarPageNode => ({
  id: url + suffix,
  title: 'Example',
  type: 'page',
  url: url + suffix,
});

describe('authored REST HTTP methods', () => {
  it('keeps page and fragment methods independent inside nested menus', () => {
    const nodes = withDocsHttpMethods(
      [
        {
          id: 'rest',
          title: 'RESTful API',
          type: 'section',
          children: [
            page(),
            page('#create'),
            page('#query'),
            page('#limits'),
            page('#toString'),
          ],
        },
      ],
      [
        {
          url,
          data: {
            httpMethod: 'PATCH',
            httpMethods: { create: 'POST', query: 'GET' },
          },
        },
      ],
    );
    expect(nodes[0]).toMatchObject({
      children: [
        { method: 'PATCH' },
        { method: 'POST' },
        { method: 'GET' },
        page('#limits'),
        page('#toString'),
      ],
    });
  });

  it('does not label an overview with the first operation method', () => {
    expect(
      withDocsHttpMethods(
        [page()],
        [{ url, data: { httpMethods: { create: 'POST' } } }],
      ),
    ).toEqual([page()]);
  });

  it('preserves OpenAPI methods, product context, and external links', () => {
    const operation = {
      ...page(),
      method: 'DELETE',
      search: { from: '/en/realtime-media/rtc' },
    };
    const external = { ...page(), external: true };
    expect(
      withDocsHttpMethods(
        [operation, external],
        [{ url, data: { httpMethod: 'POST' } }],
      ),
    ).toEqual([operation, external]);
  });

  it('leaves guides and unresolved links without badges and does not mutate inputs', () => {
    const node = page();
    expect(withDocsHttpMethods([node], [])).toEqual([node]);
    withDocsHttpMethods([node], [{ url, data: { httpMethod: 'GET' } }]);
    expect(node).not.toHaveProperty('method');
  });
});
