import { describe, expect, it } from 'vitest';
import {
  CONVERSATIONAL_AI_OPERATION_ROUTES,
  getConversationalAiEndpointUrl,
  getConversationalAiPrerenderPaths,
} from './conversational-ai';

describe('conversational ai endpoint registry', () => {
  it('maps operation IDs to route leaves once', () => {
    expect(CONVERSATIONAL_AI_OPERATION_ROUTES).toEqual({
      'start-agent': 'join',
      'stop-agent': 'leave',
      'agent-update': 'update',
      'query-agent-status': 'query',
      'get-agent-list': 'list',
      'agent-speak': 'speak',
      'agent-interrupt': 'interrupt',
      'agent-think': 'think',
      'get-history': 'history',
      'get-turns': 'turns',
    });
  });

  it('builds canonical endpoint URLs', () => {
    expect(getConversationalAiEndpointUrl('en', 'start-agent')).toBe(
      '/en/api-reference/conversational-ai/rest-api/agent/join',
    );
    expect(getConversationalAiEndpointUrl('zh-CN', 'start-agent')).toBe(
      '/zh-CN/api-reference/conversational-ai/rest-api/agent/join',
    );
  });

  it('derives prerender paths from the registry', () => {
    expect(getConversationalAiPrerenderPaths()).toContain(
      '/en/api-reference/conversational-ai/rest-api/agent/join',
    );
    expect(getConversationalAiPrerenderPaths()).toHaveLength(20);
  });
});
