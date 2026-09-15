import { describe, expect, it, vi } from 'vitest';
import type { GoldenSearchCase } from './golden-search-queries';
import { replayGoldenSearchCases } from './golden-search-replay';

const cases = [
  {
    expectedIntent: 'task',
    expectedKind: 'guide',
    expectedTitle: 'Quickstart',
    expectedUrl: '/en/quickstart',
    query: 'quickstart',
  },
  {
    expectedIntent: 'unknown',
    expectedKind: 'empty',
    query: 'does-not-exist',
  },
] satisfies GoldenSearchCase[];

const sdkCase = {
  expectedCanonicalKey: 'video-sdk|rtcengine|setaudioprofile|member',
  expectedIntent: 'unknown',
  expectedKind: 'sdk-symbol',
  expectedTitle: 'setAudioProfile',
  expectedUrl:
    'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/setaudioprofile(_:)?language=objc#app-main',
  query: 'setAudioProfile method',
} satisfies GoldenSearchCase;

describe('replayGoldenSearchCases', () => {
  it('evaluates supplied live results against the golden top-three contract', async () => {
    const search = vi.fn(async (query: string) =>
      query === 'quickstart'
        ? [
            {
              recordKind: 'guide',
              title: 'Voice agent Quickstart',
              url: '/en/quickstart',
            },
          ]
        : [],
    );

    const report = await replayGoldenSearchCases(cases, search);

    expect(search).toHaveBeenCalledTimes(2);
    expect(report).toMatchObject({ failed: 0, passed: 2, total: 2 });
    expect(report.cases).toEqual([
      expect.objectContaining({ passed: true, query: 'quickstart' }),
      expect.objectContaining({ passed: true, query: 'does-not-exist' }),
    ]);
  });

  it('reports the observed top three when the live target is missing', async () => {
    const report = await replayGoldenSearchCases(
      cases.slice(0, 1),
      async () => [
        {
          recordKind: 'guide',
          title: 'Unrelated guide',
          url: '/en/unrelated',
        },
      ],
    );

    expect(report).toMatchObject({ failed: 1, passed: 0, total: 1 });
    expect(report.cases[0]).toMatchObject({
      actualUrls: ['/en/unrelated'],
      expectedUrl: '/en/quickstart',
      passed: false,
    });
  });

  it('accepts a Documentation result on the expected page with a different section hash', async () => {
    const docsCase = {
      expectedIntent: 'task',
      expectedKind: 'guide',
      expectedTitle: 'Quickstart',
      expectedUrl: '/en/guide',
      query: 'guide section',
    } satisfies GoldenSearchCase;

    const matchingReport = await replayGoldenSearchCases(
      [docsCase],
      async () => [
        {
          recordKind: 'guide',
          title: 'Quickstart',
          url: '/en/guide#section',
        },
      ],
    );
    const differentPathReport = await replayGoldenSearchCases(
      [docsCase],
      async () => [
        {
          recordKind: 'guide',
          title: 'Quickstart',
          url: '/en/other#section',
        },
      ],
    );

    expect(matchingReport.cases[0]).toMatchObject({
      actualUrls: ['/en/guide#section'],
      passed: true,
    });
    expect(differentPathReport.cases[0]).toMatchObject({ passed: false });
  });

  it('matches a golden title when live highlights split every title term', async () => {
    const markedTitleCase = {
      expectedIntent: 'task',
      expectedKind: 'guide',
      expectedTitle: 'Voice agent quickstart',
      expectedUrl: '/en/quickstart',
      query: 'voice agent quickstart',
    } satisfies GoldenSearchCase;
    const report = await replayGoldenSearchCases(
      [markedTitleCase],
      async () => [
        {
          recordKind: 'guide',
          title:
            '<mark>Voice</mark> <mark>agent</mark> <mark>quickstart</mark>',
          url: markedTitleCase.expectedUrl,
        },
      ],
    );

    expect(report).toMatchObject({ failed: 0, passed: 1, total: 1 });
  });

  it('accepts an aggregated SDK result when a platform URL contains the expected target', async () => {
    const report = await replayGoldenSearchCases([sdkCase], async () => [
      {
        canonicalKey: sdkCase.expectedCanonicalKey,
        platformUrls: {
          blueprint:
            'https://api-ref.agora.io/en/video-sdk/blueprint/4.x/API/class_irtcengine.html#ariaid-title90',
          ios: sdkCase.expectedUrl,
        },
        recordKind: 'sdk-symbol',
        title: 'setAudioProfile',
        url: 'https://api-ref.agora.io/en/video-sdk/blueprint/4.x/API/class_irtcengine.html#ariaid-title90',
      },
    ]);

    expect(report).toMatchObject({ failed: 0, passed: 1, total: 1 });
    expect(report.cases[0]).toMatchObject({
      expectedUrl: sdkCase.expectedUrl,
      passed: true,
      query: sdkCase.query,
    });
  });

  it('rejects an aggregated SDK result when neither representative nor platform URLs contain the expected target', async () => {
    const report = await replayGoldenSearchCases([sdkCase], async () => [
      {
        canonicalKey: sdkCase.expectedCanonicalKey,
        platformUrls: {
          android:
            'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#ariaid-title90',
        },
        recordKind: 'sdk-symbol',
        title: 'setAudioProfile',
        url: 'https://api-ref.agora.io/en/video-sdk/blueprint/4.x/API/class_irtcengine.html#ariaid-title90',
      },
    ]);

    expect(report).toMatchObject({ failed: 1, passed: 0, total: 1 });
    expect(report.cases[0]).toMatchObject({
      expectedUrl: sdkCase.expectedUrl,
      passed: false,
      query: sdkCase.query,
    });
  });

  it('requires an exact query and hash match for absolute SDK URLs', async () => {
    const differentHashReport = await replayGoldenSearchCases(
      [sdkCase],
      async () => [
        {
          canonicalKey: sdkCase.expectedCanonicalKey,
          recordKind: 'sdk-symbol',
          title: 'setAudioProfile',
          url: sdkCase.expectedUrl.replace('#app-main', '#different-anchor'),
        },
      ],
    );
    const differentQueryReport = await replayGoldenSearchCases(
      [sdkCase],
      async () => [
        {
          canonicalKey: sdkCase.expectedCanonicalKey,
          recordKind: 'sdk-symbol',
          title: 'setAudioProfile',
          url: sdkCase.expectedUrl.replace('?language=objc', '?language=swift'),
        },
      ],
    );

    expect(differentHashReport).toMatchObject({
      failed: 1,
      passed: 0,
      total: 1,
    });
    expect(differentQueryReport).toMatchObject({
      failed: 1,
      passed: 0,
      total: 1,
    });
  });

  it('observes every case while preview blockers alone determine the gate', async () => {
    const previewCases = [
      {
        expectedIntent: 'task',
        expectedKind: 'guide',
        expectedTitle: 'Blocking guide',
        expectedUrl: '/en/blocking',
        previewBlocking: true,
        query: 'blocking query',
      },
      {
        expectedIntent: 'task',
        expectedKind: 'guide',
        expectedTitle: 'Monitoring guide',
        expectedUrl: '/en/monitoring',
        query: 'monitoring query',
      },
    ] satisfies GoldenSearchCase[];

    const report = await replayGoldenSearchCases(
      previewCases,
      async (query) => [
        {
          recordKind: 'guide',
          title: query === 'blocking query' ? 'Blocking guide' : 'Wrong guide',
          url: query === 'blocking query' ? '/en/blocking' : '/en/wrong',
        },
      ],
      { gateMode: 'preview-blockers' },
    );

    expect(report).toMatchObject({
      failed: 1,
      gate: {
        failed: 0,
        mode: 'preview-blockers',
        passed: 1,
        total: 1,
      },
      passed: 1,
      total: 2,
    });
    expect(report.cases).toEqual([
      expect.objectContaining({ passed: true, previewBlocking: true }),
      expect.objectContaining({ passed: false, previewBlocking: false }),
    ]);
  });

  it('uses all observed cases as the default gate', async () => {
    const report = await replayGoldenSearchCases(cases, async () => []);

    expect(report.gate).toEqual({
      failed: 1,
      mode: 'all',
      passed: 1,
      total: 2,
    });
  });
});
