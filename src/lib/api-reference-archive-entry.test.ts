import { describe, expect, it } from 'vitest';
import {
  buildApiReferenceRail,
  getApiReferenceNodeMeta,
} from './api-reference-sidebar.testkit';
import { resolveDocsNavScope } from './docs-nav-scope';
import { source } from './source.server';

describe('api reference archive entry (option a)', () => {
  it('renders the api-ref catalog as a single collapsed "All SDK versions" entry', () => {
    const rail = buildApiReferenceRail();
    const flat = rail.flatMap((n) =>
      n.type === 'section' ? [n, ...n.children] : [n],
    );
    const archive = flat.find((n) => n.title === 'All SDK versions');
    expect(archive).toBeDefined();
    expect((archive as { url?: string }).url).toBe('/en/api-reference/api-ref');
    expect((archive as { type?: string }).type).toBe('section');
    expect((archive as { collapsible?: boolean }).collapsible).toBe(true);
    expect((archive as { children?: unknown[] }).children ?? []).toHaveLength(
      0,
    );
  });

  it('keeps a lane navScope-resolvable (focused endpoint sidebar still works)', () => {
    const root = source.getPageTree('en');
    const scope = resolveDocsNavScope({
      activePath: '/en/api-reference/api-ref/rtc',
      getNodeMeta: getApiReferenceNodeMeta,
      root,
      tab: 'api-reference',
    });
    expect(scope).not.toBeNull();
  });
});
