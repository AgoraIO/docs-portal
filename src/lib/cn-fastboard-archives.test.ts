import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = 'content/docs/zh-CN/api-reference/whiteboard/fastboard';

describe('Fastboard historical references', () => {
  it.each([
    ['android', '1.6.0', 'Fastboard SDK 不支持直接初始化', '公开的'],
    [
      'ios',
      '1.4.0',
      'public class func createFastRoom(withFastRoomConfig config: FastRoomConfiguration)',
      '-> FastRoom',
    ],
    [
      'web',
      '0.3.10',
      'createFastboard(options: FastboardOptions): Promise;',
      'Promise<FastboardApp<TEventData>>',
    ],
  ])(
    'keeps %s/%s separate from current API contracts',
    (platform, version, oldSignature, currentSignature) => {
      const meta = JSON.parse(
        readFileSync(`${root}/${platform}/meta.json`, 'utf8'),
      );
      const entry = meta.navScope.versions.find(
        (item: { id: string }) => item.id === version,
      );
      expect(entry.href).toBe(
        `/zh-CN/api-reference/whiteboard/fastboard/${platform}/${version}`,
      );
      expect(entry.sidebar[0].url).toBe(entry.href);
      expect(meta.pages).toContain(version);
      const archived = readFileSync(
        `${root}/${platform}/${version}/index.mdx`,
        'utf8',
      );
      const current = readFileSync(`${root}/${platform}/index.mdx`, 'utf8');
      expect(archived).toContain(oldSignature);
      expect(archived).not.toContain(currentSignature);
      expect(current).toContain(currentSignature);
      expect(archived).toContain('发布快照 0.0.323');
      expect(archived).not.toContain('](/doc/');
    },
  );

  it.each(['android', 'ios', 'web'])(
    'uses the original product path for the oldest %s archive',
    (platform) => {
      const meta = JSON.parse(
        readFileSync(`${root}/${platform}/meta.json`, 'utf8'),
      );
      const oldest = meta.navScope.versions.at(-1);
      expect(oldest.href).toContain('/archive/0.0.67/api-ref/whiteboard/');
      expect(oldest.href).not.toContain('/api-ref/fastboard/');
    },
  );
});
