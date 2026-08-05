# Help FAQ Redirects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add permanent redirects for broken legacy Help/FAQ URLs that now map to `/en/api-reference/faq/...`, and remove old Help/FAQ links from English docs source.

**Architecture:** Keep `src/lib/legacy-sitemap/redirects.json` as the redirect source of truth and use the existing generator to update Vercel and static fallback artifacts. Add focused regression coverage in the existing legacy sitemap tests and update MDX source links directly.

**Tech Stack:** Bun, Vitest, TypeScript, JSON redirect data, Fumadocs MDX content, Vercel redirects.

---

### Task 1: Establish the Candidate Baseline

**Files:**
- Read: `docs/superpowers/specs/2026-08-04-help-faq-redirects-design.md`
- Read: `docs/agents/reports/2026-08-04-help-url-redirect-audit.md`
- Read: `docs/agents/reports/2026-08-03-api-ref-docs-redirect-triage.md`
- Read: `src/lib/legacy-sitemap/redirects.json`
- Read: `content/docs/en/**`

- [ ] **Step 1: List old Help/FAQ links still present in English docs source**

Run:

```bash
rg -n --glob '*.mdx' \
  'docs\.agora\.io/en/help/|\]\(/help/|\]\(/en/help/|\]\(/en/faq/' \
  content/docs/en
```

Expected: output includes the current known legacy links such as:

```text
content/docs/en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx:13:...
content/docs/en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx:13:...
```

- [ ] **Step 2: Extract unique candidate paths from source**

Run:

```bash
python3 - <<'PY'
import re
from pathlib import Path

pattern = re.compile(
    r'(?:https://docs\.agora\.io)?(?P<path>/en/help/[^)\s>"#]+|/help/[^)\s>"#]+|/en/faq/[^)\s>"#]+)(?P<fragment>#[^)\s>"]+)?'
)

items = {}
for path in Path('content/docs/en').rglob('*.mdx'):
    text = path.read_text(errors='ignore')
    for line_number, line in enumerate(text.splitlines(), 1):
        if '/help/' not in line and '/en/faq/' not in line:
            continue
        if 'alibabacloud.com/help/' in line:
            continue
        for match in pattern.finditer(line):
            key = f"{match.group('path')}{match.group('fragment') or ''}"
            items.setdefault(key, []).append(f'{path}:{line_number}')

for key in sorted(items):
    print(f'{key}\t{len(items[key])}')
    for occurrence in items[key]:
        print(f'  {occurrence}')
PY
```

Expected: a deduplicated list of source-linked old Help/FAQ paths and occurrence counts. Keep this output for final reporting.

- [ ] **Step 3: Check which candidates already have redirect rules**

Run:

```bash
python3 - <<'PY'
import json
from pathlib import Path

candidates = [
    '/en/help/integration-issues/system_volume',
    '/en/help/integration-issues/recording_mode',
    '/help/account-and-billing/billing_account',
    '/help/integration-issues/agora_class_custom_properties',
    '/help/integration-issues/token_cohost',
    '/help/integration-issues/token_related_issues',
]

rules = json.loads(Path('src/lib/legacy-sitemap/redirects.json').read_text())['rules']
by_path = {rule['legacyPath']: rule for rule in rules}

for candidate in candidates:
    print(f'{candidate} => {by_path.get(candidate)}')
PY
```

Expected before implementation: the seeded missing paths print `None` unless another branch has already added them.

### Task 2: Add Failing Regression Tests

**Files:**
- Modify: `src/lib/legacy-sitemap/static-redirects.test.ts`
- Modify: `src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts`

- [ ] **Step 1: Add static redirect expectations**

In `src/lib/legacy-sitemap/static-redirects.test.ts`, add this test before the existing `returns null for non-legacy paths` test:

