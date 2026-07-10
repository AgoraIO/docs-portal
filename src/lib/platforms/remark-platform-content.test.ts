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

  it('accepts Go as a platform key', async () => {
    const source = `
<PlatformStructured platform="go">
Go content
</PlatformStructured>
`;

    const result = String(
      await compile(source, {
        jsx: true,
        remarkPlugins: [remarkPlatformContent],
      }),
    );

    expect(result).toContain('canonicalPlatform="go"');
    expect(result).toContain('platform="go"');
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

  it('transforms platform blocks nested inside an embedded root (e.g. from <include>)', () => {
    // fumadocs `remarkInclude` runs before this plugin and replaces an
    // `<include>` node with a nested `{ type: 'root', children }` holding the
    // included file's children. Platform blocks in an included file are
    // top-level there, so the transform must descend into embedded roots
    // instead of leaving them untransformed (which crashes the page at runtime).
    const platformNode = (platform: string) => ({
      type: 'mdxJsxFlowElement' as const,
      name: 'PlatformStructured',
      attributes: [
        { type: 'mdxJsxAttribute' as const, name: 'platform', value: platform },
      ],
      children: [
        {
          type: 'paragraph' as const,
          children: [{ type: 'text' as const, value: `${platform} body` }],
        },
      ],
    });

    const tree = {
      type: 'root' as const,
      children: [
        {
          type: 'paragraph' as const,
          children: [{ type: 'text' as const, value: 'intro' }],
        },
        {
          type: 'root' as const,
          children: [platformNode('web'), platformNode('cpp')],
        },
      ],
    };

    // biome-ignore lint/suspicious/noExplicitAny: hand-built mdast fixture
    remarkPlatformContent()(tree as any);

    // biome-ignore lint/suspicious/noExplicitAny: hand-built mdast fixture
    const embedded = tree.children[1] as any;
    expect(embedded.type).toBe('root');
    expect(embedded.children).toHaveLength(1);
    expect(embedded.children[0].name).toBe('_PlatformTabsGroup');
    expect(embedded.children[0].children).toHaveLength(2);
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
