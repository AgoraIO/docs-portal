import { describe, expect, it } from 'vitest';
import * as searchIntent from './search-intent';
import { classifySearchIntent } from './search-intent';

describe('classifySearchIntent', () => {
  it.each([
    ['joinChannel', 'api-symbol'],
    ['NetworkQuality', 'api-symbol'],
    ['setAudioProfile()', 'api-symbol'],
    ['acquire resource ID', 'api-task'],
    ['query recording status', 'api-task'],
    ['cloud recording REST API', 'api-task'],
    ['start cloud recording task', 'api-task'],
    ['send streaming message', 'api-task'],
    ['send streaming message error', 'support'],
    ['start cloud recording task failed', 'support'],
    ['cloud recording REST API not working', 'support'],
    ['voice agent quickstart', 'task'],
    ['screen sharing', 'task'],
    ['connect your own TTS service', 'task'],
    ['join multiple channels', 'task'],
    ['black screen', 'support'],
    ['error code 110', 'support'],
    ['billing policy', 'support'],
    ['firewall requirements', 'support'],
    ['cloud recording', 'product'],
    ['Agora CLI', 'product'],
    ['voice activity detection', 'product'],
    ['interactive live streaming', 'product'],
    ['foo bar baz', 'unknown'],
    ['ERROR', 'support'],
    ['URL', 'unknown'],
    ['AI', 'unknown'],
    ['cloud recording?', 'product'],
    ['cloud-recording', 'product'],
    ['acquire resource ID?', 'api-task'],
    ['https://api.example.com', 'unknown'],
    ['1.0', 'unknown'],
    ['v1.0', 'unknown'],
    ['problem()', 'unknown'],
    ['error()', 'unknown'],
    ['foo:bar', 'unknown'],
    ['what.is', 'unknown'],
  ])('%s is classified as %s', (query, intent) => {
    expect(classifySearchIntent(query).intent).toBe(intent);
  });

  it('normalizes whitespace and Unicode for comparisons while preserving the query', () => {
    const result = classifySearchIntent('  Ｃｌｏｕｄ   Ｒｅｃｏｒｄｉｎｇ  ');

    expect(result.originalQuery).toBe('  Ｃｌｏｕｄ   Ｒｅｃｏｒｄｉｎｇ  ');
    expect(result.normalizedQuery).toBe('cloud recording');
    expect(result.terms).toEqual(['cloud', 'recording']);
  });

  it('keeps combining marks in normalized terms', () => {
    const result = classifySearchIntent('x\u0301 setup');

    expect(result.terms).toEqual(['x\u0301', 'setup']);
    expect(result.majorTerms).toContain('x\u0301');
  });

  it('splits camelCase and PascalCase symbols into major comparison terms', () => {
    expect(classifySearchIntent('NetworkQuality').majorTerms).toEqual([
      'network',
      'quality',
    ]);
    expect(classifySearchIntent('setAudioProfile()').majorTerms).toEqual([
      'set',
      'audio',
      'profile',
    ]);
  });

  it('exposes normalized terms that can match a camelCase symbol', () => {
    const result = classifySearchIntent('renew token');

    expect(result.intent).toBe('api-task');
    expect(result.terms).toEqual(['renew', 'token']);
    expect(result.majorTerms).toContain('renewtoken');
  });

  it.each([
    ['help me find docs for renew token', 'renew token'],
    ['where is the cloud recording REST API', 'cloud recording rest api'],
    ['how should I renew token', 'renew token'],
  ])(
    'records the API task phrase matched inside %s',
    (query, matchedPhrase) => {
      expect(classifySearchIntent(query)).toMatchObject({
        intent: 'api-task',
        matchedPhrase,
      });
    },
  );

  it('does not classify every two-word query as an API task', () => {
    expect(classifySearchIntent('getting started').intent).toBe('task');
    expect(classifySearchIntent('random words').intent).toBe('unknown');
  });

  it('guards empty and whitespace-only queries as unknown', () => {
    expect(classifySearchIntent('').intent).toBe('unknown');
    expect(classifySearchIntent('   ').intent).toBe('unknown');
  });

  it.each([
    ['billing policy', 'billing policies'],
    ['real-time transcription', 'speech to text'],
    ['real time transcription', 'speech to text'],
    ['billing policies', 'billing policies'],
    ['voice agent quickstart', 'voice agent quickstart'],
  ])('rewrites the exact docs retrieval query %s to %s', (query, expected) => {
    const getDocsRetrievalQuery = (
      searchIntent as typeof searchIntent & {
        getDocsRetrievalQuery?: (value: string) => string;
      }
    ).getDocsRetrievalQuery;

    expect(getDocsRetrievalQuery).toBeTypeOf('function');
    expect(getDocsRetrievalQuery?.(query)).toBe(expected);
  });

  it.each([
    ['RtcEngine', 'AgoraRtcEngineKit'],
    ['joinChannel', 'joinChannel'],
    ['RTC engine', 'RTC engine'],
  ])('rewrites the exact API retrieval query %s to %s', (query, expected) => {
    const getApiRetrievalQuery = (
      searchIntent as typeof searchIntent & {
        getApiRetrievalQuery?: (value: string) => string;
      }
    ).getApiRetrievalQuery;

    expect(getApiRetrievalQuery).toBeTypeOf('function');
    expect(getApiRetrievalQuery?.(query)).toBe(expected);
  });

  it('keeps intent classification based on the original query', () => {
    expect(classifySearchIntent('billing policy')).toMatchObject({
      intent: 'support',
      originalQuery: 'billing policy',
      normalizedQuery: 'billing policy',
    });
    expect(classifySearchIntent('real-time transcription')).toMatchObject({
      intent: 'product',
      originalQuery: 'real-time transcription',
      normalizedQuery: 'real-time transcription',
    });
    expect(classifySearchIntent('RtcEngine')).toMatchObject({
      intent: 'api-symbol',
      originalQuery: 'RtcEngine',
      normalizedQuery: 'rtcengine',
    });
  });
});
