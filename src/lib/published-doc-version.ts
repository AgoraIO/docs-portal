import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function readPublishedDocVersion(
  docsRoot: string,
  url: string,
): Promise<string | undefined> {
  const explicit = url.match(/\/(?:v)?(\d+\.\d+(?:\.\d+)?)\//)?.[1];
  if (explicit) return explicit;

  const segments = url.split('/').filter(Boolean);
  const locale = segments.shift();
  if (!locale) return undefined;

  const localeRoot = path.join(docsRoot, locale);
  let directory = path.join(localeRoot, ...segments);
  while (directory.startsWith(localeRoot)) {
    try {
      const meta = JSON.parse(
        await readFile(path.join(directory, 'meta.json'), 'utf8'),
      ) as {
        navScope?: {
          versions?: Array<{ id?: string; label?: string }>;
        };
      };
      const current = meta.navScope?.versions?.find(
        (version) => version.id === 'current',
      );
      if (typeof current?.label === 'string') {
        const version = current.label.replace(/^v/i, '');
        // “当前版本”是导航名称，不是 SDK 版本号；来源未声明时保持空值。
        return /^\d+\.\d+(?:\.\d+)?$/.test(version) ? version : undefined;
      }
    } catch {
      // The route directory often has no meta.json; continue at its parent.
    }

    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }

  return undefined;
}
