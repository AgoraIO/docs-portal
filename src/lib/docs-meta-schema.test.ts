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
});
