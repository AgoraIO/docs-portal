# Platform Content Blocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add page-level platform content blocks for MDX-authored docs so authors can interleave shared prose with platform-specific inline or structured sections, while preserving full platform content in HTML and `llms` exports and keeping the page ToC stable through canonical-platform extraction.

**Architecture:** Introduce two author-facing MDX markers, `PlatformInline` and `PlatformStructured`, then group consecutive sibling blocks at MDX compile time into internal platform groups. Render all platform variants into the HTML output, but mark inactive panels as non-visible/non-interactive, persist a global platform preference, and generate page ToC data from shared content plus each structured group's canonical platform only.

**Tech Stack:** TanStack Start, React 19, TypeScript, `fumadocs-mdx`, `fumadocs-core`, custom MDX component registry in `src/components/mdx.tsx`, server payload assembly in `src/lib/docs-page.server.ts`, Vitest, Biome.

---

## File Structure

- Create: `src/lib/platforms/registry.ts`
  - Canonical platform registry, canonical-priority constant, labels, validation helpers.
- Create: `src/lib/platforms/preference.ts`
  - Shared storage key, DOM dataset sync helpers, current-platform resolution helpers.
- Create: `src/lib/platforms/mdx-groups.ts`
  - Shared group types and pure helpers for grouping/validation logic used by tests and transforms.
- Create: `src/lib/platforms/remark-platform-content.ts`
  - MDX remark plugin to detect `PlatformInline` / `PlatformStructured`, validate them, and rewrite grouped blocks into internal nodes.
- Create: `src/lib/platforms/processed-text.ts`
  - Helpers to produce full processed text for `llms` plus canonical-only text for ToC extraction.
- Create: `src/components/mdx/PlatformTabsGroup.tsx`
  - Internal renderer for grouped platform panels, tabs UI, DOM visibility semantics, and preference sync.
- Create: `src/components/mdx/PlatformContent.tsx`
  - Author-facing marker exports that should only exist as transform sentinels plus internal panel components if needed.
- Modify: `source.config.ts`
  - Register the new remark plugin after existing directive/admonition setup.
- Modify: `src/components/mdx.tsx`
  - Register `PlatformInline` / `PlatformStructured` sentinels and internal transformed group renderer.
- Modify: `src/lib/docs-page.server.ts`
  - Replace raw `processedText -> getTableOfContents` usage with canonical-only ToC extraction while keeping full processed text for markdown export behavior.
- Modify: `src/components/docs-shell/DocsContent.tsx`
  - Add an inline pre-hydration platform script hook point if needed near docs content shell, and regression coverage around title/body ordering if markup shifts.
- Test: `src/lib/platforms/registry.test.ts`
- Test: `src/lib/platforms/mdx-groups.test.ts`
- Test: `src/lib/platforms/remark-platform-content.test.ts`
- Test: `src/lib/platforms/processed-text.test.ts`
- Test: `src/components/mdx.test.tsx`
- Test: `src/components/docs-shell/DocsContent.test.tsx`
- Test: `src/lib/docs-page.server.test.ts`

## Scope Notes

- `PlatformInline` and `PlatformStructured` are page-internal content variants only.
- They do not change route, sidebar scope, locale, or nav-scope version/platform switching.
- All platform variants remain in HTML output and `llms`/processed text output.
- Page-level ToC uses shared content plus each structured group's canonical platform only.
- The current docs search dialog remains page-level; do not implement platform-aware snippets in this plan.
- Accept the v1 tradeoff that browser-native find may still match hidden platform content.

### Task 1: Platform Domain Model

**Files:**
- Create: `src/lib/platforms/registry.ts`
- Test: `src/lib/platforms/registry.test.ts`

- [ ] **Step 1: Write the failing test for registry labels, canonical priority, and fallback resolution**

