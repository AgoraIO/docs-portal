import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const targets = [
  ...['electron', 'flutter', 'react-native', 'unity'].map((platform) => ({
    platform,
    methodId: 'api_irtcengine_sendmetadata',
    limitId: 'api_irtcengine_setmaxmetadatasize',
    limitName:
      platform === 'unity' ? 'SetMaxMetadataSize' : 'setMaxMetadataSize',
    severity: 'note',
  })),
  {
    platform: 'unity',
    methodId: 'callback_imetadataobserver_onreadytosendmetadata',
    limitId: 'api_irtcengine_setmaxmetadatasize',
    limitName: 'SetMaxMetadataSize',
    severity: 'note',
  },
  {
    platform: 'unreal-cpp',
    methodId: 'callback_imetadataobserver_onreadytosendmetadata',
    limitId: 'callback_imetadataobserver_getmaxmetadatasize',
    limitName: 'getMaxMetadataSize',
    severity: 'caution',
  },
  ...['android', 'cpp-all-platforms'].map((platform) => ({
    platform,
    methodId: 'callback_imetadataobserver_onreadytosendmetadata',
    limitId: 'api_imetadataobserver_getmaxmetadatasize',
    limitName: 'getMaxMetadataSize',
    severity: 'note',
  })),
  ...['ios', 'macos'].map((platform) => ({
    platform,
    methodId: 'api_agoramediametadatadatasource_readytosendmetadataattimestamp',
    limitId: 'api_agoramediametadatadatasource_metadatamaxsize',
    limitName: 'metadataMaxSize',
    severity: 'note',
  })),
];

function readMetadataPage(platform: string) {
  return readFileSync(
    resolve(
      process.cwd(),
      `content/docs/zh-CN/api-reference/rtc/${platform}/(current)/metadata/metadata-observer.mdx`,
    ),
    'utf8',
  );
}

function detailedDescription(content: string, methodId: string) {
  const marker = `<a id="${methodId}__detailed_desc"></a>`;
  const markerStart = content.indexOf(marker);
  expect(markerStart, `${methodId} detail anchor`).toBeGreaterThanOrEqual(0);
  const start = markerStart + marker.length;
  const end = content.indexOf('<a id="', start);
  expect(end, `${methodId} next section anchor`).toBeGreaterThan(start);
  return content.slice(start, end);
}

describe('RTC source PR 2077 metadata truncation guidance', () => {
  it.each(targets)(
    'keeps the scoped $severity for $platform at $methodId',
    ({ platform, methodId, limitId, limitName, severity }) => {
      const content = readMetadataPage(platform);
      const detail = detailedDescription(content, methodId);
      const callout = detail.match(/^:::(note|caution)\n([\s\S]*?)\n:::$/m);

      expect(callout, `${platform}.${methodId} callout`).not.toBeNull();
      expect(callout?.[1]).toBe(severity);
      expect(callout?.[2]).toContain('如果超过该值，SDK 会截除超出部分。');
      expect(callout?.[2]).toContain(
        `[${limitName}](/zh-CN/api-reference/rtc/${platform}/metadata/metadata-observer#${limitId})`,
      );
      expect(content).toContain(`<a id="${limitId}"></a>`);
    },
  );
});
