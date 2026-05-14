import { isNotFound, isRedirect } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { Route as DocPageRoute } from './$locale/$tab/$slug';
import { Route as TabIndexRoute } from './$locale/$tab/index';
import { Route as LocaleIndexRoute } from './$locale/index';

function getLoader(route: { options: { loader?: unknown } }) {
  return route.options.loader as (context: never) => Promise<unknown> | unknown;
}

describe('docs route locale guards', () => {
  it('rejects unsupported locale on the locale index route', async () => {
    try {
      await getLoader(LocaleIndexRoute)({
        params: {
          locale: 'docs',
        },
      } as never);
    } catch (error) {
      expect(isNotFound(error)).toBe(true);
      return;
    }

    throw new Error('expected loader to reject with notFound');
  });

  it('rejects unsupported locale on the tab index route before content lookup', async () => {
    try {
      await getLoader(TabIndexRoute)({
        params: {
          locale: 'doc',
          tab: 'introduction',
        },
      } as never);
    } catch (error) {
      expect(isNotFound(error)).toBe(true);
      return;
    }

    throw new Error('expected loader to reject with notFound');
  });

  it('rejects unsupported locale on the page route before page lookup', async () => {
    try {
      await getLoader(DocPageRoute)({
        params: {
          locale: 'docs',
          slug: 'index',
          tab: 'introduction',
        },
      } as never);
    } catch (error) {
      expect(isNotFound(error)).toBe(true);
      return;
    }

    throw new Error('expected loader to reject with notFound');
  });

  it('redirects supported locale index routes into the introduction tab', async () => {
    try {
      await getLoader(LocaleIndexRoute)({
        params: {
          locale: 'en',
        },
      } as never);
    } catch (error) {
      expect(isRedirect(error)).toBe(true);
      expect(error).toMatchObject({
        options: {
          href: '/en/introduction/about-agora',
          statusCode: 307,
        },
        status: 307,
      });
      return;
    }

    throw new Error('expected loader to reject with redirect');
  });

});
