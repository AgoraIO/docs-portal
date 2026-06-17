import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createLocalizedOpenApiSource,
  getOpenApiLoaderPlugin,
} from './fumadocs-source.server';

describe('fumadocs openapi source', () => {
  it('generates localized operation pages with existing route leaves', async () => {
    const source = await createLocalizedOpenApiSource();
    const pagePaths = source.files
      .filter((file) => file.type === 'page')
      .map((file) => file.path)
      .sort();

    expect(pagePaths).toContain(
      'en/api-reference/conversational-ai/rest-api/agent/join.mdx',
    );
    expect(pagePaths).toContain(
      'zh-CN/api-reference/conversational-ai/rest-api/agent/join.mdx',
    );
    expect(pagePaths).toHaveLength(20);
  });

  it('uses locale-specific document IDs in OpenAPI payload metadata', async () => {
    const source = await createLocalizedOpenApiSource();
    const englishJoin = source.files.find(
      (file) =>
        file.type === 'page' &&
        file.path ===
          'en/api-reference/conversational-ai/rest-api/agent/join.mdx',
    );

    expect(englishJoin?.type).toBe('page');
    if (englishJoin?.type !== 'page') {
      throw new Error('Missing English OpenAPI join page');
    }

    expect(englishJoin.data.openApiPayloadMeta).toEqual({
      document: 'convoai-en',
      operations: [
        {
          method: 'post',
          path: '/v2/projects/{appid}/join',
        },
      ],
      showDescription: true,
    });
  });

  it('stores a stable static payload path for each OpenAPI page', async () => {
    const source = await createLocalizedOpenApiSource();
    const englishJoin = source.files.find(
      (file) =>
        file.type === 'page' &&
        file.path ===
          'en/api-reference/conversational-ai/rest-api/agent/join.mdx',
    );

    expect(englishJoin?.type).toBe('page');
    if (englishJoin?.type !== 'page') {
      throw new Error('Missing English OpenAPI join page');
    }

    expect(englishJoin.data.openApiPayloadAssetPath).toBe(
      '/generated/openapi/page-payloads/en/convoai/start-agent.json',
    );
  });

  it('exposes only the lightweight OpenAPI page data needed by the docs shell', async () => {
    const source = await createLocalizedOpenApiSource();
    const englishJoin = source.files.find(
      (file) =>
        file.type === 'page' &&
        file.path ===
          'en/api-reference/conversational-ai/rest-api/agent/join.mdx',
    );

    expect(englishJoin?.type).toBe('page');
    if (englishJoin?.type !== 'page') {
      throw new Error('Missing English OpenAPI join page');
    }

    expect(englishJoin.data).toMatchObject({
      _openapi: {
        method: 'post',
        webhook: false,
      },
      description: 'Create a Conversational AI agent instance and join the RTC channel.',
      openApiPayloadMeta: {
        document: 'convoai-en',
        operations: [
          {
            method: 'post',
            path: '/v2/projects/{appid}/join',
          },
        ],
        showDescription: true,
      },
      structuredData: {
        contents: [
          {
            content:
              'Create a Conversational AI agent instance and join the RTC channel.',
          },
        ],
        headings: [],
      },
      title: 'Start a conversational AI agent',
      toc: [],
    });
    expect(englishJoin.data).not.toHaveProperty('getClientAPIPageProps');
  });

  it('keeps operation metadata scoped to the current operation path', async () => {
    const source = await createLocalizedOpenApiSource();
    const englishJoin = source.files.find(
      (file) =>
        file.type === 'page' &&
        file.path ===
          'en/api-reference/conversational-ai/rest-api/agent/join.mdx',
    );

    expect(englishJoin?.type).toBe('page');
    if (englishJoin?.type !== 'page') {
      throw new Error('Missing English OpenAPI join page');
    }

    expect(englishJoin.data.openApiPayloadMeta.operations).toEqual([
      {
        method: 'post',
        path: '/v2/projects/{appid}/join',
      },
    ]);
  });

  it('exposes the Fumadocs OpenAPI loader plugin', () => {
    expect(getOpenApiLoaderPlugin().name).toBe('fumadocs:openapi');
  });

  it('loads generated OpenAPI documents without runtime yaml parsing or fumadocs server helpers', async () => {
    const sourceModule = await fs.readFile(
      path.resolve(import.meta.dirname, 'fumadocs-source.server.ts'),
      'utf8',
    );

    expect(sourceModule).not.toContain('js-yaml');
    expect(sourceModule).not.toContain('fumadocs-openapi/server');
    expect(sourceModule).not.toContain('openapi-document-manifest.server');
    expect(sourceModule).toContain('openapi-route-manifest.server');
  });
});
