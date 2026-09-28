import { getTableOfContents } from 'fumadocs-core/content/toc';
import { structure } from 'fumadocs-core/mdx-plugins';
import remarkMdx from 'remark-mdx';
import { describe, expect, it } from 'vitest';
import {
  addAccordionHeadingsToTocText,
  remarkAccordionHeadings,
} from './accordion-toc';

describe('addAccordionHeadingsToTocText', () => {
  it('projects explicitly marked accordion headings into markdown headings', () => {
    const source = `<Accordions defaultValue="v4-6-3">
<Accordion title="v4.6.3" id="v4-6-3" headingLevel={3}>
Release details.
</Accordion>
</Accordions>`;

    expect(addAccordionHeadingsToTocText(source)).toContain(
      '#### v4.6.3 [#v4-6-3]',
    );
  });

  it('includes every sibling version in document order', async () => {
    const toc = await getTableOfContents(
      addAccordionHeadingsToTocText(`## Video SDK

<Accordions>
<Accordion title="v6.6.2" id="v662" headingLevel={3}>

Release details.

</Accordion>
<Accordion title="v6.5.2" id="v652" headingLevel={3}>

Older details.

</Accordion>
</Accordions>

## Extensions`),
    );
    expect(toc.map((item) => item.url)).toEqual([
      '#video-sdk',
      '#v662',
      '#v652',
      '#extensions',
    ]);
  });

  it('leaves ordinary accordions out of the generated heading projection', () => {
    const source = `<Accordion title="FAQ" id="faq">
Answer.
</Accordion>`;

    expect(addAccordionHeadingsToTocText(source)).toBe(source);
  });

  it('preserves the original accordion markup after projecting its heading', () => {
    const source =
      '<Accordion title="v4.6.3" id="v4-6-3" headingLevel={3}>\nBody.\n</Accordion>';

    expect(addAccordionHeadingsToTocText(source)).toContain(source);
  });

  it('handles quoted angle brackets and multiline attributes', () => {
    const source = `<Accordion
  title="v2 > v1"
  headingLevel={3}
  id="v2"
>
Body.
</Accordion>`;

    expect(addAccordionHeadingsToTocText(source)).toContain(
      '#### v2 > v1 [#v2]',
    );
    expect(addAccordionHeadingsToTocText(source)).toContain(source);
  });

  it('ignores accordion examples inside code fences', () => {
    const source = [
      '```mdx',
      '<Accordion title="Example" id="example" headingLevel={3}>',
      '```',
    ].join('\n');

    expect(addAccordionHeadingsToTocText(source)).toBe(source);
  });

  it('leaves incomplete source unchanged instead of breaking indexing', () => {
    const source = '<Accordion title="v2" id="v2" headingLevel={3}>';

    expect(addAccordionHeadingsToTocText(source)).toBe(source);
  });

  it('makes the projected version visible to Fumadocs TOC parsing', async () => {
    const toc = await getTableOfContents(
      addAccordionHeadingsToTocText(
        '<Accordions defaultValue="v4-6-3">\n<Accordion title="v4.6.3" id="v4-6-3" headingLevel={3}>\nRelease details.\n</Accordion>\n</Accordions>',
      ),
    );

    expect(toc).toContainEqual({
      depth: 4,
      title: 'v4.6.3',
      url: '#v4-6-3',
    });
  });

  it('projects versions within the TOC and search parsers without a second parse', async () => {
    const source = `## Versions

\`\`\`mdx
<Accordion title="Example" id="example" headingLevel={3}>
\`\`\`

<Accordions>
<Accordion title="v2 > v1" id="v2" headingLevel={3}>

Version-specific details.

</Accordion>
</Accordions>`;
    const plugins = [remarkMdx, remarkAccordionHeadings];
    const toc = await getTableOfContents(source, plugins);
    const search = structure(source, plugins);

    expect(toc).toEqual([
      { depth: 2, title: 'Versions', url: '#versions' },
      { depth: 4, title: 'v2 > v1', url: '#v2' },
    ]);
    expect(search.headings).toContainEqual({ id: 'v2', content: 'v2 > v1' });
    expect(search.contents).toContainEqual(
      expect.objectContaining({
        heading: 'v2',
        content: 'Version-specific details.',
      }),
    );
    expect(search.headings.some((heading) => heading.id === 'example')).toBe(
      false,
    );
  });
});
