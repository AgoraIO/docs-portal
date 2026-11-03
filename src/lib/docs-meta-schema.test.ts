import { describe, expect, it } from 'vitest';
import { docsMetaSchema } from './docs-meta-schema';

describe('docsMetaSchema', () => {
  it('retains a declared sidebar on a scope without version metadata', () => {
    const sidebar = [
      {
        title: 'API 参考',
        pages: [
          {
            title: '会议 SDK API',
            url: '/zh-CN/api-reference/meeting/android',
          },
        ],
      },
    ];
    const parsed = docsMetaSchema.parse({
      title: 'Android',
      navScope: { sidebar },
      pages: ['index'],
    });
    expect(parsed.navScope).toEqual({ sidebar });
    expect(parsed.navScope?.versions).toBeUndefined();
  });

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

  it('normalizes external sidebar page entries to Fumadocs link syntax', () => {
    expect(
      docsMetaSchema.parse({
        pages: [
          'index',
          {
            external: true,
            href: 'https://example.com/resources',
            title: 'External Resource',
          },
        ],
      }).pages,
    ).toEqual([
      'index',
      'external:[External Resource](https://example.com/resources)',
    ]);
  });

  it('normalizes structured sidebar groups to page-tree separator entries', () => {
    expect(
      docsMetaSchema.parse({
        pages: [
          'index',
          {
            collapsible: true,
            icon: 'Play',
            pages: ['start-agent', 'stop-agent'],
            title: 'Create and connect an agent',
            type: 'group',
          },
          {
            collapsible: false,
            pages: ['architecture'],
            title: 'Plan architecture',
            type: 'group',
          },
        ],
      }).pages,
    ).toEqual([
      'index',
      '---[Play]Create and connect an agent{dropdown}---',
      'start-agent',
      'stop-agent',
      '---{flat}---',
      '---Plan architecture{flat}---',
      'architecture',
      '---{flat}---',
    ]);
  });

  it('normalizes structural-only sidebar groups to hidden separators', () => {
    expect(
      docsMetaSchema.parse({
        pages: [
          {
            pages: ['api-ref', 'rtc'],
            sidebarHidden: true,
            title: 'Product reference',
            type: 'group',
          },
        ],
      }).pages,
    ).toEqual([
      '---Product reference{hidden}---',
      'api-ref',
      'rtc',
      '---{flat}---',
    ]);
  });

  it('treats sidebar page objects as external links by default', () => {
    expect(
      docsMetaSchema.parse({
        pages: [
          {
            href: 'https://example.com/resources',
            title: 'External Resource',
          },
        ],
      }).pages,
    ).toEqual(['external:[External Resource](https://example.com/resources)']);
  });

  it('rejects non-external sidebar page objects', () => {
    expect(() =>
      docsMetaSchema.parse({
        pages: [
          {
            external: false,
            href: '/en/introduction',
            title: 'Introduction',
          },
        ],
      }),
    ).toThrow();
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

  it('preserves context-specific versions with independently reused current ids', () => {
    const navScope = {
      defaultVersion: 'current',
      versions: [{ id: 'current', label: 'React v2.5.0', path: '.' }],
      versionOverrides: [
        {
          path: 'web-sdk',
          versions: [{ id: 'current', label: 'Web v4.24.0', path: '.' }],
        },
        {
          path: 'web-sdk/interfaces',
          versions: [{ id: 'current', label: 'Interface', path: '.' }],
        },
      ],
    };

    expect(docsMetaSchema.parse({ navScope }).navScope).toEqual(navScope);
  });

  it.each([
    '',
    '.',
    '..',
    '/web-sdk',
    'web-sdk/',
    'web-sdk//types',
    'web-sdk/../types',
    'web-sdk?query',
    'web-sdk#hash',
    ' web-sdk',
    'web-sdk\\types',
    'https://example.com',
  ])('rejects invalid override path %j', (path) => {
    expect(() =>
      docsMetaSchema.parse({
        navScope: {
          versionOverrides: [
            { path, versions: [{ id: 'current', label: 'Web', path: '.' }] },
          ],
        },
      }),
    ).toThrow();
  });

  it('rejects empty override version lists', () => {
    expect(() =>
      docsMetaSchema.parse({
        navScope: { versionOverrides: [{ path: 'web-sdk', versions: [] }] },
      }),
    ).toThrow();
  });

  it.each(['default', 'override'])(
    'rejects duplicate ids in one %s version list',
    (list) => {
      const versions = [
        { id: 'current', label: 'First', path: '.' },
        { id: 'current', label: 'Second', path: 'older' },
      ];
      expect(() =>
        docsMetaSchema.parse({
          navScope:
            list === 'default'
              ? { versions }
              : { versionOverrides: [{ path: 'web-sdk', versions }] },
        }),
      ).toThrow();
    },
  );
});
