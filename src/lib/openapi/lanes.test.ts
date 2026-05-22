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
        publicSourceUrl: '/openapi/conversational-ai/convoai.yaml',
        routePrefix: 'api-reference/conversational-ai/rest-api/agent',
        sourcePath: 'content/openapi/conversational-ai/convoai.yaml',
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
      '/en/api-reference/conversational-ai/rest-api/agent/join',
    );
    expect(getOpenApiPrerenderPaths()).toHaveLength(20);
  });
});
