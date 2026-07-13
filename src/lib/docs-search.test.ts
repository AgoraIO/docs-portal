import { describe, expect, it } from 'vitest';
import { getSearchEntryMetadata, inferSearchPlatforms } from './docs-search';

describe('inferSearchPlatforms', () => {
  it('matches platform names at token boundaries', () => {
    expect(
      inferSearchPlatforms(
        '/en/video/react-native/quickstart Android, iOS, and Web',
      ),
    ).toEqual(['android', 'ios', 'web', 'react-native']);
  });

  it('does not infer platforms from unrelated substrings', () => {
    expect(inferSearchPlatforms('scenarios and webhooks')).toEqual([]);
  });

  it('adds bounded platform metadata to search entries', () => {
    expect(
      getSearchEntryMetadata(
        '/zh-CN/realtime-media/video/ios/quickstart',
        '适用于 iOS 平台。',
      ).platform,
    ).toEqual(['ios']);
  });
});
