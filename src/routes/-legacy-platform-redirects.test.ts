import { isRedirect } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import regressions from '../../scripts/fixtures/shengwang-platform-redirects.json';
import { Route as ApiRoute } from './api-ref/$';
import { Route as DocRoute } from './doc/$';

describe('legacy links preserve the source documentation platform', () => {
  it.each(regressions)(
    'selects $platform directly for $source, including query, hash and trailing slash',
    ({ source, target }) => {
      const route = source.startsWith('/api-ref/') ? ApiRoute : DocRoute;
      const loader = route.options.loader as (input: unknown) => unknown;
      for (const ending of ['', '/']) {
        let caught: unknown;
        try {
          loader({
            params: {
              _splat: source.replace(/^\/(?:api-ref|doc)\//, '') + ending,
            },
            location: {
              searchStr: '?from=legacy&tag=a&tag=b',
              hash: '实现步骤',
            },
          });
        } catch (error) {
          caught = error;
        }
        expect(isRedirect(caught)).toBe(true);
        expect(caught).toMatchObject({
          options: {
            href:
              target +
              '?from=legacy&tag=a&tag=b#%E5%AE%9E%E7%8E%B0%E6%AD%A5%E9%AA%A4',
            statusCode: 301,
          },
        });
      }
    },
  );

  it('pins the Web platform in the quickstart destination', () => {
    const loader = DocRoute.options.loader as (input: unknown) => unknown;
    let caught: unknown;
    try {
      loader({
        params: { _splat: 'rtc/javascript/get-started/quick-start' },
      });
    } catch (error) {
      caught = error;
    }

    expect(isRedirect(caught)).toBe(true);
    expect(caught).toMatchObject({
      options: {
        href: '/realtime-media/rtc/get-started/quick-start/web',
        statusCode: 301,
      },
    });
  });
});
