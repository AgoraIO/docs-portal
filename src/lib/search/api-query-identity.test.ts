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
    'RtcEngine.joinChannel',
    'RtcEngine::joinChannel',
    'RtcEngine->joinChannel',
  ])('extracts %s from natural-language context', (target) => {
    expect(parseApiQueryIdentity(`use ${target} method`)).toMatchObject({
      target,
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
