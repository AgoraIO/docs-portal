import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const targetPath =
  'content/docs/en/realtime-media/voice/build/control-audio-and-devices/set-audio-route.mdx';

function readContent() {
  return readFileSync(resolve(process.cwd(), targetPath), 'utf8');
}

function sectionBetween(source: string, start: string, end: string) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);

  expect(startIndex).toBeGreaterThanOrEqual(0);
  expect(endIndex).toBeGreaterThan(startIndex);

  return source.slice(startIndex, endIndex);
}

describe('voice set-audio-route regressions', () => {
  it('keeps platform API names expanded instead of migration placeholders', () => {
    const content = readContent();
    const iosSection = sectionBetween(
      content,
      '<PlatformStructured platform="ios">',
      '<PlatformStructured platform="web">',
    );
    const reactNativeSection = sectionBetween(
      content,
      '<PlatformStructured platform="react-native">',
      '<PlatformStructured platform="unity">',
    );
    const unitySection = sectionBetween(
      content,
      '<PlatformStructured platform="unity">',
      '</PlatformStructured>',
    );

    expect(content).not.toContain('{props.setAudioRouteAPI}');
    expect(content).not.toContain('{props.setEnableSpeakerphoneAPI}');
    expect(content).not.toContain('{props.onAudioRouteChangedAPI}');
    expect(content).not.toContain('{props.audioScenario}');

    expect(iosSection).toContain('setDefaultAudioRouteToSpeakerphone');
    expect(iosSection).toContain('setEnableSpeakerphone');
    expect(iosSection).toContain('didAudioRouteChanged');
    expect(iosSection).toContain('AgoraAudioScenarioGameStreaming');

    expect(reactNativeSection).toContain('setDefaultAudioRouteToSpeakerphone');
    expect(reactNativeSection).toContain('setEnableSpeakerphone');
    expect(reactNativeSection).toContain('onAudioRoutingChanged');
    expect(reactNativeSection).toContain('AudioScenarioGameStreaming');

    expect(unitySection).toContain('SetDefaultAudioRouteToSpeakerphone');
    expect(unitySection).toContain('SetEnableSpeakerphone');
    expect(unitySection).toContain('OnAudioRoutingChanged');
    expect(unitySection).toContain('AUDIO_SCENARIO_GAME_STREAMING');
  });
});
