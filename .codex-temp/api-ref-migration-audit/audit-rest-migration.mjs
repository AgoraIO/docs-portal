import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourceRoot = '/Users/yangyixuan/Documents/GitHub/Doc-Source-Private';
const targetRoot = path.join(repo, 'content/docs/en/api-reference/api-ref');
const openapiRoot = path.join(repo, 'content/openapi');
const outDir = path.join(repo, '.codex-temp/api-ref-migration-audit');

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function rel(root, p) {
  return path.relative(root, p).split(path.sep).join('/');
}

function walk(dir, predicate = () => true) {
  if (!exists(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(p, predicate));
    } else if (predicate(p)) {
      out.push(p);
    }
  }
  return out;
}

function stripFrontmatter(text) {
  return text.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  try {
    return yaml.load(m[1]) ?? {};
  } catch {
    return {};
  }
}

function resolveImport(fromFile, spec) {
  let base;
  if (spec.startsWith('@docs/shared/')) {
    base = path.join(sourceRoot, 'shared', spec.slice('@docs/shared/'.length));
  } else if (spec.startsWith('@shared/')) {
    base = path.join(sourceRoot, 'shared', spec.slice('@shared/'.length));
  } else if (spec.startsWith('./') || spec.startsWith('../')) {
    base = path.resolve(path.dirname(fromFile), spec);
  } else {
    return null;
  }
  const candidates = [base, `${base}.mdx`, `${base}.md`, `${base}.json`];
  return candidates.find(exists) ?? null;
}

function expandImports(file, seen = new Set()) {
  if (!exists(file) || seen.has(file)) return '';
  seen.add(file);
  let text = read(file);
  const importRegex = /^import\s+[^'"]+\s+from\s+['"]([^'"]+)['"];?\s*$/gm;
  const imports = [];
  let m;
  while ((m = importRegex.exec(text))) {
    const resolved = resolveImport(file, m[1]);
    if (resolved && /\.(md|mdx)$/.test(resolved)) {
      imports.push({ spec: m[1], file: resolved });
    }
  }
  text = text.replace(importRegex, '');
  for (const item of imports) {
    const name = path.basename(item.spec).replace(/^_/, '').replace(/\.(mdx?|json)$/, '');
    const componentRegex = new RegExp(`<${name}\\s*/>|<${name}></${name}>`, 'g');
    if (componentRegex.test(text)) {
      text = text.replace(componentRegex, `\n${expandImports(item.file, seen)}\n`);
    } else {
      text += `\n\n${expandImports(item.file, seen)}\n`;
    }
  }
  return text;
}

function normalizeText(text) {
  return stripFrontmatter(text)
    .replace(/<Vg\s+k="COMPANY"\s*\/>/g, 'Agora')
    .replace(/<Vg\s+k="CONSOLE"\s*\/>/g, 'Agora Console')
    .replace(/<Vpd\s+k="NAME"\s*\/>/g, '')
    .replace(/<Vpd\s+k="SIG"\s*\/>/g, 'Signaling')
    .replace(/<Vpd\s+k="RTC"\s*\/>/g, 'RTC')
    .replace(/<Vpd\s+k="VID"\s*\/>/g, 'Video Calling')
    .replace(/<Vpd\s+k="VOICE"\s*\/>/g, 'Voice Calling')
    .replace(/<[^>\n]+>/g, ' ')
    .replace(/\]\([^)]+\)/g, ']')
    .replace(/[`*_{}#[\]|>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHeadings(text) {
  const headings = [];
  const re = /^(#{1,6})\s+(.+)$/gm;
  let m;
  while ((m = re.exec(text))) {
    headings.push({
      depth: m[1].length,
      text: m[2].replace(/\{#[^}]+\}/g, '').replace(/<[^>]+>/g, '').trim(),
    });
  }
  return headings;
}

function extractAnchors(text) {
  const anchors = new Set();
  for (const m of text.matchAll(/\{#([^}]+)\}/g)) anchors.add(m[1]);
  for (const m of text.matchAll(/id=["']([^"']+)["']/g)) anchors.add(m[1]);
  for (const m of text.matchAll(/name=["']([^"']+)["']/g)) anchors.add(m[1]);
  for (const h of extractHeadings(text)) {
    const slug = h.text
      .toLowerCase()
      .replace(/`/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (slug) anchors.add(slug);
  }
  return [...anchors].sort();
}

