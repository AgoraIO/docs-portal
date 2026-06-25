import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const DEFAULT_MAX_SAMPLES = 8;
const MARKDOWN_FILE_PATTERN = /\.(md|mdx)$/i;
const LOCALES = ['en', 'zh-CN'];

const STATUS_META = {
  'ready-native': {
    effort: 'none',
    severity: 'none',
  },
  'needs-anchor-normalization': {
    effort: 'low',
    severity: 'medium',
  },
  'needs-api-reference-source': {
    effort: 'high',
    severity: 'high',
  },
  'needs-directive-rewrite': {
    effort: 'medium',
    severity: 'medium',
  },
  'needs-frontmatter-cleanup': {
    effort: 'low',
    severity: 'medium',
  },
  'needs-image-standard': {
    effort: 'medium',
    severity: 'medium',
  },
  'needs-include-standardization': {
    effort: 'medium',
    severity: 'high',
  },
  'needs-jsx-review': {
    effort: 'medium',
    severity: 'medium',
  },
  'needs-landing-page-normalization': {
    effort: 'high',
    severity: 'medium',
  },
  'needs-mdx-extension': {
    effort: 'low',
    severity: 'high',
  },
  'needs-openapi-decision': {
    effort: 'high',
    severity: 'high',
  },
  'needs-platform-expansion': {
    effort: 'high',
    severity: 'high',
  },
  'needs-product-specific-rules': {
    effort: 'medium',
    severity: 'medium',
  },
  'needs-table-normalization': {
    effort: 'high',
    severity: 'high',
  },
  'manual-html-review': {
    effort: 'medium',
    severity: 'medium',
  },
};

const SEVERITY_ORDER = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

const EFFORT_ORDER = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

const APPROVED_MDX_COMPONENTS = new Set([
  'Accordion',
  'Accordions',
  'Callout',
  'CalloutContainer',
  'CalloutDescription',
  'Card',
  'Cards',
  'CodeBlockTab',
  'CodeBlockTabs',
  'CodeBlockTabsList',
  'CodeBlockTabsTrigger',
  'CommandBlock',
  'File',
  'Files',
  'Folder',
  'ParamTable',
  'PlatformInline',
  'PlatformStructured',
  'Step',
  'Steps',
  'Tab',
  'Tabs',
  'TabsContent',
  'TabsList',
  'TabsTrigger',
  '_PlatformPanel',
  '_PlatformProcessedMarker',
  '_PlatformTabsGroup',
  'include',
]);

const APPROVED_OVERVIEW_COMPONENTS = new Set([
  'CardGrid',
  'CapabilityGroupCard',
  'CapabilityGroupGrid',
  'CapabilityMatrix',
  'FeatureCard',
  'HelpHub',
  'OverviewImageCard',
  'OverviewImageCardGrid',
  'OverviewLinkBanner',
  'OverviewSpotlightCard',
  'OverviewSpotlightGrid',
  'OverviewToolkits',
  'RecipesCatalog',
  'SolutionCard',
  'SolutionCardGrid',
  'ToolkitGroup',
  'ToolkitItem',
]);

const LEGACY_COMPONENT_RULES = [
  {
    components: ['Admonition'],
    pattern: 'legacy-admonition-component',
    status: 'needs-directive-rewrite',
  },
  {
    components: ['PlatformFilter', 'Platform'],
    pattern: 'legacy-platform-filter',
    status: 'needs-platform-expansion',
  },
  {
    components: ['Table', 'Tbody', 'Td', 'Th', 'Thead', 'Tr'],
    pattern: 'legacy-table-component',
    status: 'needs-table-normalization',
  },
  {
    components: ['Image'],
    pattern: 'legacy-image-component',
    status: 'needs-image-standard',
  },
  {
    components: [
      'ApiSectionCard',
      'H2',
      'H3',
      'OverloadMethodCollapse',
      'OverloadMethodCollapsePanel',
    ],
    pattern: 'legacy-api-reference-component',
    status: 'needs-api-reference-source',
  },
  {
    components: ['OpenapiRender', 'RestfulRender'],
    pattern: 'legacy-openapi-renderer',
    status: 'needs-openapi-decision',
  },
  {
    components: [
      'HotArticleCard',
      'LinkCardV2',
      'ProductOverview',
      'QuickStartCard',
      'RecommendCard',
    ],
    pattern: 'legacy-landing-component',
    status: 'needs-landing-page-normalization',
  },
  {
    components: ['Vg', 'Vpd', 'Vpl'],
    pattern: 'legacy-runtime-variable-component',
    status: 'needs-product-specific-rules',
  },
];