```ts
  it('redirects broken legacy Help and FAQ URLs to current API Reference FAQ pages', () => {
    expect(
      resolveStaticLegacySitemapRedirect(
        '/en/help/integration-issues/system_volume',
      ),
    ).toEqual({
      preserveSearch: true,
      redirectUrl: '/en/api-reference/faq/integration/system_volume',
    });
    expect(
      resolveStaticLegacySitemapRedirect(
        '/en/help/integration-issues/recording_mode',
      ),
    ).toEqual({
      preserveSearch: true,
      redirectUrl: '/en/api-reference/faq/integration/recording_mode',
    });
    expect(
      resolveStaticLegacySitemapRedirect('/help/account-and-billing/billing_account'),
    ).toEqual({
      preserveSearch: true,
      redirectUrl: '/en/api-reference/faq/account/billing_account',
    });
    expect(
      resolveStaticLegacySitemapRedirect(
        '/help/integration-issues/agora_class_custom_properties',
      ),
    ).toEqual({
      preserveSearch: true,
      redirectUrl:
        '/en/api-reference/faq/integration/agora_class_custom_properties',
    });
    expect(
      resolveStaticLegacySitemapRedirect('/help/integration-issues/token_cohost'),
    ).toEqual({
      preserveSearch: true,
      redirectUrl: '/en/api-reference/faq/integration/token_cohost',
    });
    expect(
      resolveStaticLegacySitemapRedirect(
        '/help/integration-issues/token_related_issues',
      ),
    ).toEqual({
      preserveSearch: true,
      redirectUrl: '/en/api-reference/faq/integration/token_related_issues',
    });
  });
```

- [ ] **Step 2: Add compatibility manual URLs for new non-sitemap Help paths**

In `src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts`, add these strings to the `manualLegacyUrls` set:

```ts
  'https://docs.agora.io/en/help/integration-issues/recording_mode',
  'https://docs.agora.io/en/help/integration-issues/system_volume',
  'https://docs.agora.io/help/account-and-billing/billing_account',
  'https://docs.agora.io/help/integration-issues/agora_class_custom_properties',
  'https://docs.agora.io/help/integration-issues/token_cohost',
  'https://docs.agora.io/help/integration-issues/token_related_issues',
```

Insert them near the existing Help entries to keep the list readable.

- [ ] **Step 3: Run the focused tests and verify they fail**

Run:

```bash
bun test src/lib/legacy-sitemap/static-redirects.test.ts src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts
```

Expected before redirects are added: `static-redirects.test.ts` fails because the new seeded paths resolve to `null`. The audit test may also fail because the manual URLs have no redirect records.

### Task 3: Add Redirect Rules and Regenerate Artifacts

**Files:**
- Modify: `src/lib/legacy-sitemap/redirects.json`
- Generated: `src/lib/legacy-sitemap/static-redirects.json`
- Generated: `vercel-legacy-redirects.json`
- Generated: `vercel.json`

- [ ] **Step 1: Add high-confidence redirect rules**

In `src/lib/legacy-sitemap/redirects.json`, add these objects to the `rules` array near the existing Help/FAQ redirect rules:

```json
{
  "legacyUrl": "https://docs.agora.io/en/help/integration-issues/system_volume",
  "legacyPath": "/en/help/integration-issues/system_volume",
  "target": "/en/api-reference/faq/integration/system_volume",
  "type": "semantic-page-match",
  "confidence": "high",
  "evidence": [
    "legacy integration help content moved to the API Reference FAQ",
    "the current FAQ entry preserves the system_volume slug",
    "current target is published at the verified canonical URL"
  ],
  "preserveSearch": true
}
```

```json
{
  "legacyUrl": "https://docs.agora.io/en/help/integration-issues/recording_mode",
  "legacyPath": "/en/help/integration-issues/recording_mode",
  "target": "/en/api-reference/faq/integration/recording_mode",
  "type": "semantic-page-match",
  "confidence": "high",
  "evidence": [
    "legacy integration help content moved to the API Reference FAQ",
    "the current FAQ entry preserves the recording_mode slug",
    "current target is published at the verified canonical URL"
  ],
  "preserveSearch": true
}
```

```json
{
  "legacyUrl": "https://docs.agora.io/help/account-and-billing/billing_account",
  "legacyPath": "/help/account-and-billing/billing_account",
  "target": "/en/api-reference/faq/account/billing_account",
  "type": "semantic-page-match",
  "confidence": "high",
  "evidence": [
    "legacy account and billing help content moved to the API Reference FAQ",
    "the current FAQ entry preserves the billing_account slug",
    "current target is published at the verified canonical URL"
  ],
  "preserveSearch": true
}
```

```json
{
  "legacyUrl": "https://docs.agora.io/help/integration-issues/agora_class_custom_properties",
  "legacyPath": "/help/integration-issues/agora_class_custom_properties",
  "target": "/en/api-reference/faq/integration/agora_class_custom_properties",
  "type": "semantic-page-match",
  "confidence": "high",
  "evidence": [
    "legacy integration help content moved to the API Reference FAQ",
    "the current FAQ entry preserves the agora_class_custom_properties slug",
    "current target is published at the verified canonical URL"
  ],
  "preserveSearch": true
}
```