function extractHttp(text) {
  const endpoints = new Set();
  const methods = new Set();
  const codeBlocks = [...text.matchAll(/```[\s\S]*?```/g)].map((m) => m[0]).join('\n');
  const all = `${text}\n${codeBlocks}`;
  for (const m of text.matchAll(/<LeftColumn\b[\s\S]*?method=["']([^"']+)["'][\s\S]*?endpoint=["']([^"']+)["'][\s\S]*?>/g)) {
    methods.add(m[1].toUpperCase());
    endpoints.add(`${m[1].toUpperCase()} ${m[2]}`);
  }
  for (const m of text.matchAll(/<LeftColumn\b[\s\S]*?endpoint=["']([^"']+)["'][\s\S]*?method=["']([^"']+)["'][\s\S]*?>/g)) {
    methods.add(m[2].toUpperCase());
    endpoints.add(`${m[2].toUpperCase()} ${m[1]}`);
  }
  const methodRe = /\b(GET|POST|PUT|PATCH|DELETE)\b\s+((?:https?:\/\/[^\s`'")]+|\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%{}-]+))/g;
  let m;
  while ((m = methodRe.exec(all))) {
    methods.add(m[1]);
    endpoints.add(`${m[1]} ${m[2].replace(/[),.;]+$/, '')}`);
  }
  const curlRe = /curl\s+(?:-[A-Z]\s+)?['"]?((?:https?:\/\/|\/)[^\s'"\\]+)/g;
  while ((m = curlRe.exec(all))) endpoints.add(m[1].replace(/[),.;]+$/, ''));
  const pathRe = /`(\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%{}-]+)`/g;
  while ((m = pathRe.exec(all))) endpoints.add(m[1].replace(/[),.;]+$/, ''));
  return { methods: [...methods].sort(), endpoints: [...endpoints].sort() };
}

function extractTables(text) {
  const fields = new Set();
  const errorCodes = new Set();
  for (const m of text.matchAll(/<(?:PathParameter|Parameter)\b[^>]*\bname=["']([^"']+)["']/g)) {
    fields.add(m[1]);
  }
  const rows = text.split('\n').filter((line) => /^\s*\|.*\|\s*$/.test(line));
  for (const row of rows) {
    const cells = row
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => c.replace(/<[^>]+>/g, ' ').replace(/[`*_]/g, '').trim());
    if (!cells.length) continue;
    const first = cells[0];
    if (/^-+$/.test(first.replace(/\s/g, ''))) continue;
    if (/^\d{3,6}$/.test(first)) errorCodes.add(first);
    if (/^[A-Za-z_][A-Za-z0-9_.-]{0,80}$/.test(first) && !/^(Name|Parameter|Field|Code|Status|Type|Description|Required)$/i.test(first)) {
      fields.add(first);
    }
    for (const cell of cells) {
      for (const m of cell.matchAll(/`?([A-Za-z_][A-Za-z0-9_.-]{1,80})`?/g)) {
        const v = m[1];
        if (!/^(string|number|integer|boolean|object|array|true|false|null|required|optional|yes|no)$/i.test(v)) {
          fields.add(v);
        }
      }
    }
  }
  for (const m of text.matchAll(/\b(2\d{2}|3\d{2}|4\d{2}|5\d{2}|10\d{3}|20\d{3}|30\d{3}|40\d{3}|50\d{3})\b/g)) {
    errorCodes.add(m[1]);
  }
  return { fields: [...fields].sort(), errorCodes: [...errorCodes].sort() };
}

function extractCodeSignals(text) {
  const snippets = [...text.matchAll(/```([\w-]*)\n([\s\S]*?)```/g)].map((m) => ({
    lang: m[1] || '',
    text: m[2].trim().slice(0, 300),
  }));
  const hasCurl = /\bcurl\b/.test(text);
  const hasJson = /```json|{\s*"[^"]+"\s*:/.test(text);
  return { snippets: snippets.slice(0, 8), hasCurl, hasJson, count: snippets.length };
}

function signatureFromText(text) {
  const normalized = normalizeText(text);
  const { methods, endpoints } = extractHttp(text);
  const { fields, errorCodes } = extractTables(text);
  const code = extractCodeSignals(text);
  return {
    title: frontmatter(text).title ?? extractHeadings(text).find((h) => h.depth === 1)?.text ?? '',
    description: frontmatter(text).description ?? '',
    headings: extractHeadings(text).map((h) => `${'#'.repeat(h.depth)} ${h.text}`),
    anchors: extractAnchors(text),
    methods,
    endpoints,
    fields,
    errorCodes,
    code,
    wordCount: normalized ? normalized.split(/\s+/).length : 0,
    sample: normalized.slice(0, 400),
  };
}

function sourcePublicUrl(sourceRel) {
  const noExt = sourceRel.replace(/\.(mdx?|json)$/, '');
  const parts = noExt.split('/');
  return `https://docs.agora.io/en/${parts.join('/')}`;
}

