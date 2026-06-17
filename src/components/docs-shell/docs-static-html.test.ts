import { describe, expect, it } from 'vitest';
import { getInitialStaticDocsHtml } from './docs-static-html';

describe('docs-static-html', () => {
  it('reads the existing prerendered docs body for the matching content path', () => {
    document.body.innerHTML = `
      <article data-dr="/en/introduction/about-agora">
        <div class="docs-body">
          <h2>About Agora</h2>
          <p>Static body</p>
        </div>
      </article>
    `;

    expect(
      getInitialStaticDocsHtml('/en/introduction/about-agora'),
    ).toContain('<h2>About Agora</h2>');
    expect(
      getInitialStaticDocsHtml('/en/introduction/about-agora'),
    ).toContain('<p>Static body</p>');
  });

  it('ignores prerendered docs bodies for other content paths', () => {
    document.body.innerHTML = `
      <article data-dr="/en/introduction/about-agora">
        <div class="docs-body">
          <p>Static body</p>
        </div>
      </article>
    `;

    expect(
      getInitialStaticDocsHtml('/en/introduction/other-page'),
    ).toBeNull();
  });
});
