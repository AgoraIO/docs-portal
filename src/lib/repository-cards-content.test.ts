import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';

const docsRoot = resolve(process.cwd(), 'content/docs/zh-CN');

function readDocs(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? readDocs(path)
      : /\.mdx?$/.test(entry.name)
        ? [path]
        : [];
  });
}

function readRepositoryCard(source: string) {
  const href = source.match(
    /\bhref="(https?:\/\/(?:gitee|github)\.com\/[^"]+)"/,
  )?.[1];
  if (!href) return null;
  const wrapped = source.match(
    /title=\{<RepositoryCardTitle provider="(gitee|github)">([^<]+)<\/RepositoryCardTitle>\}/,
  );
  const title = wrapped?.[2] ?? source.match(/\btitle="([^"]+)"/)?.[1];
  if (!title) return null;
  return {
    provider: new URL(href).hostname.split('.')[0],
    title,
    iconProvider: wrapped?.[1],
    source,
  };
}

const groups = readDocs(docsRoot).flatMap((path) => {
  const source = readFileSync(path, 'utf8');
  return [...source.matchAll(/<Cards\b[\s\S]*?<\/Cards>/g)].map((match) => ({
    path: relative(docsRoot, path),
    line: source.slice(0, match.index).split('\n').length,
    source: match[0],
    cards: [...match[0].matchAll(/<Card\b[\s\S]*?\/>/g)]
      .map(([card]) => readRepositoryCard(card))
      .filter((card) => card !== null),
  }));
});

describe('Chinese paired repository cards', () => {
  it('identifies both hosts of every same-name repository pair with inline icons', () => {
    const pairs = groups.flatMap((group) =>
      group.cards
        .filter((card) =>
          group.cards.some(
            (other) =>
              other.title === card.title && other.provider !== card.provider,
          ),
        )
        .map((card) => ({ ...card, location: `${group.path}:${group.line}` })),
    );
    expect(pairs.length).toBeGreaterThanOrEqual(334);
    const missing = pairs
      .filter((card) => card.iconProvider !== card.provider)
      .map((card) => `${card.location}: ${card.provider} / ${card.title}`);
    expect(missing).toEqual([]);
  });

  it('keeps repository title markup compilable as MDX', async () => {
    const repositoryGroups = groups.filter((group) =>
      group.source.includes('<RepositoryCardTitle'),
    );
    expect(repositoryGroups.length).toBeGreaterThan(0);
    for (const group of repositoryGroups) {
      await expect(
        compile(group.source),
        `${group.path}:${group.line}`,
      ).resolves.toBeDefined();
    }
  }, 20_000);
});
