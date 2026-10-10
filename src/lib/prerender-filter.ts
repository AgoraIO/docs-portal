export function shouldPrerenderRoute(path: string) {
  return path !== '/api' && !path.startsWith('/api/');
}

export function shouldPrerenderPage(page: { path: string }) {
  return shouldPrerenderRoute(page.path);
}
