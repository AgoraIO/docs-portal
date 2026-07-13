import type { AppLocale } from '@/lib/i18n/i18n-config';
import {
  isPublicMarkdownLocale,
  MACHINE_READABLE_LOCALE,
} from '@/lib/machine-readable-docs';
import {
  getOpenApiEndpointUrl,
  getOpenApiLaneLocales,
  getOpenApiLanes,
  getOpenApiOperationIds,
  resolveOpenApiEndpointRoute,
} from './lanes';
import {
  buildOpenApiSchemaTree,
  type OpenApiSchemaTreeNode,
} from './schema-tree';
import {
  getOpenApiOperation,
  getOpenApiOperations,
  type NormalizedOpenApiOperation,
} from './source.server';

export function serializeOpenApiOperationMarkdown({
  operation,
  publicSourceUrl,
  title,
  url,
}: {
  locale: AppLocale;
  operation: NormalizedOpenApiOperation;
  publicSourceUrl: string;
  title: string;
  url: string;
}) {
  const lines = [
    `# ${title} (${url})`,
    '',
    operation.description ?? operation.summary ?? '',
    '',
    `- OpenAPI: ${publicSourceUrl}`,
    `- Operation ID: ${operation.operationId}`,
    `- Method: ${operation.method}`,
    `- Path: ${operation.path}`,
    ...(operation.servers[0]
      ? [
          `- Endpoint: ${joinOpenApiUrl(operation.servers[0].url, operation.path)}`,
        ]
      : []),
  ].filter((line, index, array) => line.length > 0 || array[index - 1] !== '');

  if (operation.servers.length > 0) {
    lines.push('', '## Servers', '');
    for (const server of operation.servers) {
      lines.push(`- ${server.url}`);
    }
  }

  appendOperationDocsFragments(lines, operation, 'after-description');

  const securityKeys = getSecurityKeys(operation.security);
  if (securityKeys.length > 0) {
    lines.push('', '## Authorization', '');
    lines.push('This endpoint requires authentication.', '');
    for (const securityKey of securityKeys) {
      lines.push(`- \`${securityKey}\``);
    }
  }

  lines.push('', '## Parameters', '');
  if (operation.parameters.length > 0) {
    for (const parameter of operation.parameters) {
      lines.push(...parameterToMarkdown(parameter));
    }
  } else {
    lines.push('No parameters.');
  }
  appendOperationDocsFragments(lines, operation, 'after-parameters');

  lines.push('', '## Request body', '');
  const requestSchema =
    operation.requestBody?.content['application/json']?.schema;
  if (operation.requestBody?.description) {
    lines.push(operation.requestBody.description, '');
  }
  if (requestSchema) {
    lines.push(...schemaTreeToMarkdown(buildOpenApiSchemaTree(requestSchema)));
  } else {
    lines.push('No request body.');
  }

  const requestExample = getMediaExample(
    operation.requestBody?.content['application/json'],
  );
  if (requestExample !== undefined) {
    lines.push('', '### Request body example', '');
    lines.push(...jsonCodeBlock(requestExample));
  }

  if (operation.codeSampleGroups.length > 0) {
    lines.push('', '## Request examples', '');
    for (const group of operation.codeSampleGroups) {
      lines.push(`### ${group.title}`, '');
      for (const sample of group.samples) {
        const sampleTitle = sample.label ?? sample.lang;
        if (sampleTitle) {
          lines.push(`#### ${sampleTitle}`, '');
        }
        lines.push(
          `\`\`\`${normalizeCodeLanguage(sample.lang)}`,
          sample.source.trim(),
          '```',
          '',
        );
      }
    }
  } else if (operation.codeSamples.length > 0) {
    lines.push('', '## Request examples', '');
    for (const sample of operation.codeSamples) {
      if (sample.label) {
        lines.push(`### ${sample.label}`, '');
      }
      lines.push(
        `\`\`\`${normalizeCodeLanguage(sample.lang)}`,
        sample.source.trim(),
        '```',
        '',
      );
    }
  }

  appendOperationDocsFragments(lines, operation, 'before-response-body');
  lines.push('', '## Responses', '');
  const responseExamples: Array<{ status: string; value: unknown }> = [];
  for (const [status, response] of Object.entries(operation.responses)) {
    lines.push(`### ${status}`, '');
    if (response.description) {
      lines.push(response.description, '');
    }
    lines.push(
      ...schemaTreeToMarkdown(
        buildOpenApiSchemaTree(response.content?.['application/json']?.schema),
      ),
    );

    const responseExample = getMediaExample(
      response.content?.['application/json'],
    );
    if (responseExample !== undefined) {
      responseExamples.push({ status, value: responseExample });
    }
  }
  appendOperationDocsFragments(lines, operation, 'after-response-body');

  if (responseExamples.length > 0) {
    lines.push('', '## Response examples', '');
    for (const example of responseExamples) {
      lines.push(`### ${example.status}`, '', ...jsonCodeBlock(example.value));
    }
  }
  appendOperationDocsFragments(lines, operation, 'after-response-example');

  return `${lines.join('\n').trim()}\n`;
}

