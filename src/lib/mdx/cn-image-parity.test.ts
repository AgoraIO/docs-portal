import { readFileSync } from 'node:fs';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';
import { isRetiredCnDocsPath } from '../retired-cn-docs.mjs';
import dimensions from './fixtures/cn-docs-image-dimensions.json';
import previousFixtures from './fixtures/cn-image-parity.json';

type ImageFixture = {
  file: string;
  src: string;
  component: string;
  count: number;
  width?: number;
  height?: number;
  displayWidth?: string;
  displayHeight?: string;
  images?: { platform: string | null; alt: string; title: string | null }[];
};

// Keep the previous inline-icon / RTC run-demo batch and the independently
// reviewed screenshot dimensions explicit. Never infer global asset defaults.
const consolidatedSources = new Set(
  (
    JSON.parse(
      readFileSync('docs/migration/cn-document-ownership.json', 'utf8'),
    ).documents as Array<{ supersededSource: string }>
  ).map(({ supersededSource }) =>
    supersededSource.replace(/^content\/docs\/zh-CN\//, ''),
  ),
);
const fixtures: ImageFixture[] = [
  ...previousFixtures,
  ...dimensions.restore,
].filter((fixture) => !consolidatedSources.has(fixture.file));
const activeDeferred = dimensions.deferred.filter(
  (fixture) => !consolidatedSources.has(fixture.file),
);
const parser = unified().use(remarkParse).use(remarkMdx);
const trees = new Map(
  [
    ...new Set([...fixtures, ...activeDeferred].map((fixture) => fixture.file)),
  ].map((file) => [
    file,
    parser.parse(readFileSync(`content/docs/zh-CN/${file}`, 'utf8')),
  ]),
);
const platforms = new WeakMap<object, string>();
for (const tree of trees.values()) {
  visit(tree, (node) => {
    if (
      (node.type !== 'mdxJsxFlowElement' &&
        node.type !== 'mdxJsxTextElement') ||
      (node.name !== 'PlatformStructured' && node.name !== 'PlatformInline')
    )
      return;
    const platform = node.attributes.find(
      (attribute) =>
        attribute.type === 'mdxJsxAttribute' && attribute.name === 'platform',
    );
    if (platform?.type !== 'mdxJsxAttribute') return;
    if (typeof platform.value !== 'string') return;
    const value = platform.value;
    visit(node, (child) => {
      platforms.set(child, value);
    });
  });
}

describe('reviewed Chinese image sizing', () => {
  it.each(fixtures)('$file preserves $component for $src', (fixture) => {
    const matches: Record<string, string>[] = [];
    const matchedPlatforms: (string | null)[] = [];
    let markdownCopies = 0;
    const tree = trees.get(fixture.file);
    if (!tree) throw new Error(`Missing parsed document: ${fixture.file}`);

    visit(tree, (node) => {
      if (node.type === 'image' && node.url === fixture.src) markdownCopies++;
      if (
        node.type !== 'mdxJsxTextElement' &&
        node.type !== 'mdxJsxFlowElement'
      )
        return;
      if (node.name !== fixture.component) return;
      const attributes: Record<string, string> = {};
      for (const attribute of node.attributes) {
        if (attribute.type !== 'mdxJsxAttribute') continue;
        const value = attribute.value;
        if (typeof value === 'string') attributes[attribute.name] = value;
        else if (value) attributes[attribute.name] = value.value;
      }
      if (attributes.src === fixture.src) {
        matches.push(attributes);
        matchedPlatforms.push(platforms.get(node) ?? null);
      }
    });

    expect(markdownCopies, 'image must not fall back to unsized Markdown').toBe(
      dimensions.deferred.find(
        (entry) => entry.file === fixture.file && entry.src === fixture.src,
      )?.count ?? 0,
    );
    expect(matches).toHaveLength(fixture.count);
    for (const [index, attributes] of matches.entries()) {
      expect(
        attributes.alt?.trim(),
        'image needs meaningful alt text',
      ).toBeTruthy();
      if (fixture.images) {
        expect(matchedPlatforms[index]).toBe(fixture.images[index].platform);
        expect(attributes.alt).toBe(fixture.images[index].alt);
        expect(attributes.title ?? null).toBe(fixture.images[index].title);
      }
      for (const dimension of [
        'width',
        'height',
        'displayWidth',
        'displayHeight',
      ] as const) {
        if (dimension in fixture) {
          expect(attributes[dimension]).toBe(String(fixture[dimension]));
        } else {
          expect(attributes[dimension]).toBeUndefined();
        }
      }
    }
  });

  it('keeps the approved restoration and deferred occurrence boundaries', () => {
    const count = (entries: { count: number }[]) =>
      entries.reduce((total, entry) => total + entry.count, 0);

    expect(count(dimensions.restore)).toBe(556);
    expect(dimensions.restore).toHaveLength(311);
    expect(
      new Set(dimensions.restore.map((fixture) => fixture.file)).size,
    ).toBe(158);
    expect(
      count(dimensions.restore.filter((fixture) => 'displayWidth' in fixture)),
    ).toBe(554);
    expect(
      count(dimensions.restore.filter((fixture) => 'displayHeight' in fixture)),
    ).toBe(2);
    expect(count(dimensions.deferred)).toBe(48);
    expect(dimensions.deferred).toHaveLength(15);
    expect(
      count(
        dimensions.deferred.filter(
          (fixture) => fixture.reason === 'ambiguous-size',
        ),
      ),
    ).toBe(13);
    expect(
      count(
        dimensions.deferred.filter(
          (fixture) => fixture.reason === 'full-width',
        ),
      ),
    ).toBe(17);
    expect(
      count(
        dimensions.deferred.filter(
          (fixture) => fixture.reason === 'source-unsized',
        ),
      ),
    ).toBe(18);

    for (const fixture of dimensions.restore) {
      expect(fixture.legacySource.length).toBeGreaterThan(0);
      expect(fixture.images).toHaveLength(fixture.count);
      if (fixture.displayWidth !== undefined) {
        expect(fixture.displayWidth).toMatch(/^\d+%$/);
        expect(Number.parseFloat(fixture.displayWidth)).toBeGreaterThan(0);
        expect(Number.parseFloat(fixture.displayWidth)).toBeLessThan(100);
        expect(
          fixture.legacySource.some(
            (source) =>
              'width' in source && source.width === fixture.displayWidth,
          ),
        ).toBe(true);
        expect('displayHeight' in fixture).toBe(false);
      } else {
        expect(['300px', '320px']).toContain(fixture.displayHeight);
        expect(
          fixture.legacySource.some(
            (source) =>
              'height' in source && source.height === fixture.displayHeight,
          ),
        ).toBe(true);
      }
    }
    for (const fixture of [...dimensions.restore, ...dimensions.deferred]) {
      expect(isRetiredCnDocsPath(`zh-CN/${fixture.file}`)).toBe(false);
    }
  });

  it.each(activeDeferred)(
    '$file leaves $reason Markdown unsized for $src',
    (fixture) => {
      let markdownCopies = 0;
      let sizedCopies = 0;
      const expectedPlatforms = new Set(
        fixture.images.map((image) => image.platform),
      );
      const markdownImages: {
        platform: string | null;
        alt: string;
        title: string | null;
      }[] = [];
      const tree = trees.get(fixture.file);
      if (!tree) throw new Error(`Missing parsed document: ${fixture.file}`);

      visit(tree, (node) => {
        const platform = platforms.get(node) ?? null;
        if (!expectedPlatforms.has(platform)) return;
        if (node.type === 'image' && node.url === fixture.src) {
          markdownCopies++;
          markdownImages.push({
            platform,
            alt: node.alt ?? '',
            title: node.title ?? null,
          });
        }
        if (
          (node.type === 'mdxJsxTextElement' ||
            node.type === 'mdxJsxFlowElement') &&
          node.name === 'DocsImage' &&
          node.attributes.some(
            (attribute) =>
              attribute.type === 'mdxJsxAttribute' &&
              attribute.name === 'src' &&
              attribute.value === fixture.src,
          )
        )
          sizedCopies++;
      });

      expect(markdownCopies).toBe(fixture.count);
      expect(markdownImages).toEqual(fixture.images);
      expect(
        sizedCopies,
        'deferred images must not acquire guessed sizes',
      ).toBe(0);
    },
  );
});
