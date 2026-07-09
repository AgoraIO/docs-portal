import type { SearchClient } from 'fumadocs-core/search/client';
import type { SearchEntry } from '../docs-search';
import type { DocsSearchScope } from './search-provider';

const ORAMA_DOCS_SCHEMA = {
  content: 'string',
  description: 'string',
  objectType: 'enum',
  platform: 'enum[]',
  product: 'enum',
  tab: 'enum',
  title: 'string',
  url: 'string',
} as const;

export function createOramaDocsClient({
  pages,
  platform,
  scope,
}: {
  pages: SearchEntry[];
  platform?: string;
  scope?: DocsSearchScope;
}): SearchClient {
  let database: ReturnType<typeof createOramaDocsDatabase> | undefined;

  return {
    deps: [pages],
    async search(query) {
      if (!query.trim()) {
        return [];
      }

      database ??= createOramaDocsDatabase(pages);
      const { search } = await import('@orama/orama');
      const result = await search(await database, {
        boost: {
          title: 4,
          description: 2,
        },
        limit: 12,
        properties: ['title', 'description', 'content', 'url'],
        term: query,
        where: buildWhereFilter({ platform, scope }),
      });

      return result.hits.map(({ document }) => ({
        content: document.title,
        id: document.url,
        objectType: document.objectType,
        platform: document.platform,
        product: document.product,
        tab: document.tab,
        title: document.title,
        type: 'page' as const,
        url: document.url,
      }));
    },
  };
}

async function createOramaDocsDatabase(pages: SearchEntry[]) {
  const { create, insertMultiple } = await import('@orama/orama');
  const database = create({
    components: {
      tokenizer: createDocsTokenizer(),
    },
    schema: ORAMA_DOCS_SCHEMA,
  });

  await insertMultiple(
    database,
    pages.map((page) => ({
      content: page.content ?? '',
      description: page.description ?? '',
      objectType: page.objectType ?? 'docs',
      platform: page.platform ?? [],
      product: page.product ?? '',
      tab: page.tab ?? '',
      title: page.title,
      url: page.url,
    })),
  );

  return database;
}

function buildWhereFilter({
  platform,
  scope,
}: {
  platform?: string;
  scope?: DocsSearchScope;
}) {
  const conditions = [
    platform
      ? {
          platform: {
            containsAll: [platform],
          },
        }
      : undefined,
    scope
      ? {
          [scope.field]: {
            eq: scope.value,
          },
        }
      : undefined,
  ].filter((condition) => condition !== undefined);

  if (conditions.length === 0) {
    return undefined;
  }

  return conditions.length === 1 ? conditions[0] : { and: conditions };
}

function createDocsTokenizer() {
  return {
    language: 'docs',
    normalizationCache: new Map<string, string>(),
    tokenize(raw: string) {
      const normalized = raw.normalize('NFKC').toLowerCase();
      const sourceTokens =
        normalized.match(/[\p{Script=Han}]+|[\p{Letter}\p{Number}_-]+/gu) ?? [];
      const tokens = new Set<string>();

      for (const sourceToken of sourceTokens) {
        tokens.add(sourceToken);

        if (!/\p{Script=Han}/u.test(sourceToken)) {
          continue;
        }

        const characters = Array.from(sourceToken);
        for (const character of characters) {
          tokens.add(character);
        }
        for (let index = 0; index < characters.length - 1; index += 1) {
          tokens.add(`${characters[index]}${characters[index + 1]}`);
        }
      }

      return [...tokens];
    },
  };
}
