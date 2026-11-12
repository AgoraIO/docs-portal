import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  resolve(process.cwd(), 'src/styles/image-spacing.css'),
  'utf8',
);
const root = postcss.parse(css);
function rule(part: string, media?: string) {
  const matches: postcss.Rule[] = [];
  root.walkRules((candidate) => {
    const parent = candidate.parent;
    if (
      candidate.selector.replace(/\s+/g, ' ').includes(part) &&
      (media
        ? parent?.type === 'atrule' &&
          (parent as postcss.AtRule).params === media
        : parent?.type === 'root')
    ) {
      matches.push(candidate);
    }
  });
  expect(matches).toHaveLength(1);
  return matches[0];
}
function declaration(rule: postcss.Rule, name: string) {
  return rule.nodes
    .filter((node): node is postcss.Declaration => node.type === 'decl')
    .find((node) => node.prop === name)?.value;
}

describe('documentation image spacing', () => {
  it('loads the shared image spacing from the application stylesheet', () => {
    const app = readFileSync(
      resolve(process.cwd(), 'src/styles/app.css'),
      'utf8',
    );
    expect(app).toContain('@import "./image-spacing.css"');
  });
  it('uses desktop16/24 and phone16/16 margins, excluding table images', () => {
    const desktop = rule(':where(');
    expect(declaration(desktop, 'margin-block')).toBe('1rem 1.5rem');
    expect(desktop.selector).toContain('table *');
    expect(desktop.selector).toContain(
      'p:has(> [data-docs-image], > a > [data-docs-image])',
    );
    expect(
      declaration(rule(':where(', '(max-width: 767px)'), 'margin-bottom'),
    ).toBe('1rem');
  });
  it('removes nested and adjacent prose margins so the image block owns the gap', () => {
    const inner = rule('.prose [data-docs-image] > img');
    expect(declaration(inner, 'margin-block')).toBe('0');
    expect(inner.selector).toContain('p > a:only-child > [data-docs-image]');
    expect(inner.selector).toContain('[data-docs-image]:only-of-type');
    expect(
      declaration(
        rule(':is(p, ul, ol):not(p:has([data-docs-image])):has('),
        'margin-bottom',
      ),
    ).toBe('0');
    expect(
      declaration(
        rule('+ :is(p, ul, ol):not(p:has([data-docs-image]))'),
        'margin-top',
      ),
    ).toBe('0');
  });
});
