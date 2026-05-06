# Preview / SSR Notes

## Docs server functions and `staticFunctionMiddleware`

Do not attach `staticFunctionMiddleware` to docs page loaders in this repo's
`/$lang/docs/...` route tree.

### Why

In `preview` and deployed production, TanStack Start will try to fetch cached
JSON from:

```text
/__tsr/staticServerFnCache/<hash>.json
```

for client-side navigations that use server functions.

For the localized docs routes in this repo, those cache files were not emitted
to `.output/public`, so the requests fell through the app router and were
redirected by `/ -> /en`. The client then received HTML instead of JSON and the
page crashed with errors like:

```text
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
Minified React error #418
```

This showed up most often when navigating through the left sidebar in
`preview`/production, while `dev` looked normal.

### What to do instead

- Keep docs loaders on plain `createServerFn({ method: 'GET' })`
- Do not add `staticFunctionMiddleware` to:
  - `src/routes/$lang.docs.$.tsx`
  - `src/routes/$lang.docs.index.tsx`
- If a future optimization needs static server-function caches again, first
  verify that the corresponding `__tsr/staticServerFnCache/*.json` files are
  emitted into the client output and can be fetched in `preview`

### Quick verification

After changing docs loaders or localized routing, verify in `preview`:

1. Open `/en/docs/convoai/restful/landing-page`
2. Click several sidebar links
3. Confirm no request to `__tsr/staticServerFnCache/*.json` falls back to HTML
4. Confirm `/en/api/search` and `/zh-CN/api/search` return JSON
