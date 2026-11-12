// Serialized into real Chrome. Keep this function independent of Node imports.
export function inspectReference() {
  const article = document.querySelector('article');
  const visible = (element) =>
    element.checkVisibility({
      checkVisibilityCSS: true,
      contentVisibilityAuto: true,
    }) && element.getBoundingClientRect().width > 0;
  const issues = [];
  const add = (rule, element, detail = {}) =>
    issues.push({
      rule,
      text: element?.textContent?.trim().slice(0, 120),
      ...detail,
    });
  if (!article || article.textContent.trim().length < 10)
    add('missing-body', article);
  if (document.querySelector('[data-testid="docs-content-skeleton"]'))
    add('body-skeleton', null);
  if (document.documentElement.scrollWidth > innerWidth + 2)
    add('page-overflow', null, {
      viewport: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    });
  for (const link of document.querySelectorAll('aside nav a')) {
    if (visible(link) && link.scrollWidth > link.clientWidth + 2)
      add('toc-overflow', link);
  }
  for (const type of document.querySelectorAll('[data-api-return-type]')) {
    if (visible(type) && type.scrollWidth > type.clientWidth + 2)
      add('overflowing-api-type', type);
  }
  for (const section of document.querySelectorAll('[data-api-returns]')) {
    if (!visible(section)) continue;
    const type = section.querySelector('[data-api-return-type]');
    const description = section.querySelector('[data-api-return-description]');
    if (
      description &&
      !description.textContent.trim() &&
      !description.querySelector('img, video, pre')
    )
      add('empty-api-return-description', section);
    if (
      section.dataset.apiReturnLayout === 'type' &&
      (!type?.textContent.trim() ||
        description ||
        section.querySelector('table'))
    )
      add('invalid-api-return-layout', section);
  }
  for (const description of document.querySelectorAll(
    '[data-parameter-description]',
  )) {
    if (!visible(description)) continue;
    const first = description.firstElementChild;
    if (
      first?.matches('a[id], a[name]') &&
      !first.textContent.trim() &&
      first.nextElementSibling &&
      parseFloat(getComputedStyle(first.nextElementSibling).marginTop) > 2
    )
      add('parameter-anchor-spacing', description);
  }
  for (const heading of document.querySelectorAll(
    '[data-parameter-list] tbody th[scope="row"]',
  )) {
    const description = heading.nextElementSibling;
    if (
      visible(heading) &&
      description &&
      getComputedStyle(heading).backgroundColor !==
        getComputedStyle(description).backgroundColor
    )
      add('inconsistent-parameter-row-surface', heading);
  }
  for (const list of document.querySelectorAll(
    '[data-parameter-list][data-parameter-nested="true"]',
  )) {
    if (
      visible(list) &&
      (list.tagName !== 'UL' ||
        [...list.querySelectorAll('[data-parameter-item]')].some(
          (item) => item.tagName !== 'LI',
        ))
    )
      add('nonstandard-nested-parameters', list);
  }
  for (const button of document.querySelectorAll(
    '[data-openapi-field-toggle], .openapi-schema-toolbar button',
  )) {
    if (!visible(button)) continue;
    const { width, height } = button.getBoundingClientRect();
    if (width < 43.5 || height < 43.5)
      add('small-schema-target', button, { width, height });
  }
  for (const list of document.querySelectorAll(
    '[data-parameter-description] ul:not([data-parameter-possible-values]), [data-parameter-description] ol, [data-api-return-description] ul, [data-api-return-description] ol, [data-parameter-nested]',
  )) {
    const style = getComputedStyle(list);
    if (
      visible(list) &&
      (style.listStyleType === 'none' ||
        parseFloat(style.paddingInlineStart) < 12)
    )
      add('unstyled-description-list', list);
  }
  for (const cell of document.querySelectorAll('article td, article th')) {
    if (!visible(cell) || cell.closest('pre')) continue;
    const text = cell.textContent.trim(),
      style = getComputedStyle(cell);
    const width =
      cell.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    if (
      text.length > 80 &&
      width < 70 &&
      cell.clientHeight > parseFloat(style.lineHeight) * 4
    )
      add('squeezed-table-prose', cell, { width });
    if (
      !/^(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|\d+\/(?:second|minute|hour|day|sec|s))$/.test(
        text,
      )
    )
      continue;
    const word = text.includes('/') ? text.split('/')[1] : text;
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const start = node.textContent.indexOf(word);
      if (start < 0) continue;
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, start + word.length);
      const lines = new Set(
        [...range.getClientRects()]
          .filter((rect) => rect.width && rect.height)
          .map((rect) => Math.round(rect.y)),
      );
      if (lines.size > 1) add('split-short-table-word', cell, { word });
    }
  }
  for (const tabs of document.querySelectorAll('article [role="tablist"]')) {
    if (!visible(tabs)) continue;
    const style = getComputedStyle(tabs.parentElement);
    if (
      parseFloat(style.borderTopLeftRadius) > 0 &&
      style.overflowX === 'visible' &&
      getComputedStyle(tabs).backgroundColor !== 'rgba(0, 0, 0, 0)'
    )
      add('tab-frame-leak', tabs);
  }
  for (const block of document.querySelectorAll(
    'article [data-code-language]',
  )) {
    const language = block.getAttribute('data-code-language');
    if (!visible(block) || !language || /^(text|plaintext|txt)$/.test(language))
      continue;
    const code = block.querySelector('pre code');
    if (code?.textContent.trim() && !code.querySelector('span[style*="shiki"]'))
      add('missing-syntax-highlight', block, { language });
    if (code) {
      const tokens = [...code.querySelectorAll('span[style*="shiki"]')].filter(
        (token) => token.textContent.trim(),
      );
      const variable = document.documentElement.classList.contains('dark')
        ? '--shiki-dark'
        : '--shiki-light';
      const authoredColors = new Set(
        tokens
          .map((token) => token.style.getPropertyValue(variable))
          .filter(Boolean),
      );
      const renderedColors = new Set(
        tokens.map((token) => getComputedStyle(token).color),
      );
      if (authoredColors.size > 1 && renderedColors.size === 1)
        add('flattened-syntax-highlight', block, { language });
    }
  }
  const ordinaryCode = [
    ...document.querySelectorAll(
      'article figure.shiki:not([data-api-signature])',
    ),
  ].find(visible);
  for (const signature of document.querySelectorAll(
    'article [data-api-signature]',
  )) {
    if (!visible(signature)) continue;
    const code = signature.querySelector('pre code');
    for (const link of signature.querySelectorAll('pre code a[href]')) {
      const style = getComputedStyle(link);
      if (
        visible(link) &&
        code &&
        style.color === getComputedStyle(code).color &&
        !style.textDecorationLine.includes('underline')
      )
        add('indistinguishable-api-type-link', link);
    }
    if (
      !signature.matches('figure.shiki') ||
      !signature.querySelector('pre code > .line')
    ) {
      add('nonstandard-api-signature', signature);
      continue;
    }
    if (ordinaryCode) {
      const actual = getComputedStyle(signature),
        expected = getComputedStyle(ordinaryCode);
      if (
        ['backgroundColor', 'borderTopLeftRadius', 'borderTopWidth'].some(
          (property) => actual[property] !== expected[property],
        )
      )
        add('inconsistent-code-frame', signature);
    }
  }
  for (const code of document.querySelectorAll(
    'article figure.shiki pre code',
  )) {
    if (!visible(code)) continue;
    const font = getComputedStyle(code).fontFamily;
    for (const inline of code.querySelectorAll('a, em, strong')) {
      if (getComputedStyle(inline).fontFamily !== font) {
        add('inconsistent-code-typography', inline);
        break;
      }
    }
  }
  for (const parameters of document.querySelectorAll(
    'article [data-parameter-list]:not([data-parameter-nested]), article [data-api-returns]:not([data-api-return-layout="type"])',
  )) {
    if (
      visible(parameters) &&
      !parameters.querySelector(
        ':scope > .docs-table-container > section > table',
      )
    )
      add('nonstandard-api-table', parameters);
  }
  for (const image of document.querySelectorAll('article img')) {
    const src = image.currentSrc || image.src;
    if (
      /https?:\/\/(?:doc\.shengwang\.cn|doc\.agora\.io)\/(?:img|images|assets)\//.test(
        src,
      )
    )
      add('legacy-image-origin', image, { src });
    if (visible(image) && image.complete && !image.naturalWidth)
      add('broken-image', image, { src });
  }
  const frameStyles = (selector) => {
    const unique = new Map();
    for (const frame of document.querySelectorAll(selector)) {
      if (!visible(frame)) continue;
      const style = getComputedStyle(frame),
        pre = frame.querySelector('pre');
      if (!pre) continue;
      const text = getComputedStyle(pre);
      const value = {
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderTopLeftRadius,
        borderWidth: style.borderTopWidth,
        fontFamily: text.fontFamily,
        fontSize: text.fontSize,
      };
      unique.set(JSON.stringify(value), value);
    }
    return [...unique.values()];
  };
  return {
    issues,
    codeFrames: {
      ordinary: frameStyles(
        'article figure.shiki[data-code-language]:not([data-api-signature])',
      ),
      signatures: frameStyles('article figure[data-api-signature]'),
    },
    actualViewport: {
      width: innerWidth,
      height: innerHeight,
      dpr: devicePixelRatio,
    },
    actualTheme: document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light',
    title: article?.querySelector('h1')?.textContent ?? document.title,
    url: location.href,
    detailed: !!document.querySelector('article table, .openapi-operation'),
    fonts: [...document.fonts]
      .filter((font) => font.status !== 'unloaded')
      .map((font) => ({
        family: font.family,
        weight: font.weight,
        status: font.status,
      })),
  };
}

