import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { highlightOpenApiCode } from './code-highlight';

describe('highlightOpenApiCode', () => {
  it('renders shell and JSON tokens while preserving source text', () => {
    const source = String.raw`curl --request post \
--header 'Authorization: Basic token' \
--data '{"name":"unique_name","idle_timeout":120}'`;
    const markup = renderToStaticMarkup(
      highlightOpenApiCode({ language: 'bash', source }),
    );

    expect(markup).toContain('class="line"');
    expect(markup).toContain('class="token-command"');
    expect(markup).toContain('class="token-flag"');
    expect(markup).toContain('class="token-string"');
    expect(markup).toContain('class="token-key"');
    expect(markup).toContain('class="token-number"');
    expect(markup).toContain('>curl</span>');
    expect(markup).toContain('&#x27;Authorization: Basic token&#x27;');
    expect(markup).toContain('&quot;name&quot;');
  });

  it('uses language-aware keywords for Python and JavaScript', () => {
    const python = renderToStaticMarkup(
      highlightOpenApiCode({
        language: 'python',
        source: 'import requests\nresponse = requests.post(url)',
      }),
    );
    const javascript = renderToStaticMarkup(
      highlightOpenApiCode({
        language: 'javascript',
        source: 'const response = await fetch(url)',
      }),
    );

    expect(python).toContain('class="token-keyword"');
    expect(javascript).toContain('class="token-keyword"');
    expect(javascript).toContain('class="token-function"');
  });
});
