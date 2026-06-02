const DESKTOP_SCROLL_SELECTOR = '[data-testid="docs-main-desktop-scroll"]';
const HASH_SCROLL_OFFSET = 24;
const WINDOW_SCROLL_OFFSET = 96;

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
    top: window.scrollY + headingRect.top - WINDOW_SCROLL_OFFSET,
  });

  return true;
}

export function syncDocsHashTargetFromLocation(behavior: ScrollBehavior = 'auto') {
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

function getActiveDocsScrollContainer() {
  const scrollContainer = document.querySelector<HTMLElement>(
    DESKTOP_SCROLL_SELECTOR,
  );

  if (!scrollContainer) {
    return null;
  }

  const styles = window.getComputedStyle(scrollContainer);

  if (styles.display === 'none' || styles.visibility === 'hidden') {
    return null;
  }

  return scrollContainer;
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
