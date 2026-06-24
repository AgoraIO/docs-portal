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
          en: '/openapi/conversational-ai/rest-api.en.yaml',
          'zh-CN': '/openapi/conversational-ai/rest-api.en.yaml',
        },
        routePrefix: 'api-reference/api-ref/conversational-ai',
        sourcePath: {
          en: 'content/openapi/conversational-ai/rest-api.en.yaml',
          'zh-CN': 'content/openapi/conversational-ai/rest-api.en.yaml',
        },
        tab: 'api-reference',
      }),
      expect.objectContaining({
        id: 'signaling-rest',
        routePrefix: 'api-reference/api-ref/signaling',
        tab: 'api-reference',
      }),
      expect.objectContaining({
        id: 'cloud-recording-rest',
        routePrefix: 'api-reference/api-ref/cloud-recording',
        tab: 'api-reference',
      }),
      expect.objectContaining({
        id: 'speech-to-text-rest',
        routePrefix: 'api-reference/api-ref/speech-to-text',
        tab: 'api-reference',
      }),
    ]);
  });

  it('builds endpoint and parent URLs from the lane mapping', () => {
    const [lane] = getOpenApiLanes();

    expect(lane.parentUrl.en).toBe(
      '/en/api-reference/api-ref/conversational-ai',
    );
    expect(getOpenApiEndpointUrl(lane, 'en', 'start-agent')).toBe(
      '/en/api-reference/api-ref/conversational-ai/join',
    );
    expect(getOpenApiEndpointUrl(lane, 'zh-CN', 'start-agent')).toBe(
      '/zh-CN/api-reference/api-ref/conversational-ai/join',
    );
  });

  it('resolves endpoint routes without product-specific loader logic', () => {
    expect(
      resolveOpenApiEndpointRoute('en', 'api-reference', [
        'api-ref',
        'conversational-ai',
        'join',
      ]),
    ).toMatchObject({
      lane: expect.objectContaining({ id: 'convoai' }),
      operationId: 'start-agent',
      routeLeaf: 'join',
      url: '/en/api-reference/api-ref/conversational-ai/join',
    });
  });

  it('derives operation order and static paths from lane operations', () => {
    const [lane] = getOpenApiLanes();

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
      '/en/api-reference/api-ref/conversational-ai/join',
    );
    expect(getOpenApiPrerenderPaths()).toContain(
      '/en/api-reference/api-ref/signaling/peer-to-peer-message',
    );
    expect(getOpenApiPrerenderPaths()).toContain(
      '/en/api-reference/api-ref/cloud-recording/acquire',
    );
    expect(getOpenApiPrerenderPaths()).toContain(
      '/en/api-reference/api-ref/speech-to-text/join',
    );
    expect(getOpenApiPrerenderPaths()).toHaveLength(54);
  });

  it('resolves signaling REST endpoint routes in the api-reference tab', () => {
    expect(
      resolveOpenApiEndpointRoute('en', 'api-reference', [
        'api-ref',
        'signaling',
        'peer-to-peer-message',
      ]),
    ).toMatchObject({
      lane: expect.objectContaining({ id: 'signaling-rest' }),
      operationId: 'send-peer-message',
      routeLeaf: 'peer-to-peer-message',
      url: '/en/api-reference/api-ref/signaling/peer-to-peer-message',
    });
  });

  it('resolves Cloud Recording REST endpoint routes in the api-reference tab', () => {
    expect(
      resolveOpenApiEndpointRoute('en', 'api-reference', [
        'api-ref',
        'cloud-recording',
        'acquire',
      ]),
    ).toMatchObject({
      lane: expect.objectContaining({ id: 'cloud-recording-rest' }),
      operationId: 'acquire-cloud-recording-resource',
      routeLeaf: 'acquire',
      url: '/en/api-reference/api-ref/cloud-recording/acquire',
    });
  });
});
