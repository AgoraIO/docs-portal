import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { OpenAPIPageProps } from 'fumadocs-openapi/ui';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  FumadocsOpenApiContent,
  getOpenApiSchemaTreeLabels,
} from './FumadocsOpenApiContent';

type Document = Extract<
  OpenAPIPageProps,
  { payload: unknown }
>['payload']['bundled'];
type OpenApiOperationItem = NonNullable<OpenAPIPageProps['operations']>[number];

describe('FumadocsOpenApiContent', () => {
  it('renders one English response body accordion with status-local headers', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [{ method: 'get', path: '/responses' }],
          payload: {
            bundled: {
              info: { title: 'Response API' },
              openapi: '3.2.0',
              paths: {
                '/responses': {
                  get: {
                    responses: {
                      default: {
                        content: {
                          'application/json': {
                            schema: {
                              properties: { error: { type: 'string' } },
                              type: 'object',
                            },
                          },
                        },
                        description: 'Fallback response',
                      },
                      '200': {
                        content: {
                          'application/json': {
                            schema: {
                              properties: { result: { type: 'string' } },
                              type: 'object',
                            },
                          },
                          'text/plain': {
                            schema: {
                              properties: { message: { type: 'string' } },
                              type: 'object',
                            },
                          },
                        },
                        headers: {
                          'x-request-id': {
                            description: 'Correlation ID.',
                            schema: { type: 'string' },
                          },
                        },
                        description: 'Successful response',
                      },
                      '204': { description: 'No content' },
                    },
                    summary: 'Responses',
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: 'Response Body' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('heading', { name: 'Response Body' }),
    ).toHaveLength(1);
    expect(
      document.querySelector('[data-openapi-responses]'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Response schema' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '200 application/json' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', { name: 'default application/json' }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      document.getElementById('response-headers-200-x-request-id'),
    ).toBeInTheDocument();
    expect(
      within(
        document.getElementById(
          'response-headers-200-x-request-id',
        ) as HTMLElement,
      ).queryByText('optional'),
    ).not.toBeInTheDocument();
    const select = screen.getByLabelText('Media type for 200 response');
    fireEvent.change(select, { target: { value: 'text/plain' } });
    expect(
      screen.getByRole('button', { name: '200 text/plain' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '204' }));
    expect(screen.getByText('Empty response body')).toBeInTheDocument();
  });

  it('opens a hashed English response panel and its schema ancestors', async () => {
    window.location.hash = 'responses-default-data-id';
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [{ method: 'get', path: '/response-hash' }],
          payload: {
            bundled: {
              info: { title: 'Response hash API' },
              openapi: '3.2.0',
              paths: {
                '/response-hash': {
                  get: {
                    responses: {
                      default: {
                        content: {
                          'application/json': {
                            schema: {
                              properties: {
                                data: {
                                  properties: { id: { type: 'string' } },
                                  type: 'object',
                                },
                              },
                              type: 'object',
                            },
                          },
                        },
                      },
                      '200': { description: 'OK' },
                    },
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'default application/json' }),
    ).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(screen.getByText('id')).toBeInTheDocument());
    window.location.hash = '';
  });

  it('opens an English response panel targeted by a response-header hash', () => {
    window.location.hash = 'response-headers-default-x-request-id';
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [{ method: 'get', path: '/response-header-hash' }],
          payload: {
            bundled: {
              info: { title: 'Response header hash API' },
              openapi: '3.2.0',
              paths: {
                '/response-header-hash': {
                  get: {
                    responses: {
                      default: {
                        headers: {
                          'x-request-id': { schema: { type: 'string' } },
                        },
                      },
                      '200': { description: 'OK' },
                    },
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'default' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(
      document.getElementById('response-headers-default-x-request-id'),
    ).toBeInTheDocument();
    window.location.hash = '';
  });

  it('preserves English response accordion state for unchanged response references', () => {
    const responses = {
      default: {
        content: {
          'application/json': { schema: { type: 'object' } },
        },
      },
      '200': { description: 'OK' },
    };
    const bundled = {
      info: { title: 'Response state API' },
      openapi: '3.2.0',
      paths: {
        '/response-state': {
          get: { responses },
        },
      },
    };
    const pageProps = {
      operations: [{ method: 'get', path: '/response-state' }],
      payload: { bundled },
    } as unknown as OpenAPIPageProps;
    const { rerender } = render(
      <FumadocsOpenApiContent pageProps={pageProps} />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'default application/json' }),
    );
    expect(
      screen.getByRole('button', { name: 'default application/json' }),
    ).toHaveAttribute('aria-expanded', 'true');

    rerender(<FumadocsOpenApiContent pageProps={pageProps} />);

    expect(
      screen.getByRole('button', { name: 'default application/json' }),
    ).toHaveAttribute('aria-expanded', 'true');

    const nextPageProps = {
      operations: pageProps.operations,
      payload: {
        bundled: {
          ...bundled,
          paths: {
            '/response-state': {
              get: { responses: { '201': { description: 'Created' } } },
            },
          },
        },
      },
    } as unknown as OpenAPIPageProps;
    rerender(<FumadocsOpenApiContent pageProps={nextPageProps} />);

    expect(screen.getByRole('button', { name: '201' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('localizes generic schema field labels in zh-CN', () => {
    expect(getOpenApiSchemaTreeLabels('schema', 'zh-CN').schemaFields).toBe(
      'Schema 字段',
    );
  });

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
    const generatedPreview = screen.getByTestId('openapi-code-preview');
    expect(
      within(generatedPreview)
        .getByRole('tabpanel')
        .querySelector('.fd-scroll-container'),
    ).toHaveAttribute('data-openapi-code-viewport', '');
    expect(
      screen
        .getByRole('tab', { name: 'cURL' })
        .closest('.openapi-request-examples'),
    ).not.toHaveAttribute('data-markdown-ignore');
    expect(
      screen.getByText('Response example').closest('.openapi-response-example'),
    ).not.toHaveAttribute('data-markdown-ignore');
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
    expect(requestExamples).toHaveAttribute('data-markdown-ignore');
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
    const preview = examplesScope.getByTestId('openapi-code-preview');
    expect(
      within(preview)
        .getByRole('tabpanel')
        .querySelector('.fd-scroll-container'),
    ).toHaveAttribute('data-openapi-code-viewport', '');
    const viewport = within(preview)
      .getByRole('tabpanel')
      .querySelector('.fd-scroll-container');
    expect(viewport).toHaveClass('fd-scroll-container', 'max-h-[600px]');
    expect(viewport?.querySelector('pre')).toHaveClass('min-w-full', 'w-max');
    expect(
      screen.getByText('Response example').closest('.openapi-response-example'),
    ).not.toContainElement(preview);
    const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    const originalClipboard = Object.getOwnPropertyDescriptor(
      window.navigator,
      'clipboard',
    );
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    });
    try {
      fireEvent.click(
        within(preview).getByRole('button', { name: 'Copy Text' }),
      );
      await waitFor(() => {
        expect(clipboardWriteText).toHaveBeenCalledWith(
          'curl --request POST https://example.com/join',
        );
      });
    } finally {
      if (originalClipboard) {
        Object.defineProperty(window.navigator, 'clipboard', originalClipboard);
      } else {
        Reflect.deleteProperty(window.navigator, 'clipboard');
      }
    }
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
    const rail = screen.getByTestId('openapi-examples-rail');
    expect(
      rail.querySelector('.openapi-authorization-section'),
    ).toBeInTheDocument();
    expect(rail.querySelector('.openapi-request-examples')).toBeInTheDocument();
    expect(rail.querySelector('.openapi-response-example')).toBeInTheDocument();
    const layout = rail.closest('.openapi-operation-layout');
    expect(layout?.firstElementChild).toHaveClass('min-w-0');
    expect(layout?.lastElementChild).toHaveClass(
      'openapi-examples-rail-anchor',
    );
    expect(layout?.lastElementChild?.lastElementChild).toBe(rail);
    expect(layout?.children).toHaveLength(2);
    expect(rail.className).not.toContain('w-[360px]');
  });

  it('renders localized operation security before parameters in zh-CN when no Authorization header parameter exists', async () => {
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [
            {
              method: 'post',
              path: '/v1/apps/{appid}/cloud_recording/acquire',
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
                  'Basic Auth': {
                    description:
                      '发送请求时，你需要使用客户 ID 和客户密钥生成 Base64 编码凭证，并填入请求头部的 `Authorization` 字段中。详见[实现 HTTP 基本认证](/doc/cloud-recording/restful/user-guides/http-basic-auth)。',
                    scheme: 'basic',
                    type: 'http',
                  },
                },
              },
              security: [
                {
                  'Basic Auth': [],
                },
              ],
              paths: {
                '/v1/apps/{appid}/cloud_recording/acquire': {
                  post: {
                    operationId: 'acquire',
                    parameters: [
                      {
                        description: '项目的 App ID。',
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
                    summary: '获取云端录制资源',
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: '路径参数' }),
    ).toBeInTheDocument();
    const authHeading = screen.getByRole('heading', { name: '鉴权' });
    expect(authHeading).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Basic Auth' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/客户 ID 和客户密钥/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '实现 HTTP 基本认证' }),
    ).toHaveAttribute(
      'href',
      'https://doc.shengwang.cn/doc/cloud-recording/restful/user-guides/http-basic-auth',
    );
    const pathHeading = screen.getByRole('heading', { name: '路径参数' });
    expect(
      authHeading.compareDocumentPosition(pathHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('prefers an explicit Authorization header parameter over localized securitySchemes in zh-CN', async () => {
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
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
              components: {
                securitySchemes: {
                  'Basic Auth': {
                    description:
                      '发送请求时，你需要使用客户 ID 和客户密钥生成 Base64 编码凭证，并填入请求头部的 `Authorization` 字段中。详见[实现 HTTP 基本认证](/doc/cloud-recording/restful/user-guides/http-basic-auth)。',
                    scheme: 'basic',
                    type: 'http',
                  },
                },
              },
              security: [
                {
                  'Basic Auth': [],
                },
              ],
              paths: {
                '/v2/projects/{appid}/join': {
                  post: {
                    operationId: 'start-agent',
                    parameters: [
                      {
                        description:
                          '鉴权凭证。支持 RTC Token 或 HTTP 基本认证。',
                        in: 'header',
                        name: 'Authorization',
                        required: true,
                        schema: {
                          type: 'string',
                        },
                      },
                      {
                        description: '项目的 App ID。',
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
                              name: {
                                description: '智能体名称。',
                                type: 'string',
                              },
                            },
                            required: ['name'],
                            type: 'object',
                          },
                        },
                      },
                    },
                    responses: {
                      '200': {
                        description: 'OK',
                        content: {
                          'application/json': {
                            schema: {
                              properties: {
                                agent_id: {
                                  description: '智能体 ID。',
                                  type: 'string',
                                },
                              },
                              type: 'object',
                            },
                          },
                        },
                      },
                    },
                    summary: '启动智能体',
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: '路径参数' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '鉴权' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Basic Auth' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/客户 ID 和客户密钥/)).not.toBeInTheDocument();
    const headerSection = screen
      .getByRole('heading', { name: '请求 Header' })
      .closest('section') as HTMLElement;
    expect(
      within(headerSection).getByText('Authorization'),
    ).toBeInTheDocument();
    expect(
      within(headerSection).getByText(/支持 RTC Token/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '请求 Body' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '响应 Body' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Header Parameters' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Request Body' }),
    ).not.toBeInTheDocument();
  });

  it('renders OpenAPI blockquote descriptions as localized note callouts in zh-CN', async () => {
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
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
                    operationId: 'start-agent',
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              agent_rtc_uid: {
                                description:
                                  '智能体在 RTC 频道内的用户 ID。\n> 同一 `channel` 内的用户 ID 不可重复，否则智能体加入频道会失败。',
                                type: 'string',
                              },
                              allowed_tools: {
                                description:
                                  '工具允许列表。\n> `allowed_tools` 字段生效规则:\n> - 不填写 `allowed_tools` 字段：所有工具都生效\n> - 填写为 `[]`：所有工具不生效',
                                type: 'array',
                                items: {
                                  type: 'string',
                                },
                              },
                              greeting_audio_url: {
                                description:
                                  '问候语音频地址。\n>- 配置 `greeting_audio_url` 时，必须同时配置 `greeting_message` 用于异常回退。\n>- 下载失败时，系统会自动使用 `greeting_message` 播报。',
                                type: 'string',
                              },
                              enable_string_uid: {
                                description:
                                  '是否启用 String UID。\n> 同一频道内，Int 型和 String 型的用户 ID 不可混用。更多信息请参考[如何使用 String UID](https://example.com/string-uid)。',
                                type: 'boolean',
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
                    summary: '启动智能体',
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    expect(await screen.findAllByText('注意')).toHaveLength(4);
    const channelCode = screen.getAllByText('channel').at(0);
    expect(channelCode?.tagName).toBe('CODE');
    const channelNote = screen.getByText((_content, node) =>
      Boolean(
        node?.textContent ===
          '同一 channel 内的用户 ID 不可重复，否则智能体加入频道会失败。',
      ),
    );
    expect(
      channelNote.closest('.openapi-markdown-blockquote'),
    ).toBeInTheDocument();
    const allowedToolsRule = screen.getByText((_content, node) =>
      Boolean(
        node?.textContent === '不填写 allowed_tools 字段：所有工具都生效',
      ),
    );
    expect(allowedToolsRule.tagName).toBe('LI');
    expect(
      allowedToolsRule.closest('.openapi-markdown-blockquote'),
    ).toBeInTheDocument();
    const greetingRule = screen.getByText((_content, node) =>
      Boolean(
        node?.tagName === 'LI' &&
          node.textContent?.includes('配置 greeting_audio_url 时') &&
          node.textContent?.includes('greeting_message 用于异常回退'),
      ),
    );
    expect(greetingRule.tagName).toBe('LI');
    expect(
      greetingRule.closest('.openapi-markdown-blockquote'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '如何使用 String UID' }),
    ).toHaveAttribute('href', 'https://example.com/string-uid');
  });

  it('keeps OpenAPI blockquote descriptions as blockquotes outside zh-CN', async () => {
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
                    operationId: 'start-agent',
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              agent_rtc_uid: {
                                description:
                                  'Agent user ID.\n> User IDs must be unique in the same `channel`.',
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
                    summary: 'Start agent',
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    const blockquoteText = await screen.findByText('User IDs must be unique', {
      exact: false,
    });
    expect(blockquoteText.closest('blockquote')).toBeInTheDocument();
    expect(screen.queryByText('Note')).not.toBeInTheDocument();
    expect(
      blockquoteText.closest('.openapi-markdown-blockquote'),
    ).not.toBeInTheDocument();
  });

  it('omits unannotated scalar array item rows from schema rendering', async () => {
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
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
                    operationId: 'start-agent',
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              remote_rtc_uids: {
                                description: '智能体订阅的用户 ID 列表。',
                                items: {
                                  type: 'string',
                                },
                                type: 'array',
                              },
                              tools: {
                                items: {
                                  properties: {
                                    name: {
                                      type: 'string',
                                    },
                                  },
                                  type: 'object',
                                },
                                type: 'array',
                              },
                            },
                            required: ['remote_rtc_uids'],
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
                    summary: '启动智能体',
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    expect(await screen.findByText('remote_rtc_uids')).toBeInTheDocument();
    expect(
      document.getElementById('request-body-remote-rtc-uids-items'),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '展开 tools 属性' }));
    expect(
      document.getElementById('request-body-tools-items'),
    ).not.toBeInTheDocument();
    expect(
      document.getElementById('request-body-tools-items-name'),
    ).toBeInTheDocument();
  });

  it('keeps array item wrapper rows outside zh-CN', async () => {
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
                    operationId: 'start-agent',
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              tools: {
                                items: {
                                  properties: {
                                    name: {
                                      type: 'string',
                                    },
                                  },
                                  type: 'object',
                                },
                                type: 'array',
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
                    summary: 'Start agent',
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    expect(await screen.findByText('tools')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Expand tools properties' }),
    );
    expect(
      document.getElementById('request-body-tools-items'),
    ).toBeInTheDocument();
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

    await screen.findByRole('heading', { name: 'Request Body' });
    const schemaTreeEl = document.querySelector(
      '.openapi-schema-tree',
    ) as HTMLElement;
    expect(
      within(schemaTreeEl).getByRole('button', {
        name: 'Collapse all Request Body schema fields',
      }),
    ).toBeVisible();
    fireEvent.click(
      within(schemaTreeEl).getByRole('button', {
        name: 'Expand llm properties',
      }),
    );

    const channelField = screen.getByText('channel');

    expect(channelField).toHaveClass('font-bold');

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
      .closest('[style]');
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
    const schemaTreeElement = document.querySelector('.openapi-schema-tree');

    expect(schemaTreeElement).toBeInstanceOf(HTMLElement);
    fireEvent.click(
      within(schemaTreeElement as HTMLElement).getByRole('button', {
        name: 'Expand all Response schema fields',
      }),
    );
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
    expect(responseBodyHeading).toHaveClass('font-semibold', 'text-2xl');
    expect(document.querySelector('[data-openapi-responses]')).toHaveAttribute(
      'id',
      'response-body',
    );
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
            } as OpenApiOperationItem,
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
        locale="zh-CN"
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

    expect(
      await screen.findByRole('heading', { name: '响应 Body' }),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-openapi-responses]')).toBeNull();
    expect(
      screen.queryByRole('heading', { name: 'Response schema' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '响应 Schema' }),
    ).not.toBeInTheDocument();
    for (const button of screen.getAllByRole('button', {
      name: /^(200|401)$/,
    })) {
      fireEvent.click(button);
    }
    fireEvent.click(
      screen.getByRole('button', {
        name: '展开全部 响应 Body 字段',
      }),
    );
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

  it('sets capped schema depth indentation variables on nested response rows', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'get',
              path: '/v1/projects/{appId}/agents/{agentId}',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Conversational AI API',
              },
              openapi: '3.2.0',
              paths: {
                '/v1/projects/{appId}/agents/{agentId}': {
                  get: {
                    operationId: 'get-agent',
                    responses: {
                      '200': {
                        content: {
                          'application/json': {
                            schema: {
                              properties: {
                                data: {
                                  properties: {
                                    agent: {
                                      properties: {
                                        voice: {
                                          type: 'string',
                                        },
                                      },
                                      type: 'object',
                                    },
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
                    summary: 'Get agent',
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    await screen.findByRole('heading', { name: 'Response Body' });
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Expand all Response schema fields',
      }),
    );

    const expectResponseSchemaRowIndent = (
      anchorId: string,
      desktopIndent: string,
      mobileIndent: string,
    ) => {
      const row = document.getElementById(anchorId);
      const wrapper = row?.closest('.openapi-schema-depth') as HTMLElement;

      expect(row).toBeInstanceOf(HTMLElement);
      expect(wrapper).toBeInstanceOf(HTMLElement);
      expect(
        wrapper.style.getPropertyValue('--openapi-schema-indent-desktop'),
      ).toBe(desktopIndent);
      expect(
        wrapper.style.getPropertyValue('--openapi-schema-indent-mobile'),
      ).toBe(mobileIndent);
      expect(
        wrapper.querySelectorAll('.openapi-schema-depth-guide'),
      ).toHaveLength(
        mobileIndent === '0px' ? 0 : mobileIndent === '16px' ? 1 : 2,
      );
    };

    expectResponseSchemaRowIndent('responses-200-data', '0px', '0px');
    expectResponseSchemaRowIndent('responses-200-data-agent', '20px', '16px');
    expectResponseSchemaRowIndent(
      'responses-200-data-agent-voice',
      '40px',
      '32px',
    );
  });

  it('keeps English response schemas inside the response body accordion', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'get',
              path: '/v1/agents/{agentId}',
            },
          ],
          payload: {
            bundled: {
              info: {
                title: 'Conversational AI API',
              },
              openapi: '3.2.0',
              paths: {
                '/v1/agents/{agentId}': {
                  get: {
                    operationId: 'get-agent',
                    responses: {
                      '200': {
                        content: {
                          'application/json': {
                            schema: {
                              properties: {
                                agent_id: {
                                  description: 'Agent ID.',
                                  type: 'string',
                                },
                              },
                              type: 'object',
                            },
                          },
                        },
                        description: 'OK',
                      },
                    },
                    summary: 'Get agent',
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: 'Response Body' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Response schema' }),
    ).not.toBeInTheDocument();
    expect(
      document.getElementById('responses-200-agent-id'),
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
    for (const button of screen.getAllByRole('button', {
      name: /^Expand all .* schema fields$/,
    })) {
      fireEvent.click(button);
    }

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

  it('shows parameter descriptions without any collapse control', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [{ method: 'post', path: '/v2/projects/{appid}/join' }],
          payload: {
            bundled: {
              info: { title: 'Conversational AI API' },
              openapi: '3.2.0',
              paths: {
                '/v2/projects/{appid}/join': {
                  post: {
                    operationId: 'join',
                    parameters: [
                      {
                        description: 'The App ID used by this request.',
                        in: 'path',
                        name: 'appid',
                        required: true,
                        schema: { type: 'string' },
                      },
                    ],
                    responses: { '200': { description: 'OK' } },
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    const pathSection = (
      await screen.findByRole('heading', { name: 'Path Parameters' })
    ).closest('section') as HTMLElement;

    expect(
      within(pathSection).getByText('The App ID used by this request.'),
    ).toBeVisible();
    expect(
      within(pathSection).getByText('appid').closest('details'),
    ).toBeNull();
    expect(
      within(pathSection).queryByRole('button', {
        name: /Expand all|Collapse all/,
      }),
    ).not.toBeInTheDocument();
  });

  it('renders all parameter locations through the shared field row contract', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [{ method: 'get', path: '/v1/items/{itemId}' }],
          payload: {
            bundled: {
              info: { title: 'Items API' },
              openapi: '3.2.0',
              paths: {
                '/v1/items/{itemId}': {
                  get: {
                    operationId: 'get-item',
                    parameters: [
                      {
                        description: 'The item identifier.',
                        in: 'path',
                        name: 'itemId',
                        required: true,
                        schema: { type: 'string' },
                      },
                      {
                        description: 'Filter by item state.',
                        in: 'query',
                        name: 'state',
                        required: false,
                        schema: { type: 'string' },
                      },
                      {
                        description: 'Request trace identifier.',
                        in: 'header',
                        name: 'X-Trace-ID',
                        required: false,
                        deprecated: true,
                        schema: { type: 'string' },
                      },
                      {
                        description: 'Session cookie.',
                        in: 'cookie',
                        name: 'session',
                        required: true,
                        schema: { type: 'string' },
                      },
                    ],
                    responses: {
                      '200': {
                        description: 'OK',
                        headers: {
                          'X-Request-ID': {
                            description: 'Response trace identifier.',
                            deprecated: true,
                            schema: { example: 'response-123', type: 'string' },
                            'x-docs-callouts': [
                              {
                                markdown: 'Keep this value for support.',
                                title: 'Note',
                                type: 'info',
                              },
                            ],
                          },
                        },
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

    const pathSection = (
      await screen.findByRole('heading', { name: 'Path Parameters' })
    ).closest('section') as HTMLElement;
    const querySection = screen
      .getByRole('heading', { name: 'Query Parameters' })
      .closest('section') as HTMLElement;
    const headerSection = screen
      .getByRole('heading', { name: 'Header Parameters' })
      .closest('section') as HTMLElement;
    const cookieSection = screen
      .getByRole('heading', { name: 'Cookie Parameters' })
      .closest('section') as HTMLElement;

    const pathRow = within(pathSection)
      .getByText('itemId')
      .closest('.openapi-field-row') as HTMLElement;
    const queryRow = within(querySection)
      .getByText('state')
      .closest('.openapi-field-row') as HTMLElement;
    expect(within(pathRow).getByText('required')).toBeInTheDocument();
    expect(pathRow).not.toHaveTextContent('*');
    expect(within(queryRow).getByText('optional')).toBeInTheDocument();
    expect(queryRow).not.toHaveTextContent('?');
    expect(
      within(pathRow)
        .getByText('The item identifier.')
        .closest('.openapi-field-details'),
    ).toBeInTheDocument();
    expect(pathRow.querySelector('.openapi-field-main')).toContainElement(
      within(pathRow).getByText('itemId'),
    );
    expect(within(headerSection).getByText('X-Trace-ID')).toBeInTheDocument();
    expect(within(cookieSection).getByText('session')).toBeInTheDocument();

    const headerField = within(headerSection).getByText('X-Trace-ID');
    const headerRow = headerField.closest('.openapi-field-row');
    expect(headerRow).not.toBeNull();
    expect(
      within(headerRow as HTMLElement).getByText('optional'),
    ).toBeInTheDocument();
    expect(
      within(headerRow as HTMLElement).getByText('Deprecated'),
    ).toBeInTheDocument();
    expect(headerRow).not.toHaveTextContent('*');
    expect(headerRow).not.toHaveTextContent('?');
    expect(
      within(headerRow as HTMLElement).queryByRole('button', {
        name: /Expand|Collapse/,
      }),
    ).not.toBeInTheDocument();
    const headerAnchor = headerRow?.querySelector('.openapi-field-anchor');
    expect(headerAnchor).toHaveAttribute(
      'href',
      '#header-parameters-x-trace-id',
    );
    expect(headerAnchor).toHaveAttribute(
      'aria-label',
      'Copy link to header-parameters-x-trace-id',
    );

    const cookieField = within(cookieSection).getByText('session');
    const cookieRow = cookieField.closest('.openapi-field-row');
    expect(cookieRow).not.toBeNull();
    expect(
      within(cookieRow as HTMLElement).getByText('required'),
    ).toBeInTheDocument();
    expect(cookieRow).not.toHaveTextContent('*');
    expect(cookieRow).not.toHaveTextContent('?');
    expect(
      within(cookieRow as HTMLElement).queryByText('Deprecated'),
    ).not.toBeInTheDocument();
    expect(
      within(cookieRow as HTMLElement).queryByRole('button', {
        name: /Expand|Collapse/,
      }),
    ).not.toBeInTheDocument();
    const cookieAnchor = cookieRow?.querySelector('.openapi-field-anchor');
    expect(cookieAnchor).toHaveAttribute('href', '#cookie-parameters-session');
    expect(cookieAnchor).toHaveAttribute(
      'aria-label',
      'Copy link to cookie-parameters-session',
    );

    const responseSection = screen
      .getByRole('heading', { name: 'Response Headers' })
      .closest('section') as HTMLElement;
    const responseRow = within(responseSection)
      .getByText('X-Request-ID')
      .closest('.openapi-field-row') as HTMLElement;
    expect(within(responseRow).getByText('string')).toBeInTheDocument();
    expect(
      within(responseRow).getByText('Response trace identifier.'),
    ).toBeInTheDocument();
    expect(within(responseRow).queryByText('Status')).not.toBeInTheDocument();
    expect(within(responseRow).getByText('Example')).toBeInTheDocument();
    expect(within(responseRow).getByText('response-123')).toBeInTheDocument();
    expect(within(responseRow).getByText('Note')).toBeInTheDocument();
    expect(within(responseRow).getByText('Deprecated')).toBeInTheDocument();
    expect(within(responseRow).queryByText('required')).not.toBeInTheDocument();
    expect(within(responseRow).queryByText('optional')).not.toBeInTheDocument();
    expect(
      within(responseRow).getByRole('link', {
        name: 'Copy link to response-headers-200-x-request-id',
      }),
    ).toHaveAttribute('href', '#response-headers-200-x-request-id');
    for (const row of [pathRow, queryRow]) {
      expect(within(row).queryByRole('button')).not.toBeInTheDocument();
    }
  });

  it('localizes shared parameter requiredness labels in zh-CN', async () => {
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [{ method: 'get', path: '/v1/items/{itemId}' }],
          payload: {
            bundled: {
              info: { title: 'Items API' },
              openapi: '3.2.0',
              paths: {
                '/v1/items/{itemId}': {
                  get: {
                    parameters: [
                      {
                        in: 'path',
                        name: 'itemId',
                        required: true,
                        schema: { type: 'string' },
                      },
                      {
                        in: 'query',
                        name: 'state',
                        required: false,
                        schema: { type: 'string' },
                      },
                    ],
                    responses: { '200': { description: 'OK' } },
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    const pathSection = (
      await screen.findByRole('heading', { name: '路径参数' })
    ).closest('section') as HTMLElement;
    const querySection = screen
      .getByRole('heading', { name: '查询参数' })
      .closest('section') as HTMLElement;
    expect(within(pathSection).getByText('必填')).toBeInTheDocument();
    expect(within(querySection).getByText('可选')).toBeInTheDocument();
  });

  async function renderNestedSchema() {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [{ method: 'post', path: '/v2/projects/{appid}/join' }],
          payload: {
            bundled: {
              info: { title: 'Conversational AI API' },
              openapi: '3.2.0',
              paths: {
                '/v2/projects/{appid}/join': {
                  post: {
                    operationId: 'join',
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              name: {
                                description: 'Unique agent name.',
                                type: 'string',
                              },
                              config: {
                                description: 'Agent runtime settings.',
                                properties: {
                                  idleTimeout: {
                                    description: 'Idle timeout in seconds.',
                                    type: 'integer',
                                  },
                                },
                                type: 'object',
                              },
                              advanced: {
                                properties: {
                                  tracing: { type: 'boolean' },
                                },
                                type: 'object',
                              },
                            },
                            type: 'object',
                          },
                        },
                      },
                    },
                    responses: { '200': { description: 'OK' } },
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    await screen.findByRole('heading', { name: 'Request Body' });
    const tree = document.querySelector('.openapi-schema-tree') as HTMLElement;
    return within(tree);
  }

  it('shows top-level schema descriptions but hides nested children until expanded', async () => {
    const tree = await renderNestedSchema();

    expect(tree.getByText('name')).toBeVisible();
    expect(tree.getByText('Unique agent name.')).toBeVisible();
    expect(tree.getByText('config')).toBeVisible();
    expect(tree.getByText('Agent runtime settings.')).toBeVisible();

    expect(tree.queryByText('idleTimeout')).not.toBeInTheDocument();

    expect(
      tree.queryByRole('button', { name: 'Expand name properties' }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      tree.getByRole('button', { name: 'Expand config properties' }),
    );

    expect(tree.getByText('idleTimeout')).toBeVisible();
    expect(tree.getByText('Idle timeout in seconds.')).toBeVisible();

    fireEvent.click(
      tree.getByRole('button', { name: 'Collapse config properties' }),
    );
    expect(tree.queryByText('idleTimeout')).not.toBeInTheDocument();
  });

  it('renders leaf schema rows without text placeholders in the property-name flow', async () => {
    const tree = await renderNestedSchema();
    const nameField = tree.getByText('name');
    const row = nameField.closest('.openapi-field-row') as HTMLElement;
    const gutter = row.querySelector('.openapi-field-control-gutter');

    expect(row.textContent).not.toContain('\u00a0');
    expect(row).not.toHaveAttribute('data-markdown-ignore');
    expect(gutter).toHaveClass('openapi-field-control-gutter');
    expect(gutter?.textContent).toBe('');
    expect(gutter?.querySelector('button')).toBeNull();
    expect(row).toContainElement(nameField);
  });

  it('uses the shared field row control for expandable and leaf schema rows', async () => {
    const tree = await renderNestedSchema();

    const getSchemaRowControl = (name: string) => {
      const field = tree.getByText(name);
      const row = field.closest('.openapi-field-row') as HTMLElement;
      const gutter = row.querySelector('.openapi-field-control-gutter');

      return { field, gutter, row };
    };

    const leafRow = getSchemaRowControl('name');
    const expandableRow = getSchemaRowControl('config');

    for (const row of [leafRow, expandableRow]) {
      expect(row.gutter).toHaveClass('openapi-field-control-gutter');
      expect(row.row).toContainElement(row.field);
    }

    expect(
      within(expandableRow.row).getByRole('button', {
        name: 'Expand config properties',
      }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(leafRow.gutter?.querySelector('button')).toBeNull();
  });

  it('expands and collapses every nested field with the schema-wide control', async () => {
    const tree = await renderNestedSchema();

    expect(tree.queryByText('idleTimeout')).not.toBeInTheDocument();
    fireEvent.click(
      tree.getByRole('button', {
        name: 'Expand all Request Body schema fields',
      }),
    );
    expect(tree.getByText('idleTimeout')).toBeVisible();

    fireEvent.click(
      tree.getByRole('button', {
        name: 'Collapse all Request Body schema fields',
      }),
    );
    expect(tree.queryByText('idleTimeout')).not.toBeInTheDocument();
    expect(tree.getByText('name')).toBeVisible();
  });

  it('expands nested ancestors when linking to a nested schema field', async () => {
    window.history.replaceState(null, '', '#request-body-config-idle-timeout');

    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [{ method: 'post', path: '/v2/projects/{appid}/join' }],
          payload: {
            bundled: {
              info: { title: 'Conversational AI API' },
              openapi: '3.2.0',
              paths: {
                '/v2/projects/{appid}/join': {
                  post: {
                    operationId: 'join',
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              config: {
                                description: 'Agent runtime settings.',
                                properties: {
                                  idleTimeout: {
                                    description: 'Idle timeout in seconds.',
                                    type: 'integer',
                                  },
                                },
                                type: 'object',
                              },
                            },
                            type: 'object',
                          },
                        },
                      },
                    },
                    responses: { '200': { description: 'OK' } },
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    await screen.findByRole('heading', { name: 'Request Body' });
    await act(async () => {
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
    });

    await waitFor(() => {
      expect(screen.getByText('idleTimeout')).toBeVisible();
    });
    expect(screen.getByText('Idle timeout in seconds.')).toBeVisible();

    window.history.replaceState(null, '', '/');
  });
});