const LEGACY_FRONTMATTER_KEYS = new Set([
  'ag_file_path',
  'ag_platform',
  'ag_product',
  'ag_product_label',
  'ag_usecase',
  'custom_edit_url',
  'displayed_sidebar',
  'hide_table_of_contents',
  'hide_title',
  'pagination_next',
  'pagination_prev',
  'sidebar_label',
  'sidebar_position',
  'slug',
  'toc_max_heading_level',
]);

const RAW_HTML_TAGS = new Set([
  'article',
  'center',
  'dd',
  'details',
  'div',
  'dl',
  'dt',
  'figure',
  'font',
  'iframe',
  'li',
  'ol',
  'p',
  'section',
  'span',
  'style',
  'summary',
  'ul',
  'video',
]);

const INLINE_HTML_TAGS = new Set(['br', 'img']);

export function auditDocsRenderingPatterns({
  docsRoot = path.join(process.cwd(), 'content', 'docs'),
} = {}) {
  const files = listMarkdownFiles(docsRoot);
  const results = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = toContentPath(docsRoot, filePath);
    const result = analyzeFile(relativePath, content);

    if (result.statuses.length > 0) {
      results.push(result);
    }
  }

  return createReport({
    docsRoot,
    files,
    results,
  });
}

export function analyzeFile(relativePath, content) {
  const extension = path.extname(relativePath).slice(1).toLowerCase();
  const locale = relativePath.split('/')[0] ?? '';
  const scannableContent = maskMarkdownCode(content);
  const context = {
    componentCounts: collectComponentCounts(scannableContent),
    content,
    extension,
    locale,
    matches: {},
    relativePath,
    samples: [],
    sampleKeys: new Set(),
    scannableContent,
    statuses: new Set(),
  };

  detectFrontmatter(context);
  detectSharedImports(context);
  detectLegacyAnchors(context);
  detectRawHtml(context);
  detectLegacyComponents(context);
  detectMdxJsxInMarkdown(context);
  detectUnknownJsx(context);

  const statuses = [...context.statuses].sort();

  return {
    components: sortObject(context.componentCounts),
    effort: maxStatusValue(statuses, 'effort', EFFORT_ORDER),
    extension,
    locale,
    matches: sortObject(context.matches),
    path: relativePath,
    samples: context.samples,
    severity: maxStatusValue(statuses, 'severity', SEVERITY_ORDER),
    statuses,
  };
}

function detectFrontmatter(context) {
  const frontmatter = context.content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatter) {
    return;
  }

  for (const line of frontmatter[1].split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):/);

    if (match && LEGACY_FRONTMATTER_KEYS.has(match[1])) {
      addMatch(context, {
        index: context.content.indexOf(line),
        pattern: `legacy-frontmatter:${match[1]}`,
        status: 'needs-frontmatter-cleanup',
      });
    }
  }
}

