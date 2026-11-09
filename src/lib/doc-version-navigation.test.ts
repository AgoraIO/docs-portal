import { describe, expect, it } from 'vitest';
import {
  getDocVersionCatalogPages,
  getDocVersionCatalogScope,
  getDocVersionEntryHref,
} from './doc-version-navigation';
import { getDocVersionSelections, getDocVersionTarget } from './doc-versions';
import type { DocsSidebarNode } from './docs-tree';

const apiRoot = '/en/api-reference/api-ref/conversational-ai';
const sdkRoot = '/en/api-reference/api-ref/server-sdk';

describe('documentation version navigation', () => {
  it('uses neutral navigation entries while preserving explicit edition URLs', () => {
    expect(getDocVersionEntryHref('/en/ai')).toBe(
      '/en/ai/documentation-versions',
    );
    expect(getDocVersionEntryHref(apiRoot)).toBe(
      `${apiRoot}/documentation-versions`,
    );
    for (const href of [
      '/en/ai/platform',
      '/en/ai/build/managed-mode',
      '/zh-CN/ai',
      '/en/realtime-media',
    ]) {
      expect(getDocVersionEntryHref(href)).toBe(href);
    }
  });

  it('updates REST and every SDK catalog link using one edition choice', () => {
    const scope = getDocVersionCatalogScope(
      '/en/api-reference',
      'separator-Voice Agents',
    );
    if (!scope) throw new Error('Missing configured Voice Agents catalog');
    const urls = [
      apiRoot,
      ...['python', 'typescript', 'go'].map(
        (language) => `${sdkRoot}/${language}`,
      ),
      '/en/api-reference/api-ref/rtc',
    ];
    const nodes: DocsSidebarNode[] = urls.map((url) => ({
      type: 'page',
      id: url,
      url,
      title: url,
    }));
    expect(
      getDocVersionCatalogPages(nodes, scope, 'v2').map(
        (node) => node.type === 'page' && node.url,
      ),
    ).toEqual([
      `${apiRoot}/platform`,
      ...['python', 'typescript', 'go'].map(
        (language) => `${sdkRoot}/platform/${language}`,
      ),
      '/en/api-reference/api-ref/rtc',
    ]);
    expect(
      getDocVersionCatalogScope(
        '/zh-CN/api-reference',
        'separator-Voice Agents',
      ),
    ).toBeUndefined();
    expect(
      getDocVersionCatalogScope('/en/ai', 'separator-Voice Agents'),
    ).toBeUndefined();
  });

  it.each(['python', 'typescript', 'go'])(
    'maps %s SDK pages in both directions',
    (language) => {
      expect(getDocVersionTarget(`${sdkRoot}/${language}`, 'v2')?.href).toBe(
        `${sdkRoot}/platform/${language}`,
      );
      expect(
        getDocVersionTarget(`${sdkRoot}/platform/${language}`, 'v1')?.href,
      ).toBe(`${sdkRoot}/${language}`);
    },
  );

  it('keeps the visible rollout consistent with a shared SDK URL without changing stored intent', () => {
    const saved = { convoai: 'v1' };
    const selections = getDocVersionSelections(`${sdkRoot}/platform/go`, saved);
    expect(selections).toMatchObject({
      'convoai-guides': 'v2',
      'convoai-api': 'v2',
      'convoai-sdk': 'v2',
    });
    expect(saved).toEqual({ convoai: 'v1' });
    expect(
      getDocVersionSelections('/en/api-reference', saved)['convoai-api'],
    ).toBe('v1');
    expect(
      getDocVersionTarget(`${sdkRoot}/documentation-versions`, 'v2')?.href,
    ).toBe(`${sdkRoot}/platform/python`);
  });
});
