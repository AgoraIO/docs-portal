import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { load } from 'cheerio';
import type { OpenAPIPageProps } from 'fumadocs-openapi/ui';
import { createInstance } from 'i18next';
import * as yaml from 'js-yaml';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import { resources } from '@/lib/i18n/resources';
import { createLocalizedOpenApiSource } from '@/lib/openapi/fumadocs-source.server';
import { FumadocsOpenApiContent } from './FumadocsOpenApiContent.zh-cn';

type Document = Extract<
  OpenAPIPageProps,
  { payload: unknown }
>['payload']['bundled'];
type OpenApiOperationItem = NonNullable<OpenAPIPageProps['operations']>[number];

function makeMinimalOpenApiPageProps(
  method: string,
  description?: string,
): OpenAPIPageProps {
  const path = `/method-${method.toLowerCase()}`;

  return {
    operations: [{ method, path } as OpenApiOperationItem],
    payload: {
      bundled: {
        info: { title: 'Methods API' },
        openapi: '3.2.0',
        paths: {
          [path]: {
            [method.toLowerCase()]: {
              parameters: description
                ? [
                    {
                      in: 'query',
                      name: 'docs',
                      schema: { type: 'string' },
                      description,
                    },
                  ]
                : undefined,
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      } as unknown as Document,
    },
  };
}

function makeSectionHeadingPageProps(): OpenAPIPageProps {
  const path = '/headings/{pathId}';

  return {
    operations: [{ method: 'post', path } as OpenApiOperationItem],
    payload: {
      bundled: {
        info: { title: 'Section Heading API' },
        openapi: '3.2.0',
        paths: {
          [path]: {
            post: {
              parameters: [
                {
                  in: 'path',
                  name: 'pathId',
                  required: true,
                  schema: { type: 'string' },
                },
                {
                  in: 'query',
                  name: 'queryLimit',
                  deprecated: true,
                  schema: { type: 'integer' },
                },
                {
                  in: 'header',
                  name: 'traceId',
                  schema: { type: 'string' },
                },
                {
                  in: 'cookie',
                  name: 'sessionId',
                  schema: { type: 'string' },
                },
              ],
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      properties: {
                        channel: { type: 'string' },
                        provider: {
                          properties: { enabled: { type: 'boolean' } },
                          type: 'object',
                        },
                      },
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
                        properties: { ok: { type: 'boolean' } },
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
  };
}

function getResponseTab(status: string) {
  return within(
    document.querySelector('[data-openapi-responses]') as HTMLElement,
  ).getByRole('tab', { name: status });
}

describe('FumadocsOpenApiContent', () => {
  it('marks external and new-window Markdown links inside OpenAPI descriptions', async () => {
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={makeMinimalOpenApiPageProps(
          'get',
          '[External docs](https://example.com/docs) [Same-window docs](/zh-CN/introduction) <a href="/zh-CN/reference" target="_blank">New-window docs</a>',
        )}
      />,
    );
    for (const name of ['External docs', 'New-window docs']) {
      const link = await screen.findByRole('link', { name });
      expect(link.querySelectorAll('.docs-external-link-icon')).toHaveLength(1);
    }
    expect(
      screen
        .getByRole('link', { name: 'Same-window docs' })
        .querySelector('.docs-external-link-icon'),
    ).toBeNull();
    expect(
      screen.getByRole('link', { name: 'New-window docs' }),
    ).toHaveAttribute('target', '_blank');
  });

  it('preserves media-pull lists, superscripts and nested protobuf code frames', async () => {
    const document = yaml.load(
      await readFile(
        'content/openapi/media-pull/media-pull.zh-CN.yaml',
        'utf8',
      ),
    ) as Document;
    const $ = load(
      renderToStaticMarkup(
        <FumadocsOpenApiContent
          locale="zh-CN"
          pageProps={{
            operations: [
              {
                method: 'post',
                path: '/{region}/v1/projects/{appId}/cloud-player/players',
              },
            ],
            payload: { bundled: document },
          }}
        />,
      ),
    );
    const region = $('p')
      .filter((_, node) => $(node).text().startsWith('云端播放器的区域'))
      .parent();
    expect(region.find('li').length).toBe(4);
    expect(
      region
        .find('li')
        .map((_, node) => $(node).find('code').first().text())
        .get(),
    ).toEqual(['cn', 'ap', 'na', 'eu']);
    const uid = $('.openapi-schema-field-row')
      .filter((_, node) => $(node).find('code').first().text() === 'uid')
      .first();
    expect(uid.find('sup').text()).toBe('32');
    expect(uid.find('.openapi-markdown-blockquote li')).toHaveLength(2);
    expect(uid.text()).not.toContain('> -');
    const proto = $('pre').filter((_, node) =>
      $(node).text().includes('message PositionData'),
    );
    expect(proto.closest('figure').attr('data-line-numbers')).toBeDefined();
    expect(proto.text()).toContain('int32 duration = 1;');
    expect(proto.text()).toContain('int32 position = 2;');
    expect(proto.text()).toContain('int32 uid = 3;');
  });

  it('keeps authentication, optional headers and the authored media-pull request in every generated client', async () => {
    const document = yaml.load(
      await readFile(
        'content/openapi/media-pull/media-pull.zh-CN.yaml',
        'utf8',
      ),
    ) as Document;
    const route = '/{region}/v1/projects/{appId}/cloud-player/players';
    const { container } = render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [{ method: 'post', path: route }],
          payload: { bundled: document },
        }}
      />,
    );
    const request = container.querySelector(
      '.openapi-request-examples',
    ) as HTMLElement;
    for (const client of ['cURL', 'Python/Requests', 'Node.js/Fetch']) {
      fireEvent.click(
        within(request).getByRole('combobox', {
          name: /代码语言|Code language/i,
        }),
      );
      const option = screen.getByRole('option', { name: client });
      fireEvent.pointerDown(option, { pointerType: 'mouse' });
      fireEvent.click(option, { detail: 1 });
      await waitFor(() => {
        const code = request.querySelector('pre')?.textContent ?? '';
        expect(code).toContain('Authorization');
        expect(code).toContain('Basic <credentials>');
        expect(code).toContain('X-Request-ID');
        expect(code.match(/Content-Type/g)).toHaveLength(1);
        expect(code).toContain('application/json');
        expect(code).not.toContain('Content-Type: string');
        expect(code).toContain('class32');
        expect(code).toContain('2a78446***');
      });
    }
  });

  it('uses matching tab frames without an inset response card', () => {
    const $ = load(
      renderToStaticMarkup(
        <FumadocsOpenApiContent pageProps={makeSectionHeadingPageProps()} />,
      ),
    );
    const responseSection = $('.openapi-response-example');
    expect(responseSection.hasClass('border-t-0')).toBe(true);
    expect(responseSection.hasClass('pt-3')).toBe(true);

    for (const selector of [
      '.openapi-request-examples',
      '.openapi-response-example',
    ]) {
      const frame = $(selector).find('figure.shiki').first();
      expect(frame.attr('data-line-numbers')).toBeDefined();
      expect(frame.hasClass('my-4')).toBe(false);
      expect(frame.find('.fd-scroll-container[role="region"]')).toHaveLength(1);
    }
  });

  it('uses the documentation code-block frame for request and response examples', () => {
    const $ = load(
      renderToStaticMarkup(
        <FumadocsOpenApiContent pageProps={makeSectionHeadingPageProps()} />,
      ),
    );

    for (const selector of [
      '.openapi-request-examples',
      '.openapi-response-example',
    ]) {
      const frame = $(selector).find('figure.shiki').first();
      expect(frame.attr('data-line-numbers')).toBeDefined();
      expect(frame.hasClass('bg-fd-card')).toBe(true);
      expect(frame.find('.fd-scroll-container[role="region"]')).toHaveLength(1);
      expect(frame.find('button[aria-label="Copy Text"]')).toHaveLength(1);
    }
  });

  it('generates a multiline cURL command for the Chinese host-list endpoint', async () => {
    const document = yaml.load(
      await readFile(
        'content/openapi/rtc/channel-management.zh-CN.yaml',
        'utf8',
      ),
    ) as Document;
    const $ = load(
      renderToStaticMarkup(
        <FumadocsOpenApiContent
          locale="zh-CN"
          pageProps={{
            operations: [
              {
                method: 'get',
                path: '/dev/v1/channel/user/{appid}/{channelName}/hosts_only',
              },
            ],
            payload: { bundled: document },
          }}
        />,
      ),
    );
    const command = $('.openapi-request-examples pre code').first().text();
    expect(command.split('\n')[0]).toBe('curl --request GET \\');
    const urlLine = command.split('\n')[1].replace(/ \\$/, '');
    expect(urlLine).toMatch(
      /^ {2}--url ["']https:\/\/[^/]+\/dev\/v1\/channel\/user\/.*\/hosts_only["']$/,
    );
  });

  it('keeps the turns endpoint and legacy notice in the overview above both panels', async () => {
    const bundled = yaml.load(
      await readFile(
        'content/openapi/conversational-ai/rest-api.zh-CN.yaml',
        'utf8',
      ),
    ) as Document;
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [
            {
              method: 'get',
              path: '/v2/projects/{appid}/agents/{agentId}/turns',
            },
          ],
          payload: { bundled },
        }}
      />,
    );
    const endpoint = screen.getByRole('button', { name: '复制接口 URL' });
    expect(endpoint.closest('[data-openapi-operation-panel]')).toBeNull();
    const overview = endpoint.closest(
      '[data-openapi-operation-overview]',
    ) as HTMLElement;
    expect(overview).toBeInTheDocument();
    expect(within(overview).getByText('注意')).toBeInTheDocument();
    expect(
      within(overview).getByText('自 v2.7 起', { exact: false }),
    ).toBeInTheDocument();
    expect(
      overview.querySelector('svg.lucide-triangle-alert'),
    ).toBeInTheDocument();
  });

  it('groups cloud-transcoding response headers and body under the response section for each status', async () => {
    const source = yaml.load(
      await readFile(
        'content/openapi/cloud-transcoding/cloud-transcoding.zh-CN.yaml',
        'utf8',
      ),
    ) as Document;
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [
            {
              method: 'post',
              path: '/v1/projects/{appId}/rtsc/cloud-transcoder/tasks',
            },
          ],
          payload: { bundled: source },
        }}
      />,
    );
    const heading = await screen.findByRole('heading', {
      name: '响应',
      level: 2,
    });
    expect(heading).toHaveAttribute('id', 'response-body');
    for (const status of ['2XX', '非 2XX']) {
      const trigger = getResponseTab(status);
      if (trigger.getAttribute('aria-selected') === 'false')
        fireEvent.mouseDown(trigger);
      const panel = document.getElementById(
        trigger.getAttribute('aria-controls') ?? '',
      ) as HTMLElement;
      const headers = within(panel).getByRole('heading', {
        name: '响应 Header',
        level: 3,
      });
      const body = within(panel).getByRole('heading', {
        name: '响应 Body',
        level: 3,
      });
      expect(
        headers.compareDocumentPosition(body) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      const name = status === '2XX' ? 'taskId' : 'message';
      const field = Array.from(
        panel.querySelectorAll('.openapi-schema-field-row'),
      ).find((row) => row.querySelector('code')?.textContent === name);
      expect(field).toBeDefined();
      expect(
        body.compareDocumentPosition(field as HTMLElement) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it('preserves the authored non-200 response label in the speech-to-text body and examples', async () => {
    const document = yaml.load(
      await readFile('content/openapi/speech-to-text/v7.zh-CN.yaml', 'utf8'),
    ) as Document;
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [
            {
              method: 'post',
              path: '/api/speech-to-text/v1/projects/{appid}/join',
            },
          ],
          payload: { bundled: document },
        }}
      />,
    );

    expect(getResponseTab('非 200')).toBeInTheDocument();
    const examples = globalThis.document.querySelector(
      '.openapi-response-example',
    ) as HTMLElement;
    expect(
      within(examples).getByRole('tab', { name: '非 200' }),
    ).toBeInTheDocument();
  });

  it('preserves legacy RTC error guidance without added fields or examples', async () => {
    const document = yaml.load(
      await readFile(
        'content/openapi/rtc/channel-management.zh-CN.yaml',
        'utf8',
      ),
    ) as Document;
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [{ method: 'get', path: '/dev/v1/kicking-rule' }],
          payload: { bundled: document },
        }}
      />,
    );
    const trigger = getResponseTab('非 200');
    fireEvent.mouseDown(trigger);
    const panel = globalThis.document.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    ) as HTMLElement;
    expect(panel).toHaveTextContent('如果状态码不为 200，则请求失败。');
    expect(
      within(panel).getByRole('link', { name: '响应状态码' }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtc/reference/response-code',
    );
    expect(within(panel).queryByText('响应 Body 为空')).not.toBeInTheDocument();
    expect(panel.querySelectorAll('.openapi-schema-field-row')).toHaveLength(0);
    expect(within(panel).queryByText('响应 Body')).toBeNull();
    const examples = globalThis.document.querySelector(
      '.openapi-response-example',
    ) as HTMLElement;
    fireEvent.mouseDown(within(examples).getByRole('tab', { name: '非 200' }));
    await waitFor(() => {
      expect(examples).toHaveTextContent('如果状态码不为 200，则请求失败。');
    });
    expect(
      within(examples).getByRole('link', { name: '响应状态码' }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtc/reference/response-code',
    );
    expect(examples.querySelector('pre')).toBeNull();
    expect(examples).not.toHaveTextContent('invalid appid');
  });

  it('offers both schema-derived response examples for the actual Converter status endpoint', async () => {
    const document = yaml.load(
      await readFile(
        'content/openapi/media-push/media-push.zh-CN.yaml',
        'utf8',
      ),
    ) as Document;
    const { container } = render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [
            {
              method: 'get',
              path: '/{region}/v1/projects/{appId}/rtmp-converters/{converterId}',
            },
          ],
          payload: { bundled: document },
        }}
      />,
    );
    const section = container.querySelector(
      '.openapi-response-example',
    ) as HTMLElement;
    const transcode = await within(section).findByRole('tab', {
      name: '转码推流',
    });
    await waitFor(() =>
      expect(section.querySelector('pre')?.textContent).toContain(
        'transcodeOptions',
      ),
    );
    fireEvent.mouseDown(
      within(section).getByRole('tab', { name: '不转码推流' }),
      { button: 0, ctrlKey: false },
    );
    await waitFor(() => {
      const data = JSON.parse(
        section.querySelector('pre')?.textContent ?? '{}',
      );
      expect(data.converter.rawOptions).toHaveProperty('rtcChannel');
      expect(data.converter).not.toHaveProperty('transcodeOptions');
    });
    fireEvent.mouseDown(transcode, { button: 0, ctrlKey: false });
    await waitFor(() =>
      expect(section.querySelector('pre')?.textContent).toContain(
        'transcodeOptions',
      ),
    );
    expect(
      within(section).getByRole('button', { name: '复制文本' }),
    ).toBeInTheDocument();
  });

  it.each(['oneOf', 'anyOf'])(
    'keeps parent fields and referenced %s branches in separate response samples',
    async (kind) => {
      const document = {
        openapi: '3.2.0',
        info: { title: 'Referenced choices' },
        paths: {
          '/choices': {
            get: {
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Choice' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Choice: {
              type: 'object',
              properties: {
                common: { type: 'string', const: 'shared-value' },
              },
              [kind]: [
                { $ref: '#/components/schemas/Alpha' },
                { $ref: '#/components/schemas/Beta' },
              ],
            },
            Alpha: {
              title: 'Alpha',
              type: 'object',
              properties: { alpha: { type: 'string' } },
            },
            Beta: {
              title: 'Beta',
              type: 'object',
              properties: { beta: { type: 'string' } },
            },
          },
        },
      } as unknown as Document;
      const { container } = render(
        <FumadocsOpenApiContent
          pageProps={{
            operations: [{ method: 'get', path: '/choices' }],
            payload: { bundled: document },
          }}
        />,
      );
      const section = container.querySelector(
        '.openapi-response-example',
      ) as HTMLElement;
      fireEvent.mouseDown(
        await within(section).findByRole('tab', { name: 'Beta' }),
        { button: 0, ctrlKey: false },
      );
      await waitFor(() => {
        const data = JSON.parse(
          section.querySelector('pre')?.textContent ?? '{}',
        );
        expect(data.common).toBe('shared-value');
        expect(data).toHaveProperty('beta');
        expect(data).not.toHaveProperty('alpha');
      });
    },
  );

  it('prefers an authored response example over schema-derived alternative samples', async () => {
    const document = {
      openapi: '3.2.0',
      info: { title: 'Authored example' },
      paths: {
        '/choices': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    example: { authored: 'keep-me' },
                    schema: {
                      oneOf: [
                        {
                          type: 'object',
                          title: 'Alpha',
                          properties: { alpha: { type: 'string' } },
                        },
                        {
                          type: 'object',
                          title: 'Beta',
                          properties: { beta: { type: 'string' } },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    } as unknown as Document;
    const { container } = render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [{ method: 'get', path: '/choices' }],
          payload: { bundled: document },
        }}
      />,
    );
    const section = container.querySelector(
      '.openapi-response-example',
    ) as HTMLElement;
    await waitFor(() =>
      expect(section.querySelector('pre')?.textContent).toContain('keep-me'),
    );
    expect(within(section).queryByRole('tab', { name: 'Alpha' })).toBeNull();
    expect(
      JSON.parse(section.querySelector('pre')?.textContent ?? '{}'),
    ).toEqual({ authored: 'keep-me' });
  });

  it('renders the source explanation without inventing a stop-agent response body', async () => {
    const document = yaml.load(
      await readFile(
        'content/openapi/conversational-ai/rest-api.zh-CN.yaml',
        'utf8',
      ),
    ) as Document;
    const { container } = render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [
            {
              method: 'post',
              path: '/v2/projects/{appid}/agents/{agentId}/leave',
            },
          ],
          payload: { bundled: document },
        }}
      />,
    );
    const section = container.querySelector(
      '.openapi-response-example',
    ) as HTMLElement;
    expect(
      await within(section).findByText(/响应包体为空/),
    ).toBeInTheDocument();
    const explanation = section.querySelector(
      '[data-openapi-response-description]',
    );
    expect(explanation).toHaveClass('px-4', 'py-3.5');
    expect(
      within(section).getByRole('link', { name: '响应状态码' }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/conversational-ai/rest-api/api/response-code',
    );
    expect(within(section).queryByText('未提供响应示例。')).toBeNull();
    expect(section.querySelector('pre')).toBeNull();
  });

  it('matches the legacy Cloud Recording non-200 description in both response panels', async () => {
    const bundled = yaml.load(
      await readFile(
        'content/openapi/cloud-recording/cloud-recording.zh-CN.yaml',
        'utf8',
      ),
    ) as Document;
    const { container } = render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [
            {
              method: 'post',
              path: '/v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/mode/{mode}/start',
            },
          ],
          payload: { bundled },
        }}
      />,
    );
    for (const selector of [
      '[data-openapi-responses]',
      '.openapi-response-example',
    ]) {
      const section = container.querySelector(selector) as HTMLElement;
      fireEvent.mouseDown(
        within(section).getByRole('tab', { name: '非 200' }),
        {
          button: 0,
          ctrlKey: false,
        },
      );
      expect(
        await within(section).findByText(/如果 HTTP 状态码不为/),
      ).toBeVisible();
      expect(
        within(section).getByRole('link', { name: '响应状态码' }),
      ).toHaveAttribute(
        'href',
        '/zh-CN/realtime-media/cloud-recording/reference/response-code',
      );
      expect(within(section).queryByText('响应 Body')).toBeNull();
      expect(section.querySelector('pre')).toBeNull();
      expect(section).not.toHaveTextContent(
        'Invalid authentication credentials',
      );
    }
  });

  it.each([
    ['zh-CN', '未提供响应示例。'],
    ['en', 'No response example provided.'],
  ])(
    'uses source text or a neutral placeholder without inferring an empty body in %s',
    async (locale, label) => {
      const pageProps = makeMinimalOpenApiPageProps('get');
      const bundled = (
        pageProps as Extract<OpenAPIPageProps, { payload: unknown }>
      ).payload.bundled;
      const responses = bundled?.paths?.['/method-get']?.get?.responses;
      if (!responses) throw new Error('Missing fixture responses');
      responses['200'] = { description: '' };
      const { container } = render(
        <FumadocsOpenApiContent locale={locale} pageProps={pageProps} />,
      );
      const section = container.querySelector(
        '.openapi-response-example',
      ) as HTMLElement;
      expect(await within(section).findByText(label)).toBeInTheDocument();
      expect(container).not.toHaveTextContent('响应 Body 为空');
      expect(container).not.toHaveTextContent('Empty response body');
    },
  );

  it('preserves response status selection, named examples, descriptions, and falsy example values', async () => {
    const pageProps = makeMinimalOpenApiPageProps('get');
    const bundled = (
      pageProps as Extract<OpenAPIPageProps, { payload: unknown }>
    ).payload.bundled;
    const response = (bundled?.paths?.['/method-get']?.get?.responses ??
      {}) as Record<string, unknown>;
    response['400'] = {
      description: 'Invalid request',
      content: {
        'application/json': {
          examples: {
            first: {
              summary: 'First example',
              description: 'First response detail.',
              value: { error: 0 },
            },
            second: {
              summary: 'Second example',
              description: 'Second response detail.',
              value: false,
            },
          },
        },
      },
    };
    const { container } = render(
      <FumadocsOpenApiContent pageProps={pageProps} />,
    );
    const section = container.querySelector(
      '.openapi-response-example',
    ) as HTMLElement;
    expect(
      await within(section).findByRole('tab', { name: '200' }),
    ).toBeVisible();
    fireEvent.mouseDown(within(section).getByRole('tab', { name: '400' }), {
      button: 0,
      ctrlKey: false,
    });
    expect(
      await within(section).findByText('First response detail.'),
    ).toBeVisible();
    await waitFor(() =>
      expect(section.querySelector('pre')?.textContent).toContain('"error": 0'),
    );
    fireEvent.click(
      within(section).getByRole('button', { name: 'Second example' }),
    );
    expect(
      await within(section).findByText('Second response detail.'),
    ).toBeVisible();
    await waitFor(() =>
      expect(section.querySelector('pre')?.textContent).toContain('false'),
    );
    expect(
      within(section).getByRole('button', { name: 'Copy Text' }),
    ).toBeVisible();
    fireEvent.mouseDown(within(section).getByRole('tab', { name: '200' }), {
      button: 0,
      ctrlKey: false,
    });
    expect(
      within(section).getByText('No response example provided.'),
    ).toBeVisible();
  });

  it('retains schema-less parameters inherited from paths and referenced from components', () => {
    const project = {
      name: 'project',
      in: 'path',
      required: true,
      description: 'Inherited project parameter.',
    };
    const cursor = {
      name: 'cursor',
      in: 'query',
      description: 'Referenced pagination cursor.',
      example: 'next-cursor',
    };
    const { container } = render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [{ method: 'get', path: '/legacy/{project}' }],
          payload: {
            bundled: {
              openapi: '3.2.0',
              info: { title: 'Legacy parameters', version: '1' },
              components: { parameters: { cursor } },
              paths: {
                '/legacy/{project}': {
                  parameters: [project],
                  get: {
                    parameters: [
                      { $ref: '#/components/parameters/cursor' },
                      {
                        name: 'trace',
                        in: 'header',
                        description: 'Trace identifier.',
                      },
                      {
                        name: 'session',
                        in: 'cookie',
                        description: 'Session identifier.',
                      },
                    ],
                    responses: { '200': { description: 'OK' } },
                  },
                },
              },
            } as Document,
          },
        }}
      />,
    );
    const fields = container.querySelectorAll(
      '.openapi-schema-parameter-fields',
    );
    expect(fields).toHaveLength(4);
    for (const field of fields) {
      expect(
        within(field as HTMLElement).queryByText('unknown', { exact: true }),
      ).not.toBeInTheDocument();
    }
    expect(container).toHaveTextContent('Inherited project parameter.');
    expect(container).toHaveTextContent('Referenced pagination cursor.');
    expect(container).toHaveTextContent('next-cursor');
    expect(container).toHaveTextContent('Trace identifier.');
    expect(container).toHaveTextContent('Session identifier.');
    expect(project).not.toHaveProperty('schema');
    expect(cursor).not.toHaveProperty('schema');
  });

  it('does not invent type labels for untyped RTC user-status parameters', async () => {
    const source = yaml.load(
      await readFile(
        'content/openapi/rtc/channel-management.zh-CN.yaml',
        'utf8',
      ),
    ) as Document;
    const { container } = render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [
            {
              method: 'get',
              path: '/dev/v1/channel/user/property/{appid}/{uid}/{channelName}',
            },
          ],
          payload: { bundled: source },
        }}
      />,
    );
    const rows = Array.from(
      container.querySelectorAll(
        '.openapi-schema-parameter-fields .openapi-schema-field-row',
      ),
    );
    expect(rows.map((row) => row.querySelector('code')?.textContent)).toEqual([
      'appid',
      'uid',
      'channelName',
    ]);
    for (const row of rows) {
      expect(
        within(row as HTMLElement).queryByText('unknown', { exact: true }),
      ).not.toBeInTheDocument();
      expect(within(row as HTMLElement).getByText('必填')).toBeInTheDocument();
    }
    expect(container).toHaveTextContent('请确保使用整型用户 ID');
  });

  it('preserves the schema-less appid parameter in the published RTC channel-list source', async () => {
    const document = yaml.load(
      await readFile(
        'content/openapi/rtc/channel-management.zh-CN.yaml',
        'utf8',
      ),
    ) as Document;
    const { container } = render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [{ method: 'get', path: '/dev/v1/channel/{appid}' }],
          payload: { bundled: document },
        }}
      />,
    );
    const appid = Array.from(
      container.querySelectorAll('.openapi-schema-field-row'),
    ).find((row) => row.querySelector('code')?.textContent === 'appid');
    expect(appid).toBeDefined();
    expect(container).toHaveTextContent('项目的 App ID。可通过以下方式获取');
    expect(container).toHaveTextContent('从声网控制台获取');
    expect(
      container.querySelector(
        'a[href="/zh-CN/api-reference/api-ref/console/list-projects"]',
      ),
    ).toHaveTextContent('获取所有项目信息 API');
  });

  it.each([
    {
      source: 'cloud-recording/cloud-recording.zh-CN.yaml',
      path: '/v1/apps/{appid}/cloud_recording/resourceid/{resourceid}/sid/{sid}/mode/{mode}/update',
      method: 'post' as const,
      heading: '路径参数',
      expectedItem: '对于页面录制模式，只需输入开通了云端录制服务的 App ID。',
    },
    {
      source: 'conversational-ai/rest-api.zh-CN.yaml',
      path: '/v2/projects/{appid}/agents',
      method: 'get' as const,
      heading: '查询参数',
      expectedItem: 'IDLE (0)：空闲状态的智能体。',
    },
  ])(
    'renders valid lists from the migrated $source descriptions',
    async (fixture) => {
      const document = yaml.load(
        await readFile(path.resolve('content/openapi', fixture.source), 'utf8'),
      ) as Document;
      const { container } = render(
        <FumadocsOpenApiContent
          locale="zh-CN"
          pageProps={{
            operations: [{ method: fixture.method, path: fixture.path }],
            payload: { bundled: document },
          }}
        />,
      );
      await screen.findByRole('heading', { name: fixture.heading });
      const items = screen.getAllByText(
        (_text, element) =>
          element?.tagName === 'LI' &&
          element.textContent === fixture.expectedItem,
      );
      for (const item of items) {
        expect(item.closest('li')?.parentElement?.tagName).toBe('UL');
      }
      for (const listItem of container.querySelectorAll('li')) {
        expect(['UL', 'OL', 'MENU']).toContain(listItem.parentElement?.tagName);
      }
    },
  );

  it.each([true, false])(
    'preserves authored authentication names and descriptions: %s',
    async (alternative) => {
      render(
        <FumadocsOpenApiContent
          locale="zh-CN"
          pageProps={{
            operations: [{ method: 'get', path: '/secured' }],
            payload: {
              bundled: {
                openapi: '3.2.0',
                info: { title: 'Security API' },
                components: {
                  securitySchemes: {
                    basic: {
                      type: 'http',
                      scheme: 'basic',
                      description: '**HTTP 基本认证**：使用客户凭证。',
                    },
                    apiKey: {
                      type: 'apiKey',
                      name: 'X-API-Key',
                      in: 'header',
                      description: '**HTTP HMAC 认证**：保留此说明。',
                    },
                  },
                },
                security: alternative
                  ? [{ basic: [] }, { apiKey: [] }]
                  : [{ basic: [], apiKey: [] }],
                paths: {
                  '/secured': {
                    get: { responses: { '200': { description: 'OK' } } },
                  },
                },
              } as unknown as Document,
            },
          }}
        />,
      );
      await screen.findByRole('heading', { name: 'basic' });
      expect(screen.getByRole('heading', { name: 'apiKey' })).toBeVisible();
      expect(
        screen.getByText('HTTP 基本认证', { selector: 'strong' }),
      ).toBeVisible();
      expect(
        screen.getByText('HTTP HMAC 认证', { selector: 'strong' }),
      ).toBeVisible();
      expect(screen.getByText(/：使用客户凭证。/)).toBeVisible();
      expect(screen.getByText(/：保留此说明。/)).toBeVisible();
      expect(
        screen.queryByRole('heading', { name: 'HTTP HMAC 认证' }),
      ).toBeNull();
      expect(screen.queryByText('使用以下任意一种鉴权方式。')).toBeNull();
    },
  );

  it('does not report a failed clipboard write as copied, including after a successful copy', async () => {
    const clipboard = vi
      .fn()
      .mockRejectedValueOnce(new Error('Clipboard denied'))
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Clipboard denied'));
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboard },
    });
    try {
      render(
        <FumadocsOpenApiContent
          pageProps={makeMinimalOpenApiPageProps('post')}
        />,
      );
      const preview = await screen.findByTestId('openapi-code-preview');
      const button = within(preview).getByRole('button', { name: 'Copy Text' });
      const source = preview.querySelector('pre')?.textContent;
      expect(source).toBeTruthy();

      await act(async () => {
        fireEvent.click(button);
      });
      expect(clipboard).toHaveBeenLastCalledWith(source);
      expect(button).toHaveAccessibleName('Copy Text');
      expect(button).not.toHaveAttribute('data-checked');

      await act(async () => {
        fireEvent.click(button);
      });
      expect(button).toHaveAccessibleName('Copied Text');

      await act(async () => {
        fireEvent.click(button);
      });
      expect(clipboard).toHaveBeenCalledTimes(3);
      expect(button).toHaveAccessibleName('Copy Text');
      expect(button).not.toHaveAttribute('data-checked');
    } finally {
      if (original) Object.defineProperty(navigator, 'clipboard', original);
      else Reflect.deleteProperty(navigator, 'clipboard');
    }
  });

  it('preserves complete multiline code in crawler HTML and copies it before and after highlighting', async () => {
    const source = [
      'curl --request POST https://example.com/endpoint \\',
      ...Array.from(
        { length: 45 },
        (_, i) => `  --header 'X-Example-${i}: <value>&' \\`,
      ),
      "  --data '{}'",
    ].join('\n');
    const props: OpenAPIPageProps = {
      operations: [
        { method: 'post', path: '/example' } as OpenApiOperationItem,
      ],
      payload: {
        bundled: {
          info: { title: 'Example' },
          openapi: '3.2.0',
          paths: {
            '/example': {
              post: {
                responses: { '200': { description: 'OK' } },
                'x-codeSamples': [{ lang: 'bash', label: 'curl', source }],
              },
            },
          },
        } as unknown as Document,
      },
    };
    const $ = load(
      renderToStaticMarkup(<FumadocsOpenApiContent pageProps={props} />),
    );
    expect($('pre code').first().text()).toBe(source);
    expect($('pre code').first().text().split('\n')).toHaveLength(47);
    expect($('pre code').first().find('value')).toHaveLength(0);
    expect($('[data-collapsed]')).toHaveLength(0);

    const clipboard = vi.fn().mockResolvedValue(undefined);
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboard },
    });
    try {
      const { container } = render(
        <FumadocsOpenApiContent pageProps={props} />,
      );
      const code = container.querySelector('pre code');
      expect(code?.textContent).toBe(source);
      fireEvent.click(screen.getByRole('button', { name: 'Copy Text' }));
      expect(clipboard).toHaveBeenLastCalledWith(source);
      await waitFor(() =>
        expect(
          container.querySelector('pre span[style*="--shiki-light"]'),
        ).toBeInTheDocument(),
      );
      expect(container.querySelector('pre code')?.textContent).toBe(source);
      const flags = [...container.querySelectorAll('pre span[style]')].filter(
        (node) => /^--[a-z-]+$/.test(node.textContent ?? ''),
      );
      expect(flags).toHaveLength(47);
      expect(
        new Set(flags.map((node) => node.getAttribute('style'))).size,
      ).toBe(1);
      fireEvent.click(
        screen.getByRole('button', { name: /Copy Text|Copied Text/ }),
      );
      expect(clipboard).toHaveBeenLastCalledWith(source);
    } finally {
      if (original) Object.defineProperty(navigator, 'clipboard', original);
      else Reflect.deleteProperty(navigator, 'clipboard');
    }
  });

  it('renders one English response body tabs with status-local headers', async () => {
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
      await screen.findByRole('heading', { name: 'Responses' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Responses' })).toHaveLength(
      1,
    );
    expect(
      document.querySelector('[data-openapi-responses]'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Response schema' }),
    ).not.toBeInTheDocument();
    expect(getResponseTab('200')).toHaveAttribute('aria-selected', 'true');
    expect(getResponseTab('Other responses')).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(
      document.getElementById('response-headers-200-x-request-id'),
    ).toBeInTheDocument();
    expect(
      document.querySelector(
        '[data-openapi-responses] input[placeholder="Filter Properties"]',
      ),
    ).toBeNull();
    expect(
      within(
        document.getElementById(
          'response-headers-200-x-request-id',
        ) as HTMLElement,
      ).queryByText('optional'),
    ).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Filter Properties')).toBeNull();
    const select = screen.getByLabelText('Media type for 200 response');
    fireEvent.change(select, { target: { value: 'text/plain' } });
    expect(getResponseTab('200')).toBeInTheDocument();
    fireEvent.mouseDown(getResponseTab('204'));
    expect(screen.getByText('No content')).toBeInTheDocument();
    expect(screen.queryByText('Empty response body')).not.toBeInTheDocument();
  });

  it('preserves English response tab selection for unchanged response references', () => {
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

    fireEvent.mouseDown(getResponseTab('Non-200'));
    expect(getResponseTab('Non-200')).toHaveAttribute('aria-selected', 'true');

    rerender(<FumadocsOpenApiContent pageProps={pageProps} />);

    expect(getResponseTab('Non-200')).toHaveAttribute('aria-selected', 'true');

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

    expect(getResponseTab('201')).toHaveAttribute('aria-selected', 'true');
  });

  it.each(['en', 'zh-CN'])(
    'omits the duplicate request caption and retains localized toolbar controls in %s',
    async (locale) => {
      const i18n = createInstance();
      await i18n.init({ lng: locale, resources });
      const { container } = render(
        <I18nextProvider i18n={i18n}>
          <FumadocsOpenApiContent
            locale={locale}
            pageProps={makeMinimalOpenApiPageProps('get')}
          />
        </I18nextProvider>,
      );
      const request = container.querySelector(
        '.openapi-request-examples',
      ) as HTMLElement;
      expect(
        within(request).getByRole('heading', {
          name: locale === 'zh-CN' ? '请求示例' : 'Request examples',
        }),
      ).toBeInTheDocument();
      expect(request.querySelector('figcaption')?.textContent).toBe('');
      expect(within(request).queryByText('Example Request')).toBeNull();
      expect(
        within(request).getByRole('combobox', {
          name: locale === 'zh-CN' ? '代码语言' : 'Code language',
        }),
      ).toBeInTheDocument();
      expect(
        within(request).getByRole('button', {
          name: locale === 'zh-CN' ? '自动换行' : 'Wrap code',
        }),
      ).toBeInTheDocument();
      expect(
        within(request).getByRole('button', {
          name: locale === 'zh-CN' ? '复制文本' : 'Copy Text',
        }),
      ).toBeInTheDocument();
    },
  );

  it('retains the request-scenario selector when omitting the fallback caption', async () => {
    const { container } = render(
      <FumadocsOpenApiContent
        locale="en"
        pageProps={{
          operations: [{ method: 'post', path: '/scenarios' }],
          payload: {
            bundled: {
              info: { title: 'Request scenarios' },
              openapi: '3.2.0',
              paths: {
                '/scenarios': {
                  post: {
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: { message: { type: 'string' } },
                          },
                          examples: {
                            first: {
                              summary: 'First request',
                              value: { message: 'first-message' },
                            },
                            second: {
                              summary: 'Second request',
                              value: { message: 'second-message' },
                            },
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
    const request = container.querySelector(
      '.openapi-request-examples',
    ) as HTMLElement;
    expect(within(request).queryByText('Example Request')).toBeNull();
    fireEvent.click(
      within(request).getByRole('combobox', { name: 'Example request' }),
    );
    const option = screen.getByRole('option', { name: 'Second request' });
    fireEvent.pointerDown(option, { pointerType: 'mouse' });
    fireEvent.click(option, { detail: 1 });
    await waitFor(() =>
      expect(request.querySelector('pre')).toHaveTextContent('second-message'),
    );
    expect(
      within(request).getByRole('combobox', { name: 'Code language' }),
    ).toBeInTheDocument();
  });

  it('keeps docked response controls attached to the selected status and hides them for empty responses', async () => {
    const previousStatus = sessionStorage.getItem('fumadocs_openapi_responses');
    const writeText = vi.fn().mockResolvedValue(undefined);
    const clipboard = vi
      .spyOn(navigator, 'clipboard', 'get')
      .mockReturnValue({ writeText } as unknown as Clipboard);
    try {
      const { container } = render(
        <FumadocsOpenApiContent
          locale="en"
          pageProps={{
            operations: [{ method: 'get', path: '/responses' }],
            payload: {
              bundled: {
                info: { title: 'Response controls' },
                openapi: '3.2.0',
                paths: {
                  '/responses': {
                    get: {
                      responses: {
                        '200': {
                          description: 'OK',
                          content: {
                            'application/json': { example: { message: 'ok' } },
                          },
                        },
                        '204': { description: 'No content' },
                        '400': {
                          description: 'Bad request',
                          content: {
                            'application/json': {
                              example: { message: 'bad-request' },
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
      const response = container.querySelector(
        '.openapi-response-example',
      ) as HTMLElement;
      fireEvent.mouseDown(within(response).getByRole('tab', { name: '400' }), {
        button: 0,
        ctrlKey: false,
      });
      await waitFor(() =>
        expect(response.querySelector('pre')).toHaveTextContent('bad-request'),
      );
      fireEvent.click(
        within(response).getByRole('button', { name: 'Wrap code' }),
      );
      expect(response.querySelector('figure')).toHaveAttribute(
        'data-code-wrap',
        'true',
      );
      fireEvent.click(
        within(response).getByRole('button', { name: 'Copy Text' }),
      );
      await waitFor(() =>
        expect(writeText).toHaveBeenCalledWith(
          '{\n  "message": "bad-request"\n}',
        ),
      );
      fireEvent.mouseDown(within(response).getByRole('tab', { name: '204' }), {
        button: 0,
        ctrlKey: false,
      });
      expect(
        within(response).getByText('No response example provided.'),
      ).toBeVisible();
      expect(
        within(response).queryByRole('button', { name: /Wrap code|Copy Text/ }),
      ).toBeNull();
    } finally {
      clipboard.mockRestore();
      if (previousStatus === null) {
        sessionStorage.removeItem('fumadocs_openapi_responses');
      } else {
        sessionStorage.setItem('fumadocs_openapi_responses', previousStatus);
      }
    }
  });

  it('limits generated request samples to the three legacy clients', async () => {
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
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

    const selector = await screen.findByRole('combobox', {
      name: /Code language|代码语言/i,
    });
    const requestExamples = selector.closest(
      '.openapi-request-examples',
    ) as HTMLElement;
    await waitFor(() =>
      expect(
        requestExamples.querySelector('pre span[style*="--shiki-light"]'),
      ).toBeInTheDocument(),
    );
    const highlightFrames: number[] = [];
    const observer = new MutationObserver(() => {
      const pre = requestExamples.querySelector('pre');
      const text = pre?.textContent ?? '';
      if (text.includes('requests.request') || text.includes('fetch(')) {
        highlightFrames.push(
          pre?.querySelectorAll('span[style*="--shiki-light"]').length ?? 0,
        );
      }
    });
    observer.observe(requestExamples, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    fireEvent.click(selector);
    expect(
      screen.getAllByRole('option').map((option) => option.textContent?.trim()),
    ).toEqual(['cURL', 'Python/Requests', 'Node.js/Fetch']);
    fireEvent.click(screen.getByRole('option', { name: 'cURL' }));
    for (const [language, snippet] of [
      ['Python/Requests', 'requests.request("GET", url)'],
      ['Node.js/Fetch', 'fetch('],
    ] as const) {
      fireEvent.click(
        within(
          document.querySelector('.openapi-request-examples') as HTMLElement,
        ).getByRole('combobox', { name: /Code language|代码语言/i }),
      );
      const option = screen.getByRole('option', { name: language });
      fireEvent.pointerDown(option, { pointerType: 'mouse' });
      fireEvent.click(option, { detail: 1 });
      await waitFor(() =>
        expect(
          document.querySelector('.openapi-request-examples pre'),
        ).toHaveTextContent(snippet),
      );
      expect(
        document.querySelector('.openapi-request-examples pre'),
      ).toHaveTextContent('/api/speech-to-text/v1/projects/');
    }
    observer.disconnect();
    expect(highlightFrames.length).toBeGreaterThan(0);
    expect(highlightFrames).not.toContain(0);
    const generatedPreview = screen.getByTestId('openapi-code-preview');
    await waitFor(() =>
      expect(
        generatedPreview.querySelector('pre span[style*="--shiki-light"]'),
      ).toBeInTheDocument(),
    );
    expect(
      generatedPreview.querySelector('.fd-scroll-container'),
    ).toHaveAttribute('data-openapi-code-viewport', '');
    expect(generatedPreview.querySelector('figure.shiki')).toHaveClass(
      'bg-fd-card',
      'shadow-none',
    );
    const preview = screen.getByTestId('openapi-code-preview');
    await waitFor(() =>
      expect(preview.querySelector('.fd-scroll-container')).toHaveAttribute(
        'data-openapi-code-viewport',
        '',
      ),
    );
    expect(
      within(preview).getByRole('button', { name: '复制文本' }),
    ).toBeInTheDocument();
    expect(requestExamples).not.toHaveAttribute('data-markdown-ignore');
  });

  it('renders response status tabs on every registered endpoint and keeps three fallback clients', async () => {
    const source = await createLocalizedOpenApiSource();
    const checkedPaths: string[] = [];

    for (const file of source.files) {
      if (file.type !== 'page') continue;
      const pageProps = await file.data.getOpenAPIPageProps();
      const route = pageProps.operations?.[0];
      if (!route) continue;
      const operation = pageProps.payload.bundled?.paths?.[route.path]?.[
        route.method
      ] as Record<string, unknown>;
      const $ = load(
        renderToStaticMarkup(
          <FumadocsOpenApiContent
            locale={file.path.startsWith('zh-CN/') ? 'zh-CN' : 'en'}
            pageProps={pageProps}
          />,
        ),
      );
      const responseTabs = $('[data-openapi-responses] > [data-slot="tabs"]');
      const overview = $('[data-openapi-operation-overview]');
      expect(overview.length, file.path).toBe(1);
      expect(
        overview.closest('[data-openapi-operation-panel]').length,
        file.path,
      ).toBe(0);
      expect(
        overview.find(
          'button[aria-label="复制接口 URL"], button[aria-label="Copy endpoint URL"]',
        ).length,
        file.path,
      ).toBe(1);
      expect(
        responseTabs
          .children()
          .first()
          .find('[role="tab"]')
          .map((_, tab) =>
            decodeURIComponent($(tab).attr('id')?.split('-trigger-')[1] ?? ''),
          )
          .get(),
        file.path,
      ).toEqual(Object.keys(operation.responses as Record<string, unknown>));
      expect(
        responseTabs.children('[role="tabpanel"]:not([hidden])').length,
        file.path,
      ).toBe(1);
      if (
        operation['x-codeSamples'] ||
        operation['x-docs-code-sample-groups']
      ) {
        continue;
      }
      expect(
        $(
          '.openapi-request-examples [role="combobox"][aria-label="代码语言"], .openapi-request-examples [role="combobox"][aria-label="Code language"]',
        ).length,
        file.path,
      ).toBe(1);
      checkedPaths.push(file.path);
    }

    expect(checkedPaths).toContain(
      'zh-CN/api-reference/api-ref/cloud-transcoding/create.mdx',
    );
    expect(checkedPaths).toContain(
      'zh-CN/api-reference/api-ref/rtc/query-channel-list.mdx',
    );
    expect(checkedPaths).toContain(
      'zh-CN/api-reference/api-ref/whiteboard/restful/get-room.mdx',
    );
  }, 30_000);

  it('keeps same-language code samples on distinct tabs', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [{ method: 'post', path: '/duplicate-languages' }],
          payload: {
            bundled: {
              info: { title: 'Duplicate language samples' },
              openapi: '3.2.0',
              paths: {
                '/duplicate-languages': {
                  post: {
                    responses: { '200': { description: 'OK' } },
                    'x-codeSamples': [
                      { lang: 'bash', source: 'curl first' },
                      { lang: 'bash', source: 'curl second' },
                    ],
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    const tabs = await screen.findAllByRole('tab', { name: 'bash' });
    expect(tabs).toHaveLength(2);
    const examples = within(
      tabs[0].closest('.openapi-request-examples') as HTMLElement,
    );
    fireEvent.mouseDown(tabs[1]);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(examples.getByRole('tabpanel')).toHaveTextContent('curl second');
  });

  it.each(['start_of_speech', 'end_of_speech'])(
    'keeps %s branch descriptions, examples, and inherited rules when switching tabs',
    async (configuration) => {
      const document = yaml.load(
        await readFile(
          path.resolve('content/openapi/conversational-ai/rest-api.zh-CN.yaml'),
          'utf8',
        ),
      ) as Document;
      render(
        <FumadocsOpenApiContent
          locale="zh-CN"
          pageProps={{
            operations: [{ method: 'post', path: '/v2/projects/{appid}/join' }],
            payload: { bundled: document },
          }}
        />,
      );

      const rootPath = `properties.turn_detection.config.${configuration}.{mode}_config`;
      const getNode = (fieldPath: string) =>
        window.document.querySelector<HTMLElement>(
          `[data-openapi-schema-path=${JSON.stringify(fieldPath)}]`,
        );
      const getRow = (fieldPath: string) =>
        getNode(fieldPath)?.querySelector<HTMLElement>(
          ':scope > .openapi-schema-field-row',
        ) as HTMLElement;

      for (const fieldPath of [
        'properties.turn_detection',
        'properties.turn_detection.config',
        `properties.turn_detection.config.${configuration}`,
        rootPath,
      ]) {
        fireEvent.click(
          within(getRow(fieldPath)).getByRole('button', { name: /^展开 / }),
        );
      }

      const branch = getNode(`${rootPath}.vad_config`);
      expect(branch).not.toBeNull();
      if (!branch) throw new Error('Missing VAD configuration branch');

      const root = getNode(rootPath) as HTMLElement;
      const choice = within(root).getByRole('tab', { name: 'vad_config' });
      expect(choice).toHaveAttribute('aria-selected', 'true');
      expect(getRow(rootPath)).toHaveTextContent('不可同时传入多个模式配置');
      expect(getRow(rootPath)).toHaveTextContent('公开接口不支持该字段');
      expect(getNode(rootPath)).not.toHaveTextContent('oneOf');
      expect(getNode(rootPath)).not.toHaveTextContent('以下配置任选一种');
      expect(within(branch).getByText(/基于 VAD 的对话/)).toBeVisible();
      await waitFor(() =>
        expect(branch.querySelector('pre')).toHaveTextContent('"vad_config"'),
      );
      expect(
        getRow(
          `${rootPath}.${configuration === 'start_of_speech' ? 'interrupt_duration_ms' : 'silence_duration_ms'}`,
        ),
      ).toBeVisible();

      const alternative = within(root)
        .getAllByRole('tab')
        .find((tab) => tab !== choice) as HTMLElement;
      fireEvent.mouseDown(alternative, { button: 0, ctrlKey: false });
      expect(alternative).toHaveAttribute('aria-selected', 'true');
      expect(branch).not.toBeVisible();
      fireEvent.mouseDown(choice, { button: 0, ctrlKey: false });
      expect(branch).toBeVisible();
      expect(within(branch).getByText(/基于 VAD 的对话/)).toBeVisible();
    },
  );

  it('renders OpenAPI Markdown tables with the docs table wrapper and cells', async () => {
    render(
      <FumadocsOpenApiContent
        pageProps={{
          operations: [
            {
              method: 'post',
              path: '/v1/kicking-rule',
            } as OpenApiOperationItem,
          ],
          payload: {
            bundled: {
              info: {
                title: 'Channel Management API',
              },
              openapi: '3.2.0',
              paths: {
                '/v1/kicking-rule': {
                  post: {
                    operationId: 'create-ban-rule',
                    responses: {
                      '200': {
                        description: 'OK',
                      },
                    },
                    summary: 'Create a ban rule',
                    'x-docs-sections': [
                      {
                        markdown: [
                          '| ip | cname | uid | 过滤规则 |',
                          '| --- | --- | --- | --- |',
                          '| ✔ | ✘ | ✘ | 所有使用该 `ip` 的用户都无法登录 App 中的任何频道。 |',
                          '| ✘ | ✔ | ✔ | 该 `uid` 无法登录 App 中该 `cname` 对应的频道。 |',
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

    const table = await screen.findByRole('table');
    expect(table.closest('.docs-table-container')).toBeInstanceOf(HTMLElement);
    expect(screen.getByRole('columnheader', { name: 'ip' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'cname' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'uid' })).toBeVisible();
    expect(
      screen.getByRole('columnheader', { name: '过滤规则' }),
    ).toBeVisible();
    expect(
      screen.getByText('所有使用该', { exact: false }).closest('td'),
    ).toHaveTextContent('所有使用该 ip 的用户都无法登录 App 中的任何频道。');
    const rows = within(table).getAllByRole('row');
    expect(within(rows[2]).getAllByRole('cell')[3]).toHaveTextContent(
      '该 uid 无法登录 App 中该 cname 对应的频道。',
    );
  });

  it('resolves relative endpoint links against the OpenAPI lane route', async () => {
    const path = '/v1/apps/{appid}/cloud_recording/acquire';

    render(
      <FumadocsOpenApiContent
        contentPath="zh-CN/api-reference/api-ref/cloud-recording/acquire.mdx"
        locale="zh-CN"
        pageProps={{
          operations: [{ method: 'post', path }],
          payload: {
            bundled: {
              info: { title: 'Cloud Recording API' },
              openapi: '3.2.0',
              paths: {
                [path]: {
                  post: {
                    operationId: 'acquire-cloud-recording-resource',
                    responses: { '200': { description: 'OK' } },
                    'x-docs-sections': [
                      {
                        markdown: 'Call [start](start) immediately.',
                        position: 'after-description',
                        title: 'Next step',
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

    expect(await screen.findByRole('link', { name: 'start' })).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/api-ref/cloud-recording/start',
    );
  });

  it('renders the legacy nested-schema fragment beside its matching field', async () => {
    const path = '/v2/projects/{appid}/agents/{agentId}/join';

    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [{ method: 'post', path }],
          payload: {
            bundled: {
              info: { title: 'Conversational AI API' },
              openapi: '3.2.0',
              paths: {
                [path]: {
                  post: {
                    operationId: 'start-agent',
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              properties: {
                                properties: {
                                  llm: {
                                    properties: {
                                      max_history: { type: 'integer' },
                                    },
                                    type: 'object',
                                  },
                                },
                                type: 'object',
                              },
                              request: {
                                properties: {
                                  body: {
                                    properties: {
                                      maxIdleTime: { type: 'integer' },
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

    const alias = await waitFor(() => {
      const element = document.getElementById('llm-max_history');
      expect(element).toBeInTheDocument();
      return element;
    });

    expect(alias?.closest('[data-openapi-schema-path]')).toHaveAttribute(
      'data-openapi-schema-path',
      'properties.llm.max_history',
    );
    expect(
      document
        .getElementById('request.body.maxIdleTime')
        ?.closest('[data-openapi-schema-path]'),
    ).toHaveAttribute('data-openapi-schema-path', 'request.body.maxIdleTime');
  });

  it('renders the localized fieldless state for a real empty response schema', async () => {
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [{ method: 'get', path: '/empty-schema' }],
          payload: {
            bundled: {
              info: { title: 'Empty schema API' },
              openapi: '3.2.0',
              paths: {
                '/empty-schema': {
                  get: {
                    responses: {
                      '200': {
                        content: {
                          'application/json': { schema: false },
                        },
                        description: 'No response fields.',
                      },
                    },
                    summary: 'Empty schema',
                  },
                },
              },
            } as unknown as Document,
          },
        }}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: '响应' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Schema 中没有字段')).toBeInTheDocument();
  });

  it('shows primitive types for titled response references', async () => {
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [{ method: 'post', path: '/recording/start' }],
          payload: {
            bundled: {
              components: {
                schemas: {
                  'cname-r': { title: 'cname-r', type: 'string' },
                  'resourceId-r': { title: 'resourceId-r', type: 'string' },
                  'uid-r': { title: 'uid-r', type: 'string' },
                },
              },
              info: { title: 'Cloud recording API' },
              openapi: '3.2.0',
              paths: {
                '/recording/start': {
                  post: {
                    responses: {
                      '200': {
                        content: {
                          'application/json': {
                            schema: {
                              properties: {
                                cname: { $ref: '#/components/schemas/cname-r' },
                                resourceId: {
                                  $ref: '#/components/schemas/resourceId-r',
                                },
                                sid: { type: 'string' },
                                uid: { $ref: '#/components/schemas/uid-r' },
                              },
                              type: 'object',
                            },
                          },
                        },
                        description: 'Recording started.',
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

    for (const name of ['cname', 'uid', 'resourceId', 'sid']) {
      const field = await screen.findByText(name, { selector: 'code' });
      const row = field.closest('.openapi-schema-field-row') as HTMLElement;
      expect(within(row).getByText('string', { exact: true })).toBeVisible();
      expect(within(row).queryByText(`${name}-r`)).not.toBeInTheDocument();
    }
  });

  it('keeps a real primitive response schema renderable', async () => {
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [{ method: 'get', path: '/primitive-schema' }],
          payload: {
            bundled: {
              info: { title: 'Primitive schema API' },
              openapi: '3.2.0',
              paths: {
                '/primitive-schema': {
                  get: {
                    responses: {
                      '200': {
                        content: {
                          'text/plain': {
                            schema: {
                              enum: ['ready', 'failed'],
                              type: 'string',
                            },
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

    expect(
      await screen.findByRole('heading', { name: '响应' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Schema 中没有字段')).not.toBeInTheDocument();
    expect(screen.getAllByText('string').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ready').length).toBeGreaterThan(0);
  });

  it('matches fieldless states to boolean and map schema rendering', async () => {
    render(
      <FumadocsOpenApiContent
        locale="zh-CN"
        pageProps={{
          operations: [{ method: 'get', path: '/schema-shapes' }],
          payload: {
            bundled: {
              info: { title: 'Schema shapes API' },
              openapi: '3.2.0',
              paths: {
                '/schema-shapes': {
                  get: {
                    responses: {
                      '200': {
                        content: { 'application/json': { schema: true } },
                      },
                      '201': {
                        content: {
                          'application/json': {
                            schema: {
                              patternProperties: {
                                '^x-': { type: 'string' },
                              },
                              type: 'object',
                            },
                          },
                        },
                      },
                      '202': {
                        content: {
                          'application/json': {
                            schema: {
                              additionalProperties: true,
                              type: 'object',
                            },
                          },
                        },
                      },
                      '203': {
                        content: {
                          'application/json': {
                            schema: {
                              additionalProperties: { type: 'string' },
                              type: 'object',
                            },
                          },
                        },
                      },
                      '204': {
                        content: {
                          'application/json': {
                            schema: { allOf: [{ type: 'object' }] },
                          },
                        },
                      },
                      '205': {
                        content: {
                          'application/json': {
                            schema: {
                              additionalProperties: { type: 'object' },
                              type: 'object',
                            },
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

    const panelFor = (status: string) => {
      const trigger = getResponseTab(status);
      if (trigger.getAttribute('aria-selected') === 'false') {
        fireEvent.mouseDown(trigger);
      }
      return within(
        document.getElementById(
          trigger.getAttribute('aria-controls') ?? '',
        ) as HTMLElement,
      );
    };

    expect(panelFor('200').queryByText('Schema 中没有字段')).toBeNull();
    expect(panelFor('201').getAllByText('^x-').length).toBeGreaterThan(0);
    expect(panelFor('202').getByText('Schema 中没有字段')).toBeVisible();
    expect(panelFor('203').queryByText('Schema 中没有字段')).toBeNull();
    expect(panelFor('203').getAllByText('string').length).toBeGreaterThan(0);
    expect(panelFor('204').getByText('Schema 中没有字段')).toBeVisible();
    expect(panelFor('205').queryByText('Schema 中没有字段')).toBeNull();
    expect(panelFor('205').getAllByText('object').length).toBeGreaterThan(0);
  });

  it('keeps English response schemas inside the response body tabs', async () => {
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
      await screen.findByRole('heading', { name: 'Responses' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Response schema' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Filter Properties')).toBeNull();
    expect(screen.getByText('agent_id')).toBeVisible();
  });
});
