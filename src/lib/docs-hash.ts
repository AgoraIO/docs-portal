import { isKnownPlatform } from './platforms/registry';

const DESKTOP_SCROLL_SELECTOR = '[data-testid="docs-main-desktop-scroll"]';
const DOCS_HEADER_SELECTOR = '[data-testid="docs-shell-header"]';
const HASH_SCROLL_OFFSET = 24;
const WINDOW_SCROLL_OFFSET = 96;
const SCROLLABLE_OVERFLOW_VALUES = new Set(['auto', 'scroll', 'overlay']);
const STICKY_POSITION_VALUES = new Set(['fixed', 'sticky']);
const HASH_LAYOUT_TIMEOUT_MS = 30_000;
const HASH_SCROLL_CANCEL_EVENTS = [
  'wheel',
  'touchstart',
  'pointerdown',
  'keydown',
  'pagehide',
] as const;
let cancelPendingHashScroll: (() => void) | undefined;
export const DOCS_HASH_TARGET_EVENT = 'docs-portal:hash-target';

/** Keep a heading's platform explicit when sharing a preference-driven page. */
export function getDocsHashHref(hash: string) {
  if (typeof window === 'undefined' || !hash.startsWith('#')) return hash;

  const platform = getHeadingForUrl(hash)
    ?.closest<HTMLElement>('[data-platform-panel]')
    ?.getAttribute('data-platform-panel');
  if (!platform || !isKnownPlatform(platform)) return hash;

  const url = new URL(window.location.href);
  const segments = url.pathname.split('/');
  let lastSegment = segments.length - 1;
  while (lastSegment >= 0 && !segments[lastSegment]) lastSegment -= 1;
  if (isKnownPlatform(segments[lastSegment] ?? '')) {
    segments[lastSegment] = platform;
    url.pathname = segments.join('/');
  }
  url.searchParams.set('platform', platform);
  url.hash = hash;
  return `${url.pathname}${url.search}${url.hash}`;
}

export function scrollDocsHashTarget(
  url: string,
  options: {
    behavior?: ScrollBehavior;
    updateHistory?: boolean;
  } = {},
) {
  if (typeof window === 'undefined' || !url.startsWith('#')) {
    return false;
  }

  const heading = getHeadingForUrl(url);

  if (!heading) {
    return false;
  }

  const behavior = options.behavior ?? 'smooth';
  const scrollContainer = getActiveDocsScrollContainer();
  const headingRect = heading.getBoundingClientRect();

  if (options.updateHistory !== false) {
    updateHash(url);
  }

  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect();

    scrollContainer.scrollTo({
      behavior,
      top:
        scrollContainer.scrollTop +
        headingRect.top -
        containerRect.top -
        HASH_SCROLL_OFFSET,
    });

    return true;
  }

  window.scrollTo({
    behavior,
    top: window.scrollY + headingRect.top - getWindowScrollOffset(),
  });

  return true;
}

/**
 * Wait for lazy content, ancestor tabs and accordion layout to settle before
 * the final scroll. Stop waiting when the reader takes control or navigates.
 */
export function scrollDocsHashTargetAfterLayout(
  url: string,
  options: {
    behavior?: ScrollBehavior;
    updateHistory?: boolean;
  } = {},
) {
  if (typeof window === 'undefined' || !url.startsWith('#')) {
    return false;
  }

  cancelPendingHashScroll?.();

  if (options.updateHistory !== false) {
    updateHash(url);
  }

  notifyDocsHashTarget(url);

  const location = window.location.href;
  const initialHeading = getHeadingForUrl(url);
  let frame = 0;
  let timeout = 0;
  let previousLayout = '';
  let stableFrames = 0;
  const observer = new MutationObserver(() => {
    if (!frame) frame = window.requestAnimationFrame(waitForLayout);
  });

  const cancel = () => {
    window.cancelAnimationFrame(frame);
    window.clearTimeout(timeout);
    observer.disconnect();
    for (const event of HASH_SCROLL_CANCEL_EVENTS) {
      window.removeEventListener(event, cancel);
    }
    if (cancelPendingHashScroll === cancel) {
      cancelPendingHashScroll = undefined;
    }
  };
  const waitForLayout = () => {
    frame = 0;
    if (window.location.href !== location) {
      cancel();
      return;
    }

    const heading = getHeadingForUrl(url);
    if (!heading || isHiddenFromDocs(heading)) {
      previousLayout = '';
      stableFrames = 0;
      // Hydration may finish well after the shell mounts. Wake on content
      // or visibility changes instead of polling while the target is hidden.
      return;
    } else {
      const container = getActiveDocsScrollContainer();
      const viewport = container ?? document.documentElement;
      const rect = heading.getBoundingClientRect();
      const position = container
        ? rect.top - container.getBoundingClientRect().top + container.scrollTop
        : rect.top + window.scrollY;
      // Scroll height matters too: an expanding region can clamp scrolling
      // even when the subsection already has its final document position.
      const layout = [
        position,
        rect.height,
        viewport.scrollHeight,
        viewport.clientHeight,
        getWindowScrollOffset(),
      ].join(':');
      stableFrames = layout === previousLayout ? stableFrames + 1 : 0;
      previousLayout = layout;

      if (stableFrames >= 2) {
        cancel();
        scrollDocsHashTarget(url, {
          behavior: options.behavior ?? 'smooth',
          updateHistory: false,
        });
        return;
      }
    }

    frame = window.requestAnimationFrame(waitForLayout);
  };

  cancelPendingHashScroll = cancel;
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['hidden', 'aria-hidden', 'inert', 'data-state', 'id'],
    childList: true,
    subtree: true,
  });
  for (const event of HASH_SCROLL_CANCEL_EVENTS) {
    window.addEventListener(event, cancel, { passive: true });
  }
  timeout = window.setTimeout(cancel, HASH_LAYOUT_TIMEOUT_MS);
  frame = window.requestAnimationFrame(waitForLayout);

  return initialHeading !== null;
}

