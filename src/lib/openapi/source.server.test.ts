import { describe, expect, it } from 'vitest';
import { CONVERSATIONAL_AI_OPERATION_ROUTES } from './conversational-ai';
import {
  getConversationalAiOperation,
  getConversationalAiOperations,
} from './source.server';

describe('openapi source loader', () => {
  it('loads conversational ai operations by operationId', async () => {
    const operations = await getConversationalAiOperations();

    expect(operations.map((operation) => operation.operationId)).toContain(
      'start-agent',
    );
    expect(operations).toHaveLength(10);
  });

  it('normalizes method, path, and request body', async () => {
    const operation = await getConversationalAiOperation('start-agent');

    expect(operation.method).toBe('POST');
    expect(operation.path).toBe('/v2/projects/{appid}/join');
    expect(operation.requestBody?.contentTypes).toContain('application/json');
  });

  it('keeps registry operation IDs in sync with YAML', async () => {
    const operations = await getConversationalAiOperations();
    const fromYaml = operations
      .map((operation) => operation.operationId)
      .sort();
    const fromRegistry = Object.keys(CONVERSATIONAL_AI_OPERATION_ROUTES).sort();

    expect(fromRegistry).toEqual(fromYaml);
  });
});
