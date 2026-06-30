import { fireEvent, render, screen, within } from '@testing-library/react';
import type { Document } from 'fumadocs-openapi';
import type { ClientApiPageProps } from 'fumadocs-openapi/ui/create-client';
import { describe, expect, it } from 'vitest';
import { FumadocsOpenApiContent } from './FumadocsOpenApiContent';

type ClientApiOperation = NonNullable<ClientApiPageProps['operations']>[number];

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
                        content: {
                          'application/json': {
                            example: {
                              status: 'success',
                            },
                          },
                        },
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

    const curlTab = await screen.findByRole('tab', { name: 'curl' });
    const requestExamples = curlTab.closest('.openapi-request-examples');
    expect(requestExamples).not.toBeNull();
    const examplesScope = within(requestExamples as HTMLElement);
    expect(
      examplesScope.getByRole('tab', { name: 'curl' }),
    ).toBeInTheDocument();
    expect(
      examplesScope.getByRole('tab', { name: 'Python' }),
    ).toBeInTheDocument();
    expect(
      examplesScope.getByRole('tab', { name: 'Node.js' }),
    ).toBeInTheDocument();
    expect(examplesScope.getByRole('tabpanel')).toHaveTextContent(
      'curl --request POST https://example.com/join',
    );
    fireEvent.mouseDown(examplesScope.getByRole('tab', { name: 'Python' }));
    expect(examplesScope.getByText('import requests')).toBeInTheDocument();
    fireEvent.mouseDown(examplesScope.getByRole('tab', { name: 'Node.js' }));
    expect(
      examplesScope.getByText('fetch("https://example.com/join")'),
    ).toBeInTheDocument();

    expect(screen.queryByRole('tab', { name: 'cURL' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: 'JavaScript' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Go' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Java' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'C#' })).not.toBeInTheDocument();
  });

  it('renders authorization from global security and hides auth header parameters', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'post',
              path: '/v1/apps/{appid}/cloud_recording/update',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Cloud Recording API',
              },
              openapi: '3.2.0',
              components: {
                securitySchemes: {
                  basicAuth: {
                    scheme: 'basic',
                    type: 'http',
                  },
                },
              },
              security: [
                {
                  basicAuth: [],
                },
              ],
              paths: {
                '/v1/apps/{appid}/cloud_recording/update': {
                  post: {
                    operationId: 'update-cloud-recording',
                    parameters: [
                      {
                        description: 'Authentication credential.',
                        in: 'header',
                        name: 'Authorization',
                        required: true,
                        schema: {
                          type: 'string',
                        },
                      },
                      {
                        description: 'The App ID of the project.',
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
                    summary: 'Update cloud recording settings',
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    expect(
      await screen.findByText('This endpoint requires authentication.'),
    ).toBeInTheDocument();
    expect(screen.getByText('basicAuth')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Header Parameters' }),
    ).not.toBeInTheDocument();
    const pathSection = screen
      .getByRole('heading', { name: 'Path Parameters' })
      .closest('section') as HTMLElement;
    expect(within(pathSection).getByText('appid')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Header Parameters' }),
    ).not.toBeInTheDocument();
  });

  it('renders operation callouts from the bundled source operation', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'get',
              path: '/v1/ncs/ip',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Cloud Recording API',
              },
              openapi: '3.2.0',
              paths: {
                '/v1/ncs/ip': {
                  get: {
                    description:
                      'Queries the IP address or IP address list of the message notification server.',
                    operationId: 'get-ncs-ip',
                    responses: {
                      '200': {
                        description: 'OK',
                      },
                    },
                    summary: 'Query message notification server IP addresses',
                    'x-docs-callouts': [
                      {
                        markdown:
                          'Query the IP addresses at least once every 24 hours and update your firewall whitelist automatically.',
                        position: 'after-description',
                        title: 'Note',
                        type: 'info',
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

    expect(await screen.findByText('Note')).toBeInTheDocument();
    expect(
      screen.getByText(/Query the IP addresses at least once every 24 hours/),
    ).toBeInTheDocument();
  });

  it('renders structured request and response sections around OpenAPI blocks', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'post',
              path: '/v2/projects/{appid}/agents/{agentId}/interrupt',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Conversational AI API',
              },
              openapi: '3.2.0',
              paths: {
                '/v2/projects/{appid}/agents/{agentId}/interrupt': {
                  post: {
                    operationId: 'agent-interrupt',
                    parameters: [
                      {
                        description: 'The App ID of the project.',
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
                    summary: 'Interrupt the agent',
                    'x-docs-sections': [
                      {
                        markdown: 'The request body is empty.',
                        position: 'after-parameters',
                        title: 'Request body',
                      },
                      {
                        markdown:
                          'If the returned status code is `200`, the agent stops talking and thinking immediately.',
                        position: 'before-response-body',
                        title: 'Response',
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
      await screen.findByText('The request body is empty.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/stops talking and thinking immediately/),
    ).toBeInTheDocument();
  });

  it('renders document server URL with path and structured no-body prose', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'get',
              path: '/{appid}/rtm/vendor/user_events',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Signaling REST API',
              },
              openapi: '3.2.0',
              servers: [
                {
                  url: 'https://api.agora.io/dev/v2/project',
                },
              ],
              paths: {
                '/{appid}/rtm/vendor/user_events': {
                  get: {
                    operationId: 'get-user-events',
                    parameters: [
                      {
                        description: 'The App ID of your Agora project.',
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
                    summary: 'Get user events',
                    'x-docs-sections': [
                      {
                        markdown:
                          'This endpoint does not require any query parameters or a request body.',
                        position: 'after-parameters',
                        title: 'Request',
                      },
                      {
                        markdown:
                          '- If the returned status code is `200`, the request was successful.',
                        position: 'before-response-body',
                        title: 'Response',
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
      await screen.findByText(
        'https://api.agora.io/dev/v2/project/{appid}/rtm/vendor/user_events',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'This endpoint does not require any query parameters or a request body.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_content, element) =>
        Boolean(
          element?.tagName === 'LI' &&
            element.textContent?.includes('returned status code is 200'),
        ),
      ),
    ).toBeInTheDocument();
  });

  it('renders referenced path and header parameters', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'post',
              path: '/v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/stop',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Cloud Recording API',
              },
              openapi: '3.2.0',
              components: {
                parameters: {
                  'Content-Type': {
                    description: 'The request content type.',
                    in: 'header',
                    name: 'Content-Type',
                    required: true,
                    schema: {
                      enum: ['application/json'],
                      type: 'string',
                    },
                  },
                  appid: {
                    description: 'The App ID of your project.',
                    in: 'path',
                    name: 'appid',
                    required: true,
                    schema: {
                      type: 'string',
                    },
                  },
                  mode: {
                    description: 'The recording mode.',
                    in: 'path',
                    name: 'mode',
                    required: true,
                    schema: {
                      enum: ['individual', 'mix', 'web'],
                      type: 'string',
                    },
                  },
                  resourceid: {
                    description: 'The resource ID.',
                    in: 'path',
                    name: 'resourceid',
                    required: true,
                    schema: {
                      type: 'string',
                    },
                  },
                  sid: {
                    description: 'The recording ID.',
                    in: 'path',
                    name: 'sid',
                    required: true,
                    schema: {
                      type: 'string',
                    },
                  },
                },
              },
              paths: {
                '/v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/stop':
                  {
                    post: {
                      operationId: 'stop-cloud-recording',
                      parameters: [
                        { $ref: '#/components/parameters/Content-Type' },
                        { $ref: '#/components/parameters/appid' },
                        { $ref: '#/components/parameters/resourceid' },
                        { $ref: '#/components/parameters/sid' },
                        { $ref: '#/components/parameters/mode' },
                      ],
                      responses: {
                        '200': {
                          description: 'OK',
                        },
                      },
                      summary: 'Stop cloud recording',
                    },
                  },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    const pathSection = screen
      .getByRole('heading', { name: 'Path Parameters' })
      .closest('section') as HTMLElement;
    const headerSection = screen
      .getByRole('heading', { name: 'Header Parameters' })
      .closest('section') as HTMLElement;

    expect(within(pathSection).getByText('appid')).toBeInTheDocument();
    expect(within(pathSection).getByText('resourceid')).toBeInTheDocument();
    expect(within(pathSection).getByText('sid')).toBeInTheDocument();
    expect(within(pathSection).getByText('mode')).toBeInTheDocument();
    expect(
      within(pathSection).getByText('individual | mix | web'),
    ).toBeInTheDocument();
    expect(within(headerSection).getByText('Content-Type')).toBeInTheDocument();
    expect(
      within(headerSection).getByText('application/json'),
    ).toBeInTheDocument();
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
              components: {
                securitySchemes: {
                  basicAuth: {
                    scheme: 'basic',
                    type: 'http',
                  },
                },
              },
              security: [
                {
                  basicAuth: [],
                },
              ],
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
                              displayName: {
                                description: 'Optional display name.',
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
                                        'x-docs-callouts': [
                                          {
                                            markdown:
                                              'Use HTTPS for production callback URLs.',
                                            title: 'Note',
                                            type: 'info',
                                          },
                                        ],
                                      } as unknown as Record<string, unknown>,
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
    expect(screen.getByText(/production callback URLs/)).toBeInTheDocument();

    const schemaTreeElement = document.querySelector('.openapi-schema-tree');
    expect(schemaTreeElement).toBeInstanceOf(HTMLElement);
    const schemaTree = within(schemaTreeElement as HTMLElement);
    const optionalFieldRow = schemaTree
      .getByText('displayName')
      .closest('div[style]');
    expect(optionalFieldRow).toBeInstanceOf(HTMLElement);
    expect(
      within(optionalFieldRow as HTMLElement).getByText('optional'),
    ).toBeInTheDocument();
    expect(schemaTree.queryByText('?')).not.toBeInTheDocument();
    expect(
      schemaTree.getByText(/production callback URLs/),
    ).toBeInTheDocument();

    const requestBodyHeading = screen.getByRole('heading', {
      name: 'Request Body',
    });
    const operationTopText =
      document.body.textContent?.slice(
        0,
        document.body.textContent.indexOf(requestBodyHeading.textContent ?? ''),
      ) ?? '';

    expect(operationTopText).not.toContain('production callback URLs');
    expect(
      schemaTree.queryByPlaceholderText('Filter Properties'),
    ).not.toBeInTheDocument();
  });

  it('renders response body fields inherited through local refs and nested allOf schemas', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'get',
              path: '/v1/apps/{appid}/cloud_recording/query',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Cloud Recording API',
              },
              openapi: '3.2.0',
              components: {
                schemas: {
                  baseSession: {
                    properties: {
                      cname: {
                        description: 'The name of the channel being recorded.',
                        type: 'string',
                      },
                      uid: {
                        description:
                          'The UID used by the cloud recording service in the RTC channel.',
                        type: 'string',
                      },
                    },
                    type: 'object',
                  },
                  queryResponse: {
                    type: 'object',
                    allOf: [
                      {
                        type: 'object',
                        allOf: [
                          { $ref: '#/components/schemas/baseSession' },
                          {
                            properties: {
                              resourceId: { type: 'string' },
                              sid: { type: 'string' },
                            },
                            type: 'object',
                          },
                        ],
                      },
                      {
                        properties: {
                          serverResponse: {
                            properties: {
                              status: {
                                description:
                                  'Current status of the cloud recording service.',
                                type: 'integer',
                              },
                            },
                            type: 'object',
                          },
                        },
                        type: 'object',
                      },
                    ],
                  },
                },
              },
              paths: {
                '/v1/apps/{appid}/cloud_recording/query': {
                  get: {
                    operationId: 'query-cloud-recording',
                    responses: {
                      '200': {
                        description: 'OK',
                        content: {
                          'application/json': {
                            schema: {
                              $ref: '#/components/schemas/queryResponse',
                            },
                          },
                        },
                      },
                    },
                    summary: 'Query status',
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    await screen.findByRole('heading', {
      name: 'Response Body',
    });
    fireEvent.click(screen.getByRole('button', { name: '200' }));

    const schemaTreeElement = document.querySelector('.openapi-schema-tree');

    expect(schemaTreeElement).toBeInstanceOf(HTMLElement);
    expect(
      within(schemaTreeElement as HTMLElement).getByText('cname'),
    ).toBeInTheDocument();
    expect(
      within(schemaTreeElement as HTMLElement).getByText(
        'The name of the channel being recorded.',
      ),
    ).toBeInTheDocument();
    expect(
      within(schemaTreeElement as HTMLElement).getByText('uid'),
    ).toBeInTheDocument();
    expect(
      within(schemaTreeElement as HTMLElement).getByText(
        'The UID used by the cloud recording service in the RTC channel.',
      ),
    ).toBeInTheDocument();
    expect(
      within(schemaTreeElement as HTMLElement).getByText('serverResponse'),
    ).toBeInTheDocument();
    expect(
      within(schemaTreeElement as HTMLElement).getByText('status'),
    ).toBeInTheDocument();
  });

  it('renders scalar parameters, response headers, callouts, and parameter metadata', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'delete',
              path: '/v1/projects/{appId}/regions/{region}/templates/{templateId}',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Media Gateway API',
              },
              openapi: '3.2.0',
              paths: {
                '/v1/projects/{appId}/regions/{region}/templates/{templateId}':
                  {
                    delete: {
                      operationId: 'delete-template',
                      parameters: [
                        {
                          description: 'The App ID of your Agora project.',
                          in: 'path',
                          name: 'appId',
                          required: true,
                          schema: {
                            example: '970ca35de60c44645bbae8a215061b33',
                            maxLength: 32,
                            minLength: 32,
                            type: 'string',
                          },
                        },
                        {
                          description: 'The region where the template exists.',
                          in: 'path',
                          name: 'region',
                          required: true,
                          schema: {
                            default: 'cn',
                            enum: ['cn', 'na', 'eu'],
                            type: 'string',
                          },
                        },
                        {
                          description: 'The number of channels per page.',
                          in: 'query',
                          name: 'page_size',
                          required: false,
                          schema: {
                            default: 100,
                            maximum: 500,
                            minimum: 1,
                            type: 'number',
                          },
                        },
                        {
                          description: 'Voice activity detection sensitivity.',
                          in: 'query',
                          name: 'speech_threshold',
                          required: false,
                          schema: {
                            default: 0.5,
                            exclusiveMaximum: 1,
                            exclusiveMinimum: 0,
                            type: 'number',
                          },
                        },
                        {
                          description:
                            'The flow configuration template ID, such as `720p`, `1080p`, `gameA`, or `gameB`.',
                          example: '720p',
                          in: 'path',
                          name: 'templateId',
                          required: true,
                          schema: {
                            pattern: '^[A-Za-z0-9_-]+$',
                            type: 'string',
                          },
                          'x-docs-callouts': [
                            {
                              markdown:
                                'Set `templateId` according to your business use case.',
                              title: 'Important',
                              type: 'important',
                            },
                          ],
                        },
                        {
                          description:
                            'Optional request ID that you provide for troubleshooting.',
                          in: 'header',
                          name: 'X-Request-ID',
                          required: false,
                          schema: {
                            example: 'request-123',
                            type: 'string',
                          },
                        },
                      ],
                      responses: {
                        '200': {
                          description: 'OK',
                          headers: {
                            'X-Request-ID': {
                              $ref: '#/components/headers/X-Request-ID',
                            },
                          },
                          content: {
                            'application/json': {
                              schema: {
                                properties: {
                                  status: {
                                    description:
                                      'The status of this request. `success` means the request succeeds.',
                                    type: 'string',
                                  },
                                },
                                type: 'object',
                              },
                            },
                          },
                        },
                      },
                      summary: 'Delete a template',
                      'x-docs-callouts': [
                        {
                          markdown:
                            'A 401 response does not return the `X-Request-ID` header.',
                          position: 'after-description',
                          title: 'Note',
                          type: 'info',
                        },
                        {
                          markdown:
                            'Do not retry deletion until the previous request finishes.',
                          position: 'after-responses',
                          title: 'Important',
                          type: 'important',
                        },
                      ],
                      'x-docs-sections': [
                        {
                          markdown:
                            'For details about possible response status codes, see [Response status codes](../../response-status-codes).\n\nIf the status code is not `200`, the request fails. See the `message` field in the response body for the reason for this failure.\n\nIf the status code is `200`, the request succeeds, and the response body includes the following parameters:',
                          position: 'after-response-body',
                        },
                        {
                          markdown:
                            '### Banning rule behavior\n\n| `ip` | `cname` | `uid` | Rule |\n|:----:|:-------:|:-----:|:-----|\n| Empty | Empty | Empty | Invalid rule. |\n| Set | Empty | Empty | Ban users from an IP address. |',
                          position: 'after-response-body',
                          title: 'Reference',
                        },
                        {
                          markdown:
                            'The following is a response example for a successful request:',
                          position: 'after-response-example',
                          title: 'Response example',
                        },
                        {
                          markdown:
                            'To explore the RESTful API parameters, obtain sample code in various client languages, or test Media Gateway requests, refer to the [Postman API reference](https://example.com/postman).',
                          position: 'after-response-example',
                          title: 'Info',
                          type: 'callout',
                          variant: 'info',
                        },
                      ],
                    },
                  },
              },
              components: {
                headers: {
                  'X-Request-ID': {
                    description:
                      'The request ID returned by Agora for troubleshooting.',
                    schema: {
                      example: 'response-123',
                      type: 'string',
                    },
                    'x-docs-callouts': [
                      {
                        markdown:
                          'A 401 response does not include this header.',
                        title: 'Caution',
                        type: 'caution',
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

    const pathParameters = await screen.findByRole('heading', {
      name: 'Path Parameters',
    });
    const pathSection = pathParameters.closest('section') as HTMLElement;
    const headerSection = screen
      .getByRole('heading', { name: 'Header Parameters' })
      .closest('section') as HTMLElement;
    const responseHeaderSection = screen
      .getByRole('heading', { name: 'Response Headers' })
      .closest('section') as HTMLElement;

    expect(within(pathSection).getByText('appId')).toBeInTheDocument();
    expect(within(pathSection).getByText('region')).toBeInTheDocument();
    expect(
      within(pathSection).getAllByText('templateId').length,
    ).toBeGreaterThan(0);
    expect(
      within(pathSection).getByText(/flow configuration template ID/),
    ).toBeInTheDocument();
    expect(within(pathSection).getByText('Allowed')).toBeInTheDocument();
    expect(within(pathSection).getByText('cn | na | eu')).toBeInTheDocument();
    expect(within(pathSection).getByText('Default')).toBeInTheDocument();
    expect(within(pathSection).getByText('Min length')).toBeInTheDocument();
    expect(within(pathSection).getByText('Max length')).toBeInTheDocument();
    expect(within(pathSection).getByText('Pattern')).toBeInTheDocument();
    expect(within(pathSection).getAllByText('720p').length).toBeGreaterThan(0);

    const querySection = screen
      .getByRole('heading', { name: 'Query Parameters' })
      .closest('section') as HTMLElement;
    expect(within(querySection).getByText('page_size')).toBeInTheDocument();
    expect(within(querySection).getAllByText('Range')).toHaveLength(2);
    expect(within(querySection).getByText('[1, 500]')).toBeInTheDocument();
    expect(
      within(querySection).getByText('speech_threshold'),
    ).toBeInTheDocument();
    expect(within(querySection).getByText('(0, 1)')).toBeInTheDocument();
    expect(within(querySection).queryByText('Minimum')).not.toBeInTheDocument();
    expect(within(querySection).queryByText('Maximum')).not.toBeInTheDocument();

    expect(within(headerSection).getByText('X-Request-ID')).toBeInTheDocument();
    expect(
      within(headerSection).getByText(/provide for troubleshooting/),
    ).toBeInTheDocument();
    expect(within(headerSection).getByText('request-123')).toBeInTheDocument();

    expect(
      within(responseHeaderSection).getByText('X-Request-ID'),
    ).toBeInTheDocument();
    expect(
      within(responseHeaderSection).getByText(/returned by Agora/),
    ).toBeInTheDocument();
    expect(
      within(responseHeaderSection).getByText('response-123'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Response Body' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getAllByText(/401 response/).length).toBeGreaterThan(1);
    expect(screen.getAllByText('Important').length).toBeGreaterThan(1);
    expect(
      screen.getByText(/according to your business use case/),
    ).toBeInTheDocument();
    expect(screen.getByText('Caution')).toBeInTheDocument();
    expect(
      screen.getByText(/does not include this header/),
    ).toBeInTheDocument();
    expect(screen.getByText(/previous request finishes/)).toBeInTheDocument();
    const responseBodyHeading = screen.getByRole('heading', {
      name: 'Response Body',
    });
    const responseHeadersHeading = screen.getByRole('heading', {
      name: 'Response Headers',
    });
    const referenceHeading = screen.getByRole('heading', {
      name: 'Reference',
    });
    expect(
      screen.getByRole('link', { name: 'Response status codes' }),
    ).toHaveAttribute('href', '../../response-status-codes');
    expect(
      screen.getByText((_content, element) =>
        Boolean(
          element?.tagName === 'P' &&
            element?.textContent?.includes(
              'If the status code is not 200, the request fails.',
            ),
        ),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_content, element) =>
        Boolean(
          element?.tagName === 'P' &&
            element?.textContent?.includes(
              'If the status code is 200, the request succeeds',
            ),
        ),
      ),
    ).toBeInTheDocument();
    expect(
      responseBodyHeading.compareDocumentPosition(referenceHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      responseHeadersHeading.compareDocumentPosition(referenceHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Banning rule behavior' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'ip' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Ban users from an IP address.' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Response example').length).toBeGreaterThan(0);
    expect(
      screen.getByText(/response example for a successful request/),
    ).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText(/RESTful API parameters/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Postman API reference' }),
    ).toHaveAttribute('href', 'https://example.com/postman');
  });

  it('scopes generated OpenAPI body headings to the shared major section typography', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'post',
              path: '/v2/projects/{appid}/agents/{agentId}/think',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Conversational AI API',
              },
              openapi: '3.2.0',
              paths: {
                '/v2/projects/{appid}/agents/{agentId}/think': {
                  post: {
                    operationId: 'agent-think',
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
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              text: {
                                type: 'string',
                              },
                            },
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
            } as unknown as Document,
          },
        }}
      />,
    );

    const operation = document.querySelector('.openapi-operation');
    expect(operation).toBeInstanceOf(HTMLElement);
    const pathHeading = await screen.findByRole('heading', {
      name: 'Path Parameters',
    });
    const requestBodyHeading = screen.getByRole('heading', {
      name: 'Request Body',
    });
    const responseBodyHeading = screen.getByRole('heading', {
      name: 'Response Body',
    });

    expect(pathHeading).toHaveClass('font-semibold', 'text-2xl');
    expect(requestBodyHeading).toHaveAttribute('id', 'request-body');
    expect(responseBodyHeading).toHaveAttribute('id', 'response-body');
    expect(operation).toHaveClass(
      '[&_h2#request-body]:font-semibold',
      '[&_h2#request-body]:text-2xl',
      '[&_h2#response-body]:font-semibold',
      '[&_h2#response-body]:text-2xl',
    );
  });

  it('scopes OpenAPI markdown prose across docs sections, schemas, and callouts without repeating operation descriptions', async () => {
    const operationDescriptionMarkdown =
      'Use this endpoint to send a custom instruction.\n\n- Pause the agent.\n- Resume the agent.\n\n1. Validate the agent ID.\n2. Send the instruction.';

    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              description: operationDescriptionMarkdown,
              method: 'post',
              path: '/v2/projects/{appid}/agents/{agentId}/instructions',
            } as ClientApiOperation,
          ],
          showDescription: true,
          payload: {
            bundled: {
              info: {
                title: 'Conversational AI API',
              },
              openapi: '3.2.0',
              paths: {
                '/v2/projects/{appid}/agents/{agentId}/instructions': {
                  post: {
                    description: operationDescriptionMarkdown,
                    operationId: 'send-custom-instruction',
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
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              instruction: {
                                description:
                                  'Instruction text.\n\n- Use plain text.\n- See [schema guide](https://example.com/schema).',
                                type: 'string',
                              },
                            },
                            required: ['instruction'],
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
                    summary: 'Send a custom instruction',
                    'x-docs-callouts': [
                      {
                        markdown:
                          'Read the [instruction guide](https://example.com/instructions).\n\n- Check rate limits.',
                        position: 'after-description',
                        title: 'Note',
                        type: 'info',
                      },
                    ],
                    'x-docs-sections': [
                      {
                        markdown:
                          'Before sending:\n\n1. Include a trace ID.\n2. Log the response.',
                        position: 'after-parameters',
                        title: 'Usage notes',
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
      await screen.findByRole('heading', { name: 'Usage notes' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Use this endpoint to send a custom instruction.'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Pause the agent.')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Validate the agent ID.'),
    ).not.toBeInTheDocument();

    const sectionListItem = screen.getByText('Include a trace ID.');
    expect(sectionListItem.tagName).toBe('LI');
    expect(sectionListItem.closest('ol')).toBeInstanceOf(HTMLOListElement);
    expect(sectionListItem.closest('.openapi-markdown')).toBeInstanceOf(
      HTMLElement,
    );

    const sectionMarkdown = sectionListItem.closest('.openapi-markdown');
    expect(sectionMarkdown).toBeInstanceOf(HTMLElement);
    expect(sectionMarkdown?.closest('.openapi-operation')).toHaveClass(
      'not-prose',
    );

    const schemaListItem = screen.getByText('Use plain text.');
    expect(schemaListItem.tagName).toBe('LI');
    expect(schemaListItem.closest('ul')).toBeInstanceOf(HTMLUListElement);
    expect(schemaListItem.closest('.openapi-markdown')).toBeInstanceOf(
      HTMLElement,
    );
    expect(screen.getByRole('link', { name: 'schema guide' })).toHaveAttribute(
      'href',
      'https://example.com/schema',
    );

    const calloutListItem = screen.getByText('Check rate limits.');
    expect(calloutListItem.tagName).toBe('LI');
    expect(calloutListItem.closest('ul')).toBeInstanceOf(HTMLUListElement);
    const calloutLink = screen.getByRole('link', {
      name: 'instruction guide',
    });
    expect(calloutLink).toHaveAttribute(
      'href',
      'https://example.com/instructions',
    );
    expect(calloutLink.closest('.openapi-markdown')).toBeInstanceOf(
      HTMLElement,
    );
  });

  it('renders structured docs code sample groups without mixing them into descriptions', async () => {
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
              components: {
                securitySchemes: {
                  basicAuth: {
                    scheme: 'basic',
                    type: 'http',
                  },
                },
              },
              security: [
                {
                  basicAuth: [],
                },
              ],
              paths: {
                '/v2/projects/{appid}/join': {
                  post: {
                    description:
                      'Use this endpoint to create and start a Conversational AI agent instance.',
                    operationId: 'start-agent',
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
                    summary: 'Start a conversational AI agent',
                    'x-docs-code-sample-groups': [
                      {
                        samples: [
                          {
                            lang: 'bash',
                            label: 'curl',
                            source:
                              'curl --request POST https://example.com/join',
                          },
                          {
                            lang: 'python',
                            label: 'Python',
                            source: 'import requests',
                          },
                        ],
                        title: 'Basic configuration',
                      },
                      {
                        samples: [
                          {
                            lang: 'javascript',
                            label: 'Node.js',
                            source: 'fetch("https://example.com/join")',
                          },
                        ],
                        title: 'Saved agent configuration',
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

    const scenarioSelect = await screen.findByLabelText(
      'Request example scenario',
    );
    const rightExamples = scenarioSelect.closest('.openapi-right-examples');
    expect(rightExamples).not.toBeNull();
    const rightScope = within(rightExamples as HTMLElement);
    expect(
      rightScope.getByRole('heading', { name: 'Request examples' }),
    ).toBeInTheDocument();
    expect(
      rightScope.getByRole('heading', { name: 'Response example' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Authorization')).toBeInTheDocument();
    expect(screen.getByText('basicAuth')).toBeInTheDocument();
    const requestExamples = scenarioSelect.closest('.openapi-request-examples');
    expect(requestExamples).not.toBeNull();
    expect(document.querySelectorAll('.openapi-request-examples')).toHaveLength(
      1,
    );
    const examplesScope = within(requestExamples as HTMLElement);
    expect(
      examplesScope.getByLabelText('Request example scenario'),
    ).toHaveValue('Basic configuration');
    expect(
      examplesScope.getByRole('option', { name: 'Saved agent configuration' }),
    ).toBeInTheDocument();
    expect(
      examplesScope.getByRole('tab', { name: 'curl' }),
    ).toBeInTheDocument();
    expect(
      examplesScope.getByRole('tab', { name: 'Python' }),
    ).toBeInTheDocument();
    expect(examplesScope.getByRole('tabpanel')).toHaveTextContent(
      'curl --request POST https://example.com/join',
    );

    fireEvent.change(examplesScope.getByLabelText('Request example scenario'), {
      target: {
        value: 'Saved agent configuration',
      },
    });

    expect(
      examplesScope.getByRole('tab', { name: 'Node.js' }),
    ).toBeInTheDocument();
    expect(examplesScope.getByRole('tabpanel')).toHaveTextContent(
      'fetch("https://example.com/join")',
    );
    expect(examplesScope.getByRole('tabpanel')).not.toHaveTextContent(
      'curl --request POST https://example.com/join',
    );
    expect(screen.getByRole('tab', { name: '200' })).toBeInTheDocument();
    expect(
      screen.queryByText('x-docs-code-sample-groups'),
    ).not.toBeInTheDocument();
  });

  it('renders custom request code samples for list endpoints without crashing', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'get',
              path: '/v2/projects/{appid}/agents',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Conversational AI API',
              },
              openapi: '3.2.0',
              paths: {
                '/v2/projects/{appid}/agents': {
                  get: {
                    description:
                      'Retrieves Conversational AI agents that match specified conditions.',
                    operationId: 'get-agent-list',
                    responses: {
                      '200': {
                        description: 'OK',
                      },
                    },
                    summary: 'Retrieve a list of agents',
                    'x-codeSamples': [
                      {
                        lang: 'bash',
                        label: 'curl',
                        source:
                          'curl --request GET https://example.com/v2/projects/:appid/agents',
                      },
                      {
                        lang: 'javascript',
                        label: 'Node.js',
                        source:
                          'fetch("https://example.com/v2/projects/:appid/agents")',
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
    expect(screen.getByRole('tab', { name: 'Node.js' })).toBeInTheDocument();
    const requestExamples = screen
      .getByRole('tab', { name: 'curl' })
      .closest('.openapi-request-examples');
    expect(requestExamples).not.toBeNull();
    expect(
      within(requestExamples as HTMLElement).getByRole('tabpanel'),
    ).toHaveTextContent(
      'curl --request GET https://example.com/v2/projects/:appid/agents',
    );
  });

  it('renders operation prose sections without repeating the page summary', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'post',
              path: '/v2/projects/{appid}/agents/{agentId}/think',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Conversational AI API',
              },
              openapi: '3.2.0',
              paths: {
                '/v2/projects/{appid}/agents/{agentId}/think': {
                  post: {
                    description:
                      'Sends a custom text instruction to a specified Conversational AI agent instance.',
                    operationId: 'agent-think',
                    responses: {
                      '200': {
                        description: 'OK',
                      },
                    },
                    summary: 'Send a custom instruction',
                    'x-docs-sections': [
                      {
                        markdown: [
                          'Use this endpoint to send a custom text instruction to the specified Conversational AI agent instance.',
                          '',
                          'Use this endpoint for the following scenarios:',
                          '',
                          '- **Implicit instruction injection**: Inject hidden context or directives into the conversation.',
                          '- **Client-side event triggering**: Notify the agent of client-side events, such as a user clicking a button.',
                          '- **Voice and text collaboration**: Combine text instructions with voice input for richer interaction.',
                        ].join('\n'),
                        position: 'after-description',
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
      await screen.findByText(
        /Use this endpoint to send a custom text instruction/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Sends a custom text instruction to a specified Conversational AI agent instance.',
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '200' })).toBeInTheDocument();
    expect(
      screen.queryByText('x-docs-code-sample-groups'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Implicit instruction injection/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Client-side event triggering/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Voice and text collaboration/),
    ).toBeInTheDocument();
  });

  it('does not render the operation description block before OpenAPI prose sections', () => {
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
                title: 'Conversational AI API',
              },
              openapi: '3.2.0',
              paths: {
                '/v2/projects/{appid}/join': {
                  post: {
                    description:
                      'Creates and starts a Conversational AI agent instance.',
                    operationId: 'start-agent',
                    responses: {
                      '200': {
                        description: 'OK',
                      },
                    },
                    summary: 'Start a conversational AI agent',
                    'x-docs-sections': [
                      {
                        markdown:
                          'Use this endpoint to create and start a Conversational AI agent instance.',
                        position: 'after-description',
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
      screen.queryByText(
        'Creates and starts a Conversational AI agent instance.',
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Use this endpoint to create and start a Conversational AI agent instance.',
      ),
    ).toBeInTheDocument();
  });

  it('renders response body schema field descriptions', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'post',
              path: '/{region}/v1/projects/{appId}/rtls/ingress/streamkeys',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Media Gateway RESTful API',
              },
              openapi: '3.2.0',
              paths: {
                '/{region}/v1/projects/{appId}/rtls/ingress/streamkeys': {
                  post: {
                    operationId: 'create-media-gateway-streaming-key',
                    responses: {
                      '200': {
                        content: {
                          'application/json': {
                            schema: {
                              properties: {
                                status: {
                                  description:
                                    'Request status. `success` means the request succeeds.',
                                  type: 'string',
                                },
                                data: {
                                  properties: {
                                    channel: {
                                      description:
                                        'Agora channel name associated with the streaming key.',
                                      type: 'string',
                                    },
                                    createdAt: {
                                      description:
                                        'Unix timestamp, in seconds, when the streaming key was created.',
                                      type: 'string',
                                    },
                                  },
                                  type: 'object',
                                },
                              },
                              type: 'object',
                            },
                          },
                        },
                        description:
                          'The request succeeded and returned the created streaming key.',
                      },
                      '401': {
                        content: {
                          'application/json': {
                            schema: {
                              properties: {
                                message: {
                                  description:
                                    'Description of why the request failed.',
                                  type: 'string',
                                },
                              },
                              type: 'object',
                            },
                          },
                        },
                        description:
                          'A `401 (Unauthorized)` response status code means the request is not authorized.',
                      },
                    },
                    summary: 'Create streaming key',
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    const responseBody = await screen.findByRole('heading', {
      name: 'Response schema',
    });
    expect(responseBody).toBeInTheDocument();
    const responseScope = within(document.body);
    const visibleText = document.body.textContent?.replace(/\s+/g, ' ') ?? '';

    expect(
      responseScope.getByText(
        'The request succeeded and returned the created streaming key.',
      ),
    ).toBeInTheDocument();
    expect(responseScope.getByText('status')).toBeInTheDocument();
    expect(responseScope.getByText('data')).toBeInTheDocument();
    expect(responseScope.getByText('channel')).toBeInTheDocument();
    expect(responseScope.getByText('createdAt')).toBeInTheDocument();
    expect(visibleText).toContain(
      'Request status. success means the request succeeds.',
    );
    expect(
      responseScope.getByText(
        'Agora channel name associated with the streaming key.',
      ),
    ).toBeInTheDocument();
    expect(
      responseScope.getByText(
        'Unix timestamp, in seconds, when the streaming key was created.',
      ),
    ).toBeInTheDocument();
    expect(visibleText).toContain(
      'A 401 (Unauthorized) response status code means the request is not authorized.',
    );
    expect(
      responseScope.getByText('Description of why the request failed.'),
    ).toBeInTheDocument();
  });

  it('adds stable deep-link anchors to parameters and schema fields', async () => {
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
                title: 'Conversational AI API',
              },
              openapi: '3.2.0',
              paths: {
                '/v2/projects/{appid}/join': {
                  post: {
                    operationId: 'join',
                    parameters: [
                      {
                        description: 'The App ID.',
                        in: 'path',
                        name: 'appid',
                        required: true,
                        schema: { type: 'string' },
                      },
                      {
                        description: 'Pagination cursor.',
                        in: 'query',
                        name: 'pageToken',
                        schema: { type: 'string' },
                      },
                    ],
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              appId: { type: 'string' },
                              channelName: { type: 'string' },
                              config: {
                                properties: {
                                  idleTimeout: { type: 'integer' },
                                },
                                type: 'object',
                              },
                            },
                            required: ['appId', 'channelName'],
                            type: 'object',
                          },
                        },
                      },
                    },
                    responses: {
                      '200': {
                        content: {
                          'application/json': {
                            schema: {
                              properties: {
                                data: {
                                  properties: {
                                    agentId: { type: 'string' },
                                  },
                                  type: 'object',
                                },
                              },
                              type: 'object',
                            },
                          },
                        },
                        description: 'OK',
                      },
                    },
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    await screen.findByRole('heading', { name: /Path Parameters/ });

    expect(document.getElementById('path-parameters-appid')).not.toBeNull();
    expect(
      document.getElementById('query-parameters-page-token'),
    ).not.toBeNull();
    expect(document.getElementById('request-body-app-id')).not.toBeNull();
    expect(document.getElementById('request-body-channel-name')).not.toBeNull();
    expect(
      document.getElementById('request-body-config-idle-timeout'),
    ).not.toBeNull();
    expect(
      document.getElementById('responses-200-data-agent-id'),
    ).not.toBeNull();
    expect(
      document.querySelector('a[href="#request-body-channel-name"]'),
    ).not.toBeNull();
  });
});
