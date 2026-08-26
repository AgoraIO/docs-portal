import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { OpenApiResponseView } from '@/lib/openapi/response-view';
import { OpenApiResponses } from './OpenApiResponses';

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
        renderDescription={(markdown) => <p>Description: {markdown}</p>}
        renderHeaders={(headers, status) =>
          headers.length ? <p>Headers: {status}</p> : null
        }
        renderSchema={renderSchema}
        responses={responses}
      />,
    ),
  };
}

describe('OpenApiResponses', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('defaults to the first 2xx response and keeps accordion panels independently expanded', () => {
    renderResponses([view('default'), view('200')]);

    expect(
      screen.getByRole('button', { name: 'default application/json' }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByRole('button', { name: '200 application/json' }),
    ).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(
      screen.getByRole('button', { name: 'default application/json' }),
    );

    expect(screen.getAllByText('Schema: application/json')).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: '200 application/json' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens the first response without a 2xx and handles no responses', () => {
    const { rerender } = renderResponses([view('default'), view('404')]);
    expect(
      screen.getByRole('button', { name: 'default application/json' }),
    ).toHaveAttribute('aria-expanded', 'true');

    rerender(
      <OpenApiResponses
        renderDescription={() => null}
        renderHeaders={() => null}
        renderSchema={() => ({ hasFields: false, node: null })}
        responses={[]}
      />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('distinguishes empty content, absent schemas, and an explicit false schema', () => {
    const renderSchema = vi.fn(() => ({ hasFields: false, node: null }));
    renderResponses(
      [
        view('200', { hasContent: false }),
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

    expect(screen.getByText('Empty response body')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '201' }));
    expect(screen.getByText('Schema not provided')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: '202 application/json' }),
    );
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
    expect(
      screen.getByRole('button', { name: '200 text/plain' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(renderSchema).toHaveBeenLastCalledWith({
      mediaType: 'text/plain',
      schema: {},
      status: '200',
    });
    expect(
      screen.getByRole('button', { name: '201 application/json' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders description, media selector, headers, then schema', () => {
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
    const schema = screen.getByText('Schema: application/json');
    expect(description.compareDocumentPosition(select)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(select.compareDocumentPosition(headers)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(headers.compareDocumentPosition(schema)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('opens statuses targeted by response field and header hashes and removes its listener', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    window.location.hash = 'responses-default-detail';
    const { unmount } = renderResponses([view('default'), view('200')]);
    expect(
      screen.getByRole('button', { name: 'default application/json' }),
    ).toHaveAttribute('aria-expanded', 'true');
    window.location.hash = 'response-headers-default-x-request-id';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(
      screen.getByRole('button', { name: 'default application/json' }),
    ).toHaveAttribute('aria-expanded', 'true');
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

    expect(
      screen.getByRole('button', { name: '200 application/json' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', { name: 'default application/json' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('preserves user state for the same response identity and resets it for a new identity', () => {
    const responses = [view('default'), view('200')];
    const { rerender } = renderResponses(responses);
    fireEvent.click(
      screen.getByRole('button', { name: 'default application/json' }),
    );
    rerender(
      <OpenApiResponses
        renderDescription={() => null}
        renderHeaders={() => null}
        renderSchema={() => ({ hasFields: false, node: null })}
        responses={responses}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'default application/json' }),
    ).toHaveAttribute('aria-expanded', 'true');
    rerender(
      <OpenApiResponses
        renderDescription={() => null}
        renderHeaders={() => null}
        renderSchema={() => ({ hasFields: false, node: null })}
        responses={[view('201')]}
      />,
    );
    expect(
      screen.getByRole('button', { name: '201 application/json' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('provides matching accessible controls for response panels', () => {
    renderResponses([view('200')]);
    const trigger = screen.getByRole('button', {
      name: '200 application/json',
    });
    const panel = document.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    );
    expect(panel).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