export async function getOpenApiMarkdownPages() {
  const pages = await Promise.all(
    getOpenApiLanes().flatMap((lane) =>
      getOpenApiLaneLocales(lane)
        .filter((locale) => locale === MACHINE_READABLE_LOCALE)
        .map(async (locale) => {
          const operations = await getOpenApiOperations(lane, locale);

          return { lane, locale, operations };
        }),
    ),
  );

  return pages.flatMap(({ lane, locale, operations }) =>
    getOpenApiOperationIds(lane).flatMap((operationId) => {
      const operation = operations.find(
        (item) => item.operationId === operationId,
      );

      if (!operation) {
        return [];
      }

      const url = getOpenApiEndpointUrl(lane, locale, operationId);
      const title = lane.operations[operationId].title[locale];

      return [
        {
          markdown: serializeOpenApiOperationMarkdown({
            locale,
            operation,
            publicSourceUrl: lane.publicSourceUrl[locale],
            title,
            url,
          }),
          title,
          url,
        },
      ];
    }),
  );
}

export async function getOpenApiMarkdownByContentPath(path: string) {
  const segments = path.split('/').filter(Boolean);
  const [locale, tab, ...rest] = segments;
  const fileName = rest.at(-1);

  if (
    !isPublicMarkdownLocale(locale) ||
    tab !== 'api-reference' ||
    fileName?.endsWith('.md') !== true
  ) {
    return null;
  }

  const slugSegments = rest.slice(0, -1).concat(fileName.replace(/\.md$/, ''));
  const route = resolveOpenApiEndpointRoute(locale, tab, slugSegments);

  if (!route) {
    return null;
  }

  const operation = await getOpenApiOperation(
    route.lane,
    route.operationId,
    locale,
  );
  const title = route.lane.operations[route.operationId].title[locale];

  return serializeOpenApiOperationMarkdown({
    locale,
    operation,
    publicSourceUrl: route.lane.publicSourceUrl[locale],
    title,
    url: route.url,
  });
}

function parameterToMarkdown(parameter: Record<string, unknown>) {
  const name =
    typeof parameter.name === 'string' ? parameter.name : 'parameter';
  const location = typeof parameter.in === 'string' ? parameter.in : 'unknown';
  const required = parameter.required === true ? 'required' : 'optional';
  const description =
    typeof parameter.description === 'string'
      ? ` - ${parameter.description}`
      : '';

  const lines = [`- \`${name}\` (${location}, ${required})${description}`];
  const schema = isRecord(parameter.schema) ? parameter.schema : undefined;
  const type = typeof schema?.type === 'string' ? schema.type : undefined;
  lines[0] = `- \`${name}\` (${[location, required, type].filter(Boolean).join(', ')})${description}`;
  const example =
    parameter.example ??
    getFirstParameterExample(parameter.examples) ??
    schema?.example;
  const metadataSchema =
    example === undefined ? schema : { ...schema, example };
  lines.push(
    ...schemaMetadataToMarkdown(metadataSchema).map((item) => `  - ${item}`),
  );

  const docsCallouts = Array.isArray(parameter.docsCallouts)
    ? parameter.docsCallouts
    : [];
  appendDocsFragments(lines, docsCallouts, {
    asCallout: true,
    indent: '  ',
  });

  return lines;
}

