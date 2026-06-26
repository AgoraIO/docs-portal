import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const appCss = readFileSync(
  resolve(process.cwd(), 'src/styles/app.css'),
  'utf8',
);
const appCssRoot = postcss.parse(appCss);

function getRuleBody(selector: string) {
  let rule: postcss.Rule | undefined;

  appCssRoot.walkRules((candidate) => {
    if (candidate.selector === selector) {
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

    expect(topLevel.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'list-style',
        value: 'decimal',
      }),
    );
    expect(secondLevel.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'list-style',
        value: 'lower-alpha',
      }),
    );
    expect(thirdLevel.rule.nodes).toContainEqual(
      expect.objectContaining({
        prop: 'list-style',
        value: 'lower-roman',
      }),
    );
    expect(topLevel.sourceStart).toBeLessThan(secondLevel.sourceStart);
    expect(secondLevel.sourceStart).toBeLessThan(thirdLevel.sourceStart);
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
});
