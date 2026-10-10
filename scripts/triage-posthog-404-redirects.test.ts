import { describe, expect, it } from 'vitest';
import {
  classifyPostHog404Path,
  normalizePathForComparison,
  triagePostHog404Paths,
} from './triage-posthog-404-redirects.mjs';

const inventory = [
  { routePath: '/en/api-reference' },
  { routePath: '/en/api-reference/faq/integration/audio_format' },
  { routePath: '/en/realtime-media/video/reference/migration-guide' },
  { routePath: '/en/realtime-media/rtc/reference/migration-guide' },
  { routePath: '/en/realtime-media/whiteboard/reference/room-management' },
];

describe('triage-posthog-404-redirects', () => {
  it('normalizes encoded paths and slug separators for comparison only', () => {
    expect(normalizePathForComparison('/en/Interactive%20Broadcast/')).toBe(
      '/en/interactive broadcast',
    );
    expect(normalizePathForComparison('/en/api_reference')).toBe(
      '/en/api-reference',
    );
  });

  it('classifies an exact inventory alias as an approved candidate', () => {
    expect(
      classifyPostHog404Path({
        pathname: '/en/api_reference',
        events: 15,
        status: 404,
        inventory,
        existingRules: [],
      }),
    ).toMatchObject({
      classification: 'inventory-exact',
      candidateTarget: '/en/api-reference',
    });
  });

  it('accepts a unique leaf only when the product family is compatible', () => {
    expect(
      classifyPostHog404Path({
        pathname: '/en/video-calling/reference/migration-guide',
        events: 1,
        status: 404,
        inventory,
        existingRules: [],
      }),
    ).toMatchObject({
      classification: 'inventory-unique-leaf',
      candidateTarget: '/en/realtime-media/video/reference/migration-guide',
    });
  });

  it('leaves ambiguous or incompatible candidates unresolved', () => {
    expect(
      classifyPostHog404Path({
        pathname: '/en/voice-calling/reference/migration-guide',
        events: 1,
        status: 404,
        inventory,
        existingRules: [],
      }),
    ).toMatchObject({
      classification: 'unresolved',
      candidateTarget: null,
    });
  });

  it('does not collapse broadcast products into the Video family', () => {
    expect(
      classifyPostHog404Path({
        pathname: '/en/broadcast-streaming/get-started/authentication-workflow',
        events: 1,
        status: 404,
        inventory: [
          {
            routePath:
              '/en/realtime-media/video/build/authenticate-users/authentication-workflow',
          },
          {
            routePath:
              '/en/realtime-media/broadcast-streaming/build/authenticate-users/authentication-workflow',
          },
        ],
        existingRules: [],
      }),
    ).toMatchObject({
      classification: 'inventory-unique-leaf',
      candidateTarget:
        '/en/realtime-media/broadcast-streaming/build/authenticate-users/authentication-workflow',
    });
  });

  it('marks a path already covered by an existing rule', () => {
    expect(
      classifyPostHog404Path({
        pathname: '/en/legacy/path',
        events: 2,
        status: 404,
        inventory,
        existingRules: [
          {
            legacyPath: '/en/legacy/path',
            target: '/en/api-reference',
          },
        ],
      }),
    ).toMatchObject({
      classification: 'already-covered',
      candidateTarget: '/en/api-reference',
    });
  });

  it('triages every observed 404 row exactly once', () => {
    expect(
      triagePostHog404Paths({
        rows: [
          { pathname: '/en/api_reference', events: 15, status: 404 },
          { pathname: '/en/unknown/path', events: 1, status: 404 },
        ],
        inventory,
        existingRules: [],
      }),
    ).toEqual([
      expect.objectContaining({ pathname: '/en/api_reference' }),
      expect.objectContaining({ pathname: '/en/unknown/path' }),
    ]);
  });
});
