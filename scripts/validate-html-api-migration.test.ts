import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  findDuplicateExplicitAnchorIds,
  hasInvalidMarkdownHeading,
  hasPageDescriptionCopiedFromFirstMember,
} from './validate-html-api-migration.mjs';

function listMdxFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(root, entry.name);
    if (entry.isDirectory()) return listMdxFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.mdx') ? [entryPath] : [];
  });
}

describe('validate-html-api-migration', () => {
  it('rejects level-7 headings outside fenced code', () => {
    expect(hasInvalidMarkdownHeading('####### `since`')).toBe(true);
    expect(hasInvalidMarkdownHeading('  ####### nested')).toBe(true);
  });

  it('allows hash-prefixed lines inside fenced code', () => {
    expect(
      hasInvalidMarkdownHeading(
        ['```shell', '####### shell comment', '```'].join('\n'),
      ),
    ).toBe(false);
    expect(
      hasInvalidMarkdownHeading(
        ['  ~~~~text', '  ####### example', '  ~~~~'].join('\n'),
      ),
    ).toBe(false);
  });

  it('reports duplicate explicit anchor IDs per generated page', () => {
    expect(
      findDuplicateExplicitAnchorIds(
        '<a id="join"></a>\n<a id="other"></a>\n<a id="join"></a>',
      ),
    ).toEqual(['join']);
  });

  it('detects a page description copied from its first API member', () => {
    expect(
      hasPageDescriptionCopiedFromFirstMember(`---
title: "音频相关"
description: "设置音频格式。"
---

<a id="toc_audio"></a>

## setAudioFormat

设置音频格式。
`),
    ).toBe(true);
    expect(
      hasPageDescriptionCopiedFromFirstMember(`---
title: "音频相关"
description: "音频相关 API reference."
---

## setAudioFormat

设置音频格式。
`),
    ).toBe(false);
    expect(
      hasPageDescriptionCopiedFromFirstMember(`---
title: "AudioParams"
description: "设置音频格式。"
---

\`\`\`ts
class AudioParams {}
\`\`\`

### sampleRate

设置音频格式。
`),
    ).toBe(false);
  });

  it('keeps committed RTC DITA section metadata separate from member content', () => {
    const rtcRoot = resolve(
      process.cwd(),
      'content/docs/zh-CN/api-reference/rtc',
    );
    const offenders = listMdxFiles(rtcRoot)
      .filter((file) => file.includes('/(current)/'))
      .filter((file) =>
        hasPageDescriptionCopiedFromFirstMember(readFileSync(file, 'utf8')),
      )
      .map((file) => relative(process.cwd(), file));

    expect(offenders).toEqual([]);
  });

  it('keeps committed Flexible Classroom Android links inside the migrated API reference route', () => {
    const androidRoot = resolve(
      process.cwd(),
      'content/docs/zh-CN/api-reference/flexible-classroom/android/api-reference',
    );
    const legacyRoutePattern =
      /\/zh-CN\/api-reference\/flexible-classroom\/android\/(?!api-reference(?:\/|$))/;
    const offenders = listMdxFiles(androidRoot)
      .filter((file) => legacyRoutePattern.test(readFileSync(file, 'utf8')))
      .map((file) => relative(process.cwd(), file));

    expect(offenders).toEqual([]);
  });
});
