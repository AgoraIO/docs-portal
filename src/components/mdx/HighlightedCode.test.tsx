import { render, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HighlightedCode } from './HighlightedCode';

describe('shared runtime code highlighting', () => {
  it('preserves every source newline before hydration', () => {
    const source = 'const value = 1;\n\nconsole.log(value);\n';
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(
      <HighlightedCode language="js" source={source} />,
    );
    expect(container.textContent).toBe(source);
    expect(container.querySelector('[data-syntax-pending]')).not.toBeNull();
  });

  it.each([
    ['arkts', 'public getValue(): string { return this.value; }\n'],
    ['cpp', 'virtual int callback(const Config& config);\n'],
    ['curl', 'curl --request POST https://example.com\n'],
    ['json', '{"value": 1}\n'],
  ])('uses real dual-theme Shiki tokens for %s', async (language, source) => {
    const { container } = render(
      <HighlightedCode language={language} source={source} />,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-syntax-pending]')).toBeNull(),
    );
    expect(container.textContent).toBe(source);
    const tokens = container.querySelectorAll('span[style*="--shiki-light"]');
    expect(tokens.length).toBeGreaterThan(0);
    expect(
      [...tokens].every((token) =>
        token.getAttribute('style')?.includes('--shiki-dark'),
      ),
    ).toBe(true);
  });

  it('keeps plain output intact without inventing a grammar', async () => {
    const source = 'Output: <unknown>\n  second line\n';
    const { container } = render(
      <HighlightedCode language="text" source={source} />,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-syntax-pending]')).toBeNull(),
    );
    expect(container.textContent).toBe(source);
  });
});
