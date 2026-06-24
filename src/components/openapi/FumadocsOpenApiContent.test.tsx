import { render, screen, within } from '@testing-library/react';
import type { Document } from 'fumadocs-openapi';
import { describe, expect, it } from 'vitest';
import { FumadocsOpenApiContent } from './FumadocsOpenApiContent';

describe('FumadocsOpenApiContent', () => {
  it('keeps generated language tabs when an operation does not define x-codeSamples', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'get',
              path: '/api/speech-to-text/v1/projects/{appid}/agents',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Speech-to-Text API',
              },
              openapi: '3.2.0',
              paths: {
                '/api/speech-to-text/v1/projects/{appid}/agents': {
                  get: {
                    operationId: 'list',
                    parameters: [
                      {
                        in: 'path',
                        name: 'appid',
                        required: true,
                        schema: {
                          type: 'string',
                        },
                      },
                    ],
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
        }}
      />,
    );

    expect(
      await screen.findByRole('tab', { name: 'cURL' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'JavaScript' })).toBeInTheDocument();
  });

  it('uses explicit x-codeSamples without adding default generated language tabs', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'post',
              path: '/api/speech-to-text/v1/projects/{appid}/join',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Speech-to-Text API',
              },
              openapi: '3.2.0',
              paths: {
                '/api/speech-to-text/v1/projects/{appid}/join': {
                  post: {
                    operationId: 'join',
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              languages: {
                                items: {
                                  type: 'string',
                                },
                                type: 'array',
                              },
                            },
                            required: ['languages'],
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
                    'x-codeSamples': [
                      {
                        lang: 'bash',
                        label: 'curl',
                        source: 'curl --request POST https://example.com/join',
                      },
                      {
                        lang: 'python',
                        label: 'Python',
                        source: 'import requests',
                      },
                      {
                        lang: 'javascript',
                        label: 'Node.js',
                        source: 'fetch("https://example.com/join")',
                      },
                    ],
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    expect(
      await screen.findByRole('tab', { name: 'curl' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Python' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Node.js' })).toBeInTheDocument();

    expect(screen.queryByRole('tab', { name: 'cURL' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: 'JavaScript' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Go' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Java' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'C#' })).not.toBeInTheDocument();
  });

  it('renders request schemas as an expanded inline tree with GFM descriptions', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
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