```json
{
  "legacyUrl": "https://docs.agora.io/help/integration-issues/token_cohost",
  "legacyPath": "/help/integration-issues/token_cohost",
  "target": "/en/api-reference/faq/integration/token_cohost",
  "type": "semantic-page-match",
  "confidence": "high",
  "evidence": [
    "legacy integration help content moved to the API Reference FAQ",
    "the current FAQ entry preserves the token_cohost slug",
    "current target is published at the verified canonical URL"
  ],
  "preserveSearch": true
}
```

```json
{
  "legacyUrl": "https://docs.agora.io/help/integration-issues/token_related_issues",
  "legacyPath": "/help/integration-issues/token_related_issues",
  "target": "/en/api-reference/faq/integration/token_related_issues",
  "type": "semantic-page-match",
  "confidence": "high",
  "evidence": [
    "legacy integration help content moved to the API Reference FAQ",
    "the current FAQ entry preserves the token_related_issues slug",
    "current target is published at the verified canonical URL"
  ],
  "preserveSearch": true
}
```

If Task 1 finds additional high-confidence Help/FAQ candidates that meet the approved spec checks, add them with the same metadata shape. Do not add candidates without a verified `/en/api-reference/faq/...` target.

- [ ] **Step 2: Regenerate redirect artifacts**

Run:

```bash
node scripts/generate-legacy-redirect-artifacts.mjs
```

Expected output includes counts similar to:

```text
[legacy-redirects] static fallback rules: 3177
[legacy-redirects] Vercel bulk redirects: 1011
[legacy-redirects] Vercel query redirects: 160
[legacy-redirects] query-split paths: 80
```

The exact counts may differ if Task 1 found additional approved candidates.

- [ ] **Step 3: Verify generated artifacts include the new paths**

Run:

```bash
python3 - <<'PY'
import json
from pathlib import Path

paths = [
    '/en/help/integration-issues/system_volume',
    '/en/help/integration-issues/recording_mode',
    '/help/account-and-billing/billing_account',
    '/help/integration-issues/agora_class_custom_properties',
    '/help/integration-issues/token_cohost',
    '/help/integration-issues/token_related_issues',
]

static_rules = json.loads(Path('src/lib/legacy-sitemap/static-redirects.json').read_text())
bulk_rules = json.loads(Path('vercel-legacy-redirects.json').read_text())

static_paths = {rule['p'] for rule in static_rules}
bulk_paths = {rule['source'] for rule in bulk_rules}

missing_static = [path for path in paths if path not in static_paths]
missing_bulk = [path for path in paths if path not in bulk_paths]

print('missing static:', missing_static)
print('missing bulk:', missing_bulk)
PY
```

Expected:

```text
missing static: []
missing bulk: []
```

- [ ] **Step 4: Run focused tests and verify they pass**

Run:

```bash
bun test src/lib/legacy-sitemap/static-redirects.test.ts src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts
```

Expected: both test files pass.

### Task 4: Update English Docs Source Links

**Files:**
- Modify: `content/docs/en/realtime-media/on-premise-recording/reference/pricing.mdx`
- Modify: `content/docs/en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx`
- Modify: `content/docs/en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx`
- Modify: `content/docs/en/realtime-media/on-premise-recording/build/set-up-authentication/authentication-workflow.mdx`
- Modify: `content/docs/en/realtime-media/video/reference/pricing.mdx`
- Modify: `content/docs/en/api-reference/api-ref/flexible-classroom/classroom-sdk.mdx`
- Modify: `content/docs/en/realtime-media/video/build/authenticate-users/deploy-token-server.mdx`
- Modify: `content/docs/en/realtime-media/cloud-recording/build/set-up-authentication/authentication-workflow.mdx`

- [ ] **Step 1: Replace known old paths with current FAQ paths**

Apply these replacements in `content/docs/en/**` only:

```text
https://docs.agora.io/en/help/integration-issues/recording_mode
=> /en/api-reference/faq/integration/recording_mode

/help/account-and-billing/billing_account
=> /en/api-reference/faq/account/billing_account

/help/integration-issues/agora_class_custom_properties
=> /en/api-reference/faq/integration/agora_class_custom_properties

/help/integration-issues/token_cohost#enable-co-host-authentication
=> /en/api-reference/faq/integration/token_cohost#enable-co-host-authentication

/help/integration-issues/token_cohost
=> /en/api-reference/faq/integration/token_cohost

/help/integration-issues/token_related_issues
=> /en/api-reference/faq/integration/token_related_issues
```

