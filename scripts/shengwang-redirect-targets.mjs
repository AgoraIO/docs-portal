import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  isKnownPlatform,
  normalizePlatformKey,
} from '../src/lib/platforms/registry.ts';

// Match the runtime's structured-platform admission rule: inline blocks and
// single-platform documents do not publish virtual /platform variants.
export async function collectCurrentDocTargets(root) {
  const targets = new Set();
  async function walk(directory, segments) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(
          file,
          /^\(.+\)$/.test(entry.name) ? segments : [...segments, entry.name],
        );
      } else if (/\.mdx?$/.test(entry.name)) {
        const leaf = entry.name.replace(/\.mdx?$/, '');
        const route = `/${[...segments, ...(leaf === 'index' ? [] : [leaf])].join('/')}`;
        targets.add(route);
        const text = await readFile(file, 'utf8');
        const platforms = new Set(
          [
            ...text.matchAll(
              /<PlatformStructured\s+platform=["']([a-z-]+)["']/g,
            ),
          ]
            .map((match) => normalizePlatformKey(match[1]))
            .filter(isKnownPlatform),
        );
        if (platforms.size > 1) {
          for (const platform of platforms) targets.add(`${route}/${platform}`);
        }
      }
    }
  }
  await walk(root, []);
  return targets;
}

export function toPublicRedirectTarget(target) {
  // Keep immutable migration snapshots intact while publishing canonical targets.
  target = target.replace(
    /^\/(zh-CN\/)?realtime-media\/rtc\/reference\/events(?=[?#]|$)/,
    '/$1api-reference/rtc/restful/webhook/events',
  );

  if (!/^\/zh-CN(?=\/|[?#]|$)/.test(target)) {
    return target;
  }

  const suffix = target.slice('/zh-CN'.length);
  return suffix.startsWith('/') ? suffix : `/${suffix}`;
}
