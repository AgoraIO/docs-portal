const DESKTOP_SCROLL_SELECTOR = '[data-testid="docs-main-desktop-scroll"]';
const DOCS_HEADER_SELECTOR = '[data-testid="docs-shell-header"]';
const HASH_SCROLL_OFFSET = 24;
const WINDOW_SCROLL_OFFSET = 96;
const SCROLLABLE_OVERFLOW_VALUES = new Set(['auto', 'scroll', 'overlay']);
const STICKY_POSITION_VALUES = new Set(['fixed', 'sticky']);

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

export function syncDocsHashTargetFromLocation(
  behavior: ScrollBehavior = 'auto',
) {
  if (typeof window === 'undefined' || !window.location.hash) {
    return false;
  }

  return scrollDocsHashTarget(window.location.hash, {
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

// The shell header is sticky, so a heading parked at a fixed offset from the
// top of the viewport hides behind it whenever the header grows: the legacy
// docs banner alone adds ~38px on top of the logo row and the tab strip.
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

  const selector = `#${escapeCssIdentifier(id)}`;
  const headings = document.querySelectorAll<HTMLElement>(selector);
  const visibleHeading = Array.from(headings).find(
    (heading) => heading.getClientRects().length > 0,
  );

  return visibleHeading ?? headings[0] ?? null;
}

function escapeCssIdentifier(value: string) {
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return CSS.escape(value);
  }

  return value.replace(/["\\#.:,[\]=>+~*^$|()\s]/g, '\\$&');
}

function updateHash(url: string) {
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}${url}`,
  );
}
