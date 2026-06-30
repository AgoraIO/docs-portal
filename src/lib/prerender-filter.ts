export function shouldPrerenderRoute(_path: string) {
  return true;
}

export function shouldPrerenderPage(page: { path: string }) {
  return shouldPrerenderRoute(page.path);
}
