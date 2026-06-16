import { describe, expect, it } from 'vitest';

import {
  findFatalPatterns,
  getUnknownPlatformKeys,
  normalizeImmediateDuplicateTabs,
  transformAdmonitions,
} from './migrate-video-calling.mjs';

describe('migrate-video-calling helpers', () => {
  it('flags unknown platform keys during page verification', () => {
    expect(
      getUnknownPlatformKeys(`
<PlatformStructured platform="android">
Android
</PlatformStructured>
<PlatformStructured platform="windows">
Windows
</PlatformStructured>
`),
    ).toEqual(['windows']);
  });

  it('collapses duplicated immediate Tabs roots', () => {
    expect(
      normalizeImmediateDuplicateTabs(`
<Tabs defaultValue="tab1">
<Tabs defaultValue="tab1">
<TabsList>
  <TabsTrigger value="java">Java</TabsTrigger>
</TabsList>

<TabsContent value="java">
Body
</TabsContent>
</Tabs></Tabs>
`),
    ).toContain('<Tabs defaultValue="tab1">\n<TabsList>');
  });

  it('rewrites admonitions even when legacy attrs contain extra props', () => {
    expect(
      transformAdmonitions(`
<Admonition title="Note" type="caution" style="Information">
Body
</Admonition>
`),
    ).toContain(':::warning[Note]');
  });

  it('treats unknown platform keys as fatal residue', () => {
    expect(
      findFatalPatterns(`
<PlatformStructured platform="windows">
Windows
</PlatformStructured>
`),
    ).toContain('unknown-platform:windows');
  });
});
