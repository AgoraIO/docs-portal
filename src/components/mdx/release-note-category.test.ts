import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getReleaseNoteCategoryIcon } from './release-note-category';

const releasePages = readdirSync('content/docs', { recursive: true })
  .map(String)
  .filter((path) => /(?:^|\/)release(?:-notes[^/]*)?\.mdx?$/.test(path));

describe('release note category coverage', () => {
  it.each(releasePages)('supports categories on %s', (path) => {
    for (const label of [
      '新增特性',
      '升级必看',
      '改进',
      '问题修复',
      '已知问题和局限性',
      'New features',
      'Improvements',
      'Fixed issues',
      'Known issues and limitations',
    ]) {
      const icon = getReleaseNoteCategoryIcon(path, label);
      expect(icon).toBeDefined();
      expect(existsSync(join('public', icon ?? 'missing-release-icon'))).toBe(
        true,
      );
    }
  });

  it('recognizes category variants without decorating arbitrary headings', () => {
    const path = 'zh-CN/realtime-media/rtm/reference/release-notes.mdx';
    expect(getReleaseNoteCategoryIcon(path, '新特性')).toBe(
      getReleaseNoteCategoryIcon(path, '新增特性'),
    );
    expect(getReleaseNoteCategoryIcon(path, '功能优化')).toBe(
      getReleaseNoteCategoryIcon(path, '改进'),
    );
    expect(getReleaseNoteCategoryIcon(path, '新增域名白名单')).toBeUndefined();
    expect(getReleaseNoteCategoryIcon(undefined, '新增特性')).toBeUndefined();
    expect(
      getReleaseNoteCategoryIcon('zh-CN/guide.mdx', '新增特性'),
    ).toBeUndefined();
  });
});
