/** A mounted component is not necessarily visible (tabs, offscreen and background). */
export function observeVisible(element: HTMLElement, callback: () => void) {
  let stopped = false;
  const visible = () => {
    if (
      stopped ||
      !element.isConnected ||
      element.closest('[hidden], [inert], [aria-hidden="true"]')
    )
      return;
    // The search dialog does not set aria-modal, but covers the document.
    const covered = [
      ...document.querySelectorAll<HTMLElement>(
        '[role="dialog"], dialog[open]',
      ),
    ].some(
      (dialog) =>
        !dialog.contains(element) &&
        dialog.getBoundingClientRect().width > 0 &&
        getComputedStyle(dialog).display !== 'none' &&
        getComputedStyle(dialog).visibility !== 'hidden',
    );
    if (covered) return;
    const rect = element.getBoundingClientRect();
    if (
      document.visibilityState !== 'hidden' &&
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      getComputedStyle(element).visibility !== 'hidden'
    )
      callback();
  };
  const observer =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(visible)
      : undefined;
  observer?.observe(element);
  const mutations =
    typeof MutationObserver !== 'undefined'
      ? new MutationObserver((records) => {
          const hasDialog = (node: Node) =>
            node instanceof Element &&
            (node.matches('[role="dialog"], dialog') ||
              node.querySelector('[role="dialog"], dialog'));
          // Ignore unrelated animation styles and content edits. Only the
          // observed element's ancestors or modal visibility can expose it.
          if (
            records.some((record) =>
              record.type === 'attributes'
                ? record.target instanceof Element &&
                  (record.target.contains(element) || hasDialog(record.target))
                : [...record.addedNodes, ...record.removedNodes].some(
                    hasDialog,
                  ),
            )
          )
            visible();
        })
      : undefined;
  mutations?.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      'hidden',
      'inert',
      'aria-hidden',
      'style',
      'data-state',
      'open',
    ],
  });
  document.addEventListener('visibilitychange', visible);
  visible();
  return () => {
    stopped = true;
    observer?.disconnect();
    mutations?.disconnect();
    document.removeEventListener('visibilitychange', visible);
  };
}
