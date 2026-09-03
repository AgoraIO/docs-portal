import { describe, expect, it } from 'vitest';
import {
  canonicalizeApiSymbol,
  getApiIdentityMatch,
  getApiRetrievalQuery,
  parseApiQueryIdentity,
} from './api-query-identity';

describe('API query identity', () => {
  it.each([
    ['setAudioProfile method', 'setAudioProfile', 'setaudioprofile'],
    ['renewToken api', 'renewToken', 'renewtoken'],
    ['joinChannel method', 'joinChannel', 'joinchannel'],
    ['RtcEngine class', 'RtcEngine', 'rtcengine'],
  ])('parses %s into its API target', (query, target, canonicalTarget) => {
    expect(parseApiQueryIdentity(query)).toMatchObject({
      target,
      canonicalTarget,
    });
  });

  it('extracts the API-style identifier from natural-language context', () => {
    expect(parseApiQueryIdentity('how to use RtcEngine class')).toEqual({
      target: 'RtcEngine',
      canonicalTarget: 'rtcengine',
      retrievalQuery: 'AgoraRtcEngineKit',
    });
  });

  it.each([
    'Bluetooth iOS API',
    'IoT SDK API',
    'how to use iOS API',
    'how to use IoT SDK API',
    'configure IoT SDK API',
    'how to use ReactNative API',
    'iOS',
    'iOS.Client',
    'IoT',
    'IoT.Client',
    'ReactNative',
    'ReactNative.Client',
    'ReactJS',
    'ReactJS.Client',
    'React-JS',
    'React-JS.Client',
    'VideoSdk',
    'VoiceSdk',
  ])(
    'does not treat product or platform query %s as API identity context',
    (query) => {
      expect(parseApiQueryIdentity(query)).toBeUndefined();
      expect(getApiRetrievalQuery(query)).toBe(query);
    },
  );

  it.each([
    'RtcEngine.joinChannel',
    'RtcEngine::joinChannel',
    'RtcEngine->joinChannel',
  ])('extracts %s from natural-language context', (target) => {
    expect(parseApiQueryIdentity(`use ${target} method`)).toMatchObject({
      target,
    });
  });

  it.each(['RtcEngine', 'RtcEngine.joinChannel'])(
    'keeps valid root-client identity %s',
    (target) => {
      expect(parseApiQueryIdentity(target)).toMatchObject({ target });
    },
  );

  it.each([
    ['Agora.Rtc.RtcEngine', 'Agora.Rtc.RtcEngine'],
    ['show Agora.Rtc.RtcEngine method', 'Agora.Rtc.RtcEngine'],
    ['Agora.Rtc.RtcEngineEventHandler', 'Agora.Rtc.RtcEngineEventHandler'],
  ])('keeps qualified Agora identity for %s', (query, target) => {
    const identity = parseApiQueryIdentity(query);

    expect(identity).toMatchObject({
      canonicalTarget: target.toLowerCase().replaceAll('.', ''),
      retrievalQuery: target,
      target,
    });
    expect(getApiIdentityMatch([target], identity)).toEqual({
      aliasesExactMatch: false,
      titleExactMatch: true,
    });
  });

  it('does not parse natural-language method queries as API symbols', () => {
    expect(parseApiQueryIdentity('audio method')).toBeUndefined();
  });

  it.each(['RtcEngine', 'AgoraRtcEngineKit', 'IRtcEngine', 'IAgoraRtcClient'])(
    'canonicalizes %s as the root client',
    (symbol) => {
      expect(canonicalizeApiSymbol(symbol)).toBe('rtcengine');
    },
  );

  it.each([
    'RtcEngine.joinChannel',
    'IRtcEngine::joinChannel',
    'AgoraRtcEngineKit->joinChannel',
  ])('canonicalizes qualified root-client alias %s', (symbol) => {
    expect(canonicalizeApiSymbol(symbol)).toBe('rtcenginejoinchannel');
  });

  it.each([
    ['Foo.Bar', 'foobar'],
    ['FooBar', 'foobar'],
  ])('keeps canonical key compatibility for %s', (symbol, canonical) => {
    expect(canonicalizeApiSymbol(symbol)).toBe(canonical);
  });

  it.each([
    ['RtcEngine', 'AgoraRtcEngineKit'],
    ['RtcEngine class', 'AgoraRtcEngineKit'],
    ['joinChannel', 'joinChannel'],
    ['setAudioProfile()', 'setAudioProfile'],
    ['RTC engine', 'RTC engine'],
  ])('rewrites the exact API retrieval query %s to %s', (query, expected) => {
    expect(getApiRetrievalQuery(query)).toBe(expected);
  });

  it('distinguishes direct and alias exact API matches', () => {
    const setAudioProfile = parseApiQueryIdentity('setAudioProfile');
    const rtcEngine = parseApiQueryIdentity('RtcEngine');

    expect(getApiIdentityMatch(['setAudioProfile'], setAudioProfile)).toEqual({
      titleExactMatch: true,
      aliasesExactMatch: false,
    });
    expect(getApiIdentityMatch(['AgoraRtcEngineKit'], rtcEngine)).toEqual({
      titleExactMatch: false,
      aliasesExactMatch: true,
    });
    expect(getApiIdentityMatch([], undefined)).toEqual({
      titleExactMatch: false,
      aliasesExactMatch: false,
    });
  });
});
