# Private source single-page migration playbook

Use this playbook when migrating one English page from
`/Users/yejiayi/Documents/Doc-Source-Private` into `content/docs/en/**`.

The goal is content fidelity first: expand the old source, copy the expanded
text into the target page, and only make mechanical changes required for the new
Fumadocs portal to compile and link correctly.

## Example

This playbook is based on the migration of:

- Source wrapper:
  `/Users/yejiayi/Documents/Doc-Source-Private/interactive-whiteboard/overview/core-concepts.mdx`
- Source shared content:
  `/Users/yejiayi/Documents/Doc-Source-Private/shared/common/core-concepts/interactive-whiteboard.mdx`
- Expanded shared dependency:
  `/Users/yejiayi/Documents/Doc-Source-Private/shared/common/core-concepts/agora-console.mdx`
- Target page:
  `content/docs/en/realtime-media/whiteboard/reference/core-concepts.mdx`
- Target navigation:
  `content/docs/en/realtime-media/whiteboard/reference/meta.json`

## Principles

- Do not summarize, rewrite, modernize, or improve the source text unless the
  user explicitly asks for content editing.
- If source text looks product-wrong or stale, keep it during faithful migration
  and call it out separately. Do not silently fix it.
- Expand `@docs/shared/**` imports before copying content into the target page.
- Expand source-private variables such as `<Vpd />` and `<Vg />` only when the
  replacement is unambiguous for the target product.
- Convert unsupported legacy syntax mechanically:
  - `@docs/shared/**` imports become expanded inline content.
  - `<Admonition>` becomes directive callouts.
  - `<Link>` becomes Markdown links.
  - Product wrappers are resolved for the target product.
  - `/images/**` asset paths become current asset URLs or valid local paths.
  - Old route links become current `content/docs/en/**` routes.
- Keep the target IA authoritative. Add the page to the current `meta.json`
  location requested by the user.

## Workflow

1. Read the migration rules:
   - `.agents/skills/fumadocs-migration-private-en/SKILL.md`
   - `.agents/skills/fumadocs-migration/references/standards.md`
   - `.agents/skills/fumadocs-migration/references/legacy-casebook.md`
   - `.agents/skills/fumadocs-migration/references/report-schema.md`
   - `.agents/skills/fumadocs-migration-private-en/references/private-source.md`
   - `.agents/skills/fumadocs-migration-private-en/references/lane-mapping.md`
2. Inspect the target IA under `content/docs/en/**`.
3. Locate the source wrapper and any shared files it imports.
4. Run the private-source audit once:

   ```bash
   node .agents/skills/fumadocs-migration/scripts/audit-legacy-docs.mjs \
     --source /Users/yejiayi/Documents/Doc-Source-Private \
     --profile doc-source-private \
     --out /tmp/private-source-audit
   ```

5. Check the audit entries for the wrapper and shared files.
6. Generate the expanded target page with a script. Prefer a script over manual
   copy/paste so the migration is repeatable.
7. Write the target page and update `meta.json`.
8. Verify that:
   - The generated output matches the target file.
   - No old source syntax remains.
   - Relative links resolve to existing files.
   - `bun run types:check` passes.

## Script template

Adapt this script for the source page and target product. Keep product-specific
rewrites small and explicit.

