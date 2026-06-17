import {
  getCanonicalPlatform,
  isKnownPlatform,
  type PlatformKey,
} from './registry';

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

export type PlatformGroupInput<T = unknown> = Array<PlatformLeaf<T>>;

export type PlatformGroup<T = unknown> = {
  canonicalPlatform: string;
  mode: PlatformGroupMode;
  showTabs: boolean;
  usedCanonicalFallback: boolean;
  platforms: string[];
  nodes: PlatformGroupInput<T>;
};

export function splitPlatformRuns<T>(
  nodes: Array<PlatformLeaf<T> | SharedLeaf<T>>,
): Array<PlatformGroupInput<T>> {
  const groups: Array<PlatformGroupInput<T>> = [];
  let current: PlatformGroupInput<T> = [];

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

export function validatePlatformGroup<T>(nodes: PlatformGroupInput<T>): void {
  if (nodes.length === 0) {
    throw new Error('Platform groups must contain at least one node.');
  }

  const mode = nodes[0].mode;

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

export function createPlatformGroup<T>(
  nodes: PlatformGroupInput<T>,
): PlatformGroup<T> {
  validatePlatformGroup(nodes);

  const platforms = nodes.map((node) => node.platform);
  const canonical = getCanonicalPlatform(platforms);

  return {
    canonicalPlatform: canonical.platform,
    mode: nodes[0].mode,
    showTabs: nodes.length > 1,
    usedCanonicalFallback: canonical.usedFallback,
    platforms,
    nodes,
  };
}
