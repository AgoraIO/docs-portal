import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';
import { remarkPlatformContent } from './remark-platform-content';

describe('remarkPlatformContent', () => {
  it('groups consecutive PlatformStructured nodes into one internal platform group', async () => {
    const source = `
<PlatformStructured platform="android">
## Install
Android install
</PlatformStructured>

<PlatformStructured platform="javascript">
## Install
JavaScript install
</PlatformStructured>

Shared paragraph.
`;

    const result = String(
      await compile(source, {
        jsx: true,
        remarkPlugins: [remarkPlatformContent],
      }),
    );

    expect(result).toContain('_PlatformTabsGroup');
    expect(result).toContain('canonicalPlatform="javascript"');
    expect(result).toContain('groupMode="structured"');
    expect(result).toContain('platform="android"');
    expect(result).toContain('platform="javascript"');
    expect(result).toContain('_PlatformProcessedMarker');
    expect(result).toContain('close="true"');
  });

  it('throws a readable error for duplicate platforms in one group', async () => {
    const source = `
<PlatformInline platform="android">A</PlatformInline>
<PlatformInline platform="android">B</PlatformInline>
`;

    await expect(
      compile(source, {
        jsx: true,
        remarkPlugins: [remarkPlatformContent],
      }),
    ).rejects.toThrow('Duplicate platform key "android" in the same group.');
  });

  it('throws a readable error for nested platform content blocks', async () => {
    const source = `
> quoted intro
>
> <PlatformInline platform="android">A</PlatformInline>
> <PlatformInline platform="javascript">B</PlatformInline>
`;

    await expect(
      compile(source, {
        jsx: true,
        remarkPlugins: [remarkPlatformContent],
      }),
    ).rejects.toThrow(
      'PlatformInline is only supported at the top-level page flow in v1.',
    );
  });
});
