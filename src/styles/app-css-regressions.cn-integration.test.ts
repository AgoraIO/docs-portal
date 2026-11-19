import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const appCss = readFileSync(
  resolve(process.cwd(), 'src/styles/app.zh-cn.css'),
  'utf8',
);
const metadataCss = readFileSync(
  resolve(process.cwd(), 'src/styles/openapi-schema-metadata.css'),
  'utf8',
);
const spacingCss = readFileSync(
  resolve(process.cwd(), 'src/styles/docs-spacing.css'),
  'utf8',
);
const appCssRoot = postcss.parse(`${appCss}\n${metadataCss}\n${spacingCss}`);

function normalizeSelector(selector: string) {
  return selector.replace(/\s+/g, ' ').trim();
}

function normalizeDeclarationValue(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

function getSelectorsContaining(selectorPart: string) {
  const selectors: string[] = [];
  const normalizedSelectorPart = normalizeSelector(selectorPart);

  appCssRoot.walkRules((candidate) => {
    const selector = normalizeSelector(candidate.selector);
    if (selector.includes(normalizedSelectorPart)) selectors.push(selector);
  });

  return selectors;
}

function expectDeclaration(
  rule: postcss.Rule,
  prop: string,
  expectedValue: string,
) {
  const expectedImportant = expectedValue.endsWith(' !important');
  const normalizedExpectedValue = expectedImportant
    ? expectedValue.slice(0, -' !important'.length)
    : expectedValue;
  const declaration = rule.nodes.find(
    (node): node is postcss.Declaration =>
      node.type === 'decl' && node.prop === prop,
  );

  expect(declaration).toBeDefined();
  expect(normalizeDeclarationValue(declaration?.value ?? '')).toBe(
    normalizeDeclarationValue(normalizedExpectedValue),
  );
  expect(declaration?.important ?? false).toBe(expectedImportant);
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

function getRuleBodyContaining(selectorPart: string) {
  let rule: postcss.Rule | undefined;
  const normalizedSelectorPart = normalizeSelector(selectorPart);

  appCssRoot.walkRules((candidate) => {
    if (
      !rule &&
      normalizeSelector(candidate.selector).includes(normalizedSelectorPart)
    ) {
      rule = candidate;
    }
  });

  expect(rule?.type).toBe('rule');

  return {
    rule: rule as postcss.Rule,
    sourceStart: rule?.source?.start?.offset ?? -1,
  };
}

function getRuleBodyOutsideContainer(selector: string) {
  let rule: postcss.Rule | undefined;
  const normalizedSelector = normalizeSelector(selector);

  appCssRoot.walkRules((candidate) => {
    if (
      normalizeSelector(candidate.selector) === normalizedSelector &&
      !(
        candidate.parent?.type === 'atrule' &&
        candidate.parent.name === 'container'
      )
    ) {
      rule = candidate;
    }
  });

  expect(rule?.type).toBe('rule');
  return { rule: rule as postcss.Rule };
}

function getRuleBodyContainingInMedia(
  selectorPart: string,
  mediaQuery: string,
) {
  let rule: postcss.Rule | undefined;
  const normalizedSelectorPart = normalizeSelector(selectorPart);

  appCssRoot.walkAtRules('media', (media) => {
    if (!media.params.includes(mediaQuery)) return;
    media.walkRules((candidate) => {
      if (
        !rule &&
        normalizeSelector(candidate.selector).includes(normalizedSelectorPart)
      ) {
        rule = candidate;
      }
    });
  });

  expect(rule?.type).toBe('rule');
  return { rule: rule as postcss.Rule };
}

function getRuleBodyContainingInContainer(
  selectorPart: string,
  containerQuery: string,
) {
  let rule: postcss.Rule | undefined;
  const normalizedSelectorPart = normalizeSelector(selectorPart);

  appCssRoot.walkAtRules('container', (container) => {
    if (!container.params.includes(containerQuery)) return;
    container.walkRules((candidate) => {
      if (
        !rule &&
        normalizeSelector(candidate.selector).includes(normalizedSelectorPart)
      ) {
        rule = candidate;
      }
    });
  });

  expect(rule?.type).toBe('rule');
  return { rule: rule as postcss.Rule };
}

describe('app prose CSS regressions', () => {
  it('keeps the console API entry heading compact', () => {
    const heading = getRuleBody(
      '.prose .docs-body > .docs-console-api-entry + h2',
    ).rule;
    expectDeclaration(heading, 'margin-top', '1.75rem');
    expectDeclaration(heading, 'padding-top', '0');
  });

  it('keeps heading anchors below the full sticky docs header', () => {
    const headingAnchor = getRuleBodyContaining(
      '.prose :is(h1, h2, h3, h4, h5, h6):not(:where(.not-prose, .not-prose *))',
    ).rule;
    const openApiHeadingAnchor = getRuleBody(
      '.openapi-operation .openapi-section-heading',
    ).rule;

    expect(headingAnchor.parent?.type).toBe('atrule');
    expect(headingAnchor.selectors).toContain(
      '.docs-body :is(h2, h3, h4)[data-accordion-value]',
    );
    expect((headingAnchor.parent as postcss.AtRule).name).toBe('layer');
    expect((headingAnchor.parent as postcss.AtRule).params).toBe('utilities');
    expectDeclaration(
      headingAnchor,
      'scroll-margin-top',
      'max(7rem, calc(var(--docs-shell-header-offset, 0px) + 1.5rem))',
    );
    expect(openApiHeadingAnchor.parent?.type).toBe('atrule');
    expect((openApiHeadingAnchor.parent as postcss.AtRule).name).toBe('layer');
    expect((openApiHeadingAnchor.parent as postcss.AtRule).params).toBe(
      'utilities',
    );
    expectDeclaration(
      openApiHeadingAnchor,
      'scroll-margin-top',
      'max(7rem, calc(var(--docs-shell-header-offset, 0px) + 1.5rem))',
    );
  });

  it('keeps wrapped prose tables fluid with native column sizing while raw tables retain scroll fallback', () => {
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
    const cellFirstChild = getRuleBody(
      '.prose :where(td > :first-child):not(:where(.not-prose, .not-prose *))',
    );
    const cellLastChild = getRuleBody(
      '.prose :where(td > :last-child):not(:where(.not-prose, .not-prose *))',
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
        value: '100%',
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
        value: '100%',
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
    const cellFirstChildOverride = getRuleBody(
      ':where(html) .prose :where(td > :first-child):not(:where(.not-prose, .not-prose *))',
    );
    const cellLastChildOverride = getRuleBody(
      ':where(html) .prose :where(td > :last-child):not(:where(.not-prose, .not-prose *))',
    );

    expect(cells.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'min-width',
        value: '6ch',
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
        value: '12ch',
      }),
    );
    expect(cellFirstChild.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'margin-top',
        value: '0',
      }),
    );
    expect(cellLastChild.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'margin-bottom',
        value: '0',
      }),
    );
    expect(cellFirstChildOverride.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'margin-top',
        value: '0',
      }),
    );
    expect(cellLastChildOverride.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'margin-bottom',
        value: '0',
      }),
    );
    expect(wrappedTableOverflowOverride.sourceStart).toBeLessThan(
      cellFirstChildOverride.sourceStart,
    );
    expect(cellFirstChildOverride.sourceStart).toBeLessThan(
      cellLastChildOverride.sourceStart,
    );
  });

  it('defines dark code block tokens for prose and OpenAPI Markdown', () => {
    const darkProse = getRuleBodyContaining('.dark .prose');
    expect(darkProse.rule.selector).toContain('.dark .openapi-operation');
    expect(darkProse.rule.selector).toContain('.dark .openapi-markdown');

    expect(darkProse.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: '--docs-prose-code-block-bg',
        value: '#0b1120',
      }),
    );
    expect(darkProse.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: '--docs-prose-code-block-color',
        value: '#f8fafc',
      }),
    );
    expect(darkProse.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: '--docs-prose-code-block-line-number',
        value: 'rgb(203 213 225 / 0.62)',
      }),
    );
    expect(darkProse.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: '--docs-prose-code-block-copy-bg',
        value: 'rgb(15 23 42 / 0.86)',
      }),
    );
    expect(darkProse.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: '--docs-prose-code-block-token-mix',
        value: '88%',
      }),
    );
  });

  it('keeps the examples rail sticky from tablet widths onward', () => {
    const rail = getRuleBodyContainingInContainer(
      '.openapi-examples-rail',
      '40rem',
    );
    const operation = getRuleBodyOutsideContainer('.openapi-operation');
    const anchorInDesktop = getRuleBodyContainingInContainer(
      '[data-openapi-operation-panel="examples"]',
      '40rem',
    );
    expectDeclaration(
      operation.rule,
      '--openapi-examples-sticky-top',
      'calc(var(--docs-shell-header-offset, 48px) + 1rem)',
    );
    expectDeclaration(rail.rule, 'position', 'sticky');
    expectDeclaration(anchorInDesktop.rule, 'align-self', 'stretch');
    expectDeclaration(
      rail.rule,
      'top',
      'var(--openapi-examples-sticky-top, 48px)',
    );
    const maxBlockSizes = rail.rule.nodes
      .filter(
        (node): node is postcss.Declaration =>
          node.type === 'decl' && node.prop === 'max-block-size',
      )
      .map((declaration) => normalizeDeclarationValue(declaration.value));
    expect(maxBlockSizes).toEqual([
      'calc(100vh - var(--openapi-examples-sticky-top, 48px) - 1rem)',
      'calc(100dvh - var(--openapi-examples-sticky-top, 48px) - 1rem)',
    ]);
    expectDeclaration(rail.rule, 'overflow-y', 'auto');
    expectDeclaration(rail.rule, 'overscroll-behavior', 'contain');
    expectDeclaration(rail.rule, 'scrollbar-width', 'thin');
    expectDeclaration(
      rail.rule,
      'scrollbar-color',
      'color-mix(in srgb, var(--ink-1) 16%, transparent) transparent',
    );
    const baseRail = getRuleBodyOutsideContainer('.openapi-examples-rail');
    expectDeclaration(baseRail.rule, 'min-width', '0');
    expectDeclaration(baseRail.rule, 'max-width', '100%');
    expectDeclaration(baseRail.rule, 'overflow-x', 'clip');
    const railContent = getRuleBodyOutsideContainer(
      '.openapi-examples-rail-content',
    );
    expectDeclaration(railContent.rule, 'min-width', '0');
    expectDeclaration(railContent.rule, 'max-width', '100%');
    expectDeclaration(rail.rule, 'overflow-x', 'clip');
    for (const prop of [
      'overflow',
      'overflow-y',
      'overflow-block',
      'max-block-size',
      'overscroll-behavior',
      'scrollbar-width',
      'scrollbar-color',
    ]) {
      expect(baseRail.rule.nodes).not.toContainEqual(
        expect.objectContaining({ prop }),
      );
    }
    const anchor = getRuleBodyOutsideContainer('.openapi-examples-rail-anchor');
    expectDeclaration(anchor.rule, 'position', 'relative');
    expectDeclaration(anchor.rule, 'min-width', '0');
    expect(anchor.rule.nodes).not.toContainEqual(
      expect.objectContaining({ prop: 'display', value: 'contents' }),
    );
    expect(appCss).not.toContain('data-constrained');
    expect(appCss).not.toContain('data-openapi-code-viewport-active');
    expect(appCss).not.toContain('data-openapi-examples-rail-sentinel');
  });
});
