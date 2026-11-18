import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DOCS_HASH_TARGET_EVENT } from '@/lib/docs-hash';
import { OpenApiOperationPanels } from './OpenApiOperationPanels';

function Page({ locale = 'zh-CN' }: { locale?: string }) {
  return (
    <OpenApiOperationPanels
      overview={<p>Shared overview</p>}
      documentation={<h2 id="parameters-query">查询参数</h2>}
      examples={
        <>
          <h2 id="response-example">响应示例</h2>
          <input aria-label="Example value" defaultValue="initial" />
        </>
      }
      locale={locale}
    />
  );
}

describe('OpenApiOperationPanels', () => {
  it('switches mobile views without remounting example controls', () => {
    render(<Page />);
    const documentation = screen.getByRole('tab', { name: '接口文档' });
    const examples = screen.getByRole('tab', { name: '请求与响应示例' });
    expect(documentation).toHaveAttribute('aria-selected', 'true');
    const overview = screen.getByText('Shared overview');
    expect(overview.closest('[data-openapi-operation-panel]')).toBeNull();
    fireEvent.mouseDown(examples, { button: 0, ctrlKey: false });
    expect(examples).toHaveAttribute('aria-selected', 'true');
    expect(overview).toBeVisible();
    const input = screen.getByRole('textbox', { name: 'Example value' });
    fireEvent.change(input, { target: { value: 'kept' } });
    fireEvent.mouseDown(documentation, { button: 0, ctrlKey: false });
    fireEvent.mouseDown(examples, { button: 0, ctrlKey: false });
    expect(screen.getByRole('textbox', { name: 'Example value' })).toBe(input);
    expect(input).toHaveValue('kept');
  });

  it('keeps the examples rail height when a response status shortens documentation', async () => {
    let documentationHeight = 480;
    const originalGetBoundingClientRect =
      HTMLElement.prototype.getBoundingClientRect;
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (
          this.getAttribute('data-openapi-operation-panel') === 'documentation'
        ) {
          return {
            x: 0,
            y: 0,
            width: 800,
            height: documentationHeight,
            top: 0,
            left: 0,
            right: 800,
            bottom: documentationHeight,
            toJSON: () => ({}),
          } as DOMRect;
        }
        return originalGetBoundingClientRect.call(this);
      });
    const renderDocumentation = (summary: string) => (
      <div data-openapi-responses>
        <button type="button" role="tab">
          非 200
        </button>
        <div>{summary}</div>
      </div>
    );
    const examplesContent = <p>Response examples</p>;
    const { container, rerender } = render(
      <OpenApiOperationPanels
        documentation={renderDocumentation('Long success schema')}
        examples={examplesContent}
        locale="zh-CN"
      />,
    );
    const examples = container.querySelector(
      '[data-openapi-operation-panel="examples"]',
    ) as HTMLElement;

    await waitFor(() => {
      expect(
        examples.style.getPropertyValue('--openapi-examples-min-height'),
      ).toBe('480px');
    });
    fireEvent.mouseDown(screen.getByRole('tab', { name: '非 200' }), {
      button: 0,
      ctrlKey: false,
    });
    documentationHeight = 120;
    rerender(
      <OpenApiOperationPanels
        documentation={renderDocumentation('Short error note')}
        examples={examplesContent}
        locale="zh-CN"
      />,
    );

    expect(await screen.findByText('Short error note')).toBeVisible();
    expect(
      examples.style.getPropertyValue('--openapi-examples-min-height'),
    ).toBe('480px');
    getBoundingClientRect.mockRestore();
  });

  it('reveals the panel containing a heading requested by the docs navigation', () => {
    render(<Page />);
    act(() =>
      window.dispatchEvent(
        new CustomEvent(DOCS_HASH_TARGET_EVENT, {
          detail: '#response-example',
        }),
      ),
    );
    expect(screen.getByRole('tab', { name: '请求与响应示例' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    act(() =>
      window.dispatchEvent(
        new CustomEvent(DOCS_HASH_TARGET_EVENT, {
          detail: '#parameters-query',
        }),
      ),
    );
    expect(screen.getByRole('tab', { name: '接口文档' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('localizes the view switcher for English pages', () => {
    render(<Page locale="en" />);
    expect(
      screen.getByRole('tablist', { name: 'API documentation view' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Request & response examples' }),
    ).toBeInTheDocument();
  });
});
