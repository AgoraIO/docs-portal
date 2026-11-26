import { isRedirect } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import regressions from '../../scripts/fixtures/shengwang-jenkins-158-redirects.json';
import { Route as ApiRoute } from './api-ref/$';
import { Route as DocRoute } from './doc/$';

type LegacyLoader = (context: { params: { _splat: string } }) => unknown;

describe('reviewed legacy redirects in the application router', () => {
  it.each(regressions)('redirects $source to $target', ({ source, target }) => {
    const route = source.startsWith('/api-ref/') ? ApiRoute : DocRoute;
    const loader = route.options.loader as LegacyLoader;
    expect(loader).toBeTypeOf('function');
    const splat = source.replace(/^\/(?:api-ref|doc)\//, '');

    for (const value of [splat, `${splat}/`]) {
      let caught: unknown;
      try {
        loader({ params: { _splat: value } });
      } catch (error) {
        caught = error;
      }
      expect(isRedirect(caught)).toBe(true);
      expect(caught).toMatchObject({
        options: { href: target, statusCode: 301 },
        status: 301,
      });
    }
  });

  it('keeps unreviewed API references on the existing legacy component', () => {
    const loader = ApiRoute.options.loader as LegacyLoader;
    expect(
      loader({ params: { _splat: 'rtc/android/unknown-api' } }),
    ).toBeUndefined();
    expect(ApiRoute.options.component).toBeTypeOf('function');
  });
});