function detectSharedImports(context) {
  addRegexMatches(context, {
    pattern: 'legacy-shared-import',
    regex: /^import\s+.+\s+from\s+['"]@(shared|docs\/shared)\//gm,
    status: 'needs-include-standardization',
  });
  addRegexMatches(context, {
    pattern: 'legacy-shared-reference',
    regex: /@shared\//g,
    status: 'needs-include-standardization',
  });
  addRegexMatches(context, {
    pattern: 'legacy-runtime-frontmatter-reference',
    regex: /\b(frontMatter|props)\.[A-Za-z0-9_.]+/g,
    status: 'needs-include-standardization',
  });
}

function detectLegacyAnchors(context) {
  addRegexMatches(context, {
    pattern: 'legacy-anchor-name',
    regex: /<a\s+[^>]*\bname=(["'])[^"']+\1[^>]*>\s*<\/a>/gi,
    status: 'needs-anchor-normalization',
  });
  addRegexMatches(context, {
    pattern: 'legacy-anchor-id',
    regex: /<a\s+[^>]*\bid=(["'])[^"']+\1[^>]*(?:\/>|>\s*<\/a>)/gi,
    status: 'needs-anchor-normalization',
  });
  addRegexMatches(context, {
    pattern: 'legacy-jsx-heading-id',
    regex: /<\/?H[1-6]\b[^>]*\bid=(["'])[^"']+\1[^>]*>/g,
    status: 'needs-anchor-normalization',
  });
}

function detectRawHtml(context) {
  addRegexMatches(context, {
    pattern: 'native-html-table',
    regex: /<\/?(table|thead|tbody|tr|td|th)\b[^>]*>/gi,
    status: 'needs-table-normalization',
  });

  for (const tag of RAW_HTML_TAGS) {
    addRegexMatches(context, {
      pattern: `raw-html:${tag}`,
      regex: new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi'),
      status: 'manual-html-review',
    });
  }

  for (const tag of INLINE_HTML_TAGS) {
    addRegexMatches(context, {
      pattern: `inline-html:${tag}`,
      regex: new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi'),
      status: 'manual-html-review',
    });
  }
}

function detectLegacyComponents(context) {
  for (const rule of LEGACY_COMPONENT_RULES) {
    for (const component of rule.components) {
      const count = context.componentCounts[component] ?? 0;

      if (count === 0) {
        continue;
      }

      addCount(context, {
        count,
        pattern: `${rule.pattern}:${component}`,
        status: rule.status,
      });
      addComponentSample(context, component, rule.pattern, rule.status);
    }
  }
}

function detectMdxJsxInMarkdown(context) {
  if (context.extension !== 'md') {
    return;
  }

  for (const component of Object.keys(context.componentCounts)) {
    if (!isApprovedComponent(component, context.relativePath)) {
      continue;
    }

    addCount(context, {
      count: context.componentCounts[component],
      pattern: `md-with-mdx-jsx:${component}`,
      status: 'needs-mdx-extension',
    });
    addComponentSample(
      context,
      component,
      'md-with-mdx-jsx',
      'needs-mdx-extension',
    );
  }
}

function detectUnknownJsx(context) {
  if (context.extension !== 'mdx') {
    return;
  }

  for (const [component, count] of Object.entries(context.componentCounts)) {
    if (isApprovedComponent(component, context.relativePath)) {
      continue;
    }

    if (isLegacyComponent(component)) {
      continue;
    }

    addCount(context, {
      count,
      pattern: `unapproved-jsx-component:${component}`,
      status: 'needs-jsx-review',
    });
    addComponentSample(
      context,
      component,
      'unapproved-jsx-component',
      'needs-jsx-review',
    );
  }
}

function isApprovedComponent(component) {
  if (APPROVED_MDX_COMPONENTS.has(component)) {
    return true;
  }

  return APPROVED_OVERVIEW_COMPONENTS.has(component);
}

function isLegacyComponent(component) {
  return LEGACY_COMPONENT_RULES.some((rule) =>
    rule.components.includes(component),
  );
}

function addRegexMatches(context, { pattern, regex, status }) {
  for (const match of context.scannableContent.matchAll(regex)) {
    addMatch(context, {
      index: match.index ?? 0,
      pattern,
      status,
    });
  }
}

function addComponentSample(context, component, pattern, status) {
  const regex = new RegExp(`<\\/?${escapeRegExp(component)}\\b[^>]*>`, 'g');
  const match = regex.exec(context.scannableContent);

  if (!match) {
    return;
  }

  addSample(context, {
    index: match.index,
    pattern: `${pattern}:${component}`,
    status,
  });
}

function addMatch(context, { index, pattern, status }) {
  addCount(context, {
    count: 1,
    pattern,
    status,
  });
  addSample(context, {
    index,
    pattern,
    status,
  });
}

function addCount(context, { count, pattern, status }) {
  context.statuses.add(status);
  context.matches[pattern] = (context.matches[pattern] ?? 0) + count;
}

function addSample(context, { index, pattern, status }) {
  if (context.samples.length >= DEFAULT_MAX_SAMPLES) {
    return;
  }

  const line = getLineAt(context.content, index);
  const excerpt = line.text.trim().replace(/\s+/g, ' ').slice(0, 180).trimEnd();
  const key = `${status}\0${pattern}\0${line.number}\0${excerpt}`;

  if (context.sampleKeys.has(key)) {
    return;
  }

  context.sampleKeys.add(key);

  context.samples.push({
    excerpt,
    line: line.number,
    pattern,
    status,
  });
}

function collectComponentCounts(content) {
  const counts = {};
  const componentPattern = /<\/?([A-Z][A-Za-z0-9_.]*)\b/g;

  for (const match of content.matchAll(componentPattern)) {
    const component = match[1].split('.')[0];

    counts[component] = (counts[component] ?? 0) + 1;
  }

  return counts;
}

function maskMarkdownCode(content) {
  return maskInlineCode(maskFencedCodeBlocks(content));
}

function maskFencedCodeBlocks(content) {
  let result = '';
  let offset = 0;
  let inFence = false;
  let fenceMarker = '';
  let fenceLength = 0;

  while (offset < content.length) {
    const nextLineBreak = content.indexOf('\n', offset);
    const lineEnd = nextLineBreak === -1 ? content.length : nextLineBreak + 1;
    const line = content.slice(offset, lineEnd);
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/);

    if (!inFence && fenceMatch) {
      inFence = true;
      fenceMarker = fenceMatch[1][0];
      fenceLength = fenceMatch[1].length;
      result += maskNonNewline(line);
      offset = lineEnd;
      continue;
    }

    if (inFence) {
      const closingFence = new RegExp(
        `^ {0,3}${escapeRegExp(fenceMarker)}{${fenceLength},}\\s*$`,
      );
      result += maskNonNewline(line);

      if (closingFence.test(line.trimEnd())) {
        inFence = false;
        fenceMarker = '';
        fenceLength = 0;
      }

      offset = lineEnd;
      continue;
    }

    result += line;
    offset = lineEnd;
  }

  return result;
}

function maskInlineCode(content) {
  return content.replace(/(`+)([^`\n]|`(?!\1))*?\1/g, (match) =>
    maskNonNewline(match),
  );
}

function maskNonNewline(value) {
  return value.replace(/[^\n]/g, ' ');
}

function getLineAt(content, index) {
  let lineNumber = 1;
  let lineStart = 0;

  for (let offset = 0; offset < index; offset += 1) {
    if (content[offset] === '\n') {
      lineNumber += 1;
      lineStart = offset + 1;
    }
  }

  const lineEnd = content.indexOf('\n', index);

  return {
    number: lineNumber,
    text: content.slice(lineStart, lineEnd === -1 ? content.length : lineEnd),
  };
}

function createReport({ docsRoot, files, results }) {
  const sourceRoot = toRepoPath(docsRoot);
  const affectedFiles = results.filter(
    (file) => !file.statuses.includes('ready-native'),
  );
  const summary = {
    affectedFiles: affectedFiles.length,
    docsRoot: sourceRoot,
    filesByEffort: countBy(affectedFiles, 'effort'),
    filesByLocale: countBy(affectedFiles, 'locale'),
    filesBySeverity: countBy(affectedFiles, 'severity'),
    markdownFiles: files.length,
    statusCounts: countStatuses(affectedFiles),
  };

  return {
    filesByStatus: groupFilesByStatus(affectedFiles),
    files: affectedFiles,
    generatedAt: new Date().toISOString(),
    sourceRoot,
    summary,
  };
}

function countBy(files, key) {
  return sortObject(
    files.reduce((counts, file) => {
      counts[file[key]] = (counts[file[key]] ?? 0) + 1;
      return counts;
    }, {}),
  );
}

function countStatuses(files) {
  const counts = {};

  for (const file of files) {
    for (const status of file.statuses) {
      counts[status] = (counts[status] ?? 0) + 1;
    }
  }

  return sortObject(counts);
}

function groupFilesByStatus(files) {
  const groups = {};

  for (const file of files) {
    for (const status of file.statuses) {
      groups[status] ??= [];
      groups[status].push(file.path);
    }
  }

  for (const paths of Object.values(groups)) {
    paths.sort();
  }

  return sortObject(groups);
}

function maxStatusValue(statuses, key, order) {
  return statuses.reduce((max, status) => {
    const value = STATUS_META[status]?.[key] ?? 'medium';

    return order[value] > order[max] ? value : max;
  }, 'none');
}

function listMarkdownFiles(root) {
  const results = [];

  for (const locale of LOCALES) {
    const localeRoot = path.join(root, locale);

    if (!fs.existsSync(localeRoot)) {
      continue;
    }

    collectMarkdownFiles(localeRoot, results);
  }

  return results.sort();
}

function collectMarkdownFiles(root, results) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath, results);
      continue;
    }

    if (MARKDOWN_FILE_PATTERN.test(entry.name)) {
      results.push(fullPath);
    }
  }
}

function renderMarkdownReport(report) {
  const lines = [
    '# Legacy Rendering Pattern Audit',
    '',
    `Generated: ${report.generatedAt}`,
    `Source root: \`${report.sourceRoot}\``,
    '',
    '## Summary',
    '',
    `- Markdown/MDX files scanned: ${report.summary.markdownFiles}`,
    `- Affected files: ${report.summary.affectedFiles}`,
    '',
    '### Status Counts',
    '',
    ...renderCountList(report.summary.statusCounts),
    '',
    '### Severity',
    '',
    ...renderCountList(report.summary.filesBySeverity),
    '',
    '### Migration Effort',
    '',
    ...renderCountList(report.summary.filesByEffort),
    '',
    '### Locale',
    '',
    ...renderCountList(report.summary.filesByLocale),
    '',
    '## Recommended Follow-up Buckets',
    '',
    '- `needs-mdx-extension`: rename `.md` files that contain approved MDX components to `.mdx`, then update incoming relative links.',
    '- `needs-table-normalization`: convert legacy table components or raw HTML tables to GFM tables when possible; keep native HTML only for true rowspan/colspan or block-heavy cells.',
    '- `manual-html-review`: inspect raw HTML blocks and inline HTML for whether a Markdown/directive equivalent exists.',
    '- `needs-jsx-review`: classify unapproved JSX as approved editorial widgets, legacy components, or content that should be rewritten.',
    '- `needs-frontmatter-cleanup`: remove Docusaurus or old-build frontmatter that is outside the portal schema.',
    '',
    '## Files by Status',
    '',
    ...renderFilesByStatus(report.filesByStatus),
    '',
    '## Affected Files',
    '',
  ];

  for (const file of report.files) {
    lines.push(`### ${file.path}`);
    lines.push('');
    lines.push(
      `- Statuses: ${file.statuses.map((status) => `\`${status}\``).join(', ')}`,
    );
    lines.push(`- Severity: ${file.severity}`);
    lines.push(`- Effort: ${file.effort}`);

    if (Object.keys(file.components).length > 0) {
      lines.push(
        `- Components: ${Object.entries(file.components)
          .map(([name, count]) => `${name} (${count})`)
          .join(', ')}`,
      );
    }

    lines.push('- Patterns:');

    for (const [pattern, count] of Object.entries(file.matches)) {
      lines.push(`  - \`${pattern}\`: ${count}`);
    }

    if (file.samples.length > 0) {
      lines.push('- Samples:');

      for (const sample of file.samples) {
        lines.push(
          `  - L${sample.line} \`${sample.pattern}\`: ${sample.excerpt}`,
        );
      }
    }

    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

function renderCountList(counts) {
  const entries = Object.entries(counts);

  if (entries.length === 0) {
    return ['- none'];
  }

  return entries.map(([key, count]) => `- \`${key}\`: ${count}`);
}

function renderFilesByStatus(filesByStatus) {
  const lines = [];

  for (const [status, files] of Object.entries(filesByStatus)) {
    lines.push(`### ${status}`);
    lines.push('');

    for (const file of files) {
      lines.push(`- ${file}`);
    }

    lines.push('');
  }

  return lines;
}

function writeReport(report, outPath) {
  const jsonPath = `${outPath}.json`;
  const markdownPath = `${outPath}.md`;

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(markdownPath, renderMarkdownReport(report));

  return { jsonPath, markdownPath };
}

function parseArgs(args) {
  const options = {
    docsRoot: path.join(process.cwd(), 'content', 'docs'),
    out: '',
  };

  for (const arg of args) {
    if (arg.startsWith('--docs-root=')) {
      options.docsRoot = path.resolve(arg.slice('--docs-root='.length));
      continue;
    }

    if (arg.startsWith('--out=')) {
      options.out = path.resolve(arg.slice('--out='.length));
    }
  }

  return options;
}

function sortObject(object) {
  return Object.fromEntries(
    Object.entries(object).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function toContentPath(docsRoot, filePath) {
  return path.relative(docsRoot, filePath).split(path.sep).join(path.posix.sep);
}

function toRepoPath(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);

  if (!relativePath.startsWith('..') && !path.isAbsolute(relativePath)) {
    return relativePath.split(path.sep).join(path.posix.sep);
  }

  return filePath.split(path.sep).join(path.posix.sep);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = auditDocsRenderingPatterns({
    docsRoot: options.docsRoot,
  });

  if (options.out) {
    const paths = writeReport(report, options.out);

    console.log(`Wrote ${paths.jsonPath}`);
    console.log(`Wrote ${paths.markdownPath}`);
    return;
  }

  console.log(renderMarkdownReport(report));
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
