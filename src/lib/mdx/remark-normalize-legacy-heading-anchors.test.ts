import { compile } from '@mdx-js/mdx';
import { remarkHeading } from 'fumadocs-core/mdx-plugins';
import { describe, expect, it } from 'vitest';
import { remarkNormalizeLegacyHeadingAnchors } from './remark-normalize-legacy-heading-anchors';

async function compileWithLegacyHeadingAnchorNormalization(source: string) {
  return String(
    await compile(source, {
      jsx: true,
      remarkPlugins: [remarkNormalizeLegacyHeadingAnchors, remarkHeading],
    }),
  );
}

describe('remarkNormalizeLegacyHeadingAnchors', () => {
  it('moves an adjacent empty anchor id onto its heading', async () => {
    const result = await compileWithLegacyHeadingAnchorNormalization(`
<a id="moduletype"></a>
## ModuleType
`);

    expect(result).not.toContain('<a id="moduletype" />');
    expect(result).toContain(
      '<_components.h2 id="moduletype">{"ModuleType"}</_components.h2>',
    );
  });

  it('preserves a legacy id that differs from the generated heading slug', async () => {
    const result = await compileWithLegacyHeadingAnchorNormalization(`
<a id="rtc_api_overview__toc_initialize"></a>
## initialize
`);

    expect(result).not.toContain('<a id="rtc_api_overview__toc_initialize" />');
    expect(result).toContain(
      '<_components.h2 id="rtc_api_overview__toc_initialize">{"initialize"}</_components.h2>',
    );
  });

  it('normalizes legacy heading anchors inside MDX flow containers', async () => {
    const result = await compileWithLegacyHeadingAnchorNormalization(`
<PlatformPanel>
<a id="messagereceipt"></a>
## MessageReceipt
</PlatformPanel>
`);

    expect(result).not.toContain('<a id="messagereceipt" />');
    expect(result).toContain(
      '<_components.h2 id="messagereceipt">{"MessageReceipt"}</_components.h2>',
    );
  });

  it('normalizes matching runs of legacy anchors and headings in order', async () => {
    const result = await compileWithLegacyHeadingAnchorNormalization(`
<a id="callapiprotocol"></a>
<a id="initialize"></a>
## CallApiProtocol
### initialize
`);

    expect(result).not.toContain('<a id="callapiprotocol" />');
    expect(result).not.toContain('<a id="initialize" />');
    expect(result).toContain(
      '<_components.h2 id="callapiprotocol">{"CallApiProtocol"}</_components.h2>',
    );
    expect(result).toContain(
      '<_components.h3 id="initialize">{"initialize"}</_components.h3>',
    );
  });

  it('preserves an anchor when the final heading id is different', async () => {
    const result = await compileWithLegacyHeadingAnchorNormalization(`
<a id="legacy"></a>
## Heading [#canonical]
`);

    expect(result).toContain('<a id="legacy" />');
    expect(result).toContain(
      '<_components.h2 id="canonical">{"Heading"}</_components.h2>',
    );
  });

  it('preserves an ambiguous anchor run without enough adjacent headings', async () => {
    const result = await compileWithLegacyHeadingAnchorNormalization(`
<a id="first"></a>
<a id="second"></a>
## First

Body text.
`);

    expect(result).toContain('<a id="first" />');
    expect(result).toContain('<a id="second" />');
  });

  it('preserves empty links that have a navigation target', async () => {
    const result = await compileWithLegacyHeadingAnchorNormalization(`
<a id="related" href="/related"></a>
## Related APIs
`);

    expect(result).toContain('<a id="related" href="/related" />');
    expect(result).not.toContain('<_components.h2 id="related">');
  });
});