```js
const fs = require('fs');
const path = require('path');

const sourceRoot = '/Users/yejiayi/Documents/Doc-Source-Private';
const wrapperPath = path.join(
  sourceRoot,
  'interactive-whiteboard/overview/core-concepts.mdx',
);
const sharedPath = path.join(
  sourceRoot,
  'shared/common/core-concepts/interactive-whiteboard.mdx',
);
const consolePath = path.join(
  sourceRoot,
  'shared/common/core-concepts/agora-console.mdx',
);
const targetPath =
  'content/docs/en/realtime-media/whiteboard/reference/core-concepts.mdx';

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function frontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return '';

  const fm = match[1];
  const title = fm.match(/^title:\s*(.+)$/m)?.[1]?.trim() ?? 'Core concepts';
  const descBlock = fm.match(/^description:\s*>\n((?:\s+.*\n?)+)/m)?.[1];
  const desc = descBlock
    ? descBlock
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ')
    : fm.match(/^description:\s*(.+)$/m)?.[1]?.trim();

  return `---\ntitle: ${title}\n${
    desc ? `description: ${JSON.stringify(desc).replaceAll('"', "'")}\n` : ''
  }---\n`;
}

function stripImports(source) {
  return source
    .replace(/^import .*$/gm, '')
    .replace(/^export const toc = \[\{\}\];\n?/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function selectConsoleForInteractiveWhiteboard(source) {
  let body = source;

  body = body.replace(
    /<ProductWrapper notAllowed=\{\['interactive-whiteboard'[\s\S]*?<\/ProductWrapper>\n?/g,
    '',
  );
  body = body.replace(
    /<ProductWrapper product=\{\['interactive-whiteboard'[\s\S]*?\}>\n?([\s\S]*?)\n?<\/ProductWrapper>/g,
    '$1\n',
  );
  body = body.replace(
    /<ProductWrapper notAllowed="interactive-whiteboard">[\s\S]*?<\/ProductWrapper>\n?/g,
    '',
  );

  return stripImports(body);
}

function normalizeAdmonitions(source) {
  return source
    .replace(
      /<Admonition type="caution" title="Note">\n([\s\S]*?)\n<\/Admonition>/g,
      ':::warning[Note]\n$1\n:::',
    )
    .replace(
      /<Admonition type="info" title="Info">\n([\s\S]*?)\n<\/Admonition>/g,
      ':::info[Info]\n$1\n:::',
    );
}

function replaceVariables(source) {
  return source
    .replace(/<Vpd k="NAME" \/>/g, 'Interactive Whiteboard')
    .replace(/<Vpd k="SDK" \/>/g, 'Whiteboard SDK')
    .replace(/<Vg k="CONSOLE" \/>/g, 'Agora Console')
    .replace(/<Vg k="COMPANY" \/>/g, 'Agora')
    .replace(
      /<Link to="\{\{Global\.AGORA_CONSOLE_URL\}\}">Agora Console<\/Link>/g,
      '[Agora Console](https://console.agora.io/)',
    );
}

function normalizeLinksAndImages(source) {
  return source
    .replace(
      /!\[\]\(\/images\/interactive-whiteboard\/whiteboard-concepts\.png\)/g,
      '![Interactive Whiteboard concepts](https://assets-docs.agora.io/images/interactive-whiteboard/whiteboard-concepts.png)',
    )
    .replace(
      /\[File conversion overview\]\(\/interactive-whiteboard\/develop\/file-conversion-overview\)/g,
      '[File conversion overview](../build/display-files-and-manage-scenes/file-conversion-overview.md)',
    )
    .replace(
      /\[Scenes overview\]\(\/interactive-whiteboard\/develop\/scenes\/overview\)/g,
      '[Scenes overview](../build/display-files-and-manage-scenes/scenes/overview.mdx)',
    )
    .replace(
      /\[Enable Interactive Whiteboard\]\(\.\.\/get-started\/enable-whiteboard\)/g,
      '[Enable Interactive Whiteboard](../build/set-up-and-build-your-first-app/enable-whiteboard.md)',
    )
    .replace(
      /\[Agora account management\]\(\.\.\/get-started\/manage-agora-account\)/g,
      '[Agora account management](../build/manage-agora-account.md)',
    )
    .replace(/\{\{Global\.AGORA_CONSOLE_URL\}\}/g, 'https://console.agora.io/');
}

function normalizeMdx(source) {
  return `${source
    .replace(/<br\/>/g, '<br />')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()}\n`;
}

let body = read(wrapperPath).replace(/^---\n[\s\S]*?\n---\n?/, '');
const shared = stripImports(read(sharedPath));
const consoleBody = selectConsoleForInteractiveWhiteboard(read(consolePath));

body = body
  .replace(/^import CoreConcepts.*$/m, '')
  .replace(/^export const toc = \[\{\}\];\n?/m, '')
  .replace('<CoreConcepts />', shared)
  .trim();

body = body.replace('<Console />', consoleBody);
body = normalizeMdx(normalizeLinksAndImages(replaceVariables(normalizeAdmonitions(body))));

const generated = `${frontmatter(read(wrapperPath))}\n${body}`;
fs.writeFileSync(targetPath, generated);
```

## Verification snippets

Check for old source syntax:

```bash
rg -n '@docs/shared|@shared|<Vpd|<Vg|<Admonition|<ProductWrapper|<Console' \
  content/docs/en/realtime-media/whiteboard/reference/core-concepts.mdx
```

Check local relative links:

```bash
node <<'NODE'
const fs = require('fs');
const path = require('path');
const file = 'content/docs/en/realtime-media/whiteboard/reference/core-concepts.mdx';
const text = fs.readFileSync(file, 'utf8');
const dir = path.dirname(file);
const links = [...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
  .map((match) => match[1])
  .filter((href) => !/^https?:/.test(href));

let failed = false;
for (const href of links) {
  const [target] = href.split('#');
  const resolved = path.normalize(path.join(dir, target));
  const ok = [
    resolved,
    resolved.replace(/\.mdx?$/, '.md'),
    resolved.replace(/\.mdx?$/, '.mdx'),
  ].some((candidate) => fs.existsSync(candidate));
  console.log(`${ok ? 'ok' : 'missing'} ${href}`);
  failed ||= !ok;
}
process.exit(failed ? 1 : 0);
NODE
```

Run the required build gate:

```bash
bun run types:check
```

## What to report

In the final response for a migration, include:

- Source wrapper path.
- Shared files that were expanded.
- Target page path.
- `meta.json` path if navigation changed.
- Mechanical conversions performed.
- Verification commands and whether they passed.
- Any source text that appears suspicious but was preserved for fidelity.
