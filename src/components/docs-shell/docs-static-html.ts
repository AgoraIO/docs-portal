export function getInitialStaticDocsHtml(activePath: string) {
  if (typeof document === 'undefined') {
    return null;
  }

  const containers = document.querySelectorAll<HTMLElement>('[data-dr]');

  for (const container of containers) {
    if (container.getAttribute('data-dr') !== activePath) {
      continue;
    }

    const body = container.querySelector<HTMLElement>('.docs-body');

    if (!body) {
      return null;
    }

    return body.innerHTML;
  }

  return null;
}
