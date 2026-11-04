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
  for (const button of document.querySelectorAll(
    '[data-openapi-field-toggle], .openapi-schema-toolbar button',
  )) {
    if (!visible(button)) continue;
    const { width, height } = button.getBoundingClientRect();
    if (width < 43.5 || height < 43.5)
      add('small-schema-target', button, { width, height });
  }
  for (const list of document.querySelectorAll(
    '[data-parameter-description] ul:not([data-parameter-possible-values]), [data-parameter-description] ol, [data-api-return-description] ul, [data-api-return-description] ol',
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
  return {
    issues,
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
</article></body></html>`;
export const canaryRules = [
  'page-overflow',
  'small-schema-target',
  'unstyled-description-list',
  'split-short-table-word',
  'tab-frame-leak',
  'squeezed-table-prose',
  'toc-overflow',
];
