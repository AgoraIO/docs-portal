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
    expect(pagePaths).toContain(
      'en/api-reference/api-ref/signaling/peer-to-peer-message.mdx',
    );
    expect(pagePaths).toContain(
      'en/api-reference/api-ref/speech-to-text/join.mdx',
    );
    expect(pagePaths).toHaveLength(40);
  });

  it('uses locale-specific document IDs in client page props', async () => {
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

    const props = await englishJoin.data.getClientAPIPageProps();

    expect(props.operations).toEqual([
      {
        method: 'post',
        path: '/v2/projects/{appid}/join',
      },
    ]);
    expect(props.payload.bundled.info?.title).toBe(
      'Conversational AI Agent API Overview',
    );
  });

  it('exposes the Fumadocs OpenAPI loader plugin', () => {
    expect(getOpenApiLoaderPlugin().name).toBe('fumadocs:openapi');
  });
});
