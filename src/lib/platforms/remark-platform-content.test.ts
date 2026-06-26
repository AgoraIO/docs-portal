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

<PlatformStructured platform="web">
## Install
Web install
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
    expect(result).toContain('canonicalPlatform="web"');
    expect(result).toContain('groupMode="structured"');
    expect(result).toContain('platform="android"');
    expect(result).toContain('platform="web"');
    expect(result).toContain('_PlatformProcessedMarker');
    expect(result).toContain('close="true"');
  });

  it('preserves a single top-level platform block as a one-panel group', async () => {
    const source = `
Shared intro.

<PlatformStructured platform="web">
## Web only
Web body
</PlatformStructured>

Shared outro.
`;

    const result = String(
      await compile(source, {
        jsx: true,
        remarkPlugins: [remarkPlatformContent],
      }),
    );

    expect(result).toContain('_PlatformTabsGroup');
    expect(result).toContain('canonicalPlatform="web"');
    expect(result).toContain('platforms="[&quot;web&quot;]"');
    expect(result).toContain('platform="web"');
  });

  it('normalizes legacy platform aliases before validating groups', async () => {
    const source = `
<PlatformStructured platform="react-js">
React content
</PlatformStructured>

<PlatformStructured platform="web">
Web content
</PlatformStructured>
`;

    const result = String(
      await compile(source, {
        jsx: true,
        remarkPlugins: [remarkPlatformContent],
      }),
    );

    expect(result).toContain('canonicalPlatform="web"');
    expect(result).toContain('platform="javascript"');
    expect(result).not.toContain('platform="react-js"');
  });

  it('accepts C++ as a platform key', async () => {
    const source = `
<PlatformStructured platform="cpp">
C++ content
</PlatformStructured>
`;

    const result = String(
      await compile(source, {
        jsx: true,
        remarkPlugins: [remarkPlatformContent],
      }),
    );

    expect(result).toContain('canonicalPlatform="cpp"');
    expect(result).toContain('platform="cpp"');
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
> <PlatformInline platform="web">B</PlatformInline>
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
