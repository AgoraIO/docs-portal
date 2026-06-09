import { describe, expect, it } from 'vitest';
import { docsMetaSchema } from './docs-meta-schema';

describe('docsMetaSchema', () => {
  it('accepts a plain nav scope', () => {
    expect(
      docsMetaSchema.parse({
        navScope: {},
        pages: ['index', 'android'],
        title: 'RTC',
      }),
    ).toEqual({
      navScope: {},
      pages: ['index', 'android'],
      title: 'RTC',
    });
  });

  it('accepts a versioned nav scope', () => {
    expect(
      docsMetaSchema.parse({
        navScope: {
          defaultVersion: 'current',
          platformTabs: true,
          presentation: 'tabs',
          sharedSidebar: true,
          versions: [
            { id: 'current', label: 'v4.6.2', path: '(current)' },
            { id: '4.6.0', label: 'v4.6.0', path: '4.6.0' },
          ],
        },
        pages: ['(current)', '4.6.0'],
        title: 'Android API Reference',
      }).navScope,
    ).toEqual({
      defaultVersion: 'current',
      platformTabs: true,
      presentation: 'tabs',
      sharedSidebar: true,
      versions: [
        { id: 'current', label: 'v4.6.2', path: '(current)' },
        { id: '4.6.0', label: 'v4.6.0', path: '4.6.0' },
      ],
    });
  });

  it('rejects incomplete version entries', () => {
    expect(() =>
      docsMetaSchema.parse({
        navScope: {
          versions: [{ id: 'current', label: 'v4.6.2' }],
        },
      }),
    ).toThrow();
  });
});
