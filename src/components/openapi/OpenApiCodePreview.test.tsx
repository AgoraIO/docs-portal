import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OpenApiCodePreview } from './OpenApiCodePreview';

function CodeTabs() {
  return (
    <>
      <div role="tablist">
        <button role="tab" type="button">
          curl
        </button>
      </div>
      <div role="tabpanel">
        <div className="fd-scroll-container">
          <pre>
            <code>curl --request GET https://example.com/very-long-path</code>
          </pre>
        </div>
      </div>
    </>
  );
}

describe('OpenApiCodePreview', () => {
  it('toggles wrapping without changing the source content', () => {
    render(
      <OpenApiCodePreview resetKey="operation-a">
        <CodeTabs />
      </OpenApiCodePreview>,
    );

    const preview = screen.getByTestId('openapi-code-preview');
    const button = screen.getByRole('button', { name: 'Wrap lines' });
    const source = 'curl --request GET https://example.com/very-long-path';

    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(preview).toHaveAttribute('data-wrap-lines', 'false');
    expect(preview).toHaveTextContent(source);

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(preview).toHaveAttribute('data-wrap-lines', 'true');
    expect(preview).toHaveTextContent(source);
  });

  it('marks panel code viewports without including language tabs', async () => {
    render(
      <OpenApiCodePreview resetKey="operation-a">
        <CodeTabs />
      </OpenApiCodePreview>,
    );

    const viewport = await screen.findByText(/curl --request/);
    expect(viewport.closest('.fd-scroll-container')).toHaveAttribute(
      'data-openapi-code-viewport',
      '',
    );
    expect(screen.getByRole('tablist')).not.toHaveAttribute(
      'data-openapi-code-viewport',
    );
  });

  it('marks code viewports added after render', async () => {
    const { container } = render(
      <OpenApiCodePreview resetKey="operation-a">
        <div />
      </OpenApiCodePreview>,
    );
    const root = screen.getByTestId('openapi-code-preview');
    const panel = document.createElement('div');
    panel.setAttribute('role', 'tabpanel');
    panel.innerHTML =
      '<div class="fd-scroll-container"><pre>new code</pre></div>';
    root.append(panel);

    await waitFor(() => {
      expect(panel.querySelector('.fd-scroll-container')).toHaveAttribute(
        'data-openapi-code-viewport',
        '',
      );
    });
    expect(container).toContainElement(panel);
  });

  it('marks initial viewports when MutationObserver is unavailable', () => {
    const originalMutationObserver = globalThis.MutationObserver;
    vi.stubGlobal('MutationObserver', undefined);

    try {
      render(
        <OpenApiCodePreview resetKey="operation-a">
          <CodeTabs />
        </OpenApiCodePreview>,
      );

      expect(
        screen.getByText(/curl --request/).closest('.fd-scroll-container'),
      ).toHaveAttribute('data-openapi-code-viewport', '');
    } finally {
      vi.stubGlobal('MutationObserver', originalMutationObserver);
    }
  });

  it('keeps wrapping for the same reset key and resets it for a new key', () => {
    const { rerender } = render(
      <OpenApiCodePreview resetKey="operation-a">
        <CodeTabs />
      </OpenApiCodePreview>,
    );
    const button = screen.getByRole('button', { name: 'Wrap lines' });
    fireEvent.click(button);

    rerender(
      <OpenApiCodePreview resetKey="operation-a">
        <CodeTabs />
      </OpenApiCodePreview>,
    );
    expect(button).toHaveAttribute('aria-pressed', 'true');

    rerender(
      <OpenApiCodePreview resetKey="operation-b">
        <CodeTabs />
      </OpenApiCodePreview>,
    );
    expect(screen.getByRole('button', { name: 'Wrap lines' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
