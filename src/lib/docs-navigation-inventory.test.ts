import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Folder, Node, Root } from 'fumadocs-core/page-tree';
import { expect, it } from 'vitest';
import type { DocsMeta } from './docs-meta-schema';
import { resolveDocsNavScope } from './docs-nav-scope';
import { resolveNavigationParent } from './docs-navigation-parent';
import { loadDocsPagePayload } from './docs-page.server';
import { source } from './source';

it('audits API ownership across both locale source trees and verifies each recovered scope', async () => {
  const rows = [];
  const samples = new Map<
    string,
    { url: string; locale: string; title: string }
  >();
  for (const locale of ['zh-CN', 'en']) {
    const root = source.getPageTree(locale);
    const getMeta = (node: Folder | Root): DocsMeta | undefined =>
      source.getNodeMeta(node, locale)?.data;
    const visible = new Set<string>();
    const visit = (nodes: Node[]) => {
      for (const node of nodes) {
        if (node.type === 'page') visible.add(node.url);
        if (node.type === 'folder') {
          if (node.index) visible.add(node.index.url);
          visit(node.children);
        }
      }
    };
    visit(root.children);
    for (const page of source.getPages(locale)) {
      if (!page.url.includes('/api-reference/')) continue;
      const options = {
        activePath: page.url,
        root,
        tab: 'api-reference',
        getNodeMeta: getMeta,
      };
      const before = resolveDocsNavScope(options);
      const after =
        before ??
        resolveDocsNavScope({
          ...options,
          contentPath: page.path,
          getNodePath: (node) => source.getNodeMeta(node, locale)?.path,
        });
      const parent = resolveNavigationParent(root, page.url, getMeta);
      if (!before && after) {
        const scopePath = source.getNodeMeta(after.scope.node, locale)?.path;
        if (!scopePath)
          throw new Error(`Missing scope metadata for ${page.url}`);
        expect(
          page.path.startsWith(
            scopePath.slice(0, scopePath.lastIndexOf('/') + 1),
          ),
        ).toBe(true);
        const key = `${locale}:${scopePath}:${after.activeVersion?.id}`;
        if (!samples.has(key))
          samples.set(key, {
            url: page.url,
            locale,
            title: after.header.title,
          });
      }
      rows.push({
        locale,
        url: page.url,
        path: page.path,
        visible: visible.has(page.url),
        before: before?.header.title,
        after: after?.header.title,
        scope: after
          ? source.getNodeMeta(after.scope.node, locale)?.path
          : undefined,
        version: after?.activeVersion?.id,
        parent: parent?.url,
      });
    }
  }
  const verified = [];
  for (const sample of samples.values()) {
    const page = await loadDocsPagePayload(
      sample.locale,
      'api-reference',
      sample.url.split('/').slice(3),
    );
    expect(page).toBeTruthy();
    if (page && 'redirectUrl' in page) {
      verified.push({ ...sample, redirect: page.redirectUrl });
    } else if (page) {
      expect(page.sidebarHeader?.title).toBe(sample.title);
      verified.push({ ...sample, header: page.sidebarHeader?.title });
    }
  }
  if (process.env.DOCS_NAV_AUDIT_OUTPUT) {
    writeFileSync(
      process.env.DOCS_NAV_AUDIT_OUTPUT,
      JSON.stringify({ rows, verified }, null, 2),
    );
  }
}, 120_000);

it('declares only direct type-index entries that have local detail files', () => {
  const rtc = 'content/docs/zh-CN/api-reference/rtc';
  for (const entry of readdirSync(rtc, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const folder = join(rtc, entry.name, '(current)');
    let meta: DocsMeta;
    try {
      meta = JSON.parse(readFileSync(join(folder, 'meta.json'), 'utf8'));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw error;
    }
    for (const [parent, children] of Object.entries(
      meta.navigationParents ?? {},
    )) {
      const text = readFileSync(
        join(folder, `${parent.split('/').at(-1)}.mdx`),
        'utf8',
      );
      const listed = [
        ...text.matchAll(/^- \[[^\]]+\]\(([^)#]+)(?:#[^)]*)?\)/gm),
      ].map((match) => match[1]);
      for (const child of children) {
        expect(listed).toContain(child);
        const prefix = `/zh-CN/api-reference/rtc/${entry.name}/`;
        expect(child.startsWith(prefix)).toBe(true);
        expect(
          readFileSync(
            join(folder, `${child.slice(prefix.length)}.mdx`),
            'utf8',
          ),
        ).toContain('title:');
      }
    }
  }
});
