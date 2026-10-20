import { describe, expect, it } from 'vitest';
import { getRtcDownloadCardEntries } from './rtc-download-card-entries';

describe('RTC download Native version suffix', () => {
  it.each([
    [undefined, undefined],
    ['4.6.4', '对应 Native v4.6.4'],
  ])(
    'handles nativeVersion=%s without changing the package',
    (nativeVersion, suffix) => {
      const version = {
        id: '6.6.4-video-sdk-flutter',
        label: '版本 6.6.4（最新）',
        nativeVersion,
      };
      const entries = getRtcDownloadCardEntries('flutter', 'Flutter', 'video', {
        id: 'video-sdk-flutter',
        label: '视频 SDK',
        info: '',
        versions: [version],
      });
      expect(entries).toHaveLength(1);
      expect(entries[0].version).toBe(version);
      expect(entries[0].versionSuffix).toBe(suffix);
    },
  );

  it('keeps the UnionTech suffix ahead of Native correspondence', () => {
    const version = {
      id: '4.5.40-electron-uniontech',
      label: '版本 4.5.40',
      nativeVersion: '4.6.4',
    };
    const entries = getRtcDownloadCardEntries('electron', 'Electron', 'video', {
      id: 'video-sdk-electron',
      label: '视频 SDK',
      info: '',
      versions: [version],
    });
    expect(entries[0].title).toBe('Electron for 统信 OS');
    expect(entries[0].versionSuffix).toBe('统信 OS 专版');
  });
});
