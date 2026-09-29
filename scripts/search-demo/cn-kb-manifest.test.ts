import { describe, expect, it } from 'vitest';
import { cnKbManifest } from './cn-kb-manifest';

describe('CN KB manifest', () => {
  it('has five distinct, curated pages in each document shape', () => {
    const groups = new Map<string, string[]>();
    for (const entry of cnKbManifest) {
      groups.set(entry.kind, [...(groups.get(entry.kind) ?? []), entry.route]);
    }

    expect([...groups.keys()].sort()).toEqual([
      'api-reference',
      'faq',
      'overview',
      'platform-version',
      'tutorial',
    ]);
    expect(cnKbManifest).toHaveLength(25);
    expect([...groups.values()].map((routes) => routes.length)).toEqual([
      5, 5, 5, 5, 5,
    ]);
    expect(
      cnKbManifest.some((entry) =>
        entry.route.endsWith('/conversationalaiapi'),
      ),
    ).toBe(true);
  });

  it('contains no duplicate routes and every entry has a query fixture', () => {
    const routes = cnKbManifest.map((entry) => entry.route);

    expect(new Set(routes).size).toBe(routes.length);
    expect(cnKbManifest.every((entry) => entry.reason.length > 0)).toBe(true);
    expect(
      cnKbManifest.every((entry) => entry.sourcePath.endsWith('.mdx')),
    ).toBe(true);
    expect(cnKbManifest.every((entry) => entry.queryIds.length > 0)).toBe(true);
    expect(cnKbManifest.every((entry) => entry.product.length > 0)).toBe(true);
  });
});
