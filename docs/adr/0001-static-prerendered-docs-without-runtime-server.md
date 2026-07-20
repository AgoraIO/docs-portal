# Static prerendered pages without a runtime server

The portal will publish canonical documentation routes as **Static prerendered pages** while retaining the current function-free static deployment. This combines build-time readable HTML with client hydration and SPA navigation; it does not restore Nitro or runtime SSR because the previous server deployment exceeded Vercel's function-size limit.

Machine-readable discovery remains a complementary path rather than the primary rendering path. `llms.txt` links directly to absolute per-page Markdown URLs, canonical HTML advertises the same resource with a `text/markdown` alternate link, and `llms-full.txt` remains an offline bulk export rather than default interactive context.
