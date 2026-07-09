# Static Asset Uploads

This repo uploads docs-owned binary assets directly to the shared S3 bucket
behind `https://assets-docs.agora.io/`. Do not add screenshots, diagrams, or
other large docs assets to Git unless they are part of a deliberate repo-owned
test fixture.

## Security Discipline

Agents and humans must follow these rules:

- Never read, print, summarize, copy, upload, or expose `.env`, `.env.local`, or
  any `.env*` file.
- Never ask the user to paste secrets into chat.
- Never include secrets in command output, logs, commits, PR descriptions, or
  issue comments.
- Use `.env.local` only by running the upload script. The script loads the file
  itself.
- If an upload fails because credentials are missing or invalid, report the
  missing variable name or failure category only. Do not inspect the env file.

The tracked template is `.env.example`. Local `.env*` files are
ignored by Git.

## Bucket Layout

Current bucket: `assets-docs-agora`.

Known top-level prefixes:

- `images/` - canonical location for new docs image uploads.
- `img/` - legacy compatibility prefix. Do not upload new assets here.
- `fonts/` - font assets. Not part of the docs image upload workflow.
- `og/` - Open Graph assets. Not part of the docs image upload workflow.

The upload script hard-codes `images/` as the only allowed object prefix. Even
when `--key` is used, the object key must start with `images/`.

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Fill only the S3 upload variables provided by the project owner:

```dotenv
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DOC_ASSETS_S3_REGION=
DOC_ASSETS_S3_BUCKET=
DOC_ASSETS_CDN_BASE_URL=https://assets-docs.agora.io/
DOC_ASSETS_CACHE_CONTROL=public, max-age=31536000, immutable
```

Do not commit `.env.local`.

## Commands

Preview an upload without touching S3:

```bash
bun run assets:upload ./local-images/foo.png --dry-run
```

Upload a single file to the default object key:

```bash
bun run assets:upload ./local-images/foo.png
```

The default object key is:

```text
images/foo.png
```

Upload a single file to an explicit object key:

```bash
bun run assets:upload ./local-images/foo.png --key images/rtc/foo.png
```

Upload a directory:

```bash
bun run assets:upload ./local-images
```

By default, the script refuses to overwrite existing S3 objects. To replace an
existing object deliberately:

```bash
bun run assets:upload ./local-images/foo.png --key images/rtc/foo.png --overwrite
```

## Expected Output

The script prints the uploaded CDN URL and Markdown image syntax:

```text
Uploaded:
https://assets-docs.agora.io/images/rtc/foo.png

Markdown:
![foo](https://assets-docs.agora.io/images/rtc/foo.png)
```

Use the printed CDN URL in docs content.

## Guardrails

The script enforces:

- Allowed object prefix: `images/`.
- Allowed file extensions: `avif`, `gif`, `ico`, `jpeg`, `jpg`, `pdf`, `png`,
  `svg`, and `webp`.
- Default no-overwrite behavior through a pre-upload `HEAD` check.
- Explicit `--overwrite` for replacement.
- CDN URL output using `DOC_ASSETS_CDN_BASE_URL`.

The script rejects object keys under `img/`, `fonts/`, `og/`, or any other
prefix.
