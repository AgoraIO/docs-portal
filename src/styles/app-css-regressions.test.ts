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

function normalizeDeclarationValue(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
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
  it('keeps the narrow response-header and browser-find adapter contracts', () => {
    expectDeclaration(
      getRuleBodyContaining(
        '.openapi-response-header-row .openapi-field-anchor',
      ).rule,
      'opacity',
      '0',
    );
    const visibleAnchorRule = getRuleBodyContaining(
      '.openapi-response-header-row:hover .openapi-field-anchor',
    ).rule;
    expect(visibleAnchorRule.selector).toContain(
      '.openapi-response-header-row:hover .openapi-field-anchor',
    );
    expect(visibleAnchorRule.selector).toContain(
      '.openapi-response-header-row:focus-within .openapi-field-anchor',
    );
    expect(visibleAnchorRule.selector).toContain(
      '.openapi-response-header-row:target .openapi-field-anchor',
    );
    expect(visibleAnchorRule.selector).toContain(
      '.openapi-field-anchor:focus-visible',
    );
    expectDeclaration(visibleAnchorRule, 'opacity', '1');
    const reducedMotion = getRuleBodyContainingInMedia(
      '.openapi-response-header-row .openapi-field-anchor',
      'prefers-reduced-motion: reduce',
    ).rule;
    expectDeclaration(reducedMotion, 'transition', 'none');
    expectDeclaration(
      getRuleBody('.openapi-operation').rule,
      'container-type',
      'inline-size',
    );
  });

  it('treats empty legacy anchors as transparent before the first heading', () => {
    const leadingHeading = getRuleBody(
      `.prose
        :where(h2):not(:where(.not-prose, .not-prose *)):not(
          :where(:not(a:empty) ~ h2)
        )`,
    );
    const leadingHeadingSeparator = getRuleBody(
      `.prose
        :where(h2):not(:where(.not-prose, .not-prose *)):not(
          :where(:not(a:empty) ~ h2)
        )::before`,
    );
    const platformLeadingHeading = getRuleBody(
      `.prose[data-platform-header-tabs="true"]
        [data-platform-group="structured"]
        > [data-platform-panel]:not([hidden])
        .docs-body
        > h2:not(:where(.not-prose, .not-prose *)):not(:where(:not(a:empty) ~ h2))`,
    );
    const platformLeadingHeadingSeparator = getRuleBody(
      `.prose[data-platform-header-tabs="true"]
        [data-platform-group="structured"]
        > [data-platform-panel]:not([hidden])
        .docs-body
        > h2:not(:where(.not-prose, .not-prose *)):not(
          :where(:not(a:empty) ~ h2)
        )::before`,
    );

    expectDeclaration(leadingHeading.rule, 'margin-top', '0');
    expectDeclaration(leadingHeading.rule, 'padding-top', '0');
    expectDeclaration(leadingHeadingSeparator.rule, 'content', 'none');
    expectDeclaration(platformLeadingHeading.rule, 'margin-top', '0.75rem');
    expectDeclaration(platformLeadingHeading.rule, 'padding-top', '0');
    expectDeclaration(platformLeadingHeadingSeparator.rule, 'content', 'none');
  });

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
    const cellFirstChildOverride = getRuleBody(
      ':where(html) .prose :where(td > :first-child):not(:where(.not-prose, .not-prose *))',
    );
    const cellLastChildOverride = getRuleBody(
      ':where(html) .prose :where(td > :last-child):not(:where(.not-prose, .not-prose *))',
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

  it('restores prose link and inline code styling inside parameter descriptions', () => {
    const link = getRuleBody('.prose :where([data-parameter-description] a)');
    const linkHover = getRuleBody(
      '.prose :where([data-parameter-description] a):hover',
    );
    const linkFocus = getRuleBody(
      '.prose :where([data-parameter-description] a):focus-visible',
    );
    const inlineCode = getRuleBody(
      `.prose
        :where([data-parameter-description] :not(pre) > code):not(
          :where(
            [data-parameter-possible-values],
            [data-parameter-possible-values] *
          )
        )`,
    );

    expect(link.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'color',
        value: 'var(--foreground)',
      }),
    );
    expect(link.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'text-decoration-line',
        value: 'underline',
      }),
    );
    expect(linkHover.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'background',
        value: 'transparent',
      }),
    );
    expect(linkFocus.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'outline',
        value: '2px solid var(--accent-brand-ring)',
      }),
    );
    expect(inlineCode.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'background',
        value: 'var(--bg-sunken)',
      }),
    );
    expect(inlineCode.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'overflow-wrap',
        value: 'anywhere',
      }),
    );
  });

  it('keeps rendered prose links foreground-colored after Fumadocs prose styles', () => {
    const linkOverride = getRuleBodyContaining(
      ':where(html) .prose :where([data-parameter-description] a)',
    );
    const linkHoverOverride = getRuleBodyContaining(
      ':where(html) .prose :where([data-parameter-description] a):hover',
    );
    const darkCodeOverride = getRuleBodyContaining(
      ':where(html.dark) .prose :where(:not(pre) > code)',
    );

    expect(linkOverride.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'color',
        value: 'var(--foreground)',
      }),
    );
    expectDeclaration(
      linkOverride.rule,
      '-webkit-text-decoration-color',
      'color-mix(in srgb, var(--foreground) 42%, transparent)',
    );
    expectDeclaration(
      linkOverride.rule,
      'text-decoration-color',
      'color-mix(in srgb, var(--foreground) 42%, transparent)',
    );
    expect(linkHoverOverride.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'background',
        value: 'transparent',
      }),
    );
    expect(linkHoverOverride.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'text-decoration-color',
        value: 'var(--foreground)',
      }),
    );
    expect(linkOverride.sourceStart).toBeLessThan(
      linkHoverOverride.sourceStart,
    );
    expect(linkHoverOverride.sourceStart).toBeLessThan(
      darkCodeOverride.sourceStart,
    );
  });

  it('defines high-contrast dark code block tokens and chrome variables', () => {
    const darkProse = getRuleBody('.dark .prose');

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

  it('keeps dark Fumadocs code blocks, tabs, and copy controls readable after imported styles', () => {
    const codeBlock = getRuleBodyContaining(
      ':where(html.dark) .prose :where(pre):not(:where(.not-prose, .not-prose *))',
    );
    const tokenRule = getRuleBodyContaining(
      ':where(html.dark) .prose figure.shiki.not-prose code span',
    );
    const lineNumberRule = getRuleBodyContaining(
      ':where(html.dark) .prose figure.shiki.not-prose[data-line-numbers]',
    );
    const copyButtonRule = getRuleBodyContaining(
      ':where(html.dark) .prose figure.shiki.not-prose button[aria-label]',
    );
    const copyButtonHoverRule = getRuleBodyContaining(
      ':where(html.dark) .prose figure.shiki.not-prose button[aria-label]:hover',
    );
    const tabPanelRule = getRuleBody(
      `:where(html.dark) .prose [role="tabpanel"] > figure.shiki.not-prose,
        :where(html.dark) .prose [role="tabpanel"] > figure.shiki.not-prose:only-child`,
    );
    const darkCodeOverride = getRuleBodyContaining(
      ':where(html.dark) .prose :where(:not(pre) > code)',
    );

    expect(codeBlock.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'background',
        value: 'var(--docs-prose-code-block-bg)',
      }),
    );
    expect(codeBlock.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'color',
        value: 'var(--docs-prose-code-block-color)',
      }),
    );
    expectDeclaration(
      tokenRule.rule,
      'color',
      `color-mix(
        in srgb,
        var(--shiki-dark, var(--docs-prose-code-block-color))
          var(--docs-prose-code-block-token-mix),
        var(--docs-prose-code-block-token-boost)
      )`,
    );
    expect(lineNumberRule.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'color',
        value: 'var(--docs-prose-code-block-line-number)',
      }),
    );
    expect(copyButtonRule.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'background',
        value: 'var(--docs-prose-code-block-copy-bg)',
      }),
    );
    expect(copyButtonRule.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'color',
        value: 'var(--docs-prose-code-block-copy-color)',
      }),
    );
    expect(copyButtonHoverRule.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'background',
        value: 'var(--docs-prose-code-block-copy-hover-bg)',
      }),
    );
    expect(tabPanelRule.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'background',
        value: 'var(--docs-prose-code-block-bg)',
      }),
    );
    expect(darkCodeOverride.sourceStart).toBeLessThan(codeBlock.sourceStart);
    expect(codeBlock.sourceStart).toBeLessThan(tokenRule.sourceStart);
    expect(tokenRule.sourceStart).toBeLessThan(tabPanelRule.sourceStart);
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

  it('caps only marked OpenAPI code viewports with a stable desktop limit', () => {
    const viewport = getRuleBodyContaining(
      '.openapi-code-preview [data-openapi-code-viewport]',
    );
    const mobileViewport = getRuleBodyContainingInContainer(
      '[data-openapi-code-viewport]',
      '55.999rem',
    );

    expect(appCss).not.toContain(
      '.openapi-request-examples\n    [role="region"].fd-scroll-container',
    );
    expectDeclaration(viewport.rule, 'max-block-size', '24rem !important');
    expectDeclaration(viewport.rule, 'overflow', 'auto');
    expectDeclaration(viewport.rule, 'overscroll-behavior', 'contain');
    expect(viewport.rule.parent?.type).toBe('root');
    expectDeclaration(
      mobileViewport.rule,
      'max-block-size',
      'min(50dvh, 24rem) !important',
    );
    expect(mobileViewport.rule.parent?.type).toBe('atrule');
    expect((mobileViewport.rule.parent as postcss.AtRule).name).toBe(
      'container',
    );
  });

  it('defines the independent desktop examples rail layout', () => {
    const baseLayout = getRuleBodyOutsideContainer('.openapi-operation-layout');
    const layout = getRuleBodyContainingInContainer(
      '.openapi-operation-layout',
      '56rem',
    );
    const rail = getRuleBodyContainingInContainer(
      '.openapi-examples-rail',
      '56rem',
    );
    const anchorInDesktop = getRuleBodyContainingInContainer(
      '.openapi-examples-rail-anchor',
      '56rem',
    );
    expectDeclaration(baseLayout.rule, 'display', 'flex');
    expectDeclaration(baseLayout.rule, 'flex-direction', 'column');
    expect(baseLayout.rule.nodes).not.toContainEqual(
      expect.objectContaining({ prop: 'grid-template-columns' }),
    );
    expect(layout.rule.parent?.type).toBe('atrule');
    expect((layout.rule.parent as postcss.AtRule).name).toBe('container');
    expect((layout.rule.parent as postcss.AtRule).params).toContain('56rem');
    expectDeclaration(
      layout.rule,
      'grid-template-columns',
      'minmax(0, 1fr) 400px',
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
