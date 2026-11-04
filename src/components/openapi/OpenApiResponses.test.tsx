import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildOpenApiResponseSchemaAnchorId } from '@/lib/openapi/anchors';
import type { OpenApiResponseView } from '@/lib/openapi/response-view';
import { OpenApiResponses } from './OpenApiResponses';

const { syncHashTarget } = vi.hoisted(() => ({ syncHashTarget: vi.fn() }));

vi.mock('@/lib/docs-hash', () => ({
  syncDocsHashTargetFromLocation: syncHashTarget,
}));

const ENGLISH_RESPONSE_LABELS = {
  mediaTypeForResponse: (status: string) => `Media type for ${status} response`,
  responseBody: 'Response Body',
  responses: 'Responses',
  schemaHasNoFields: 'Schema has no fields',
  schemaNotProvided: 'Schema not provided',
};

function view(
  statusCode: string,
  overrides: Partial<OpenApiResponseView> = {},
): OpenApiResponseView {
  return {
    hasContent: true,
    headers: [],
    mediaTypes: [
      {
        mediaType: 'application/json',
        schema: { type: 'object' },
        source: { schema: { type: 'object' } },
      },
    ],
    source: {},
    statusCode,
    ...overrides,
  };
}

function renderResponses(
  responses: OpenApiResponseView[],
  renderSchema: Parameters<typeof OpenApiResponses>[0]['renderSchema'] = vi.fn(
    ({ mediaType }: { mediaType: string }) => ({
      hasFields: true,
      node: <p>Schema: {mediaType}</p>,
    }),
  ),
) {
  return {
    renderSchema,
    ...render(
      <OpenApiResponses
        labels={ENGLISH_RESPONSE_LABELS}
        renderDescription={(markdown) => <p>Description: {markdown}</p>}
        renderHeaders={(headers, status) =>
          headers.length ? <p>Headers: {status}</p> : null
        }
        renderSchema={renderSchema}
        responses={responses}
        sectionId="test-responses"
      />,
    ),
  };
}

function getResponseTab(status: string) {
  return within(
    document.querySelector('[data-openapi-responses]') as HTMLElement,
  ).getByRole('tab', { name: status });
}

