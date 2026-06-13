import { describe, expect, it } from 'vitest';
import {
  getOpenApiEndpointUrl,
  getOpenApiLanes,
  getOpenApiOperationIds,
  getOpenApiPrerenderPaths,
  resolveOpenApiEndpointRoute,
} from './lanes';

describe('openapi lanes', () => {
  it('describes each YAML lane as one IA mapping record', () => {
    expect(getOpenApiLanes()).toEqual([
      expect.objectContaining({
        id: 'convoai',
        publicSourceUrl: {
          en: '/openapi/conversational-ai/convoai.en.yaml',
          'zh-CN': '/openapi/conversational-ai/convoai.zh-CN.yaml',
        },
        routePrefix: 'api-reference/conversational-ai/rest-api/agent',
        sourcePath: {
          en: 'content/openapi/conversational-ai/convoai.en.yaml',
          'zh-CN': 'content/openapi/conversational-ai/convoai.zh-CN.yaml',
        },
        tab: 'api-reference',
      }),
      expect.objectContaining({
        id: 'speech-to-text',
        publicSourceUrl: {
          en: '/openapi/speech-to-text/v7.en.yaml',
          'zh-CN': '/openapi/speech-to-text/v7.zh-CN.yaml',
        },
        routePrefix: 'api-reference/speech-to-text/restful',
        sourcePath: {
          en: 'content/openapi/speech-to-text/v7.en.yaml',
          'zh-CN': 'content/openapi/speech-to-text/v7.zh-CN.yaml',
        },
        tab: 'api-reference',
      }),
    ]);
  });

  it('builds endpoint and parent URLs from the lane mapping', () => {
    const [lane] = getOpenApiLanes();

    expect(lane.parentUrl.en).toBe(
      '/en/api-reference/conversational-ai/rest-api/agent',
    );
    expect(getOpenApiEndpointUrl(lane, 'en', 'start-agent')).toBe(
      '/en/api-reference/conversational-ai/rest-api/agent/join',
    );
    expect(getOpenApiEndpointUrl(lane, 'zh-CN', 'start-agent')).toBe(
      '/zh-CN/api-reference/conversational-ai/rest-api/agent/join',
    );
  });

  it('resolves endpoint routes without product-specific loader logic', () => {
    expect(
      resolveOpenApiEndpointRoute('en', 'api-reference', [
        'conversational-ai',
        'rest-api',
        'agent',
        'join',
      ]),
    ).toMatchObject({
      lane: expect.objectContaining({ id: 'convoai' }),
      operationId: 'start-agent',
      routeLeaf: 'join',
      url: '/en/api-reference/conversational-ai/rest-api/agent/join',
    });
    expect(
      resolveOpenApiEndpointRoute('en', 'api-reference', [
        'speech-to-text',
        'restful',
        'join',
      ]),
    ).toMatchObject({
      lane: expect.objectContaining({ id: 'speech-to-text' }),
      operationId: 'join',
      routeLeaf: 'join',
      url: '/en/api-reference/speech-to-text/restful/join',
    });
  });

  it('derives operation order and static paths from lane operations', () => {
    const [lane, sttLane] = getOpenApiLanes();

    expect(getOpenApiOperationIds(lane)).toEqual([
      'start-agent',
      'stop-agent',
      'agent-update',
      'query-agent-status',
      'get-agent-list',
      'agent-speak',
      'agent-interrupt',
      'agent-think',
      'get-history',
      'get-turns',
    ]);
    expect(getOpenApiPrerenderPaths()).toContain(
      '/en/api-reference/conversational-ai/rest-api/agent/join',
    );
    expect(getOpenApiOperationIds(sttLane)).toEqual([
      'join',
      'query',
      'leave',
      'update',
      'list',
    ]);
    expect(getOpenApiPrerenderPaths()).toContain(
      '/en/api-reference/speech-to-text/restful/join',
    );
    expect(getOpenApiPrerenderPaths()).toHaveLength(30);
  });
});
