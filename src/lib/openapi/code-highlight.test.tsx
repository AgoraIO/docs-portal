import { render, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { highlightOpenApiCode } from './code-highlight';

describe('highlightOpenApiCode', () => {
  it('enhances code with Shiki without changing the copied command', async () => {
    const source = String.raw`curl --request post \
--header 'Authorization: Basic token' \
--data '{"name":"unique_name","idle_timeout":120}'`;
    const { container } = render(
      highlightOpenApiCode({ language: 'bash', source }),
    );
    expect(container.textContent).toBe(source);
    await waitFor(() =>
      expect(container.querySelector('code')).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
    expect(container.textContent).toBe(source);
    expect(
      container.querySelector('span[style*="--shiki-light"]'),
    ).toBeInTheDocument();
  });
  it('keeps code available and escaped during server rendering', () => {
    const markup = renderToStaticMarkup(
      highlightOpenApiCode({
        language: 'python',
        source: 'print("<response>")',
      }),
    );
    expect(markup).toContain('&lt;response&gt;');
    expect(markup).not.toContain('<response>');
  });
});
