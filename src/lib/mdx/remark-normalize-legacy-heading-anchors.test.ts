import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { remarkHeading } from 'fumadocs-core/mdx-plugins';
import { describe, expect, it } from 'vitest';
import { remarkPlatformContent } from '../platforms/remark-platform-content';
import { remarkNormalizeLegacyHeadingAnchors } from './remark-normalize-legacy-heading-anchors';

async function compileWithLegacyHeadingAnchorNormalization(source: string) {
  return String(
    await compile(source, {
      jsx: true,
      remarkPlugins: [remarkHeading, remarkNormalizeLegacyHeadingAnchors],
    }),
  );
}

describe('remarkNormalizeLegacyHeadingAnchors', () => {
  it('resolves local heading references inside the selected platform without renaming headings', async () => {
    const result = String(
      await compile(
        `
<PlatformStructured platform="android">

## Create room

[Create room](#create-room)

</PlatformStructured>

<PlatformStructured platform="ios">

## Create room

[Create room](#create-room)

[Another page](/other#create-room)

[Unknown](#unknown)

</PlatformStructured>
`,
        {
          jsx: true,
          remarkPlugins: [
            remarkPlatformContent,
            remarkHeading,
            remarkNormalizeLegacyHeadingAnchors,
          ],
        },
      ),
    );
    expect(result).toContain('id="create-room"');
    expect(result).toContain('id="create-room-1"');
    expect(result).toContain('href="#create-room-1"');
    expect(result).toContain('href="/other#create-room"');
    expect(result).toContain('href="#unknown"');
  });

  it('keeps explicit anchors local to each panel and does not guess ambiguous headings', async () => {
    const result = String(
      await compile(
        `
<PlatformStructured platform="android">

## Setup

</PlatformStructured>

<PlatformStructured platform="ios">

<a id="setup"></a>

## Setup

[Explicit](#setup)

## Repeat

## Repeat

</PlatformStructured>

<PlatformStructured platform="web">

## Repeat

## Repeat

[Ambiguous](#repeat)

</PlatformStructured>
`,
        {
          jsx: true,
          remarkPlugins: [
            remarkPlatformContent,
            remarkHeading,
            remarkNormalizeLegacyHeadingAnchors,
          ],
        },
      ),
    );
    expect(result).toContain('href="#setup"');
    expect(result).toContain('href="#repeat"');
  });

  it('runs once after Fumadocs heading plugins in the content config', () => {
    const config = readFileSync(
      resolve(process.cwd(), 'source.config.ts'),
      'utf8',
    );
    const pluginConfig = config.match(
      /remarkPlugins: \(plugins\) => \[([\s\S]*?)\n {6}\],/,
    )?.[1];

    expect(pluginConfig).toBeDefined();
    expect(
      pluginConfig?.match(/remarkNormalizeLegacyHeadingAnchors/g),
    ).toHaveLength(1);
    const defaultPluginsIndex = pluginConfig?.indexOf('...plugins');
    const normalizerIndex = pluginConfig?.indexOf(
      'remarkNormalizeLegacyHeadingAnchors',
    );
    expect(defaultPluginsIndex).toBeDefined();
    expect(normalizerIndex).toBeDefined();
    expect(defaultPluginsIndex).toBeLessThan(normalizerIndex ?? -1);
  });

  it('keeps a legacy anchor and the generated slug for the same heading', async () => {
    const result = await compileWithLegacyHeadingAnchorNormalization(`
<a id="111"></a>
### 111 agent metrics
`);

    expect(result).toContain('<a id="111" />');
    expect(result).toContain(
      '<_components.h3 id="111-agent-metrics">{"111 agent metrics"}</_components.h3>',
    );
  });

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

  it('preserves a legacy id alongside the generated heading slug', async () => {
    const result = await compileWithLegacyHeadingAnchorNormalization(`
<a id="rtc_api_overview__toc_initialize"></a>
## initialize
`);

    expect(result).toContain('<a id="rtc_api_overview__toc_initialize" />');
    expect(result).toContain(
      '<_components.h2 id="initialize">{"initialize"}</_components.h2>',
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
