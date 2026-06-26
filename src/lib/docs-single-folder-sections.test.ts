import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { source } from './source.server';

const docsRoot = resolve(process.cwd(), 'content/docs');

describe('single-folder docs sections', () => {
  it('does not keep navigation sections whose only page is another folder', () => {
    expect(findSingleFolderSections()).toEqual([]);
  });

  it('resolves flattened RTM routes without the removed intermediate folders', () => {
    expect(
      source.getPage(
        [
          'realtime-media',
          'rtm',
          'build',
          'work-with-channels',
          'message-channel',
        ],
        'en',
      )?.url,
    ).toBe('/en/realtime-media/rtm/build/work-with-channels/message-channel');
    expect(
      source.getPage(
        [
          'realtime-media',
          'rtm',
          'build',
          'send-and-receive-messages',
          'add-event-listener',
        ],
        'en',
      )?.url,
    ).toBe(
      '/en/realtime-media/rtm/build/send-and-receive-messages/add-event-listener',
    );

    expect(
      source.getPage(
        [
          'realtime-media',
          'rtm',
          'build',
          'work-with-channels',
          'channels',
          'message-channel',
        ],
        'en',
      ),
    ).toBeUndefined();
    expect(
      source.getPage(
        [
          'realtime-media',
          'rtm',
          'build',
          'send-and-receive-messages',
          'messaging',
          'add-event-listener',
        ],
        'en',
      ),
    ).toBeUndefined();
  });

  it('does not leave links pointing at removed RTM intermediate folders', () => {
    const offenders = listTextFiles(docsRoot)
      .filter((file) => {
        const content = readFileSync(file, 'utf8');

        return /work-with-channels\/channels|send-and-receive-messages\/messaging/.test(
          content,
        );
      })
      .map((file) => relative(process.cwd(), file));

    expect(offenders).toEqual([]);
  });
});

function findSingleFolderSections() {
  return listMetaFiles(docsRoot).flatMap((metaPath) => {
    const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as {
      pages?: unknown;
      title?: string;
    };

    if (
      !Array.isArray(meta.pages) ||
      meta.pages.length !== 1 ||
      typeof meta.pages[0] !== 'string'
    ) {
      return [];
    }

    const parentDir = resolve(metaPath, '..');
    const childDir = join(parentDir, meta.pages[0]);

    if (!existsSync(join(childDir, 'meta.json'))) {
      return [];
    }

    return [
      {
        child: meta.pages[0],
        parent: relative(docsRoot, parentDir),
        title: meta.title ?? null,
      },
    ];
  });
}

function listMetaFiles(root: string) {
  return listTextFiles(root).filter((file) => file.endsWith('/meta.json'));
}

function listTextFiles(root: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const entryPath = join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...listTextFiles(entryPath));
      continue;
    }

    if (entry.isFile() && /\.(?:json|md|mdx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}
