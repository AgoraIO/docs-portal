// Requires agent-browser and a CN dev server.
// Run: node scripts/check-docs-feedback-layout.mjs [origin] [route]
// Uses the rendered docs shell; a DOM-only test cannot measure sticky layout.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const origin = process.argv[2] ?? 'http://127.0.0.1:3041';
const route = process.argv[3] ?? '/introduction/quickstart';
const browser = (...args) =>
  execFileSync(
    'agent-browser',
    ['--session', 'cn-feedback-regression', ...args],
    { encoding: 'utf8' },
  );
const probe = async (shortArticle = false) => {
  await document.fonts.ready;
  if (shortArticle) {
    // Keep the real shell and feedback component; minimise only the article.
    const article = document.querySelector(
      '[data-testid="docs-main-mobile-flow"] > div',
    );
    article.replaceChildren(document.createTextNode('Short article fixture.'));
  }
  const frames = () =>
    new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  const root = document.querySelector('[data-testid="docs-feedback"]');
  const buttons = [...root.querySelectorAll('button')];
  root.scrollIntoView({ block: 'center' });
  await frames();
  for (const id of ['docs-sidebar-scroll', 'docs-toc-rail-scroll']) {
    const area = document.querySelector(`[data-testid="${id}"]`);
    if (area?.clientHeight) area.scrollTop = area.scrollHeight;
  }
  await frames();
  if (shortArticle) {
    const article = document.querySelector(
      '[data-testid="docs-main-mobile-flow"] > div',
    );
    const footer = document.querySelector('[data-testid="docs-page-footer"]');
    if (
      footer.getBoundingClientRect().top -
        article.getBoundingClientRect().bottom >
      80
    ) {
      throw new Error('Short article gained excess space before feedback');
    }
  }
  const read = () => ({
    scrollY,
    feedbackY: root.getBoundingClientRect().y,
    overflow: document.documentElement.scrollWidth - innerWidth,
    rails: ['docs-sidebar', 'docs-toc-rail'].flatMap((id) => {
      const element = document.querySelector(`[data-testid="${id}"]`);
      if (!element) return [];
      const rect = element.getBoundingClientRect();
      const area = element.querySelector('[data-testid$="-scroll"]');
      return rect.width
        ? [
            {
              id,
              x: rect.x,
              y: rect.y,
              width: rect.width,
              scrollTop: area?.scrollTop,
              contentY: area?.querySelector('a')?.getBoundingClientRect().y,
            },
          ]
        : [];
    }),
  });
  const results = [];
  for (const [name, expanded] of [
    ['有', true],
    ['没有', true],
    ['没有', false],
    ['没有', true],
    ['有', true],
    ['有', false],
  ]) {
    const before = read();
    const button = buttons.find((button) => button.textContent.trim() === name);
    button.click();
    await frames();
    const after = read();
    results.push({
      name,
      expanded: button.getAttribute('aria-expanded'),
      before,
      after,
      pass:
        button.getAttribute('aria-expanded') === String(expanded) &&
        Math.abs(after.scrollY - before.scrollY) <= 1 &&
        Math.abs(after.feedbackY - before.feedbackY) <= 1 &&
        after.overflow <= 1 &&
        after.rails.every((rail, i) =>
          ['x', 'y', 'width', 'scrollTop', 'contentY'].every(
            (key) =>
              rail[key] === undefined ||
              Math.abs(rail[key] - before.rails[i][key]) <= 1,
          ),
        ),
    });
  }
  // Scrolling back up must release the extra room used to preserve an anchor.
  const sidebarArea = document.querySelector(
    '[data-testid="docs-sidebar-scroll"]',
  );
  if (sidebarArea?.clientHeight && sidebarArea.scrollTop > 0) {
    buttons[0].click();
    await frames();
    sidebarArea.scrollTop = 0;
    await frames();
    if (sidebarArea.scrollHeight > sidebarArea.clientHeight) {
      sidebarArea.scrollTop = sidebarArea.scrollHeight;
      await frames();
      const lastLink = [...sidebarArea.querySelectorAll('a[href]')].at(-1);
      if (
        lastLink &&
        sidebarArea.getBoundingClientRect().bottom -
          lastLink.getBoundingClientRect().bottom >
          80
      ) {
        throw new Error(
          'Sidebar kept excess blank space after scrolling back up',
        );
      }
    }
  }
  // Stable coordinates alone can pass when both rails are already off-screen.
  buttons.find((button) => button.textContent.trim() === '没有').click();
  await frames();
  window.scrollTo(0, document.documentElement.scrollHeight);
  await frames();
  const headerBottom = document
    .querySelector('[data-testid="docs-shell-header"]')
    .getBoundingClientRect().bottom;
  for (const expanded of [true, false, true]) {
    if (expanded !== (buttons[1].getAttribute('aria-expanded') === 'true')) {
      buttons[1].click();
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await frames();
    const bodyBottom = document
      .querySelector('[data-testid="docs-body-shell"]')
      .getBoundingClientRect().bottom;
    for (const id of ['docs-sidebar', 'docs-toc-rail']) {
      const rail = document.querySelector(`[data-testid="${id}"]`);
      if (!rail?.getBoundingClientRect().width) continue;
      const rect = rail.getBoundingClientRect();
      if (
        Math.abs(rect.top - headerBottom) > 1 ||
        rect.bottom <= headerBottom
      ) {
        throw new Error(
          `${id} disappeared at page bottom: top=${rect.top}, bottom=${rect.bottom}, header=${headerBottom}`,
        );
      }
      if (rect.bottom > bodyBottom + 1) {
        throw new Error(`${id} overlaps the site footer`);
      }
      const scrollRegion = rail.querySelector('[data-testid$="-scroll"]');
      scrollRegion.scrollTop = scrollRegion.scrollHeight;
      await frames();
      const lastLink = [...scrollRegion.querySelectorAll('a[href]')]
        .filter((link) => link.getBoundingClientRect().height)
        .at(-1);
      if (lastLink) {
        const linkRect = lastLink.getBoundingClientRect();
        if (
          linkRect.top < headerBottom - 1 ||
          linkRect.bottom > rect.bottom + 1
        ) {
          throw new Error(
            `${id} last link is unreachable in the shortened scroll area`,
          );
        }
      }
    }
  }
  return results;
};

try {
  for (const [width, height, shortArticle] of [
    [1440, 900, false],
    [1100, 900, false],
    [390, 844, false],
    [1440, 900, true],
  ]) {
    browser('set', 'viewport', String(width), String(height));
    browser('open', `${origin}${route}`);
    browser(
      'wait',
      '--fn',
      '(() => { const button = document.querySelector("[data-testid=docs-feedback] button"); return button && Object.keys(button).some(key => key.startsWith("__reactProps$")); })()',
    );
    const raw = browser('eval', `(${probe.toString()})(${shortArticle})`);
    const results = JSON.parse(raw);
    console.log(
      JSON.stringify(
        {
          width,
          height,
          shortArticle,
          results: results.map((result) => ({
            name: result.name,
            expanded: result.expanded,
            pass: result.pass,
            scrollShift: result.after.scrollY - result.before.scrollY,
            feedbackShift: result.after.feedbackY - result.before.feedbackY,
            railShifts: result.after.rails.map((rail, i) => ({
              id: rail.id,
              x: rail.x - result.before.rails[i].x,
              y: rail.y - result.before.rails[i].y,
              scrollTop: rail.scrollTop - result.before.rails[i].scrollTop,
              contentY: rail.contentY - result.before.rails[i].contentY,
            })),
          })),
        },
        null,
        2,
      ),
    );
    assert(
      results.every((result) => result.pass),
      `Layout moved at ${width}x${height}`,
    );
  }
} finally {
  browser('close');
}