export function syncDocsHashTargetFromLocation(
  behavior: ScrollBehavior = 'auto',
) {
  if (typeof window === 'undefined' || !window.location.hash) {
    return false;
  }

  return scrollDocsHashTargetAfterLayout(window.location.hash, {
    behavior,
    updateHistory: false,
  });
}

export function findDocsHeadingForHash(url: string) {
  if (!url.startsWith('#')) {
    return null;
  }

  return getHeadingForUrl(url);
}

export function getActiveDocsScrollContainer() {
  const scrollContainer = document.querySelector<HTMLElement>(
    DESKTOP_SCROLL_SELECTOR,
  );

  if (!scrollContainer) {
    return null;
  }

  const styles = window.getComputedStyle(scrollContainer);
  const overflowY =
    styles.overflowY ||
    styles.overflow ||
    scrollContainer.style.overflowY ||
    scrollContainer.style.overflow;

  if (
    styles.display === 'none' ||
    styles.visibility === 'hidden' ||
    !SCROLLABLE_OVERFLOW_VALUES.has(overflowY)
  ) {
    return null;
  }

  return scrollContainer;
}

function getWindowScrollOffset() {
  const header = document.querySelector<HTMLElement>(DOCS_HEADER_SELECTOR);

  if (!header) {
    return WINDOW_SCROLL_OFFSET;
  }

  const { position } = window.getComputedStyle(header);

  if (!STICKY_POSITION_VALUES.has(position)) {
    return WINDOW_SCROLL_OFFSET;
  }

  return Math.max(
    WINDOW_SCROLL_OFFSET,
    Math.ceil(header.getBoundingClientRect().height) + HASH_SCROLL_OFFSET,
  );
}

function getHeadingForUrl(url: string) {
  const id = decodeURIComponent(url.slice(1));

  if (!id) {
    return null;
  }

  const selector = `[id="${escapeCssIdentifier(id)}"]`;
  const headings = document.querySelectorAll<HTMLElement>(selector);
  const visibleHeading = Array.from(headings).find(
    (heading) =>
      !isHiddenFromDocs(heading) && heading.getClientRects().length > 0,
  );
  const renderedHeading = Array.from(headings).find(
    (heading) => !isHiddenFromDocs(heading),
  );

  return visibleHeading ?? renderedHeading ?? headings[0] ?? null;
}

function isHiddenFromDocs(element: HTMLElement) {
  for (
    let current: HTMLElement | null = element;
    current;
    current = current.parentElement
  ) {
    if (
      current.hidden ||
      current.getAttribute('aria-hidden') === 'true' ||
      current.hasAttribute('inert') ||
      (current.getAttribute('role') === 'tabpanel' &&
        current.getAttribute('data-state') === 'inactive') ||
      (current.getAttribute('role') === 'region' &&
        current.getAttribute('data-state') === 'closed')
    ) {
      return true;
    }
  }

  return false;
}

function escapeCssIdentifier(value: string) {
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return CSS.escape(value);
  }

  return value.replace(/["\\#.:,[\]=>+~*^$|()\s]/g, '\\$&');
}

function updateHash(url: string) {
  const href = getDocsHashHref(url);
  window.history.replaceState(
    null,
    '',
    href.startsWith('#')
      ? `${window.location.pathname}${window.location.search}${href}`
      : href,
  );
}

function notifyDocsHashTarget(url: string) {
  window.dispatchEvent(
    new CustomEvent(DOCS_HASH_TARGET_EVENT, {
      detail: url,
    }),
  );
}
