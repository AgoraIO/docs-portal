import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';
import type { Root } from 'mdast';
import { remark } from 'remark';
import { describe, expect, it } from 'vitest';
import { directiveCalloutTypes } from '@/lib/mdx/directive-callouts';
import {
  getOpenApiQuoteCallout,
  remarkOpenApiCallouts,
} from './remark-callouts';

function clean(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(clean);
  if (!node || typeof node !== 'object') return node;
  return Object.fromEntries(
    Object.entries(node)
      .filter(([key]) => key !== 'position' && key !== 'data')
      .map(([key, value]) => [key, clean(value)]),
  );
}

describe('explicit OpenAPI quote types', () => {
  it('preserves lists, code and links when consuming a type marker', () => {
    const body = '- 必须设置 `uid`。\n- 参考[说明](/reference)。';
    const parser = remark().use(remarkOpenApiCallouts);
    const quote = (text: string) =>
      text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
    const before = parser.parse(quote(body));
    const after = parser.runSync(
      parser.parse(`> [!CAUTION]\n>\n${quote(body)}`),
    );
    expect(clean(after)).toEqual(clean(before));
    const block = (after as Root).children[0];
    expect(block.data?.hProperties?.['data-callout']).toBe('CAUTION');
  });

  it('does not treat fenced examples or unknown markers as typed notices', () => {
    const parser = remark().use(remarkOpenApiCallouts);
    const text =
      '```markdown\n> [!CAUTION]\n> Example only.\n```\n\n> [!CUSTOM]\n> Literal quote.';
    const before = parser.parse(text);
    expect(clean(parser.runSync(before))).toEqual(clean(parser.parse(text)));
  });

  it('requires maintained OpenAPI notices to declare their severity explicitly', () => {
    const parser = remark();
    const files: string[] = [];
    const collect = (dir: string) => {
      for (const item of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) collect(full);
        else if (/\.ya?ml$/.test(item.name)) files.push(full);
      }
    };
    collect(path.join(process.cwd(), 'content/openapi'));
    const missing: string[] = [];
    let quotes = 0;
    const walk = (value: unknown, location: string) => {
      if (Array.isArray(value)) {
        for (const [index, item] of value.entries())
          walk(item, `${location}[${index}]`);
        return;
      }
      if (!value || typeof value !== 'object') return;
      for (const [key, child] of Object.entries(value)) {
        if (
          Array.isArray(child) &&
          (key === 'x-docs-callouts' || key === 'x-docs-sections')
        ) {
          for (const [index, entry] of child.entries()) {
            if (
              !entry ||
              typeof entry !== 'object' ||
              (key === 'x-docs-sections' && entry.type !== 'callout')
            )
              continue;
            const type = key === 'x-docs-callouts' ? entry.type : entry.variant;
            if (
              typeof type !== 'string' ||
              (!Object.hasOwn(directiveCalloutTypes, type) &&
                type !== 'important' &&
                type !== 'idea')
            )
              missing.push(`${location}.${key}[${index}]`);
          }
        }
        if (
          typeof child === 'string' &&
          (key === 'description' || key === 'markdown')
        ) {
          const inspect = (node: {
            type: string;
            value?: string;
            children?: unknown[];
          }) => {
            if (node.type === 'blockquote') {
              quotes++;
              const paragraph = node.children?.[0] as {
                children?: { value?: string }[];
              };
              const marker = /^\[!([A-Z]+)\](?:[ \t]*\r?\n|[ \t]*$)/.exec(
                paragraph?.children?.[0]?.value ?? '',
              );
              if (!marker || !getOpenApiQuoteCallout(marker[1]))
                missing.push(`${location}.${key}`);
            }
            for (const item of node.children ?? [])
              inspect(item as Parameters<typeof inspect>[0]);
          };
          inspect(parser.parse(child));
        } else walk(child, `${location}.${key}`);
      }
    };
    for (const file of files)
      walk(
        yaml.load(readFileSync(file, 'utf8')),
        path.relative(process.cwd(), file),
      );
    expect(quotes).toBeGreaterThan(0);
    expect(
      missing,
      'Add an explicit > [!NOTE], > [!CAUTION] or other supported type; preserve the quote text.',
    ).toEqual([]);
  });
});