function targetPublicUrl(targetRel) {
  const noExt = targetRel.replace(/\.(mdx?|json)$/, '').replace(/\/index$/, '');
  return `https://docs.agora.io/en/api-reference/api-ref/${noExt}`;
}

const restFilePredicates = [
  (r) => /(^|\/)rest-api\//.test(r),
  (r) => /(^|\/)restful-api\//.test(r),
  (r) => /(^|\/)channel-management-api\//.test(r),
  (r) => /\/reference\/(agora-console-rest-api|channel-management-rest-api|restful-authentication)\.mdx?$/.test(r),
  (r) => /\/reference\/whiteboard-api\//.test(r),
  (r) => /\/develop\/generate-token-rest\.mdx?$/.test(r),
  (r) => /\/develop\/restful-api\.mdx?$/.test(r),
];

const sourceFiles = walk(sourceRoot, (p) => /\.(md|mdx|json)$/.test(p))
  .map((p) => ({ abs: p, rel: rel(sourceRoot, p) }))
  .filter(({ rel: r }) => restFilePredicates.some((fn) => fn(r)))
  .filter(({ rel: r }) => !r.startsWith('shared/'))
  .sort((a, b) => a.rel.localeCompare(b.rel));

const sourceDocs = sourceFiles
  .filter(({ rel: r }) => /\.(md|mdx)$/.test(r))
  .map(({ abs, rel: r }) => {
    const raw = read(abs);
    const expanded = expandImports(abs);
    const sig = signatureFromText(expanded || raw);
    return {
      rel: r,
      abs,
      url: sourcePublicUrl(r),
      product: r.split('/')[0],
      rawImports: [...raw.matchAll(/^import\s+[^'"]+\s+from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]),
      sig,
    };
  });

const targetFiles = walk(targetRoot, (p) => /\.(md|mdx|json)$/.test(p))
  .map((p) => ({ abs: p, rel: rel(targetRoot, p) }))
  .sort((a, b) => a.rel.localeCompare(b.rel));

const targetDocs = targetFiles
  .filter(({ rel: r }) => /\.(md|mdx)$/.test(r))
  .map(({ abs, rel: r }) => {
    const raw = read(abs);
    return {
      rel: r,
      abs,
      url: targetPublicUrl(r),
      product: r.split('/')[0],
      sig: signatureFromText(raw),
    };
  });

const openapiFiles = walk(openapiRoot, (p) => /\.(ya?ml|json)$/.test(p))
  .map((p) => ({ abs: p, rel: rel(repo, p) }))
  .filter(({ rel: r }) => !r.endsWith('openapi.meta.json'))
  .sort((a, b) => a.rel.localeCompare(b.rel));

function flattenSchemaProperties(schema, prefix = '', out = new Set()) {
  if (!schema || typeof schema !== 'object') return out;
  if (schema.$ref) {
    out.add(`${prefix}${schema.$ref.split('/').pop()}`);
    return out;
  }
  const props = schema.properties;
  if (props && typeof props === 'object') {
    for (const [key, val] of Object.entries(props)) {
      const name = prefix ? `${prefix}.${key}` : key;
      out.add(name);
      flattenSchemaProperties(val, name, out);
    }
  }
  if (schema.items) flattenSchemaProperties(schema.items, prefix ? `${prefix}[]` : 'items', out);
  for (const branch of ['oneOf', 'anyOf', 'allOf']) {
    if (Array.isArray(schema[branch])) {
      for (const child of schema[branch]) flattenSchemaProperties(child, prefix, out);
    }
  }
  return out;
}

function resolveRef(doc, ref) {
  if (!ref?.startsWith('#/')) return null;
  let cur = doc;
  for (const part of ref.slice(2).split('/')) {
    cur = cur?.[part.replace(/~1/g, '/').replace(/~0/g, '~')];
  }
  return cur ?? null;
}

function schemaFields(doc, schema, prefix = '', out = new Set(), seen = new Set()) {
  if (!schema || typeof schema !== 'object') return out;
  if (schema.$ref) {
    if (seen.has(schema.$ref)) return out;
    seen.add(schema.$ref);
    return schemaFields(doc, resolveRef(doc, schema.$ref), prefix, out, seen);
  }
  const props = schema.properties;
  if (props && typeof props === 'object') {
    for (const [key, val] of Object.entries(props)) {
      const name = prefix ? `${prefix}.${key}` : key;
      out.add(name);
      schemaFields(doc, val, name, out, seen);
    }
  }
  if (schema.items) schemaFields(doc, schema.items, prefix ? `${prefix}[]` : 'items', out, seen);
  for (const branch of ['oneOf', 'anyOf', 'allOf']) {
    if (Array.isArray(schema[branch])) {
      for (const child of schema[branch]) schemaFields(doc, child, prefix, out, seen);
    }
  }
  return out;
}

const openapiOps = [];
for (const { abs, rel: r } of openapiFiles) {
  let doc;
  try {
    doc = yaml.load(read(abs));
  } catch {
    continue;
  }
  if (!doc?.paths) continue;
  for (const [apiPath, item] of Object.entries(doc.paths)) {
    for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
      const op = item?.[method];
      if (!op) continue;
      const fields = new Set();
      const params = op.parameters ?? [];
      for (const p of params) fields.add(p.name);
      const reqSchemas = op.requestBody?.content ? Object.values(op.requestBody.content).map((c) => c.schema) : [];
      for (const s of reqSchemas) schemaFields(doc, s, '', fields);
      const errorCodes = new Set();
      const responseFields = new Set();
      for (const [code, resp] of Object.entries(op.responses ?? {})) {
        errorCodes.add(code);
        const schemas = resp?.content ? Object.values(resp.content).map((c) => c.schema) : [];
        for (const s of schemas) schemaFields(doc, s, '', responseFields);
      }
      openapiOps.push({
        source: r,
        operationId: op.operationId ?? '',
        title: op.summary ?? op.operationId ?? '',
        method: method.toUpperCase(),
        path: apiPath,
        endpoint: `${method.toUpperCase()} ${apiPath}`,
        fields: [...fields].sort(),
        responseFields: [...responseFields].sort(),
        errorCodes: [...errorCodes].sort(),
        description: op.description ?? '',
      });
    }
  }
}

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size && !B.size) return 1;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter || 1);
}

