import { describe, expect, it } from 'vitest';
import { getOpenApiOperationIds, OPENAPI_LANES } from './lanes';
import { getOpenApiOperation, getOpenApiOperations } from './source.server';

describe('openapi source loader', () => {
  const lane = OPENAPI_LANES[0];

  it('loads lane operations by operationId', async () => {
    const operations = await getOpenApiOperations(lane);

    expect(operations.map((operation) => operation.operationId)).toContain(
      'start-agent',
    );
    expect(operations).toHaveLength(10);
  });

  it('normalizes method, path, and request body', async () => {
    const operation = await getOpenApiOperation(lane, 'start-agent');

    expect(operation.method).toBe('POST');
    expect(operation.path).toBe('/v2/projects/{appid}/join');
    expect(operation.requestBody?.contentTypes).toContain('application/json');
  });

  it('keeps registry operation IDs in sync with YAML', async () => {
    const operations = await getOpenApiOperations(lane);
    const fromYaml = operations
      .map((operation) => operation.operationId)
      .sort();
    const fromRegistry = getOpenApiOperationIds(lane).sort();

    expect(fromRegistry).toEqual(fromYaml);
  });
});
