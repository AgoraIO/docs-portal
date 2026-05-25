import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
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

  it('dereferences local parameter refs before normalization', async () => {
    const operation = await getOpenApiOperation(lane, 'start-agent');

    expect(operation.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          in: 'header',
          name: 'Authorization',
        }),
        expect.objectContaining({
          in: 'path',
          name: 'appid',
        }),
      ]),
    );
  });

  it('serializes normalized operations without parser objects', async () => {
    const operation = await getOpenApiOperation(lane, 'start-agent');

    expect(JSON.parse(JSON.stringify(operation))).toMatchObject({
      method: 'POST',
      operationId: 'start-agent',
      path: '/v2/projects/{appid}/join',
    });
  });

  it('keeps registry operation IDs in sync with YAML', async () => {
    const operations = await getOpenApiOperations(lane);
    const fromYaml = operations
      .map((operation) => operation.operationId)
      .sort();
    const fromRegistry = getOpenApiOperationIds(lane).sort();

    expect(fromRegistry).toEqual(fromYaml);
  });

  it('loads OpenAPI data when runtime cwd has no content or public folders', async () => {
    const originalCwd = process.cwd();
    const runtimeCwd = await fs.mkdtemp(
      path.join(os.tmpdir(), 'docs-openapi-runtime-'),
    );
    const uncachedLane = {
      ...lane,
      id: `${lane.id}-runtime-cwd`,
    };

    try {
      process.chdir(runtimeCwd);

      const operation = await getOpenApiOperation(uncachedLane, 'start-agent');

      expect(operation.method).toBe('POST');
      expect(operation.path).toBe('/v2/projects/{appid}/join');
    } finally {
      process.chdir(originalCwd);
      await fs.rm(runtimeCwd, { force: true, recursive: true });
    }
  });
});
