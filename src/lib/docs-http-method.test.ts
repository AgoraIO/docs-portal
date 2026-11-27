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

describe('REST article menus', () => {
  it('retargets old operation links to headings in the selected platform without duplicates', () => {
    const result = withDocsHttpMethods(
      [page(), { ...page('#create'), title: 'Create' }],
      [
        {
          url,
          data: { httpMethods: { create: 'POST', 'create-1': 'POST' } },
          toc: [
            { title: 'Create', url: '#create-1', search: { platform: 'ios' } },
          ],
        },
      ],
    );
    expect(result).toMatchObject([
      page(),
      {
        title: 'Create',
        url: `${url}#create-1`,
        href: `${url}/ios#create-1`,
        method: 'POST',
      },
    ]);
  });
  it('expands mapped headings into endpoint links and preserves platform and product context', () => {
    const result = withDocsHttpMethods(
      [{ ...page(), search: { from: '/en/realtime-media/im' } }],
      [
        {
          url,
          data: { httpMethods: { create: 'POST', remove: 'DELETE' } },
          toc: [
            { title: 'Create', url: '#create', search: { platform: 'ios' } },
            { title: 'Limits', url: '#limits' },
            { title: 'Remove', url: '#remove', search: { platform: 'ios' } },
          ],
        },
      ],
    );
    expect(result[0]).toMatchObject({
      type: 'section',
      title: 'Example',
      collapsible: true,
      children: [
        { title: 'Overview', url },
        {
          title: 'Create',
          url: `${url}#create`,
          method: 'POST',
          search: { from: '/en/realtime-media/im' },
          href: `${url}/ios#create`,
        },
        { title: 'Remove', url: `${url}#remove`, method: 'DELETE' },
      ],
    });
  });

  it('does not duplicate existing article links or manufacture unresolved fragments', () => {
    const nodes = [page(), page('#create')];
    const result = withDocsHttpMethods(nodes, [
      {
        url,
        data: { httpMethods: { create: 'POST', missing: 'GET' } },
        toc: [{ title: 'Create', url: '#create' }],
      },
    ]);
    expect(result).toMatchObject([
      page(),
      {
        ...page('#create'),
        title: 'Create',
        method: 'POST',
        href: `${url}#create`,
      },
    ]);
  });
});
