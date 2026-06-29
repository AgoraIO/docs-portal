import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const appCss = readFileSync(
  resolve(process.cwd(), 'src/styles/app.css'),
  'utf8',
);
const appCssRoot = postcss.parse(appCss);

function normalizeSelector(selector: string) {
  return selector.replace(/\s+/g, ' ').trim();
}

function getRuleBody(selector: string) {
  let rule: postcss.Rule | undefined;
  const normalizedSelector = normalizeSelector(selector);

  appCssRoot.walkRules((candidate) => {
    if (normalizeSelector(candidate.selector) === normalizedSelector) {
      rule = candidate;
    }
  });

  expect(rule?.type).toBe('rule');

  return {
    rule: rule as postcss.Rule,
    sourceStart: rule?.source?.start?.offset ?? -1,
  };
}

describe('app prose CSS regressions', () => {
  it('uses decimal, alpha, and roman markers for nested ordered lists', () => {
    const topLevel = getRuleBody(
      '.prose :where(ol):not(:where(.not-prose, .not-prose *))',
    );
    const secondLevel = getRuleBody(
      '.prose :where(ol > li > ol):not(:where(.not-prose, .not-prose *))',
    );
    const thirdLevel = getRuleBody(
      '.prose :where(ol > li > ol > li > ol):not(:where(.not-prose, .not-prose *))',
    );
    const topLevelOverride = getRuleBody(
      ':where(html) .prose :where(ol):not(:where(.not-prose, .not-prose *))',
    );
    const secondLevelOverride = getRuleBody(
      ':where(html) .prose :where(ol > li > ol):not(:where(.not-prose, .not-prose *))',
    );
    const thirdLevelOverride = getRuleBody(
      `:where(html)
        .prose
        :where(ol > li > ol > li > ol):not(:where(.not-prose, .not-prose *))`,
    );

    for (const rule of [topLevel.rule, topLevelOverride.rule]) {
      expect(rule.nodes).toContainEqual(
        expect.objectContaining({
          prop: 'list-style',
          value: 'decimal',
        }),
      );
    }
    for (const rule of [secondLevel.rule, secondLevelOverride.rule]) {
      expect(rule.nodes).toContainEqual(
        expect.objectContaining({
          prop: 'list-style',
          value: 'lower-alpha',
        }),
      );
    }
    for (const rule of [thirdLevel.rule, thirdLevelOverride.rule]) {
      expect(rule.nodes).toContainEqual(
        expect.objectContaining({
          prop: 'list-style',
          value: 'lower-roman',
        }),
      );
    }
    expect(topLevel.sourceStart).toBeLessThan(secondLevel.sourceStart);
    expect(secondLevel.sourceStart).toBeLessThan(thirdLevel.sourceStart);
    expect(thirdLevel.sourceStart).toBeLessThan(topLevelOverride.sourceStart);
    expect(topLevelOverride.sourceStart).toBeLessThan(
      secondLevelOverride.sourceStart,
    );
    expect(secondLevelOverride.sourceStart).toBeLessThan(
      thirdLevelOverride.sourceStart,
    );
  });

  it('keeps wrapped prose tables intrinsic while raw tables retain scroll fallback', () => {
    const table = getRuleBody(
      '.prose :where(table):not(:where(.not-prose, .not-prose *))',
    );
    const wrappedTable = getRuleBody(
      `.prose
        :where(.prose-no-margin.overflow-auto > table):not(
          :where(.not-prose, .not-prose *)
        )`,
    );
    const cells = getRuleBody(
      '.prose :where(th, td):not(:where(.not-prose, .not-prose *))',
    );
    const headers = getRuleBody(
      '.prose :where(th):not(:where(.not-prose, .not-prose *))',
    );
    const firstColumn = getRuleBody(
      `.prose
        :where(th:first-child, td:first-child):not(
          :where(.not-prose, .not-prose *)
        )`,
    );

    expect(table.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'display',
        value: 'block',
      }),
    );
    expect(table.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'width',
        value: '100%',
      }),
    );
    expect(table.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'min-width',
        value: '100%',
      }),
    );
    const tableOverflowOverride = getRuleBody(
      ':where(html) .prose :where(table):not(:where(.not-prose, .not-prose *))',
    );
    const wrappedTableOverflowOverride = getRuleBody(
      `:where(html)
        .prose
        :where(.prose-no-margin.overflow-auto > table):not(
          :where(.not-prose, .not-prose *)
        )`,
    );

    expect(table.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'overflow-x',
        value: 'auto',
      }),
    );
    expect(table.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'overflow-y',
        value: 'hidden',
      }),
    );
    expect(table.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'max-width',
        value: '100%',
      }),
    );
    expect(table.rule.nodes).not.toContainEqual(
      expect.objectContaining({
        prop: 'overflow',
        value: 'hidden',
      }),
    );
    expect(wrappedTable.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'display',
        value: 'table',
      }),
    );
    expect(wrappedTable.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'width',
        value: 'auto',
      }),
    );
    expect(wrappedTable.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'max-width',
        value: 'none',
      }),
    );
    expect(wrappedTable.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'min-width',
        value: '0',
      }),
    );
    expect(wrappedTable.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'overflow',
        value: 'visible',
      }),
    );
    expect(tableOverflowOverride.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'overflow-x',
        value: 'auto',
      }),
    );
    expect(tableOverflowOverride.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'overflow-y',
        value: 'hidden',
      }),
    );
    expect(wrappedTableOverflowOverride.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'display',
        value: 'table',
      }),
    );
    expect(wrappedTableOverflowOverride.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'width',
        value: 'auto',
      }),
    );
    expect(wrappedTableOverflowOverride.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'max-width',
        value: 'none',
      }),
    );
    expect(wrappedTableOverflowOverride.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'min-width',
        value: '0',
      }),
    );
    expect(wrappedTableOverflowOverride.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'overflow',
        value: 'visible',
      }),
    );
    expect(table.sourceStart).toBeLessThan(wrappedTable.sourceStart);
    expect(tableOverflowOverride.sourceStart).toBeLessThan(
      wrappedTableOverflowOverride.sourceStart,
    );
    expect(cells.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'min-width',
        value: '7.5rem',
      }),
    );
    expect(cells.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'overflow-wrap',
        value: 'break-word',
      }),
    );
    expect(cells.rule.nodes).not.toContainEqual(
      expect.objectContaining({
        prop: 'overflow-wrap',
        value: 'anywhere',
      }),
    );
    expect(headers.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'white-space',
        value: 'nowrap',
      }),
    );
    expect(firstColumn.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'min-width',
        value: '9.5rem',
      }),
    );
  });

  it('keeps table image cells wide enough for readable thumbnails', () => {
    const imageCell = getRuleBody(
      '.prose :where(td:has(> img)):not(:where(.not-prose, .not-prose *))',
    );
    const image = getRuleBody(
      '.prose :where(td > img):not(:where(.not-prose, .not-prose *))',
    );

    expect(imageCell.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'width',
        value: '16rem',
      }),
    );
    expect(imageCell.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'min-width',
        value: '12rem',
      }),
    );
    expect(image.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'max-width',
        value: '100%',
      }),
    );
    expect(image.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'height',
        value: 'auto',
      }),
    );
  });

  it('lets long prose inline code break without changing pre code styling', () => {
    const inlineCode = getRuleBody(
      '.prose :where(:not(pre) > code):not(:where(.not-prose, .not-prose *))',
    );
    const preCode = getRuleBody(
      '.prose :where(pre code):not(:where(.not-prose, .not-prose *))',
    );

    expect(inlineCode.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'max-width',
        value: '100%',
      }),
    );
    expect(inlineCode.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'overflow-wrap',
        value: 'anywhere',
      }),
    );
    expect(inlineCode.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'word-break',
        value: 'break-word',
      }),
    );
    expect(inlineCode.sourceStart).toBeLessThan(preCode.sourceStart);
    expect(preCode.rule.nodes).not.toContainEqual(
      expect.objectContaining({
        prop: 'overflow-wrap',
        value: 'anywhere',
      }),
    );
  });

  it('adds a mobile scroll affordance to wide OpenAPI code examples', () => {
    const codeFigure = getRuleBody(
      '.openapi-operation figure.shiki:has(> .fd-scroll-container)::after',
    );
    const scrollContainer = getRuleBody(
      '.openapi-operation figure.shiki > .fd-scroll-container',
    );
    const webkitScrollbar = getRuleBody(
      '.openapi-operation figure.shiki > .fd-scroll-container::-webkit-scrollbar',
    );
    const webkitThumb = getRuleBody(
      '.openapi-operation figure.shiki > .fd-scroll-container::-webkit-scrollbar-thumb',
    );

    expect(codeFigure.rule.parent?.type).toBe('atrule');
    expect((codeFigure.rule.parent as postcss.AtRule).params).toBe(
      '(max-width: 48rem)',
    );
    expect(codeFigure.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'pointer-events',
        value: 'none',
      }),
    );
    expect(codeFigure.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'background',
        value: expect.stringContaining('linear-gradient'),
      }),
    );
    expect(scrollContainer.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'scrollbar-width',
        value: 'thin',
      }),
    );
    expect(webkitScrollbar.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'height',
        value: '12px',
      }),
    );
    expect(webkitThumb.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'background',
        value: 'color-mix(in srgb, var(--ink-1) 38%, transparent)',
      }),
    );
  });
});