```ts
import {
  PLATFORM_CANONICAL_PRIORITY,
  PLATFORM_PREFERENCE_STORAGE_KEY,
  getCanonicalPlatform,
  getPlatformLabel,
  isKnownPlatform,
} from './registry';
import { describe, expect, it } from 'vitest';

describe('platform registry', () => {
  it('exposes a stable canonical priority order', () => {
    expect(PLATFORM_CANONICAL_PRIORITY).toEqual([
      'javascript',
      'android',
      'ios',
      'flutter',
      'react-native',
    ]);
  });

  it('resolves canonical platform by priority, not declaration order', () => {
    expect(getCanonicalPlatform(['ios', 'android'])).toBe('android');
    expect(getCanonicalPlatform(['flutter', 'javascript'])).toBe('javascript');
  });

  it('falls back to the first available platform when no canonical priority matches', () => {
    expect(getCanonicalPlatform(['unity', 'web']).platform).toBe('unity');
    expect(getCanonicalPlatform(['unity', 'web']).usedFallback).toBe(true);
  });

  it('recognizes only registered platform keys', () => {
    expect(isKnownPlatform('android')).toBe(true);
    expect(isKnownPlatform('js')).toBe(false);
  });

  it('returns locale-specific labels from the registry', () => {
    expect(getPlatformLabel('javascript', 'en')).toBe('JavaScript');
    expect(getPlatformLabel('javascript', 'zh-CN')).toBe('JavaScript');
    expect(getPlatformLabel('ios', 'en')).toBe('iOS');
  });

  it('uses a namespaced storage key', () => {
    expect(PLATFORM_PREFERENCE_STORAGE_KEY).toBe('docs-portal:platform:v1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/platforms/registry.test.ts`

Expected: FAIL with `Cannot find module './registry'` or missing exports for the registry helpers.

- [ ] **Step 3: Write the minimal platform registry implementation**

```ts
import type { AppLocale } from '@/lib/i18n/i18n-config';

export const PLATFORM_PREFERENCE_STORAGE_KEY = 'docs-portal:platform:v1';

export const platformRegistry = {
  javascript: {
    label: {
      en: 'JavaScript',
      'zh-CN': 'JavaScript',
    },
    order: 10,
  },
  android: {
    label: {
      en: 'Android',
      'zh-CN': 'Android',
    },
    order: 20,
  },
  ios: {
    label: {
      en: 'iOS',
      'zh-CN': 'iOS',
    },
    order: 30,
  },
  flutter: {
    label: {
      en: 'Flutter',
      'zh-CN': 'Flutter',
    },
    order: 40,
  },
  'react-native': {
    label: {
      en: 'React Native',
      'zh-CN': 'React Native',
    },
    order: 50,
  },
} as const;

export type PlatformKey = keyof typeof platformRegistry;

export const PLATFORM_CANONICAL_PRIORITY: PlatformKey[] = [
  'javascript',
  'android',
  'ios',
  'flutter',
  'react-native',
];

export function isKnownPlatform(value: string): value is PlatformKey {
  return value in platformRegistry;
}

export function getPlatformLabel(platform: PlatformKey, locale: AppLocale) {
  return platformRegistry[platform].label[locale];
}

export function getCanonicalPlatform(platforms: string[]) {
  const knownPlatforms = platforms.filter(isKnownPlatform);
  const match = PLATFORM_CANONICAL_PRIORITY.find((platform) =>
    knownPlatforms.includes(platform),
  );

  if (match) {
    return {
      platform: match,
      usedFallback: false,
    };
  }

  const fallback = knownPlatforms[0];

  if (!fallback) {
    throw new Error('Cannot resolve canonical platform from an empty group.');
  }

  return {
    platform: fallback,
    usedFallback: true,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/platforms/registry.test.ts`

Expected: PASS with all registry and canonical-selection assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/platforms/registry.ts src/lib/platforms/registry.test.ts
git commit -m "feat: add platform registry contract"
```

### Task 2: Grouping and Validation Helpers

**Files:**
- Create: `src/lib/platforms/mdx-groups.ts`
- Test: `src/lib/platforms/mdx-groups.test.ts`

- [ ] **Step 1: Write the failing test for group splitting and validation**

```ts
import {
  createPlatformGroup,
  splitPlatformRuns,
  validatePlatformGroup,
} from './mdx-groups';
import { describe, expect, it } from 'vitest';