function schemaTreeToMarkdown(
  nodes: OpenApiSchemaTreeNode[],
  depth = 0,
): string[] {
  if (nodes.length === 0) {
    return ['No schema.'];
  }

  return nodes.flatMap((node) => {
    const indent = '  '.repeat(depth);
    const qualifiers = [
      `${node.type}${node.nullable ? ' | null' : ''}`,
      node.required ? 'required' : undefined,
      node.deprecated ? 'deprecated' : undefined,
    ].filter(Boolean);
    const description = node.description ? ` - ${node.description}` : '';
    const metadata = schemaNodeMetadataToMarkdown(node);
    const callouts = serializeDocsFragments(node.docsCallouts ?? [], {
      asCallout: true,
      indent: `${indent}  `,
    });

    return [
      `${indent}- \`${node.path}\` (${qualifiers.join(', ')})${description}`,
      ...metadata.map((item) => `${indent}  - ${item}`),
      ...callouts,
      ...(node.children.length > 0
        ? schemaTreeToMarkdown(node.children, depth + 1)
        : []),
    ];
  });
}

function appendDocsFragments(
  lines: string[],
  fragments: Array<{
    markdown?: unknown;
    type?: unknown;
    title?: unknown;
  }>,
  options: { asCallout?: boolean; indent?: string } = {},
) {
  lines.push(...serializeDocsFragments(fragments, options));
}

function serializeDocsFragments(
  fragments: Array<{
    markdown?: unknown;
    type?: unknown;
    title?: unknown;
  }>,
  { asCallout = false, indent = '' }: { asCallout?: boolean; indent?: string },
) {
  const lines: string[] = [];

  for (const fragment of fragments) {
    if (typeof fragment.markdown !== 'string' || !fragment.markdown.trim()) {
      continue;
    }

    lines.push('');
    if (asCallout) {
      const type = normalizeCalloutType(fragment.type);
      const title =
        typeof fragment.title === 'string' && fragment.title.trim()
          ? `[${fragment.title.trim().replaceAll(']', '\\]')}]`
          : '';
      lines.push(`${indent}:::${type}${title}`);
      lines.push(
        ...fragment.markdown
          .trim()
          .split('\n')
          .map((line) => `${indent}${line}`),
      );
      lines.push(`${indent}:::`);
      continue;
    }

    if (typeof fragment.title === 'string' && fragment.title.trim()) {
      lines.push(`${indent}### ${fragment.title.trim()}`, '');
    }
    lines.push(
      ...fragment.markdown
        .trim()
        .split('\n')
        .map((line) => `${indent}${line}`),
      '',
    );
  }

  return lines;
}

function appendOperationDocsFragments(
  lines: string[],
  operation: NormalizedOpenApiOperation,
  position: string,
) {
  const atPosition = <T extends { position?: string }>(fragments: T[]) =>
    fragments.filter(
      (fragment) => (fragment.position ?? 'after-description') === position,
    );

  appendDocsFragments(lines, atPosition(operation.docsSections));
  const calloutPosition =
    position === 'after-response-body' ? 'after-responses' : position;
  appendDocsFragments(
    lines,
    operation.docsCallouts.filter(
      (fragment) =>
        (fragment.position ?? 'after-description') === calloutPosition,
    ),
    {
      asCallout: true,
    },
  );
}

function normalizeCalloutType(type: unknown) {
  if (
    type === 'caution' ||
    type === 'important' ||
    type === 'warn' ||
    type === 'warning'
  ) {
    return 'warning';
  }
  if (type === 'error') {
    return 'error';
  }
  if (type === 'idea' || type === 'success' || type === 'tip') {
    return 'tip';
  }
  if (type === 'note') {
    return 'note';
  }
  return 'info';
}

function getSecurityKeys(security: unknown) {
  if (!Array.isArray(security)) {
    return [];
  }

  return [
    ...new Set(
      security.flatMap((entry) =>
        isRecord(entry) ? Object.keys(entry).filter(Boolean) : [],
      ),
    ),
  ];
}

