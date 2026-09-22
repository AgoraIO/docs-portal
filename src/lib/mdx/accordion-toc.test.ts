import { getTableOfContents } from 'fumadocs-core/content/toc';
import { describe, expect, it } from 'vitest';
import { addAccordionHeadingsToTocText } from './accordion-toc';

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
    const source = '<Accordion title="v4.6.3" id="v4-6-3" headingLevel={3}>';

    expect(addAccordionHeadingsToTocText(source)).toContain(source);
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
});
