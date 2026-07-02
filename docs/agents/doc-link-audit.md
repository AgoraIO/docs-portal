# Docs Link Audit

Use `docs:links` to batch-check docs links without editing content files.
For the repair workflow, see
[`broken-link-fix-playbook.md`](./broken-link-fix-playbook.md).

```bash
bun run docs:links
```

The report includes invalid rows in this shape:

```text
source: <content path> | target: <resolved href> | reason: <failure reason> | href: <raw href>
```

Common reasons:

- `missing-internal-path`: the internal docs route or relative docs target does not resolve.
- `missing-hash-anchor`: the target page exists, but the hash anchor is not present in that page.
- `legacy-doc-root-path`: the link still uses the legacy `/doc/*` path shape.

Use strict mode when the command should fail on invalid internal links:

```bash
bun run docs:links:strict
```

External links are opt-in because network checks can be flaky:

```bash
bun run docs:links:external
```

Useful external-check controls:

- `--external-timeout=5000`: request timeout in milliseconds.
- `--external-concurrency=8`: number of unique external URLs to check in parallel.
- `--external-retries=2`: retry count after the first failed request.
- `--external-allowlist=example.com,*.example.org`: skip known flaky hosts or URL prefixes.
- `--external-allowlist-file=path/to/file.txt`: read one allowlist pattern per line.
- `--fail-on-invalid`: exit nonzero when invalid internal or checked external links are found.

Allowlist patterns can be exact hosts, wildcard hosts such as `*.example.com`,
or full URL prefixes such as `https://example.com/known-flaky/`.