function getMediaExample(media: unknown) {
  if (!isRecord(media)) {
    return undefined;
  }

  if (media.example !== undefined) {
    return media.example;
  }

  if (!isRecord(media.examples)) {
    return undefined;
  }

  for (const example of Object.values(media.examples)) {
    if (isRecord(example) && example.value !== undefined) {
      return example.value;
    }
  }

  return undefined;
}

function jsonCodeBlock(value: unknown) {
  return ['```json', JSON.stringify(value, null, 2), '```'];
}

function normalizeCodeLanguage(language: unknown) {
  if (typeof language !== 'string' || !language.trim()) {
    return 'text';
  }

  return language === 'shell' || language === 'sh' ? 'bash' : language;
}

function schemaNodeMetadataToMarkdown(node: OpenApiSchemaTreeNode) {
  return schemaMetadataToMarkdown({
    default: node.defaultValue,
    enum: node.enumValues,
    example: node.example,
    exclusiveMaximum: node.exclusiveMaximum,
    exclusiveMinimum: node.exclusiveMinimum,
    format: node.format,
    maximum: node.maximum,
    maxItems: node.maxItems,
    maxLength: node.maxLength,
    minimum: node.minimum,
    minItems: node.minItems,
    minLength: node.minLength,
    pattern: node.pattern,
  });
}

function schemaMetadataToMarkdown(schema: Record<string, unknown> | undefined) {
  const metadata: string[] = [];
  const allowedValues = Array.isArray(schema?.enum) ? schema.enum : [];

  if (allowedValues.length > 0) {
    metadata.push(
      `Allowed: ${allowedValues.map((value) => `\`${formatInlineValue(value)}\``).join(' | ')}`,
    );
  }
  if (schema?.default !== undefined) {
    metadata.push(`Default: \`${formatInlineValue(schema.default)}\``);
  }
  if (schema?.example !== undefined) {
    metadata.push(`Example: \`${formatInlineValue(schema.example)}\``);
  }
  if (typeof schema?.format === 'string') {
    metadata.push(`Format: \`${schema.format}\``);
  }

  const range = getMarkdownRange(schema);
  if (range) {
    metadata.push(`Range: \`${range}\``);
  } else {
    appendNumericMetadata(metadata, 'Minimum', schema?.minimum);
    appendNumericMetadata(metadata, 'Maximum', schema?.maximum);
  }
  appendNumericMetadata(metadata, 'Min length', schema?.minLength);
  appendNumericMetadata(metadata, 'Max length', schema?.maxLength);
  appendNumericMetadata(metadata, 'Min items', schema?.minItems);
  appendNumericMetadata(metadata, 'Max items', schema?.maxItems);
  if (typeof schema?.pattern === 'string') {
    metadata.push(`Pattern: \`${schema.pattern}\``);
  }

  return metadata;
}

function appendNumericMetadata(
  metadata: string[],
  label: string,
  value: unknown,
) {
  if (typeof value === 'number') {
    metadata.push(`${label}: \`${value}\``);
  }
}

function getMarkdownRange(schema: Record<string, unknown> | undefined) {
  const minimum = getMarkdownNumberBound(
    schema?.minimum,
    schema?.exclusiveMinimum,
  );
  const maximum = getMarkdownNumberBound(
    schema?.maximum,
    schema?.exclusiveMaximum,
  );

  if (!minimum || !maximum) {
    return undefined;
  }

  return `${minimum.exclusive ? '(' : '['}${minimum.value}, ${maximum.value}${maximum.exclusive ? ')' : ']'}`;
}

function getMarkdownNumberBound(inclusive: unknown, exclusive: unknown) {
  if (typeof inclusive === 'number') {
    return { exclusive: false, value: inclusive };
  }
  if (typeof exclusive === 'number') {
    return { exclusive: true, value: exclusive };
  }
  return undefined;
}

function getFirstParameterExample(examples: unknown) {
  if (!isRecord(examples)) {
    return undefined;
  }

  for (const example of Object.values(examples)) {
    if (isRecord(example) && example.value !== undefined) {
      return example.value;
    }
  }

  return undefined;
}

function joinOpenApiUrl(baseUrl: string, path: string) {
  if (!path) {
    return baseUrl;
  }

  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function formatInlineValue(value: unknown) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
