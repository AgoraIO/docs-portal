# Dependency patches

## @tanstack/react-router 1.170.46

The React readable-stream branch starts the router transform before awaiting
`stream.allReady`. The transform reads eagerly, which flushes Suspense fallbacks
into crawler/static output. Waiting afterward cannot put the completed content
back inside the article. This breaks the existing static-body build gate on a
cold render of lazily imported MDX.

Wait for `allReady` before starting the transform for crawler requests, using the
request signal so an interrupted prerender still cancels and cleans up. Normal
browser requests retain progressive streaming. ESM, CommonJS, and source entries
receive the same change. No document renderer or static HTML gate is replaced.

React documents this static-generation sequence at:
https://react.dev/reference/react-dom/server/renderToReadableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation

`src/lib/prerender-stream.test.tsx` exercises real React Suspense and the router
transform: completed crawler HTML passes the article-body gate, browsers stream,
and aborted crawler requests release the router. Remove this patch when the
upstream router passes those tests without it. The prerender user agent in
`vite.config.ts` selects the upstream crawler path.

The existing `@fumadocs/api-docs` patch is retained from the global main branch.
Keep patch contents identical in the Chinese and global worktrees.
