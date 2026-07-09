import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const allowedObjectPrefix = 'images/';

const contentTypes = new Map([
  ['.avif', 'image/avif'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.pdf', 'application/pdf'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
]);
const allowedExtensions = new Set(contentTypes.keys());

loadEnvFile(path.join(repoRoot, '.env.local'));

const args = parseArgs(process.argv.slice(2));

if (args.help || args.inputs.length === 0) {
  printUsage();
  process.exit(args.help ? 0 : 1);
}

const config = readConfig();
const uploads = collectUploads(args.inputs, config, args.key);

if (uploads.length === 0) {
  fail('No uploadable assets found.');
}

console.log(args.dryRun ? 'Dry run:' : 'Uploading:');

for (const upload of uploads) {
  console.log(`- ${path.relative(repoRoot, upload.filePath)} -> ${upload.url}`);
}

if (args.dryRun) {
  printMarkdown(uploads);
  process.exit(0);
}

assertUploadCredentials();

for (const upload of uploads) {
  if (!args.overwrite && (await objectExists(config, upload.key))) {
    fail(`Refusing to overwrite existing object: s3://${config.bucket}/${upload.key}`);
  }

  await putObject(config, upload);
}

console.log('\nUploaded:');
for (const upload of uploads) {
  console.log(upload.url);
}

printMarkdown(uploads);

function parseArgs(rawArgs) {
  const parsed = {
    dryRun: false,
    help: false,
    inputs: [],
    key: null,
    overwrite: false,
  };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }

    if (arg === '--overwrite') {
      parsed.overwrite = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    if (arg === '--key') {
      parsed.key = readFlagValue(rawArgs, (index += 1), '--key');
      continue;
    }

    if (arg.startsWith('--')) {
      fail(`Unknown option: ${arg}`);
    }

    parsed.inputs.push(arg);
  }

  if (parsed.key && parsed.inputs.length !== 1) {
    fail('--key can only be used with a single file.');
  }

  return parsed;
}

function readFlagValue(rawArgs, index, flag) {
  const value = rawArgs[index];
  if (!value || value.startsWith('--')) {
    fail(`Missing value for ${flag}.`);
  }
  return value;
}

function readConfig() {
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    bucket: readEnv('DOC_ASSETS_S3_BUCKET'),
    cacheControl:
      process.env.DOC_ASSETS_CACHE_CONTROL ?? 'public, max-age=31536000, immutable',
    cdnBaseUrl: normalizeBaseUrl(readEnv('DOC_ASSETS_CDN_BASE_URL')),
    prefix: allowedObjectPrefix,
    region: readEnv('DOC_ASSETS_S3_REGION'),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

function readEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    fail(`Missing required environment variable: ${name}`);
  }
  return value;
}

function assertUploadCredentials() {
  if (!process.env.AWS_ACCESS_KEY_ID?.trim()) {
    fail('Missing required environment variable: AWS_ACCESS_KEY_ID');
  }

  if (!process.env.AWS_SECRET_ACCESS_KEY?.trim()) {
    fail('Missing required environment variable: AWS_SECRET_ACCESS_KEY');
  }
}

function collectUploads(inputs, uploadConfig, keyOverride) {
  const files = inputs.flatMap((input) => collectInputFiles(path.resolve(repoRoot, input)));

  return files.map((file) => {
    const key = keyOverride
      ? normalizeObjectKey(keyOverride, uploadConfig.prefix)
      : normalizeObjectKey(
          `${uploadConfig.prefix}${relativeAssetKey(file, inputs)}`,
          uploadConfig.prefix,
        );

    return {
      body: fs.readFileSync(file),
      contentType: getContentType(file),
      filePath: file,
      key,
      url: `${uploadConfig.cdnBaseUrl}${encodeKeyForUrl(key)}`,
    };
  });
}

function collectInputFiles(inputPath) {
  if (!fs.existsSync(inputPath)) {
    fail(`Input does not exist: ${inputPath}`);
  }

  const stat = fs.statSync(inputPath);

  if (stat.isFile()) {
    assertAllowedFile(inputPath);
    return [inputPath];
  }

  if (!stat.isDirectory()) {
    fail(`Input must be a file or directory: ${inputPath}`);
  }

  const files = [];
  walkDirectory(inputPath, files);
  return files;
}

function walkDirectory(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }

    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkDirectory(entryPath, files);
      continue;
    }

    if (entry.isFile()) {
      assertAllowedFile(entryPath);
      files.push(entryPath);
    }
  }
}

function assertAllowedFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    fail(`Unsupported asset type: ${filePath}`);
  }
}

