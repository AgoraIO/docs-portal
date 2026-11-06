import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { inspectReference } from './lib/api-reference-quality/probe.mjs';

beforeEach(() => {
  document.body.innerHTML = '<article><h1>Reference</h1></article>';
  vi.spyOn(Element.prototype, 'checkVisibility').mockReturnValue(true);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
    DOMRect.fromRect({ width: 300, height: 100 }),
  );
  Object.defineProperty(document, 'fonts', { configurable: true, value: [] });
});
afterEach(() => vi.restoreAllMocks());
const inspect = (html: string) => {
  document.querySelector('article')!.insertAdjacentHTML('beforeend', html);
  return inspectReference().issues.map((issue: { rule: string }) => issue.rule);
};

describe('API presentation regression detection', () => {
  it('rejects nested parameter cards and accepts native lists inside the parent table', () => {
    expect(
      inspect(
        '<div data-parameter-list data-parameter-nested="true"><div data-parameter-item>flag</div></div>',
      ),
    ).toContain('nonstandard-nested-parameters');
    document.querySelector('article')!.innerHTML = '<h1>Reference</h1>';
    expect(
      inspect(
        '<table><tr><td><ul data-parameter-list data-parameter-nested="true"><li data-parameter-item>flag</li></ul></td></tr></table>',
      ),
    ).not.toContain('nonstandard-nested-parameters');
  });
  it('rejects overflowing return types and accepts types that fit their cell', () => {
    const type = document.createElement('div');
    type.dataset.apiReturnType = '';
    type.textContent = 'Promise<VideoTrack, AudioTrack>';
    document.querySelector('article')!.append(type);
    Object.defineProperty(type, 'clientWidth', {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(type, 'scrollWidth', {
      configurable: true,
      value: 300,
    });
    expect(inspect('')).toContain('overflowing-api-type');
    Object.defineProperty(type, 'scrollWidth', {
      configurable: true,
      value: 100,
    });
    expect(inspect('')).not.toContain('overflowing-api-type');
  });
  it('fails missing highlighting for a declared programming language', () => {
    expect(
      inspect(
        '<figure data-code-language="cpp"><pre><code>int value = 1;</code></pre></figure>',
      ),
    ).toContain('missing-syntax-highlight');
  });
  it('preserves plain output and accepts actual highlighted tokens', () => {
    const rules = inspect(
      '<figure data-code-language="text"><pre><code>plain output</code></pre></figure><figure data-code-language="cpp"><pre><code><span style="--shiki-light:red;--shiki-dark:blue">int</span> value;</code></pre></figure>',
    );
    expect(rules).not.toContain('missing-syntax-highlight');
  });
  it('rejects private signature frames and parameter grids', () => {
    const rules = inspect(
      '<div data-api-signature>void f();</div><section data-parameter-list><div>uid</div></section>',
    );
    expect(rules).toContain('nonstandard-api-signature');
    expect(rules).toContain('nonstandard-api-table');
  });
  it('accepts native shared frames and table wrappers, including nested fields', () => {
    const rules = inspect(
      '<figure class="shiki" data-api-signature><pre><code><span class="line">void f();</span></code></pre></figure><section data-parameter-list><div class="docs-table-container"><section><table><tbody><tr><td><div data-parameter-list data-parameter-nested="true">nested</div></td></tr></tbody></table></section></div></section>',
    );
    expect(rules).not.toContain('nonstandard-api-signature');
    expect(rules).not.toContain('nonstandard-api-table');
  });
  it('detects signature frames with divergent surfaces', () => {
    expect(
      inspect(
        '<figure class="shiki" style="background:white;border-radius:12px"><pre><code>example</code></pre></figure><figure class="shiki" data-api-signature style="background:red;border-radius:24px"><pre><code><span class="line">void f();</span></code></pre></figure>',
      ),
    ).toContain('inconsistent-code-frame');
  });
});

it('detects syntax tokens flattened to one color by CSS', () => {
  const rules = inspect(
    '<figure data-code-language="cpp"><pre><code><span style="--shiki-light:red;--shiki-dark:red;color:black">int</span><span style="--shiki-light:blue;--shiki-dark:blue;color:black">callback</span></code></pre></figure>',
  );
  expect(rules).toContain('flattened-syntax-highlight');
});

it('rejects independently skinned return-value grids too', () => {
  expect(
    inspect('<section data-api-returns><div>Return value</div></section>'),
  ).toContain('nonstandard-api-table');
});

import { sharedCodeFrameFindings } from './lib/api-reference-quality/policy.mjs';

it('compares signature styles with ordinary code across pages and refuses missing references', () => {
  const frame = {
    backgroundColor: 'rgb(255,255,255)',
    borderRadius: '12px',
    borderWidth: '1px',
    fontFamily: 'monospace',
    fontSize: '14px',
  };
  const signature = {
    url: '/signature',
    states: [
      { viewport: 'phone', theme: 'dark', codeFrames: { signatures: [frame] } },
    ],
  };
  const ordinary = {
    url: '/example',
    states: [
      { viewport: 'phone', theme: 'dark', codeFrames: { ordinary: [frame] } },
    ],
  };
  expect(sharedCodeFrameFindings([signature])).toHaveLength(1);
  expect(sharedCodeFrameFindings([signature, ordinary])).toEqual([]);
  expect(
    sharedCodeFrameFindings([
      signature,
      {
        ...ordinary,
        states: [
          {
            ...ordinary.states[0],
            codeFrames: { ordinary: [{ ...frame, borderRadius: '24px' }] },
          },
        ],
      },
    ]),
  ).toHaveLength(1);
});

it('rejects signature fragments that become separate flex rows and mixed type fonts', () => {
  expect(
    inspect(
      '<figure class="shiki" data-api-signature><pre><code>void f(<a href="#type">Type</a>);</code></pre></figure>',
    ),
  ).toContain('nonstandard-api-signature');
  expect(
    inspect(
      '<figure class="shiki"><pre><code style="font-family:monospace"><span class="line"><a href="#type" style="font-family:serif">Type</a></span></code></pre></figure>',
    ),
  ).toContain('inconsistent-code-typography');
});
