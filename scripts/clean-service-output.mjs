import { rm } from 'node:fs/promises';

// Remove only generated service artifacts; keep dist/client and dist/search.
await rm(new URL('../.output/', import.meta.url), {
  recursive: true,
  force: true,
});
await rm(new URL('../dist/service/', import.meta.url), {
  recursive: true,
  force: true,
});
