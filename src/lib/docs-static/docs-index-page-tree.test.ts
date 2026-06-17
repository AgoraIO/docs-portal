import { describe, expect, it } from 'vitest';
import { getFirstTabPageUrl } from '../docs-tree';
import { getDocsIndex } from './docs-index.server';
import {
  getDocsIndexCompatiblePageTree,
  getDocsIndexCompatibleNodeMeta,
} from './docs-index-page-tree';

describe('docs index compatible page tree', () => {
  it('builds tab roots that work with docs-tree helpers', () => {
    const root = getDocsIndexCompatiblePageTree(getDocsIndex(), 'en');

    expect(getFirstTabPageUrl(root, 'ai')).toBe('/en/ai');
    expect(getFirstTabPageUrl(root, 'realtime-media')).toBe('/en/realtime-media');
  });

  it('exposes folder meta for nav-scope consumers', () => {
    const index = getDocsIndex();
    const root = getDocsIndexCompatiblePageTree(index, 'en');
    const realtimeTab = root.children[0]?.children.find(
      (node) => node.type === 'folder' && node.$id === 'en/realtime-media',
    );
    const rtcFolder =
      realtimeTab?.type === 'folder'
        ? realtimeTab.children.find(
            (node) => node.type === 'folder' && node.$id === 'en/realtime-media/rtc',
          )
        : undefined;

    expect(rtcFolder?.type).toBe('folder');
    expect(
      rtcFolder?.type === 'folder'
        ? getDocsIndexCompatibleNodeMeta(index, rtcFolder)
        : undefined,
    ).toMatchObject({
      data: {
        navScope: {
          defaultVersion: 'android',
        },
      },
    });
  });

  it('preserves meta.json page ordering and separator markers for tab roots', () => {
    const root = getDocsIndexCompatiblePageTree(getDocsIndex(), 'en');
    const localeFolder = root.children[0];
    const introduction =
      localeFolder?.type === 'folder'
        ? localeFolder.children.find(
            (node) => node.type === 'folder' && node.$id === 'en/introduction',
          )
        : undefined;

    expect(introduction?.type).toBe('folder');
    expect(
      introduction?.type === 'folder'
        ? introduction.children.slice(0, 5).map((node) => {
            if (node.type === 'separator') {
              return { icon: node.icon, name: node.name, type: node.type };
            }

            return { name: node.name, type: node.type };
          })
        : [],
    ).toEqual(
      expect.arrayContaining([
        { name: 'Core Concepts', type: 'page' },
        { icon: 'Bot', name: 'Coding Agent Tools', type: 'separator' },
        { name: 'Start with AI', type: 'page' },
      ]),
    );
  });
});