// These broken examples prove the detector goes red in the same browser used for QA.
export const canaryHtml = `<!doctype html><html><body><article>
<h1>Regression detector calibration</h1>
<div style="width:200vw">Overflow</div>
<button data-openapi-field-toggle style="width:10px;height:10px;padding:0">x</button>
<div data-parameter-description><ul style="list-style:none;padding:0"><li>Lost marker</li></ul></div>
<table style="table-layout:fixed;width:20px"><tr><td style="word-break:break-all;width:20px">DELETE</td></tr></table>
<div style="border-radius:12px;overflow:visible"><div role="tablist" style="background:red">Tabs</div></div>
<table style="table-layout:fixed;width:20px"><tr><td style="width:20px;line-height:20px">A long description that has been squeezed into a very narrow table column and is no longer readable as continuous prose.</td></tr></table>
<aside><nav><a style="display:block;width:20px;overflow:hidden">A clipped table of contents link</a></nav></aside>
<figure class="shiki" data-code-language="cpp"><pre><code>int callback();</code></pre></figure>
<figure data-code-language="cpp"><pre><code><span style="--shiki-light:red;--shiki-dark:red;color:black">int</span><span style="--shiki-light:blue;--shiki-dark:blue;color:black">callback</span></code></pre></figure>
<div data-api-signature>Unshared signature frame</div>
<figure class="shiki" data-api-signature style="background:red;border-radius:24px"><pre><code><span class="line">void callback();</span></code></pre></figure>
<figure class="shiki"><pre><code style="font-family:monospace"><span class="line"><a href="#type" style="font-family:serif">Inconsistent type font</a></span></code></pre></figure>
<section data-parameter-list><div>Unshared parameter grid</div></section>
<div data-parameter-list data-parameter-nested="true"><div data-parameter-item>Unshared nested card</div></div>
<div data-api-return-type style="width:100px;white-space:pre">Promise&lt;VeryLongVideoTrackInterface,VeryLongAudioTrackInterface&gt;</div>
<section data-api-returns><table><tbody><tr><td data-api-return-type>void</td><td data-api-return-description></td></tr></tbody></table></section>
<section data-api-returns data-api-return-layout="type"><div data-api-return-description>Missing return type</div></section>
<figure class="shiki" data-api-signature><pre><code style="color:black"><span class="line">open(<a href="#type" style="color:black;text-decoration:none;font-family:inherit">Options</a>)</span></code></pre></figure>
<div data-parameter-description><a id="old-parameter"></a><p style="margin-top:19px">Path to the image.</p></div>
<section data-parameter-list><table><tbody><tr><th scope="row" style="background:beige">uid</th><td style="background:white">User identifier.</td></tr></tbody></table></section>
</article></body></html>`;
export const canaryRules = [
  'page-overflow',
  'small-schema-target',
  'unstyled-description-list',
  'split-short-table-word',
  'tab-frame-leak',
  'squeezed-table-prose',
  'toc-overflow',
  'missing-syntax-highlight',
  'flattened-syntax-highlight',
  'nonstandard-api-signature',
  'inconsistent-code-frame',
  'nonstandard-api-table',
  'inconsistent-code-typography',
  'overflowing-api-type',
  'nonstandard-nested-parameters',
  'empty-api-return-description',
  'invalid-api-return-layout',
  'indistinguishable-api-type-link',
  'parameter-anchor-spacing',
  'inconsistent-parameter-row-surface',
];
