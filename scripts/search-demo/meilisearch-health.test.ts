import { readFile } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import yaml from 'js-yaml';
import { afterEach, describe, expect, it } from 'vitest';
import { checkMeilisearchHealth } from './meilisearch-health';

const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    servers
      .splice(0)
      .map(
        (server) =>
          new Promise<void>((resolve) => server.close(() => resolve())),
      ),
  );
});

describe('checkMeilisearchHealth', () => {
  it('reports an unavailable local endpoint without leaking the master key', async () => {
    const key = 'never-print-this-master-key';
    const previousKey = process.env.MEILI_MASTER_KEY;
    process.env.MEILI_MASTER_KEY = key;
    try {
      await expect(
        checkMeilisearchHealth('http://127.0.0.1:0'),
      ).rejects.toThrow(
        'Meilisearch is not ready at http://127.0.0.1:0/health',
      );
      await expect(
        checkMeilisearchHealth('http://127.0.0.1:0'),
      ).rejects.not.toThrow(key);
    } finally {
      if (previousKey === undefined) delete process.env.MEILI_MASTER_KEY;
      else process.env.MEILI_MASTER_KEY = previousKey;
    }
  });

  it('accepts only an available health response without sending credentials', async () => {
    let authorization: string | undefined;
    const server = createServer((request, response) => {
      authorization = request.headers.authorization;
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ status: 'available' }));
    });
    servers.push(server);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('fixture server has no port');

    await expect(
      checkMeilisearchHealth(`http://127.0.0.1:${address.port}`),
    ).resolves.toBeUndefined();
    expect(authorization).toBeUndefined();
  });

  it('rejects a responding service that is not healthy', async () => {
    const server = createServer((_request, response) => {
      response.writeHead(503, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ status: 'unavailable' }));
    });
    servers.push(server);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('fixture server has no port');

    await expect(
      checkMeilisearchHealth(`http://127.0.0.1:${address.port}`),
    ).rejects.toThrow('Meilisearch is not ready');
  });
});

it('keeps the demo service local, persistent, and keyed through environment variables', async () => {
  const compose = yaml.load(
    await readFile('search-demo/docker-compose.yml', 'utf8'),
  ) as {
    services: {
      meilisearch: {
        image: string;
        ports: string[];
        volumes: string[];
        environment: Record<string, string>;
        healthcheck: object;
      };
    };
    volumes: Record<string, object>;
  };
  const service = compose.services.meilisearch;
  expect(service.image).toMatch(/^getmeili\/meilisearch:v\d+\.\d+\.\d+$/);
  expect(service.ports).toEqual(['127.0.0.1:7700:7700']);
  expect(service.volumes).toContain('meili-data:/meili_data');
  expect(compose.volumes).toHaveProperty('meili-data');
  expect(service.environment.MEILI_MASTER_KEY).toContain('${MEILI_MASTER_KEY:');
  expect(service.healthcheck).toBeDefined();
});
