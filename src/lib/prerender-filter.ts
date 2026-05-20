const RAW_MARKDOWN_ROUTE_PREFIX = '/llms.mdx/docs/';

export function shouldPrerenderRoute(path: string) {
  return !path.startsWith(RAW_MARKDOWN_ROUTE_PREFIX);
}

export function shouldPrerenderPage(page: { path: string }) {
  return shouldPrerenderRoute(page.path);
}
