import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FumadocsOpenApiContent } from './FumadocsOpenApiContent';

describe('FumadocsOpenApiContent', () => {
  it('renders request schemas as an expanded inline tree with GFM descriptions', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          operations: [
            {
              method: 'post',
              path: '/v2/projects/{appid}/join',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Conversational AI Agent API Overview',
              },
              openapi: '3.2.0',
              paths: {
                '/v2/projects/{appid}/join': {
                  post: {
                    operationId: 'start-agent',
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              name: {
                                description: 'Unique agent name.',
                                type: 'string',
                              },
                              properties: {
                                description: 'Detailed configuration.',
                                properties: {
                                  channel: {
                                    description:
                                      'Channel list:\\n\\n- `main`: primary channel\\n\\nSee [Token docs](https://example.com/token) and [FAQ](/faq/list?category=integration-issues&amp;platform=all&amp;product=all).',
                                    type: 'string',
                                  },
                                  llm: {
                                    properties: {
                                      url: {
                                        description: 'LLM callback address.',
                                        type: 'string',
                                      },
                                    },
                                    required: ['url'],
                                    type: 'object',
                                  },
                                },
                                required: ['channel', 'llm'],
                                type: 'object',
                              },
                            },
                            required: ['name', 'properties'],
                            type: 'object',
                          },
                        },
                      },
                    },
                    responses: {
                      '200': {
                        description: 'OK',
                      },
                    },
                  },
                },
              },
            },
          },
          showDescription: true,
        }),
      );

    render(
      <FumadocsOpenApiContent
        payloadAssetPath="/generated/openapi/page-payloads/en/convoai/start-agent.json"
        payloadMeta={{
          document: 'convoai-en',
          operations: [
            {
              method: 'post',
              path: '/v2/projects/{appid}/join',
            },
          ],
          showDescription: true,
        }}
      />,
    );

    const channelField = await screen.findByText('channel');

    expect(channelField).toBeInTheDocument();
    expect(screen.getByText('llm')).toBeInTheDocument();
    expect(screen.getByText('url')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Token docs' })).toHaveAttribute(
      'href',
      'https://example.com/token',
    );
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'href',
      'https://doc.shengwang.cn/faq/list?category=integration-issues&platform=all&product=all',
    );
    expect(screen.getByText(/primary channel/)).toBeInTheDocument();

    const schemaTreeElement = document.querySelector('.openapi-schema-tree');
    expect(schemaTreeElement).toBeInstanceOf(HTMLElement);
    expect(
      within(schemaTreeElement as HTMLElement).queryByPlaceholderText(
        'Filter Properties',
      ),
    ).not.toBeInTheDocument();
  });
});