describe('platform mdx groups', () => {
  it('splits non-consecutive platform blocks into separate groups', () => {
    const nodes = [
      { kind: 'shared', value: 'before' },
      { kind: 'platform', mode: 'structured', platform: 'android', value: 'A' },
      { kind: 'platform', mode: 'structured', platform: 'javascript', value: 'B' },
      { kind: 'shared', value: 'middle' },
      { kind: 'platform', mode: 'inline', platform: 'android', value: 'C' },
      { kind: 'platform', mode: 'inline', platform: 'javascript', value: 'D' },
    ] as const;

    expect(splitPlatformRuns(nodes)).toEqual([
      [{ kind: 'platform', mode: 'structured', platform: 'android', value: 'A' },
       { kind: 'platform', mode: 'structured', platform: 'javascript', value: 'B' }],
      [{ kind: 'platform', mode: 'inline', platform: 'android', value: 'C' },
       { kind: 'platform', mode: 'inline', platform: 'javascript', value: 'D' }],
    ]);
  });

  it('rejects mixed inline and structured nodes in the same consecutive run', () => {
    expect(() =>
      validatePlatformGroup([
        { kind: 'platform', mode: 'inline', platform: 'android', value: 'A' },
        { kind: 'platform', mode: 'structured', platform: 'javascript', value: 'B' },
      ]),
    ).toThrow('Platform groups cannot mix PlatformInline and PlatformStructured blocks.');
  });

  it('rejects duplicate platforms inside one group', () => {
    expect(() =>
      validatePlatformGroup([
        { kind: 'platform', mode: 'inline', platform: 'android', value: 'A' },
        { kind: 'platform', mode: 'inline', platform: 'android', value: 'B' },
      ]),
    ).toThrow('Duplicate platform key "android" in the same group.');
  });

  it('requires at least two platform variants per group', () => {
    expect(() =>
      createPlatformGroup([
        { kind: 'platform', mode: 'inline', platform: 'android', value: 'A' },
      ]),
    ).toThrow('Platform groups must contain at least two variants.');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/platforms/mdx-groups.test.ts`

Expected: FAIL because `src/lib/platforms/mdx-groups.ts` does not exist yet.

- [ ] **Step 3: Write minimal grouping helpers**

```ts
import { getCanonicalPlatform, isKnownPlatform, type PlatformKey } from './registry';

export type PlatformGroupMode = 'inline' | 'structured';

export type PlatformLeaf<T = unknown> = {
  kind: 'platform';
  mode: PlatformGroupMode;
  platform: string;
  value: T;
};

export type SharedLeaf<T = unknown> = {
  kind: 'shared';
  value: T;
};

export type GroupInput<T = unknown> = Array<PlatformLeaf<T>>;

export function splitPlatformRuns<T>(
  nodes: Array<PlatformLeaf<T> | SharedLeaf<T>>,
) {
  const groups: Array<GroupInput<T>> = [];
  let current: GroupInput<T> = [];

  for (const node of nodes) {
    if (node.kind === 'shared') {
      if (current.length > 0) {
        groups.push(current);
        current = [];
      }
      continue;
    }

    current.push(node);
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
}

export function validatePlatformGroup<T>(nodes: GroupInput<T>) {
  if (nodes.length < 2) {
    throw new Error('Platform groups must contain at least two variants.');
  }

  const mode = nodes[0]?.mode;

  if (!mode) {
    throw new Error('Platform groups must contain at least one node.');
  }

  if (nodes.some((node) => node.mode !== mode)) {
    throw new Error(
      'Platform groups cannot mix PlatformInline and PlatformStructured blocks.',
    );
  }

  const seen = new Set<PlatformKey>();

  for (const node of nodes) {
    if (!isKnownPlatform(node.platform)) {
      throw new Error(`Unknown platform key "${node.platform}".`);
    }

    if (seen.has(node.platform)) {
      throw new Error(
        `Duplicate platform key "${node.platform}" in the same group.`,
      );
    }

    seen.add(node.platform);
  }
}

export function createPlatformGroup<T>(nodes: GroupInput<T>) {
  validatePlatformGroup(nodes);

  const platforms = nodes.map((node) => node.platform);
  const canonical = getCanonicalPlatform(platforms);

  return {
    canonicalPlatform: canonical.platform,
    mode: nodes[0]!.mode,
    platforms,
    usedCanonicalFallback: canonical.usedFallback,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/platforms/mdx-groups.test.ts`

Expected: PASS with grouping, duplicate detection, and mode-mixing checks green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/platforms/mdx-groups.ts src/lib/platforms/mdx-groups.test.ts
git commit -m "feat: add platform mdx grouping helpers"
```

### Task 3: Remark Transform for Platform Blocks

**Files:**
- Create: `src/lib/platforms/remark-platform-content.ts`
- Test: `src/lib/platforms/remark-platform-content.test.ts`
- Modify: `source.config.ts`

- [ ] **Step 1: Write the failing test for MDX transform output**

```ts
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
    expect(result).toContain('canonicalPlatform: "javascript"');
    expect(result).toContain('groupMode: "structured"');
    expect(result).toContain('platform: "android"');
    expect(result).toContain('platform: "javascript"');
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/platforms/remark-platform-content.test.ts`

Expected: FAIL because the plugin file does not exist and `source.config.ts` has no platform transform registered.

- [ ] **Step 3: Write the transform and register it in `source.config.ts`**

```ts
// src/lib/platforms/remark-platform-content.ts
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import {
  createPlatformGroup,
  type PlatformGroupMode,
  type PlatformLeaf,
} from './mdx-groups';

const PLATFORM_COMPONENT_NAMES = new Map<string, PlatformGroupMode>([
  ['PlatformInline', 'inline'],
  ['PlatformStructured', 'structured'],
]);

export function remarkPlatformContent() {
  return (tree: Root) => {
    const nextChildren = [];

    for (let index = 0; index < tree.children.length; ) {
      const node = tree.children[index];
      const firstLeaf = toPlatformLeaf(node);

      if (!firstLeaf) {
        nextChildren.push(node);
        index += 1;
        continue;
      }

      const run: Array<{ leaf: PlatformLeaf<typeof node>; node: typeof node }> = [
        { leaf: firstLeaf, node },
      ];

      let lookahead = index + 1;

      while (lookahead < tree.children.length) {
        const leaf = toPlatformLeaf(tree.children[lookahead]);

        if (!leaf) {
          break;
        }

        run.push({
          leaf,
          node: tree.children[lookahead],
        });
        lookahead += 1;
      }

      const group = createPlatformGroup(run.map((entry) => entry.leaf));

      nextChildren.push({
        type: 'mdxJsxFlowElement',
        name: '_PlatformTabsGroup',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'groupMode', value: group.mode },
          {
            type: 'mdxJsxAttribute',
            name: 'canonicalPlatform',
            value: group.canonicalPlatform,
          },
          {
            type: 'mdxJsxAttribute',
            name: 'platforms',
            value: JSON.stringify(group.platforms),
          },
        ],
        children: run.map(({ leaf, node }) => ({
          type: 'mdxJsxFlowElement',
          name: '_PlatformPanel',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'platform', value: leaf.platform },
          ],
          children: 'children' in node ? node.children : [],
        })),
      });

      index = lookahead;
    }

    tree.children = nextChildren as Root['children'];
  };
}

function toPlatformLeaf(node: any): PlatformLeaf<any> | null {
  if (node?.type !== 'mdxJsxFlowElement') {
    return null;
  }

  const mode = PLATFORM_COMPONENT_NAMES.get(node.name);

  if (!mode) {
    return null;
  }

  const platform = node.attributes?.find(
    (attribute: any) => attribute.type === 'mdxJsxAttribute' && attribute.name === 'platform',
  )?.value;

  if (typeof platform !== 'string') {
    throw new Error(`${node.name} requires a string platform attribute.`);
  }

  return {
    kind: 'platform',
    mode,
    platform,
    value: node,
  };
}
```

```ts
// source.config.ts excerpt inside remarkPlugins
remarkPlugins: (plugins) => [
  remarkDirective,
  [
    remarkDirectiveAdmonition,
    {
      types: {
        danger: 'error',
        info: 'info',
        note: 'info',
        success: 'ok',
        tip: 'ok',
        warn: 'warning',
        warning: 'warning',
      },
    },
  ],
  remarkPlatformContent,
  ...plugins,
],
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/platforms/remark-platform-content.test.ts`

Expected: PASS with transformed `_PlatformTabsGroup` output and duplicate-platform failure coverage.

- [ ] **Step 5: Commit**

```bash
git add source.config.ts src/lib/platforms/remark-platform-content.ts src/lib/platforms/remark-platform-content.test.ts
git commit -m "feat: add platform content mdx transform"
```

### Task 4: Platform Tabs Renderer and Preference Sync

**Files:**
- Create: `src/lib/platforms/preference.ts`
- Create: `src/components/mdx/PlatformContent.tsx`
- Create: `src/components/mdx/PlatformTabsGroup.tsx`
- Modify: `src/components/mdx.tsx`
- Test: `src/components/mdx.test.tsx`

- [ ] **Step 1: Write the failing test for rendered platform tabs, fallback selection, and inactive-panel semantics**

```tsx
it('renders transformed platform groups with persisted preference fallback and hidden inactive panels', () => {
  window.localStorage.setItem('docs-portal:platform:v1', 'ios');

  const components = getMDXComponents();
  const Group = components._PlatformTabsGroup as TabsComponent;
  const Panel = components._PlatformPanel as TabsChildComponent;

  render(
    <Group
      canonicalPlatform="javascript"
      groupMode="structured"
      platforms='["javascript","android"]'
    >
      <Panel platform="javascript">
        <h2 id="js-install">Install JS SDK</h2>
      </Panel>
      <Panel platform="android">
        <h2 id="android-install">Install Android SDK</h2>
      </Panel>
    </Group>,
  );

  expect(screen.getByRole('tab', { name: 'JavaScript' })).toHaveAttribute(
    'data-state',
    'active',
  );
  expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
    'data-state',
    'inactive',
  );

  const activePanel = screen
    .getByText('Install JS SDK')
    .closest('[data-platform-panel="javascript"]');
  const inactivePanel = screen
    .getByText('Install Android SDK')
    .closest('[data-platform-panel="android"]');

  expect(activePanel).not.toHaveAttribute('hidden');
  expect(activePanel).toHaveAttribute('aria-hidden', 'false');
  expect(inactivePanel).toHaveAttribute('hidden');
  expect(inactivePanel).toHaveAttribute('aria-hidden', 'true');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/components/mdx.test.tsx`

Expected: FAIL because `_PlatformTabsGroup` and `_PlatformPanel` are not registered in the MDX component registry.

- [ ] **Step 3: Implement preference helpers, internal renderer, and component registration**

```ts
// src/lib/platforms/preference.ts
import { PLATFORM_PREFERENCE_STORAGE_KEY, type PlatformKey } from './registry';

export const PLATFORM_DATASET_KEY = 'docsPlatform';

export function getStoredPlatformPreference() {
  try {
    return window.localStorage.getItem(PLATFORM_PREFERENCE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredPlatformPreference(platform: PlatformKey) {
  try {
    window.localStorage.setItem(PLATFORM_PREFERENCE_STORAGE_KEY, platform);
  } catch {}

  document.documentElement.dataset[PLATFORM_DATASET_KEY] = platform;
}

export function syncPlatformDataset(platform: string | null) {
  if (!platform) {
    delete document.documentElement.dataset[PLATFORM_DATASET_KEY];
    return;
  }

  document.documentElement.dataset[PLATFORM_DATASET_KEY] = platform;
}
```

```tsx
// src/components/mdx/PlatformContent.tsx
export function PlatformInline() {
  throw new Error('PlatformInline should be transformed at MDX compile time.');
}

export function PlatformStructured() {
  throw new Error(
    'PlatformStructured should be transformed at MDX compile time.',
  );
}
```

```tsx
// src/components/mdx/PlatformTabsGroup.tsx
import { Tabs, TabsList, TabsTrigger } from 'fumadocs-ui/components/tabs';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { getPlatformLabel, isKnownPlatform, type PlatformKey } from '@/lib/platforms/registry';
import {
  getStoredPlatformPreference,
  setStoredPlatformPreference,
  syncPlatformDataset,
} from '@/lib/platforms/preference';
import { DEFAULT_LOCALE } from '@/lib/i18n/i18n-config';

export function PlatformTabsGroup({
  canonicalPlatform,
  children,
  groupMode,
  locale = DEFAULT_LOCALE,
  platforms,
}: {
  canonicalPlatform: PlatformKey;
  children: ReactNode;
  groupMode: 'inline' | 'structured';
  locale?: 'en' | 'zh-CN';
  platforms: string;
}) {
  const parsedPlatforms = useMemo(
    () => JSON.parse(platforms) as PlatformKey[],
    [platforms],
  );
  const stored = getStoredPlatformPreference();
  const fallback =
    stored && isKnownPlatform(stored) && parsedPlatforms.includes(stored)
      ? stored
      : canonicalPlatform;
  const [activePlatform, setActivePlatform] = useState<PlatformKey>(fallback);

  useEffect(() => {
    syncPlatformDataset(activePlatform);
  }, [activePlatform]);

  return (
    <div
      className={groupMode === 'structured' ? 'not-prose flex flex-col gap-4' : 'flex flex-col gap-3'}
      data-platform-group=""
      data-platforms={parsedPlatforms.join(' ')}
    >
      <Tabs value={activePlatform}>
        <TabsList>
          {parsedPlatforms.map((platform) => (
            <TabsTrigger
              key={platform}
              onClick={() => {
                setActivePlatform(platform);
                setStoredPlatformPreference(platform);
              }}
              value={platform}
            >
              {getPlatformLabel(platform, locale)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {Array.isArray(children)
        ? children.map((child: any) =>
            child?.props?.platform === activePlatform
              ? child
              : child
                ? {
                    ...child,
                    props: {
                      ...child.props,
                      activePlatform,
                      isActive: false,
                    },
                  }
                : child,
          )
        : children}
    </div>
  );
}

export function PlatformPanel({
  activePlatform,
  children,
  isActive = true,
  platform,
}: {
  activePlatform?: PlatformKey;
  children: ReactNode;
  isActive?: boolean;
  platform: PlatformKey;
}) {
  const visible = activePlatform ? activePlatform === platform : isActive;

  return (
    <section
      aria-hidden={visible ? 'false' : 'true'}
      data-platform-panel={platform}
      hidden={!visible}
      inert={visible ? undefined : ''}
    >
      {children}
    </section>
  );
}
```

```ts
// src/components/mdx.tsx excerpt inside getMDXComponents()
import { PlatformInline, PlatformStructured } from './mdx/PlatformContent';
import { PlatformPanel, PlatformTabsGroup } from './mdx/PlatformTabsGroup';

// inside returned registry
PlatformInline,
PlatformStructured,
_PlatformTabsGroup: PlatformTabsGroup,
_PlatformPanel: PlatformPanel,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/components/mdx.test.tsx`

Expected: PASS with platform tab rendering, fallback selection, and hidden inactive panel coverage green alongside existing MDX registry tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/platforms/preference.ts src/components/mdx/PlatformContent.tsx src/components/mdx/PlatformTabsGroup.tsx src/components/mdx.tsx src/components/mdx.test.tsx
git commit -m "feat: render platform mdx groups"
```

### Task 5: Canonical-Only ToC Extraction

**Files:**
- Create: `src/lib/platforms/processed-text.ts`
- Modify: `src/lib/docs-page.server.ts`
- Test: `src/lib/platforms/processed-text.test.ts`
- Test: `src/lib/docs-page.server.test.ts`

- [ ] **Step 1: Write the failing test for canonical-only ToC source text**

```ts
import { describe, expect, it } from 'vitest';
import { buildCanonicalPlatformTocText } from './processed-text';

describe('canonical platform toc text', () => {
  it('keeps shared content and only canonical structured-platform headings', () => {
    const processedText = `
# Page title

Shared intro

[platform-structured group canonical=javascript platform=android]
## Install Android SDK
[/platform-structured]

[platform-structured group canonical=javascript platform=javascript]
## Install JavaScript SDK
[/platform-structured]

## Shared follow-up
`;

    expect(buildCanonicalPlatformTocText(processedText)).toContain(
      '## Install JavaScript SDK',
    );
    expect(buildCanonicalPlatformTocText(processedText)).not.toContain(
      '## Install Android SDK',
    );
    expect(buildCanonicalPlatformTocText(processedText)).toContain(
      '## Shared follow-up',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/platforms/processed-text.test.ts`

Expected: FAIL because `src/lib/platforms/processed-text.ts` does not exist yet.

- [ ] **Step 3: Implement canonical ToC text derivation and wire it into docs page payload loading**

```ts
// src/lib/platforms/processed-text.ts
const CANONICAL_BLOCK_PATTERN =
  /\[platform-structured group canonical=(?<canonical>[a-z-]+) platform=(?<platform>[a-z-]+)\]\n(?<body>[\s\S]*?)\[\/platform-structured\]/g;

export function buildCanonicalPlatformTocText(processedText: string) {
  return processedText.replace(
    CANONICAL_BLOCK_PATTERN,
    (_match, canonical: string, platform: string, body: string) =>
      canonical === platform ? body : '',
  );
}
```

```ts
// src/lib/docs-page.server.ts excerpt
import { buildCanonicalPlatformTocText } from './platforms/processed-text';

async function resolvePageToc(page: PageWithSource, processedText: string) {
  const directToc = normalizeToc(getPageToc(page));

  if (directToc.length > 0) {
    return directToc;
  }

  try {
    return normalizeToc(
      await getTableOfContents(buildCanonicalPlatformTocText(processedText)),
    );
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/platforms/processed-text.test.ts src/lib/docs-page.server.test.ts`

Expected: PASS with canonical-platform headings included and non-canonical headings excluded from ToC generation.

- [ ] **Step 5: Commit**

```bash
git add src/lib/platforms/processed-text.ts src/lib/platforms/processed-text.test.ts src/lib/docs-page.server.ts src/lib/docs-page.server.test.ts
git commit -m "feat: limit docs toc to canonical platform content"
```

### Task 6: Full Processed Text Markers for `llms` and Diagnostics

**Files:**
- Modify: `src/lib/platforms/remark-platform-content.ts`
- Modify: `src/lib/source.server.ts`
- Test: `src/lib/platforms/remark-platform-content.test.ts`
- Test: `src/components/docs-shell/DocsContent.test.tsx`

- [ ] **Step 1: Write the failing test for full processed text markers and markdown export stability**

```ts
it('keeps all platform variants in processed text with readable platform markers', async () => {
  const source = `
<PlatformStructured platform="android">
Android content
</PlatformStructured>
<PlatformStructured platform="javascript">
JavaScript content
</PlatformStructured>
`;

  const result = String(
    await compile(source, {
      jsx: true,
      remarkPlugins: [remarkPlatformContent],
    }),
  );

  expect(result).toContain('[platform-structured group canonical=javascript platform=android]');
  expect(result).toContain('[platform-structured group canonical=javascript platform=javascript]');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/platforms/remark-platform-content.test.ts src/components/docs-shell/DocsContent.test.tsx`

Expected: FAIL because the transform does not yet emit processed-text markers that distinguish canonical and non-canonical platform variants.

- [ ] **Step 3: Emit readable processed-text markers while preserving markdown export URLs**

```ts
// src/lib/platforms/remark-platform-content.ts inside generated _PlatformPanel children
children: [
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        value: `[platform-${group.mode} group canonical=${group.canonicalPlatform} platform=${leaf.platform}]`,
      },
    ],
  },
  ...('children' in node ? node.children : []),
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        value: `[\/platform-${group.mode}]`,
      },
    ],
  },
],
```

Keep `src/lib/source.server.ts` behavior unchanged for `getLLMText(page)` so it still uses the full processed text output after transform and continues returning:

```ts
return `# ${page.data.title} (${page.url})

${processed}`;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/platforms/remark-platform-content.test.ts src/components/docs-shell/DocsContent.test.tsx`

Expected: PASS with all-platform processed markers present and docs content rendering regressions still green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/platforms/remark-platform-content.ts src/lib/platforms/remark-platform-content.test.ts src/lib/source.server.ts src/components/docs-shell/DocsContent.test.tsx
git commit -m "feat: preserve full platform content in processed exports"
```

### Task 7: Verification and Example Coverage

**Files:**
- Modify: `content/docs/en/ai/get-started/test-mdx-comps.mdx`
- Test: `src/components/mdx.test.tsx`
- Test: `src/lib/docs-page.server.test.ts`
- Test: `src/components/docs-shell/DocsContent.test.tsx`

- [ ] **Step 1: Add a small real-content fixture section to the MDX test page**

```mdx
## Platform content blocks

Shared setup note before platform instructions.

<PlatformStructured platform="android">
### Install on Android

Use Gradle to add the SDK.
</PlatformStructured>

<PlatformStructured platform="javascript">
### Install with JavaScript

Use npm to add the SDK.
</PlatformStructured>

Shared note after structured block.

<PlatformInline platform="android">
Use `./gradlew assemble`.
</PlatformInline>

<PlatformInline platform="javascript">
Use `npm run build`.
</PlatformInline>
```

- [ ] **Step 2: Run focused tests to verify new platform content coverage**

Run: `bunx vitest run src/components/mdx.test.tsx src/components/docs-shell/DocsContent.test.tsx src/lib/docs-page.server.test.ts`

Expected: PASS with the platform content tests green and no regressions in ToC/header rendering.

- [ ] **Step 3: Run repo-specific validation for touched files**

Run: `bunx biome check source.config.ts src/components/mdx.tsx src/components/mdx/PlatformContent.tsx src/components/mdx/PlatformTabsGroup.tsx src/lib/platforms/registry.ts src/lib/platforms/preference.ts src/lib/platforms/mdx-groups.ts src/lib/platforms/remark-platform-content.ts src/lib/platforms/processed-text.ts src/lib/docs-page.server.ts src/lib/source.server.ts src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsContent.test.tsx src/components/mdx.test.tsx src/lib/docs-page.server.test.ts`

Expected: PASS with no formatting or lint errors on touched files.

- [ ] **Step 4: Run typecheck and build**

Run: `bun run types:check`
Expected: PASS, or if there is a pre-existing unrelated failure, capture the exact file and error text before continuing.

Run: `bun run build`
Expected: PASS and static docs build completes with platform content transform active.

- [ ] **Step 5: Run diff checks and commit**

```bash
git diff --check
git diff --cached --check
git add content/docs/en/ai/get-started/test-mdx-comps.mdx src/components/mdx.test.tsx src/components/docs-shell/DocsContent.test.tsx src/lib/docs-page.server.test.ts
git commit -m "test: verify platform content blocks end to end"
```

## Self-Review

- Spec coverage:
  - Author-facing `PlatformInline` / `PlatformStructured`: Task 4
  - Compile-time grouping and validation: Tasks 2-3
  - Global persisted platform preference: Task 4
  - Full HTML / full processed text / full `llms`: Tasks 4 and 6
  - Canonical-only ToC: Task 5
  - Page-level search scope unchanged: explicitly preserved in scope notes; no new task required
  - Performance/lifecycle constraints: reflected in architecture, scope notes, and the hidden/inert renderer contract in Task 4
- Placeholder scan:
  - Removed `TODO`-style wording; every task has concrete files, code, and commands.
- Type consistency:
  - Author-facing markers use `PlatformInline` / `PlatformStructured` consistently.
  - Internal transform output uses `_PlatformTabsGroup` / `_PlatformPanel` consistently.
  - Storage key and canonical registry constants are defined once in the registry/preference layer.

Plan complete and saved to `docs/superpowers/plans/2026-06-12-platform-content-blocks.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