describe('OpenApiResponses', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('renders responses above its body subsection while preserving the section anchor', () => {
    renderResponses([view('200')]);

    const heading = screen.getByRole('heading', {
      name: 'Responses',
      level: 2,
    });
    expect(heading.tagName).toBe('H2');
    expect(heading).toHaveClass('openapi-section-heading');
    expect(heading.querySelector('a[href="#test-responses"]')).toBeTruthy();
    expect(document.querySelectorAll('#test-responses')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { name: 'Response Body', level: 3 }),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-openapi-responses]'),
    ).not.toHaveAttribute('id');
    expect(getResponseTab('200')).toBeInTheDocument();
  });

  it('uses supplied labels for response chrome and empty states', () => {
    render(
      <OpenApiResponses
        labels={{
          mediaTypeForResponse: (status) => `${status} 响应的媒体类型`,
          responseBody: '响应 Body',
          responses: '响应',
          schemaHasNoFields: 'Schema 中没有字段',
          schemaNotProvided: '未提供 Schema',
        }}
        renderDescription={() => null}
        renderHeaders={() => null}
        renderSchema={() => ({ hasFields: false, node: null })}
        responses={[
          view('200', {
            mediaTypes: [
              {
                mediaType: 'application/json',
                schema: {},
                source: { schema: {} },
              },
              {
                mediaType: 'text/plain',
                schema: {},
                source: { schema: {} },
              },
            ],
          }),
          view('204', { hasContent: false }),
          view('400', { mediaTypes: [] }),
        ]}
        sectionId="localized-responses"
      />,
    );

    expect(
      screen.getByRole('heading', { name: '响应', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('200 响应的媒体类型')).toBeInTheDocument();
    expect(screen.getByText('Schema 中没有字段')).toBeInTheDocument();
    fireEvent.mouseDown(getResponseTab('204'));
    expect(screen.queryByText('响应 Body 为空')).not.toBeInTheDocument();
    fireEvent.mouseDown(getResponseTab('400'));
    expect(screen.getByText('未提供 Schema')).toBeInTheDocument();
  });

  it('defaults to the first 2xx response and switches to one status at a time', () => {
    renderResponses([view('default'), view('200')]);

    expect(getResponseTab('default')).toHaveAttribute('aria-selected', 'false');
    expect(getResponseTab('200')).toHaveAttribute('aria-selected', 'true');

    fireEvent.mouseDown(getResponseTab('default'));

    expect(screen.getAllByText('Schema: application/json')).toHaveLength(1);
    expect(getResponseTab('default')).toHaveAttribute('aria-selected', 'true');
    expect(getResponseTab('200')).toHaveAttribute('aria-selected', 'false');
  });

  it('switches all response content and supports keyboard navigation', async () => {
    renderResponses([
      view('200', {
        description: 'Success',
        headers: [{ name: 'X-Success', source: {} }],
      }),
      view('非 200', {
        description: 'Failure',
        hasContent: false,
        mediaTypes: [],
      }),
    ]);
    const success = getResponseTab('200');
    expect(screen.getByText('Description: Success')).toBeVisible();
    expect(screen.getByText('Headers: 200')).toBeVisible();
    expect(screen.queryByText('Description: Failure')).not.toBeInTheDocument();
    act(() => success.focus());
    fireEvent.keyDown(success, { key: 'ArrowRight' });
    await waitFor(() =>
      expect(getResponseTab('非 200')).toHaveAttribute('aria-selected', 'true'),
    );
    expect(getResponseTab('非 200')).toHaveFocus();
    for (const tab of [success, getResponseTab('非 200')]) {
      expect(tab.id).not.toMatch(/\s/);
      const panel = document.getElementById(
        tab.getAttribute('aria-controls') ?? '',
      );
      expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    }
    expect(screen.getByText('Description: Failure')).toBeVisible();
    expect(screen.queryByText('Description: Success')).not.toBeInTheDocument();
    expect(screen.queryByText('Headers: 200')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Response Body' }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });

  it('opens the first response without a 2xx and handles no responses', () => {
    const { rerender } = renderResponses([view('default'), view('404')]);
    expect(getResponseTab('default')).toHaveAttribute('aria-selected', 'true');

    rerender(
      <OpenApiResponses
        labels={ENGLISH_RESPONSE_LABELS}
        renderDescription={() => null}
        renderHeaders={() => null}
        renderSchema={() => ({ hasFields: false, node: null })}
        responses={[]}
        sectionId="test-responses"
      />,
    );
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('omits inferred empty-body text while distinguishing absent and explicit false schemas', () => {
    const renderSchema = vi.fn(() => ({ hasFields: false, node: null }));
    renderResponses(
      [
        view('200', {
          hasContent: false,
          mediaTypes: [],
          description: 'The operation succeeded.',
          headers: [{ name: 'X-Request-ID', source: {} }],
        }),
        view('201', { mediaTypes: [] }),
        view('202', {
          mediaTypes: [
            {
              mediaType: 'application/json',
              schema: false,
              source: { schema: false },
            },
          ],
        }),
      ],
      renderSchema,
    );

    expect(screen.queryByText('Empty response body')).not.toBeInTheDocument();
    expect(
      screen.getByText('Description: The operation succeeded.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Headers: 200')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Response Body' }),
    ).not.toBeInTheDocument();
    expect(renderSchema).not.toHaveBeenCalled();
    fireEvent.mouseDown(getResponseTab('201'));
    expect(screen.getByText('Schema not provided')).toBeInTheDocument();
    fireEvent.mouseDown(getResponseTab('202'));
    expect(renderSchema).toHaveBeenCalledWith({
      mediaType: 'application/json',
      schema: false,
      status: '202',
    });
    expect(screen.getByText('Schema has no fields')).toBeInTheDocument();
  });

  it('treats a selected media type without its own schema key as missing', () => {
    const renderSchema = vi.fn(() => ({ hasFields: false, node: null }));
    renderResponses(
      [
        view('200', {
          mediaTypes: [{ mediaType: 'application/json', source: {} }],
        }),
      ],
      renderSchema,
    );

    expect(screen.getByText('Schema not provided')).toBeInTheDocument();
    expect(renderSchema).not.toHaveBeenCalled();
  });

  it('shows the fieldless state for an ordinary object schema', () => {
    renderResponses(
      [
        view('200', {
          mediaTypes: [
            {
              mediaType: 'application/json',
              schema: { type: 'object' },
              source: { schema: { type: 'object' } },
            },
          ],
        }),
      ],
      vi.fn(() => ({ hasFields: false, node: null })),
    );

    expect(screen.getByText('Schema has no fields')).toBeInTheDocument();
  });

  it('selects JSON by default and changes only that response media', () => {
    const { renderSchema } = renderResponses([
      view('200', {
        mediaTypes: [
          { mediaType: 'text/plain', schema: {}, source: { schema: {} } },
          { mediaType: 'application/json', schema: {}, source: { schema: {} } },
        ],
      }),
      view('201'),
    ]);

    const select = screen.getByLabelText('Media type for 200 response');
    expect(select).toHaveValue('application/json');
    fireEvent.change(select, { target: { value: 'text/plain' } });
    expect(getResponseTab('200')).toHaveAttribute('aria-selected', 'true');
    expect(renderSchema).toHaveBeenLastCalledWith({
      mediaType: 'text/plain',
      schema: {},
      status: '200',
    });
    expect(getResponseTab('201')).toHaveAttribute('aria-selected', 'false');
  });

  it('renders description, headers, then a body subsection containing the media selector and schema', () => {
    renderResponses([
      view('200', {
        description: 'A response',
        headers: [
          { name: 'x-request-id', source: {}, schema: { type: 'string' } },
        ],
        mediaTypes: [
          { mediaType: 'application/json', schema: {}, source: { schema: {} } },
          { mediaType: 'text/plain', schema: {}, source: { schema: {} } },
        ],
      }),
    ]);
    const description = screen.getByText('Description: A response');
    const select = screen.getByLabelText('Media type for 200 response');
    const headers = screen.getByText('Headers: 200');
    const body = screen.getByRole('heading', {
      name: 'Response Body',
      level: 3,
    });
    const schema = screen.getByText('Schema: application/json');
    expect(description.compareDocumentPosition(headers)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(headers.compareDocumentPosition(body)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(body.compareDocumentPosition(select)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(select.compareDocumentPosition(schema)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('opens statuses targeted by response field and header hashes and removes its listener', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    window.location.hash = 'responses-default-detail';
    const { unmount } = renderResponses([view('default'), view('200')]);
    expect(getResponseTab('default')).toHaveAttribute('aria-selected', 'true');
    window.location.hash = 'response-headers-default-x-request-id';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(getResponseTab('default')).toHaveAttribute('aria-selected', 'true');
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      'hashchange',
      expect.any(Function),
    );
    removeEventListener.mockRestore();
  });

  it('opens a default response directly from a response-header hash', () => {
    window.location.hash = 'response-headers-default-x-request-id';
    renderResponses([view('default'), view('200')]);

    expect(getResponseTab('200')).toHaveAttribute('aria-selected', 'false');
    expect(getResponseTab('default')).toHaveAttribute('aria-selected', 'true');
  });

  it('restores a copied response schema hash with its status and media type', () => {
    const mediaTypes = [
      'application/vnd.foo+json',
      'application/vnd.foo-json',
      'application/vnd.foo.json',
    ];
    const selectedMediaType = mediaTypes[1];
    const responseAnchor = buildOpenApiResponseSchemaAnchorId(
      '404',
      selectedMediaType,
      mediaTypes,
    );
    window.history.replaceState(
      {},
      '',
      `/?path=detail&s-highlight=id#${responseAnchor}`,
    );
    renderResponses([
      view('200'),
      view('404', {
        mediaTypes: mediaTypes.map((mediaType) => ({
          mediaType,
          schema: {},
          source: { schema: {} },
        })),
      }),
    ]);

    expect(getResponseTab('404')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText('Media type for 404 response')).toHaveValue(
      selectedMediaType,
    );
    window.history.replaceState({}, '', '/');
  });

  it('preserves user state for the same response identity and resets it for a new identity', () => {
    const responses = [view('default'), view('200')];
    const { rerender } = renderResponses(responses);
    fireEvent.mouseDown(getResponseTab('default'));
    rerender(
      <OpenApiResponses
        labels={ENGLISH_RESPONSE_LABELS}
        renderDescription={() => null}
        renderHeaders={() => null}
        renderSchema={() => ({ hasFields: false, node: null })}
        responses={responses}
        sectionId="test-responses"
      />,
    );
    expect(getResponseTab('default')).toHaveAttribute('aria-selected', 'true');
    rerender(
      <OpenApiResponses
        labels={ENGLISH_RESPONSE_LABELS}
        renderDescription={() => null}
        renderHeaders={() => null}
        renderSchema={() => ({ hasFields: false, node: null })}
        responses={[view('201')]}
        sectionId="test-responses"
      />,
    );
    expect(getResponseTab('201')).toHaveAttribute('aria-selected', 'true');
  });

  it('provides matching accessible controls for response panels', () => {
    renderResponses([view('200')]);
    const trigger = getResponseTab('200');
    const panel = document.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    );
    expect(panel).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-selected', 'true');
    expect(panel).toHaveAttribute('role', 'tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
  });

  it('keeps inactive tab panels hidden with an accessible relationship', () => {
    renderResponses([view('default'), view('200')]);
    const trigger = getResponseTab('default');
    const panel = document.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    );

    expect(panel).toHaveAttribute('role', 'tabpanel');
    expect(panel).toHaveAttribute('hidden');
    expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
    expect(trigger).toHaveAttribute('aria-selected', 'false');
    expect(panel).toBeEmptyDOMElement();
  });

  it('generates distinct relationship and media IDs for separate instances', () => {
    const responses = [
      view('200', {
        mediaTypes: [
          { mediaType: 'application/json', schema: {}, source: { schema: {} } },
          { mediaType: 'text/plain', schema: {}, source: { schema: {} } },
        ],
      }),
    ];
    render(
      <>
        <OpenApiResponses
          labels={ENGLISH_RESPONSE_LABELS}
          renderDescription={() => null}
          renderHeaders={() => null}
          renderSchema={() => ({ hasFields: false, node: null })}
          responses={responses}
          sectionId="responses-one"
        />
        <OpenApiResponses
          labels={ENGLISH_RESPONSE_LABELS}
          renderDescription={() => null}
          renderHeaders={() => null}
          renderSchema={() => ({ hasFields: false, node: null })}
          responses={responses}
          sectionId="responses-two"
        />
      </>,
    );

    const triggers = screen.getAllByRole('tab', { name: '200' });
    const selects = screen.getAllByLabelText('Media type for 200 response');
    expect(new Set(triggers.map((trigger) => trigger.id)).size).toBe(2);
    expect(
      new Set(triggers.map((trigger) => trigger.getAttribute('aria-controls')))
        .size,
    ).toBe(2);
    expect(new Set(selects.map((select) => select.id)).size).toBe(2);
  });

  it('scrolls a hash target after the opened panel commits and cancels its frame', () => {
    const callbacks: FrameRequestCallback[] = [];
    const requestAnimationFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callbacks.push(callback);
        return callbacks.length;
      });
    const cancelAnimationFrame = vi.spyOn(window, 'cancelAnimationFrame');
    window.location.hash = 'response-headers-default-x-request-id';
    const { unmount } = render(
      <OpenApiResponses
        labels={ENGLISH_RESPONSE_LABELS}
        renderDescription={() => null}
        renderHeaders={(headers, status) =>
          headers.map((header) => (
            <div
              id={`response-headers-${status}-${header.name}`}
              key={header.name}
            >
              {header.name}
            </div>
          ))
        }
        renderSchema={() => ({ hasFields: false, node: null })}
        responses={[
          view('default', {
            headers: [
              {
                name: 'x-request-id',
                schema: { type: 'string' },
                source: { schema: { type: 'string' } },
              },
            ],
          }),
          view('200'),
        ]}
        sectionId="test-responses"
      />,
    );

    const panel = document.getElementById(
      getResponseTab('default').getAttribute('aria-controls') ?? '',
    );
    expect(panel).not.toHaveAttribute('hidden');
    const target = document.getElementById(
      'response-headers-default-x-request-id',
    );
    expect(target).toBeVisible();
    act(() => {
      callbacks.forEach((callback) => {
        callback(0);
      });
    });
    expect(syncHashTarget).toHaveBeenCalledWith('auto');

    act(() => window.dispatchEvent(new HashChangeEvent('hashchange')));

    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
    requestAnimationFrame.mockRestore();
    cancelAnimationFrame.mockRestore();
  });
});
