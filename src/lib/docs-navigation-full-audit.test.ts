import { mkdirSync, writeFileSync } from 'node:fs';
import type { Node } from 'fumadocs-core/page-tree';
import { expect, it } from 'vitest';
import { zhCNApiReferenceCards } from './api-reference-cards-data.zh-cn';
import { loadDocsPagePayload } from './docs-page.server';
import type { DocsSidebarNode } from './docs-tree';
import { source } from './source';

it.skipIf(!process.env.DOCS_NAV_FULL_AUDIT)(
  'loads every API page and records actual navigation, redirects and failures',
  async () => {
    const output = process.env.DOCS_NAV_FULL_AUDIT ?? '';
    mkdirSync(output, { recursive: true });
    const roots = new Set<string>();
    const publicPath = (url: string) =>
      url.replace(/^\/zh-CN(?=\/|$)/, '') || '/';
    const visit = (nodes: Node[]) => {
      for (const node of nodes) {
        if (node.type === 'page') roots.add(publicPath(node.url));
        if (node.type === 'folder') {
          if (node.index) roots.add(publicPath(node.index.url));
          visit(node.children);
        }
      }
    };
    for (const entry of zhCNApiReferenceCards.all)
      if (entry.href.startsWith('/')) roots.add(publicPath(entry.href));
    const rows = [];
    for (const locale of ['zh-CN', 'en']) {
      visit(source.getPageTree(locale).children);
      for (const page of source.getPages(locale)) {
        if (!page.url.includes('/api-reference/')) continue;
        const base = { locale, url: publicPath(page.url), path: page.path };
        try {
          const payload = await loadDocsPagePayload(
            locale,
            'api-reference',
            page.url.split('/').slice(3),
          );
          if (!payload) {
            rows.push({ ...base, state: 'missing' });
            continue;
          }
          if ('redirectUrl' in payload) {
            rows.push({
              ...base,
              state: 'redirect',
              target: publicPath(payload.redirectUrl),
            });
            continue;
          }
          const menu: { title: string; url: string; contains: boolean }[] = [];
          const flatten = (nodes: DocsSidebarNode[]) => {
            for (const node of nodes) {
              if (node.url)
                menu.push({
                  title: node.title,
                  url: publicPath(node.url),
                  contains: Boolean(node.containsActivePage),
                });
              if (node.type === 'section') flatten(node.children);
            }
          };
          flatten(payload.sidebar);
          const active = publicPath(payload.activePath);
          const selected = menu.filter(
            (node) => node.url === active || node.contains,
          );
          const breadcrumb = payload.breadcrumb.map((item) => ({
            title: item.title,
            url: item.url && publicPath(item.url),
          }));
          const errors = [];
          const sourceVersion = page.path
            .split('/')
            .find((segment) => /^\d+\.\d+\.\d+$/.test(segment));
          if (
            sourceVersion &&
            payload.sidebarHeader?.versionSwitcher?.currentId !== sourceVersion
          )
            errors.push('source-version-mismatch');
          if (selected.length > 1) errors.push('multiple-selected-items');
          if (
            selected.some(
              (item) =>
                item.contains &&
                !breadcrumb.some((crumb) => crumb.url === item.url),
            )
          )
            errors.push('parent-not-in-breadcrumb');
          rows.push({
            ...base,
            state: 'rendered',
            active,
            title: payload.title,
            header: payload.sidebarHeader?.title,
            version: payload.sidebarHeader?.versionSwitcher?.currentId,
            selected,
            breadcrumb,
            menuCount: menu.length,
            errors,
          });
        } catch (error) {
          rows.push({ ...base, state: 'error', error: String(error) });
        }
        if (rows.length % 100 === 0) {
          console.log(`Full navigation audit: ${rows.length} pages`);
          writeFileSync(
            `${output}/payloads.partial.json`,
            JSON.stringify({ roots: [...roots], rows }),
          );
        }
      }
    }
    writeFileSync(
      `${output}/payloads.json`,
      JSON.stringify({ roots: [...roots], rows }, null, 2),
    );
    expect(
      rows.filter((row) => row.state === 'error' || row.state === 'missing'),
    ).toEqual([]);
    expect(rows.filter((row) => 'errors' in row && row.errors?.length)).toEqual(
      [],
    );
  },
  1_200_000,
);
