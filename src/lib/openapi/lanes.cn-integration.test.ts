import { describe, expect, it } from 'vitest';
import {
  findOpenApiLaneByUrl,
  getOpenApiEndpointUrl,
  getOpenApiLaneLocales,
  getOpenApiLanes,
  getOpenApiOperationIds,
  getOpenApiPrerenderPaths,
  getOpenApiReferenceBackLink,
  resolveOpenApiEndpointRoute,
  resolveOpenApiLaneRootRedirect,
  resolveOpenApiLaneRoute,
} from './lanes';

describe('openapi lanes', () => {
  it('returns every OpenAPI locale to its reference center', () => {
    expect(getOpenApiReferenceBackLink('en')).toEqual({
      href: '/en/api-reference',
      label: 'API Reference',
    });
    expect(getOpenApiReferenceBackLink('zh-CN')).toEqual({
      href: '/zh-CN/api-reference/api',
      label: 'API 参考',
    });

    for (const lane of getOpenApiLanes()) {
      for (const locale of getOpenApiLaneLocales(lane)) {
        expect(
          findOpenApiLaneByUrl(locale, lane.tab, lane.parentUrl[locale])?.id,
        ).toBe(lane.id);
        expect(
          findOpenApiLaneByUrl(
            locale,
            lane.tab,
            getOpenApiEndpointUrl(
              lane,
              locale,
              getOpenApiOperationIds(lane)[0],
            ),
          )?.id,
        ).toBe(lane.id);
      }
    }
  });

  it('redirects an OpenAPI product root to its first endpoint', () => {
    expect(
      resolveOpenApiLaneRootRedirect('zh-CN', 'api-reference', [
        'api-ref',
        'conversational-ai',
      ]),
    ).toBe('/zh-CN/api-reference/api-ref/conversational-ai/join');
    expect(
      resolveOpenApiLaneRootRedirect('zh-CN', 'api-reference', [
        'api-ref',
        'conversational-ai',
        'join',
      ]),
    ).toBeNull();
  });
});