function relativeAssetKey(filePath, rawInputs) {
  const matchingDirectory = rawInputs
    .map((input) => path.resolve(repoRoot, input))
    .filter((input) => fs.existsSync(input) && fs.statSync(input).isDirectory())
    .find((input) => filePath.startsWith(`${input}${path.sep}`));

  if (matchingDirectory) {
    return path.relative(matchingDirectory, filePath).split(path.sep).join('/');
  }

  return path.basename(filePath);
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function normalizeObjectKey(key, requiredPrefix) {
  const normalized = key.trim().replace(/^\/+/, '');

  if (!normalized || normalized.endsWith('/')) {
    fail(`Invalid object key: ${key}`);
  }

  if (normalized.includes('..') || normalized.includes('\\')) {
    fail(`Unsafe object key: ${key}`);
  }

  if (!normalized.startsWith(requiredPrefix)) {
    fail(`Object key must start with configured prefix: ${requiredPrefix}`);
  }

  for (const segment of normalized.split('/')) {
    if (!/^[A-Za-z0-9._@+-]+$/.test(segment)) {
      fail(
        `Unsafe object key segment "${segment}". Use ASCII letters, numbers, dot, dash, underscore, @, or +.`,
      );
    }
  }

  return normalized;
}

function encodeKeyForUrl(key) {
  return key.split('/').map(encodeURIComponent).join('/');
}

function getContentType(filePath) {
  return contentTypes.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream';
}

async function objectExists(uploadConfig, key) {
  const response = await signedFetch(uploadConfig, 'HEAD', key);

  if (response.status === 404) {
    return false;
  }

  if (response.ok) {
    return true;
  }

  await failWithResponse(`Failed to check existing object: ${key}`, response);
}

async function putObject(uploadConfig, upload) {
  const response = await signedFetch(uploadConfig, 'PUT', upload.key, upload.body, {
    'cache-control': uploadConfig.cacheControl,
    'content-type': upload.contentType,
  });

  if (!response.ok) {
    await failWithResponse(`Failed to upload object: ${upload.key}`, response);
  }
}

async function signedFetch(uploadConfig, method, key, body = Buffer.alloc(0), extraHeaders = {}) {
  const host = `${uploadConfig.bucket}.s3.${uploadConfig.region}.amazonaws.com`;
  const now = new Date();
  const amzDate = formatAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(body);
  const encodedKey = encodeKeyForUrl(key);
  const url = `https://${host}/${encodedKey}`;
  const headers = {
    ...extraHeaders,
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };
  const signedHeaders = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaders.map((name) => `${name}:${headers[name]}\n`).join('');
  const credentialScope = `${dateStamp}/${uploadConfig.region}/s3/aws4_request`;
  const canonicalRequest = [
    method,
    `/${encodedKey}`,
    '',
    canonicalHeaders,
    signedHeaders.join(';'),
    payloadHash,
  ].join('\n');
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');
  const signingKey = getSigningKey(uploadConfig.secretAccessKey, dateStamp, uploadConfig.region);
  const signature = hmacHex(signingKey, stringToSign);

  return fetch(url, {
    body: method === 'PUT' ? body : undefined,
    headers: {
      ...headers,
      authorization: [
        `AWS4-HMAC-SHA256 Credential=${uploadConfig.accessKeyId}/${credentialScope}`,
        `SignedHeaders=${signedHeaders.join(';')}`,
        `Signature=${signature}`,
      ].join(', '),
    },
    method,
  });
}

function formatAmzDate(date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function getSigningKey(secretAccessKey, dateStamp, region) {
  const dateKey = hmac(Buffer.from(`AWS4${secretAccessKey}`, 'utf8'), dateStamp);
  const dateRegionKey = hmac(dateKey, region);
  const dateRegionServiceKey = hmac(dateRegionKey, 's3');
  return hmac(dateRegionServiceKey, 'aws4_request');
}

function hmac(key, value) {
  return crypto.createHmac('sha256', key).update(value).digest();
}

function hmacHex(key, value) {
  return crypto.createHmac('sha256', key).update(value).digest('hex');
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function failWithResponse(message, response) {
  fail(`${message}\nS3 responded ${response.status} ${response.statusText}`);
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const raw = fs.readFileSync(envPath, 'utf8');

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      continue;
    }

    const [, name, rawValue] = match;
    if (process.env[name] !== undefined) {
      continue;
    }

    process.env[name] = unquoteEnvValue(rawValue.trim());
  }
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function printMarkdown(uploadList) {
  console.log('\nMarkdown:');
  for (const upload of uploadList) {
    const alt = path.basename(upload.filePath, path.extname(upload.filePath));
    console.log(`![${alt}](${upload.url})`);
  }
}

function printUsage() {
  console.log(`Usage:
  bun run assets:upload <file-or-directory> [more-files] [--dry-run] [--overwrite]
  bun run assets:upload <file> --key images/product/example.png

Rules:
  - New uploads are restricted to the images/ S3 prefix.
  - The legacy img/ prefix is read-only compatibility surface; do not upload there.
  - Never print, copy, summarize, upload, or inspect .env* files.
  - Let this script load .env.local directly. Do not read secrets manually.

Environment:
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  DOC_ASSETS_S3_REGION
  DOC_ASSETS_S3_BUCKET
  DOC_ASSETS_CDN_BASE_URL
  DOC_ASSETS_CACHE_CONTROL

Examples:
  bun run assets:upload ./local-images --dry-run
  bun run assets:upload ./local-images/foo.png
  bun run assets:upload ./foo.png --key images/rtc/foo.png
`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