- [ ] **Step 2: Confirm the current fragment exists**

Run:

```bash
rg -n '^### Enable co-host authentication$' \
  content/docs/en/api-reference/faq/integration/token_cohost.mdx
```

Expected:

```text
content/docs/en/api-reference/faq/integration/token_cohost.mdx:111:### Enable co-host authentication
```

The current slug for that heading is `enable-co-host-authentication`, so keep the fragment.

- [ ] **Step 3: Confirm no old Agora Help/FAQ source links remain**

Run:

```bash
rg -n --glob '*.mdx' \
  'docs\.agora\.io/en/help/|\]\(/help/|\]\(/en/help/|\]\(/en/faq/' \
  content/docs/en
```

Expected: no output. If output remains and points to `alibabacloud.com/help`, ignore it only if the regex accidentally caught a non-Agora external help URL. Otherwise update the remaining old Agora Help/FAQ links.

### Task 5: Full Verification and Final Evidence

**Files:**
- Verify: `src/lib/legacy-sitemap/redirects.json`
- Verify: `src/lib/legacy-sitemap/static-redirects.json`
- Verify: `vercel-legacy-redirects.json`
- Verify: `vercel.json`
- Verify: `content/docs/en/**`

- [ ] **Step 1: Check generated redirect artifacts are current**

Run:

```bash
bun run legacy-redirects:check
```

Expected:

```text
[legacy-redirects] static fallback rules: ...
[legacy-redirects] Vercel bulk redirects: ...
[legacy-redirects] Vercel query redirects: ...
[legacy-redirects] query-split paths: ...
```

The command exits with status `0`.

- [ ] **Step 2: Run focused tests**

Run:

```bash
bun test src/lib/legacy-sitemap
```

Expected: all tests under `src/lib/legacy-sitemap` pass.

- [ ] **Step 3: Run type check for substantial redirect/content changes**

Run:

```bash
bun run types:check
```

Expected: Fumadocs generation and `tsc --noEmit` finish with exit status `0`.

- [ ] **Step 4: Verify local static redirect resolution for the seeded paths**

Run:

```bash
bun test src/lib/legacy-sitemap/static-redirects.test.ts
```

Expected: the `redirects broken legacy Help and FAQ URLs to current API Reference FAQ pages` test passes.

- [ ] **Step 5: Capture production status separately**

Run:

```bash
for url in \
  https://docs.agora.io/en/help/integration-issues/system_volume \
  https://docs.agora.io/en/help/integration-issues/recording_mode \
  https://docs.agora.io/help/account-and-billing/billing_account \
  https://docs.agora.io/help/integration-issues/agora_class_custom_properties \
  https://docs.agora.io/help/integration-issues/token_cohost \
  https://docs.agora.io/help/integration-issues/token_related_issues; do
  printf '\nURL %s\n' "$url"
  curl -sSI --max-redirs 0 "$url" \
    | awk 'BEGIN{IGNORECASE=1}/^HTTP\//{print}/^location:/{print}/^content-disposition:/{print}/^x-vercel-cache:/{print}'
done
```

Expected before this branch is deployed: production may still return `404`.
Report that separately from local artifact verification. After deployment, the
expected status is `301` with a `Location` matching the new FAQ target.

- [ ] **Step 6: Review the final diff**

Run:

```bash
git diff --stat
git diff -- src/lib/legacy-sitemap/redirects.json src/lib/legacy-sitemap/static-redirects.json vercel-legacy-redirects.json vercel.json src/lib/legacy-sitemap/static-redirects.test.ts src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts content/docs/en
```

Expected: changes are limited to redirect rules, generated redirect artifacts, focused tests, and English docs source link cleanup.

- [ ] **Step 7: Commit implementation**

Run:

```bash
git add src/lib/legacy-sitemap/redirects.json src/lib/legacy-sitemap/static-redirects.json vercel-legacy-redirects.json vercel.json src/lib/legacy-sitemap/static-redirects.test.ts src/lib/legacy-sitemap/legacy-sitemap-audit.test.ts content/docs/en
git commit -m "fix: redirect legacy help faq urls"
```

Expected: commit succeeds. Do not stage unrelated untracked reports unless the user explicitly asks to include them.