function tokens(s) {
  return normalizeText(s)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((x) => x.length > 2 && !['the', 'and', 'for', 'with', 'api', 'rest', 'restful', 'agora'].includes(x));
}

function docsForProduct(product) {
  const productMap = {
    'agora-chat': ['im'],
    'video-calling': ['rtc', 'video'],
    'voice-calling': ['rtc', 'voice'],
    'interactive-live-streaming': ['rtc', 'video'],
    'broadcast-streaming': ['rtc', 'broadcast-streaming'],
    signaling: ['signaling'],
    'cloud-recording': ['cloud-recording'],
    'cloud-transcoding': ['cloud-transcoding'],
    'conversational-ai': ['conversational-ai'],
    'real-time-stt': ['speech-to-text'],
    'media-gateway': ['rtmp-gateway'],
    'media-pull': ['media-pull'],
    'media-push': ['media-push'],
    'interactive-whiteboard': ['whiteboard'],
    iot: ['iot-channel-management-rest-api.md'],
    'flexible-classroom': ['flexible-classroom'],
    'agora-analytics': ['agora-analytics'],
  };
  return productMap[product] ?? [product];
}

function candidateTargets(src) {
  const targetProducts = docsForProduct(src.product);
  const titleTokens = tokens(`${src.rel} ${src.sig.title} ${src.sig.description} ${src.sig.headings.slice(0, 8).join(' ')}`);
  const candidates = [];
  for (const tgt of targetDocs) {
    const productHit = targetProducts.some((p) => tgt.rel === p || tgt.rel.startsWith(`${p}/`) || tgt.rel === p);
    if (!productHit && src.product !== 'broadcast-streaming') continue;
    const endpointScore = jaccard(src.sig.endpoints, tgt.sig.endpoints);
    const fieldScore = jaccard(src.sig.fields.slice(0, 120), tgt.sig.fields.slice(0, 120));
    const titleScore = jaccard(titleTokens, tokens(`${tgt.rel} ${tgt.sig.title} ${tgt.sig.description} ${tgt.sig.headings.slice(0, 8).join(' ')}`));
    const score = endpointScore * 5 + titleScore * 3 + fieldScore;
    if (score > 0.15) candidates.push({ rel: tgt.rel, url: tgt.url, score, endpointScore, titleScore, fieldScore });
  }
  for (const op of openapiOps) {
    const routeProduct = op.source.includes('/rtc/') ? 'rtc'
      : op.source.includes('/rtm/') ? 'signaling'
      : op.source.includes('/cloud-recording/') ? 'cloud-recording'
      : op.source.includes('/cloud-transcoding/') ? 'cloud-transcoding'
      : op.source.includes('/conversational-ai/') ? 'conversational-ai'
      : op.source.includes('/media-gateway/') ? 'rtmp-gateway'
      : op.source.includes('/speech-to-text/') ? 'speech-to-text'
      : op.source;
    const productHit = targetProducts.includes(routeProduct);
    if (!productHit) continue;
    const srcEndpointText = src.sig.endpoints.join(' ');
    const endpointHit = srcEndpointText.includes(op.path) || src.sig.methods.includes(op.method) && jaccard(tokens(src.rel), tokens(op.operationId + ' ' + op.title + ' ' + op.path)) > 0.2;
    const fieldScore = jaccard(src.sig.fields.slice(0, 160), [...op.fields, ...op.responseFields].slice(0, 220));
    const titleScore = jaccard(titleTokens, tokens(`${op.operationId} ${op.title} ${op.path}`));
    const score = (endpointHit ? 6 : 0) + titleScore * 4 + fieldScore;
    if (score > 0.2) candidates.push({
      rel: op.source,
      operationId: op.operationId,
      endpoint: op.endpoint,
      score,
      endpointScore: endpointHit ? 1 : 0,
      titleScore,
      fieldScore,
      type: 'openapi',
    });
  }
  return candidates.sort((a, b) => b.score - a.score).slice(0, 8);
}

