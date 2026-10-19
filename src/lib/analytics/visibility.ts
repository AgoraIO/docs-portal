/** A mounted component is not necessarily visible (tabs, offscreen and background). */
export function observeVisible(element: HTMLElement, callback: () => void) {
  const visible = () => {
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
  document.addEventListener('visibilitychange', visible);
  visible();
  return () => {
    observer?.disconnect();
    document.removeEventListener('visibilitychange', visible);
  };
}