const mapped = sourceDocs.map((src) => ({
  oldPage: src.url,
  oldSource: src.rel,
  product: src.product,
  title: src.sig.title,
  methods: src.sig.methods,
  endpoints: src.sig.endpoints,
  fieldsCount: src.sig.fields.length,
  errorCodes: src.sig.errorCodes,
  anchorsCount: src.sig.anchors.length,
  imports: src.rawImports,
  candidates: candidateTargets(src),
}));

const byProduct = {};
for (const item of mapped) {
  byProduct[item.product] ??= { pages: 0, endpointPages: 0, oldSources: [] };
  byProduct[item.product].pages++;
  if (item.endpoints.length || item.methods.length) byProduct[item.product].endpointPages++;
  byProduct[item.product].oldSources.push(item.oldSource);
}

const result = {
  generatedAt: new Date().toISOString(),
  sourceRoot,
  targetRoot,
  summary: {
    sourceDocs: sourceDocs.length,
    targetDocs: targetDocs.length,
    openapiFiles: openapiFiles.length,
    openapiOps: openapiOps.length,
    byProduct,
  },
  sourceDocs,
  targetDocs,
  openapiOps,
  mappingCandidates: mapped,
};

fs.writeFileSync(path.join(outDir, 'inventory.json'), JSON.stringify(result, null, 2));
fs.writeFileSync(
  path.join(outDir, 'inventory-summary.md'),
  [
    '# REST Migration Inventory',
    '',
    `Generated: ${result.generatedAt}`,
    '',
    '## Source Products',
    '',
    '| Product | Pages | Endpoint-like pages |',
    '| --- | ---: | ---: |',
    ...Object.entries(byProduct).map(([product, info]) => `| ${product} | ${info.pages} | ${info.endpointPages} |`),
    '',
    '## OpenAPI Operations',
    '',
    '| Source | Operation | Method | Path |',
    '| --- | --- | --- | --- |',
    ...openapiOps.map((op) => `| ${op.source} | ${op.operationId} | ${op.method} | \`${op.path}\` |`),
    '',
    '## Mapping Candidates',
    '',
    '| Old source | Old URL | Top candidates |',
    '| --- | --- | --- |',
    ...mapped.map((m) => {
      const cand = m.candidates
        .slice(0, 3)
        .map((c) => c.type === 'openapi' ? `${c.rel}#${c.operationId} (${c.score.toFixed(2)})` : `${c.rel} (${c.score.toFixed(2)})`)
        .join('<br>');
      return `| ${m.oldSource} | ${m.oldPage} | ${cand || 'NONE'} |`;
    }),
    '',
  ].join('\n'),
);

console.log(JSON.stringify(result.summary, null, 2));
