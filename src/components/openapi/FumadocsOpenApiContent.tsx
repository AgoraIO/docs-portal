import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm';
import type { MethodInformation, RenderContext } from 'fumadocs-openapi';
import type {
  CodeUsageGeneratorRegistry,
  InlineCodeUsageGenerator,
} from 'fumadocs-openapi/requests/generators';
import type { ClientApiPageProps } from 'fumadocs-openapi/ui/create-client';
import { createClientAPIPage } from 'fumadocs-openapi/ui/create-client';
import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
} from 'fumadocs-ui/components/codeblock';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as JsxRuntime from 'react/jsx-runtime';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import { cn } from '@/lib/cn';
import { syncDocsHashTargetFromLocation } from '@/lib/docs-hash';
import {
  buildOpenApiSchemaRows,
  getOpenApiSchemaRowLayout,
  type OpenApiSchemaRow,
} from '@/lib/openapi/schema-tree';

const LEGACY_DOC_ORIGIN = 'https://doc.shengwang.cn';
const LEGACY_DOC_PATH_PATTERN =
  /(]\()(\/(?:api-center|basics|codebox|doc|faq)(?:[^)]*))(\))/g;
const GENERATED_CODE_SAMPLE_IDS = [
  'curl',
  'js',
  'go',
  'python',
  'java',
  'csharp',
] as const;
const removeGeneratedCodeSamples = GENERATED_CODE_SAMPLE_IDS.map((id) => ({
  id,
  lang: id,
  source: false,
})) satisfies InlineCodeUsageGenerator[];
const OpenApiCallout = defaultMdxComponents.Callout;
const OpenApiOperationContext = createContext<OpenApiOperation | undefined>(
  undefined,
);
const OpenApiSourceOperationContext = createContext<
  OpenApiOperation | undefined
>(undefined);
const OPENAPI_MAJOR_SECTION_HEADING_CLASS = 'font-semibold text-2xl';
const OPENAPI_GENERATED_BODY_HEADING_CLASSES = [
  '[&_h2#request-body]:font-semibold',
  '[&_h2#request-body]:text-2xl',
  '[&_h2#response-body]:font-semibold',
  '[&_h2#response-body]:text-2xl',
] as const;

const ClientAPIPage = createClientAPIPage({
  content: {
    renderAPIExampleLayout: (slots) => (
      <OpenApiRightExamplesLayout slots={slots} />
    ),
    renderAPIExampleUsageTabs: (generators, ctx) => (
      <OpenApiCodeSampleUsageTabs generators={generators} ctx={ctx} />
    ),
    renderOperationLayout: (slots, ctx, method) => (
      <OpenApiOperationLayoutWithSource
        method={
          {
            ...(method as OpenApiOperation),
            __documentSecurity: ctx.schema.dereferenced.security,
            __document: ctx.schema.dereferenced as OpenApiRecord,
          } as OpenApiOperation
        }
        slots={slots}
      />
    ),
  },
  generateTypeScriptDefinitions: () => undefined,
  generateCodeSamples: getGeneratedCodeSampleOverrides,
  playground: {
    enabled: false,
  },
  renderMarkdown: renderOpenApiMarkdown,
  schemaUI: {
    render: (options, ctx) => (
      <OpenApiSchemaRows
        anchorPrefix={getOpenApiSchemaAnchorPrefix(options)}
        document={ctx.schema.dereferenced}
        readOnly={options.readOnly}
        renderMarkdown={ctx.renderMarkdown}
        root={options.root}
        writeOnly={options.writeOnly}
      />
    ),
  },
});

function getGeneratedCodeSampleOverrides(method: MethodInformation) {
  return method['x-codeSamples']?.length ? removeGeneratedCodeSamples : [];
}

export function FumadocsOpenApiContent({
  className,
  pageProps,
}: {
  className?: string;
  pageProps: ClientApiPageProps;
}) {
  const operation = getCurrentOperation(pageProps);

  useOpenApiHashScroll();

  return (
    <div
      className={cn(
        'not-prose openapi-operation',
        ...OPENAPI_GENERATED_BODY_HEADING_CLASSES,
        className,
      )}
    >
      <OpenApiSourceOperationContext.Provider value={operation}>
        <OpenApiDocsCallouts
          operation={operation}
          position="before-description"
        />
        <ClientAPIPage {...pageProps} />
      </OpenApiSourceOperationContext.Provider>
    </div>
  );
}

type OpenApiOperationLayoutSlots = {
  apiExample: ReactNode;
  apiPlayground: ReactNode;
  authSchemes: ReactNode;
  body: ReactNode;
  callbacks: ReactNode;
  description: ReactNode;
  header: ReactNode;
  parameters: ReactNode;
  responses: ReactNode;
};

type OpenApiRecord = Record<string, unknown>;
type OpenApiOperation = OpenApiRecord & {
  __document?: OpenApiRecord;
  __documentSecurity?: unknown;
  __path?: string;
  parameters?: unknown[];
  responses?: OpenApiRecord;
};
type OpenApiParameter = OpenApiRecord & {
  description?: string;
  example?: unknown;
  examples?: OpenApiRecord;
  in?: string;
  name?: string;
  required?: boolean;
  schema?: unknown;
};
type OpenApiCalloutItem = OpenApiRecord & {
  markdown?: string;
  position?: string;
  title?: string;
  type?: string;
};
type OpenApiResolvedCalloutItem = OpenApiCalloutItem & {
  markdown: string;
};
type OpenApiDisplayCallout = {
  markdown: string;
  title?: string;
  type?: string;
};
type OpenApiDocsSection = OpenApiRecord & {
  markdown?: string;
  position?: string;
  title?: string;
  type?: string;
  variant?: string;
};
type OpenApiResolvedDocsSection = OpenApiDocsSection & {
  markdown: string;
};
type OpenApiCodeSample = OpenApiRecord & {
  label?: string;
  lang?: string;
  source?: string;
};
type OpenApiResolvedCodeSample = OpenApiCodeSample & {
  source: string;
};
type OpenApiResolvedCodeSampleGroup = {
  samples: OpenApiResolvedCodeSample[];
  title: string;
};
type OpenApiMetadataItem = {
  label: string;
  value: string;
};

function OpenApiOperationLayoutWithSource({
  method,
  slots,
}: {
  method: OpenApiOperation;
  slots: OpenApiOperationLayoutSlots;
}) {
  const sourceOperation = useContext(OpenApiSourceOperationContext);

  return (
    <OpenApiOperationLayout
      method={mergeOpenApiOperationExtensions(method, sourceOperation)}
      slots={slots}
    />
  );
}

function OpenApiOperationLayout({
  method,
  slots,
}: {
  method: OpenApiOperation;
  slots: OpenApiOperationLayoutSlots;
}) {
  return (
    <div className="flex flex-col gap-x-6 gap-y-4 @3xl:flex-row @3xl:items-start">
      <div className="min-w-0 flex-1">
        {slots.header}
        <OpenApiEndpointBar operation={method} />
        <OpenApiDocsSections operation={method} position="after-description" />
        <OpenApiDocsCallouts operation={method} position="after-description" />
        <OpenApiParameters operation={method} />
        <OpenApiDocsSections operation={method} position="after-parameters" />
        {slots.body}
        <OpenApiDocsSections
          operation={method}
          position="before-response-body"
        />
        {slots.responses}
        <OpenApiResponseBodySchemas operation={method} />
        <OpenApiResponseHeaders operation={method} />
        <OpenApiDocsSections
          operation={method}
          position="after-response-body"
        />
        <OpenApiDocsCallouts operation={method} position="after-responses" />
        <OpenApiDocsSections
          operation={method}
          position="after-response-example"
        />
        {slots.callbacks}
      </div>
      <div className="@3xl:sticky @3xl:top-[calc(var(--fd-docs-row-1,2rem)+1rem)] @3xl:w-[360px] @3xl:shrink-0">
        <OpenApiAuthorizationSection operation={method} />
        <OpenApiOperationContext.Provider value={method}>
          {slots.apiExample}
        </OpenApiOperationContext.Provider>
      </div>
    </div>
  );
}

function mergeOpenApiOperationExtensions(
  method: OpenApiOperation,
  sourceOperation?: OpenApiOperation,
) {
  if (!sourceOperation) {
    return method;
  }

  return {
    ...method,
    __path: method.__path ?? sourceOperation.__path,
    'x-codeSamples':
      sourceOperation['x-codeSamples'] ?? method['x-codeSamples'],
    'x-docs-callouts': sourceOperation['x-docs-callouts'],
    'x-docs-code-sample-groups':
      sourceOperation['x-docs-code-sample-groups'] ??
      method['x-docs-code-sample-groups'],
    'x-docs-sections': sourceOperation['x-docs-sections'],
  } satisfies OpenApiOperation;
}

function OpenApiRightExamplesLayout({
  slots,
}: {
  slots: {
    responseTabs: ReactNode;
    selector: ReactNode;
    usageTabs: ReactNode;
  };
}) {
  const operation = useContext(OpenApiOperationContext);
  const hasGroupedSamples = getOpenApiCodeSampleGroups(operation).length > 0;

  return (
    <div className="openapi-right-examples prose-no-margin space-y-3">
      <OpenApiRightSection
        className="openapi-request-examples"
        title="Request examples"
      >
        {hasGroupedSamples ? null : slots.selector}
        {slots.usageTabs}
      </OpenApiRightSection>
      <OpenApiRightSection
        className="openapi-response-example"
        title="Response example"
      >
        {slots.responseTabs}
      </OpenApiRightSection>
    </div>
  );
}

function OpenApiRightSection({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <section
      className={cn(
        'openapi-right-section border-fd-border border-t pt-3 first:border-t-0 first:pt-0',
        className,
      )}
    >
      <h3 className="mb-2 font-semibold text-fd-foreground text-sm">{title}</h3>
      {children}
    </section>
  );
}

function OpenApiAuthorizationSection({
  operation,
}: {
  operation?: OpenApiOperation;
}) {
  const securityKeys = getOpenApiSecurityKeys(operation);

  if (securityKeys.length === 0) {
    return null;
  }

  return (
    <OpenApiRightSection
      className="openapi-authorization-section mb-3"
      title="Authorization"
    >
      <p className="mb-2 text-fd-muted-foreground text-xs">
        This endpoint requires authentication.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {securityKeys.map((key) => (
          <code
            className="rounded-md border border-fd-border bg-fd-secondary px-1.5 py-0.5 text-[11px] text-fd-muted-foreground"
            key={key}
          >
            {key}
          </code>
        ))}
      </div>
    </OpenApiRightSection>
  );
}

function OpenApiEndpointBar({ operation }: { operation: OpenApiOperation }) {
  const endpoint = getOpenApiDisplayEndpoint(operation);
  const method = typeof operation.method === 'string' ? operation.method : '';

  if (!endpoint && !method) {
    return null;
  }

  return (
    <div className="not-prose flex flex-row items-center gap-2.5 rounded-xl border bg-fd-card p-3 text-fd-card-foreground">
      {method ? (
        <span className="rounded-md bg-fd-primary px-2 py-1 font-semibold text-[0.6875rem] text-fd-primary-foreground uppercase">
          {method}
        </span>
      ) : null}
      {endpoint ? (
        <code className="flex-1 overflow-auto text-nowrap text-[0.8125rem] text-fd-muted-foreground">
          {endpoint}
        </code>
      ) : null}
    </div>
  );
}

function getOpenApiDisplayEndpoint(operation: OpenApiOperation) {
  const path = typeof operation.__path === 'string' ? operation.__path : '';
  const serverUrl = getOpenApiServerUrl(operation);

  if (!serverUrl) {
    return path;
  }

  return joinOpenApiUrl(serverUrl, path);
}

function getOpenApiServerUrl(operation: OpenApiOperation) {
  const operationServer = arrayOfRecords(operation.servers).at(0);
  const documentServer = arrayOfRecords(operation.__document?.servers).at(0);
  const url = operationServer?.url ?? documentServer?.url;

  return typeof url === 'string' ? url : undefined;
}

function joinOpenApiUrl(baseUrl: string, path: string) {
  if (!path) {
    return baseUrl;
  }

  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function getOpenApiSecurityKeys(operation?: OpenApiOperation) {
  const securities = arrayOfRecords(
    operation?.security ??
      operation?.__documentSecurity ??
      operation?.__document?.security,
  );

  return [
    ...new Set(
      securities.flatMap((security) =>
        Object.keys(security).filter((key) => key.length > 0),
      ),
    ),
  ];
}

function getCurrentOperation(
  pageProps: ClientApiPageProps,
): OpenApiOperation | undefined {
  const operation = pageProps.operations?.at(0);
  const pathItem = operation
    ? getRecord(pageProps.payload.bundled.paths)?.[operation.path]
    : undefined;

  if (!operation || !isRecord(pathItem)) {
    return undefined;
  }

  const method = pathItem[operation.method.toLowerCase()];

  return isRecord(method)
    ? ({
        ...method,
        __document: pageProps.payload.bundled,
        __path: operation.path,
      } as OpenApiOperation)
    : undefined;
}

function OpenApiParameters({ operation }: { operation?: OpenApiOperation }) {
  const parameters = arrayOfRecords(operation?.parameters)
    .map((parameter) => resolveLocalReference(operation?.__document, parameter))
    .filter(isDisplayableParameter) as OpenApiParameter[];
  const groups = [
    ['path', 'Path Parameters'],
    ['query', 'Query Parameters'],
    ['header', 'Header Parameters'],
    ['cookie', 'Cookie Parameters'],
  ] as const;

  if (parameters.length === 0) {
    return null;
  }

  return (
    <>
      {groups.map(([location, title]) => {
        const groupParameters = parameters.filter(
          (parameter) => parameter.in === location,
        );

        if (groupParameters.length === 0) {
          return null;
        }

        return (
          <OpenApiFieldList
            anchorPrefix={getOpenApiParameterGroupAnchorPrefix(location)}
            fields={groupParameters.map((parameter) => ({
              callouts: getOpenApiDocsCallouts(parameter),
              description: parameter.description,
              metadata: getOpenApiSchemaMetadata(parameter.schema, parameter),
              name: parameter.name ?? '',
              required: parameter.required === true,
              type: getSchemaTypeLabel(parameter.schema),
            }))}
            key={location}
            title={title}
          />
        );
      })}
    </>
  );
}

function OpenApiResponseHeaders({
  operation,
}: {
  operation?: OpenApiOperation;
}) {
  const responseHeaders = Object.entries(
    getRecord(operation?.responses) ?? {},
  ).flatMap(([statusCode, response]) => {
    const headers = getRecord(response)?.headers;

    if (!isRecord(headers)) {
      return [];
    }

    return Object.entries(headers).flatMap(([name, header]) => {
      const resolvedHeader = resolveLocalReference(
        operation?.__document,
        header,
      );

      if (!isRecord(resolvedHeader)) {
        return [];
      }

      return [
        {
          callouts: getOpenApiDocsCallouts(resolvedHeader),
          description: getString(resolvedHeader.description),
          metadata: getOpenApiSchemaMetadata(
            resolvedHeader.schema,
            resolvedHeader,
          ),
          name,
          required: false,
          statusCode,
          type: getSchemaTypeLabel(resolvedHeader.schema),
        },
      ];
    });
  });

  if (responseHeaders.length === 0) {
    return null;
  }

  return (
    <OpenApiFieldList
      anchorPrefix="response-headers"
      fields={responseHeaders.map((header) => ({
        anchorSuffix: `${header.statusCode}-${header.name}`,
        callouts: header.callouts,
        description: header.description,
        metadata: [
          {
            label: 'Status',
            value: header.statusCode,
          },
          ...header.metadata,
        ],
        name: header.name,
        required: header.required,
        type: header.type,
      }))}
      title="Response Headers"
    />
  );
}

function OpenApiResponseBodySchemas({
  operation,
}: {
  operation?: OpenApiOperation;
}) {
  const responses = Object.entries(getRecord(operation?.responses) ?? {})
    .map(([statusCode, response]) => {
      const resolvedResponse = getRecord(
        resolveLocalReference(operation?.__document, response),
      );
      const content = getRecord(resolvedResponse?.content);
      const jsonContent = getRecord(content?.['application/json']);
      const schema = jsonContent?.schema;
      const rows = buildOpenApiSchemaRows(schema, {
        document: operation?.__document,
        usage: 'response',
      });

      return {
        description: getString(resolvedResponse?.description),
        rows,
        schema,
        statusCode,
      };
    })
    .filter((response) => response.description || response.rows.length > 0);

  if (responses.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h3 className="mb-3 font-semibold text-xl">Response schema</h3>
      <div className="space-y-4">
        {responses.map((response) => (
          <div key={response.statusCode}>
            <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
              <code className="rounded-md border border-fd-border bg-fd-secondary px-1.5 py-1 font-medium text-fd-foreground text-xs">
                {response.statusCode}
              </code>
              <span className="font-mono text-fd-muted-foreground text-xs">
                application/json
              </span>
            </div>
            {response.description ? (
              <div className="prose-no-margin mb-3 text-fd-muted-foreground text-sm">
                {renderOpenApiMarkdown(
                  normalizeOpenApiDescriptionMarkdown(response.description),
                )}
              </div>
            ) : null}
            {response.rows.length > 0 ? (
              <OpenApiSchemaRows
                anchorPrefix={`responses-${slugOpenApiAnchorSegment(response.statusCode)}`}
                document={operation?.__document}
                readOnly
                renderMarkdown={renderOpenApiMarkdown}
                root={response.schema}
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function OpenApiFieldList({
  anchorPrefix,
  fields,
  title,
}: {
  anchorPrefix: string;
  fields: {
    anchorSuffix?: string;
    callouts?: OpenApiDisplayCallout[];
    description?: string;
    metadata: OpenApiMetadataItem[];
    name: string;
    required: boolean;
    type: string;
  }[];
  title: string;
}) {
  const titleId = anchorPrefix;
  const anchorIds = buildUniqueOpenApiAnchorIds(
    anchorPrefix,
    fields.map((field) => field.anchorSuffix ?? field.name),
  );

  return (
    <section className="mt-8">
      <h2
        className={cn('mb-3 scroll-mt-24', OPENAPI_MAJOR_SECTION_HEADING_CLASS)}
        id={titleId}
      >
        <OpenApiAnchorLink anchorId={titleId}>{title}</OpenApiAnchorLink>
      </h2>
      <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card text-fd-card-foreground">
        {anchorIds.map((anchorId, index) => {
          const field = fields[index];

          return (
            <div
              className="scroll-mt-24 border-fd-border border-t px-4 py-3 text-sm first:border-t-0"
              id={anchorId}
              key={`${title}:${field.name}`}
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <code className="font-medium text-fd-primary">
                  {field.name}
                </code>
                <OpenApiAnchorLink anchorId={anchorId} className="text-xs" />
                {field.required ? (
                  <span className="font-medium text-red-500">*</span>
                ) : (
                  <span className="text-fd-muted-foreground">?</span>
                )}
                <span className="font-mono text-fd-muted-foreground text-xs">
                  {field.type}
                </span>
              </div>
              {field.description ? (
                <div className="openapi-schema-description prose-no-margin mt-2 text-fd-muted-foreground">
                  {renderOpenApiMarkdown(
                    normalizeOpenApiDescriptionMarkdown(field.description),
                  )}
                </div>
              ) : null}
              <OpenApiInlineCallouts callouts={field.callouts} />
              <OpenApiMetadata items={field.metadata} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OpenApiCodeSampleUsageTabs({
  ctx,
  generators,
}: {
  ctx: RenderContext;
  generators: CodeUsageGeneratorRegistry;
}) {
  const operation = useContext(OpenApiOperationContext);
  const groups = getOpenApiCodeSampleGroups(operation);
  const samples = getOpenApiCodeSamples(operation);

  if (groups.length > 0) {
    return (
      <OpenApiCodeSampleGroupSelector
        groups={groups}
        renderCodeBlock={ctx.renderCodeBlock}
      />
    );
  }

  if (samples.length > 0) {
    return (
      <OpenApiCodeSampleTabs
        renderCodeBlock={ctx.renderCodeBlock}
        samples={samples}
      />
    );
  }

  return <OpenApiDefaultUsageTabs ctx={ctx} generators={generators} />;
}

function OpenApiDefaultUsageTabs({
  ctx,
  generators,
}: {
  ctx: RenderContext;
  generators: CodeUsageGeneratorRegistry;
}) {
  const entries = Array.from(generators.map().entries());
  const UsageTab = ctx.clientBoundary.UsageTab;

  if (entries.length === 0) {
    return null;
  }

  return (
    <CodeBlockTabs
      defaultValue={entries[0]?.[0]}
      groupId="fumadocs_openapi_requests"
    >
      <CodeBlockTabsList>
        {entries.map(([id, item]) => (
          <CodeBlockTabsTrigger key={id} value={id}>
            {item.label ?? item.lang}
          </CodeBlockTabsTrigger>
        ))}
      </CodeBlockTabsList>
      {entries.map(([id, item]) => (
        <CodeBlockTab key={id} value={id}>
          <UsageTab id={id} lang={item.lang} _client={item._client} />
        </CodeBlockTab>
      ))}
    </CodeBlockTabs>
  );
}

function getOpenApiCodeSampleGroups(operation?: OpenApiOperation) {
  return arrayOfRecords(operation?.['x-docs-code-sample-groups'])
    .map((group): OpenApiResolvedCodeSampleGroup | undefined => {
      const title = getString(group.title);
      const samples = arrayOfRecords(group.samples).filter(isCodeSample);

      if (!title || samples.length === 0) {
        return undefined;
      }

      return {
        ...group,
        samples,
        title,
      };
    })
    .filter((group): group is OpenApiResolvedCodeSampleGroup => Boolean(group));
}

function getOpenApiCodeSamples(operation?: OpenApiOperation) {
  return arrayOfRecords(operation?.['x-codeSamples']).filter(isCodeSample);
}

function OpenApiCodeSampleTabs({
  renderCodeBlock,
  samples,
}: {
  renderCodeBlock: RenderContext['renderCodeBlock'];
  samples: OpenApiResolvedCodeSample[];
}) {
  const [selectedSampleValue, setSelectedSampleValue] = useState('');
  const sampleEntries = samples.map((sample, index) => ({
    sample,
    value: getCodeSampleValue(sample, index),
  }));
  const activeSampleValue = sampleEntries.some(
    (entry) => entry.value === selectedSampleValue,
  )
    ? selectedSampleValue
    : (sampleEntries[0]?.value ?? '');

  if (sampleEntries.length === 0) {
    return null;
  }

  return (
    <CodeBlockTabs
      className="openapi-request-code-tabs my-0"
      onValueChange={setSelectedSampleValue}
      value={activeSampleValue}
    >
      <CodeBlockTabsList>
        {sampleEntries.map(({ sample, value }) => (
          <CodeBlockTabsTrigger key={value} value={value}>
            {sample.label ?? getCodeSampleLanguage(sample.lang)}
          </CodeBlockTabsTrigger>
        ))}
      </CodeBlockTabsList>
      {sampleEntries.map(({ sample, value }) => (
        <CodeBlockTab key={value} value={value}>
          {renderCodeBlock(getCodeSampleLanguage(sample.lang), sample.source)}
        </CodeBlockTab>
      ))}
    </CodeBlockTabs>
  );
}

function OpenApiCodeSampleGroupSelector({
  groups,
  renderCodeBlock,
}: {
  groups: OpenApiResolvedCodeSampleGroup[];
  renderCodeBlock: RenderContext['renderCodeBlock'];
}) {
  const [selectedTitle, setSelectedTitle] = useState(groups[0]?.title ?? '');
  const [selectedSampleValue, setSelectedSampleValue] = useState('');
  const selectedGroup =
    groups.find((group) => group.title === selectedTitle) ?? groups[0];
  const sampleEntries = useMemo(
    () =>
      selectedGroup?.samples.map((sample, index) => ({
        sample,
        value: getCodeSampleValue(sample, index),
      })) ?? [],
    [selectedGroup],
  );
  const activeSampleValue = sampleEntries.some(
    (entry) => entry.value === selectedSampleValue,
  )
    ? selectedSampleValue
    : (sampleEntries[0]?.value ?? '');

  if (!selectedGroup) {
    return null;
  }

  return (
    <div className="openapi-code-sample-groups">
      <label className="sr-only" htmlFor="openapi-code-sample-group-select">
        Request example scenario
      </label>
      <select
        className="not-prose mb-2 flex h-10 w-full items-center rounded-md border border-fd-border bg-fd-secondary px-3 py-2 font-medium text-fd-secondary-foreground text-sm outline-none transition-colors hover:bg-fd-accent focus:ring focus:ring-fd-ring"
        id="openapi-code-sample-group-select"
        onChange={(event) => setSelectedTitle(event.target.value)}
        value={selectedGroup.title}
      >
        {groups.map((group) => (
          <option key={group.title} value={group.title}>
            {group.title}
          </option>
        ))}
      </select>
      <CodeBlockTabs
        key={selectedGroup.title}
        className="openapi-request-code-tabs my-0"
        onValueChange={setSelectedSampleValue}
        value={activeSampleValue}
      >
        <CodeBlockTabsList>
          {sampleEntries.map(({ sample, value }) => (
            <CodeBlockTabsTrigger key={value} value={value}>
              {sample.label ?? getCodeSampleLanguage(sample.lang)}
            </CodeBlockTabsTrigger>
          ))}
        </CodeBlockTabsList>
        {sampleEntries.map(({ sample, value }) => (
          <CodeBlockTab key={value} value={value}>
            {renderCodeBlock(getCodeSampleLanguage(sample.lang), sample.source)}
          </CodeBlockTab>
        ))}
      </CodeBlockTabs>
    </div>
  );
}

function getCodeSampleLanguage(lang: unknown) {
  return typeof lang === 'string' && lang ? lang : 'text';
}

function getCodeSampleValue(sample: OpenApiResolvedCodeSample, index: number) {
  return (
    getString(sample.id) ?? sample.label ?? sample.lang ?? `sample-${index}`
  );
}

function isCodeSample(
  sample: OpenApiRecord,
): sample is OpenApiResolvedCodeSample {
  return typeof sample.source === 'string';
}

function OpenApiInlineCallouts({
  callouts,
}: {
  callouts?: OpenApiDisplayCallout[];
}) {
  if (!callouts?.length) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      {callouts.map((callout) => (
        <OpenApiCallout
          key={getOpenApiCalloutKey(callout)}
          title={callout.title}
          type={toCalloutType(callout.type)}
        >
          <div className="prose-no-margin">
            {renderOpenApiMarkdown(
              normalizeOpenApiDescriptionMarkdown(callout.markdown),
            )}
          </div>
        </OpenApiCallout>
      ))}
    </div>
  );
}

function OpenApiDocsCallouts({
  operation,
  position,
}: {
  operation?: OpenApiOperation;
  position: 'after-description' | 'after-responses' | 'before-description';
}) {
  const callouts = arrayOfRecords(operation?.['x-docs-callouts']).filter(
    (callout): callout is OpenApiResolvedCalloutItem =>
      typeof callout.markdown === 'string' &&
      (callout.position ?? 'after-description') === position,
  );

  if (callouts.length === 0) {
    return null;
  }

  return (
    <div className={position === 'before-description' ? 'mb-6' : 'mt-6'}>
      {callouts.map((callout) => (
        <OpenApiCallout
          key={`${position}:${getOpenApiCalloutKey(callout)}`}
          title={callout.title}
          type={toCalloutType(callout.type)}
        >
          <div className="prose-no-margin">
            {renderOpenApiMarkdown(
              normalizeOpenApiDescriptionMarkdown(callout.markdown),
            )}
          </div>
        </OpenApiCallout>
      ))}
    </div>
  );
}

function getOpenApiCalloutKey(callout: OpenApiDisplayCallout) {
  return [
    callout.title ?? 'callout',
    callout.type ?? 'info',
    callout.markdown.slice(0, 80),
  ].join(':');
}

function OpenApiDocsSections({
  operation,
  position,
}: {
  operation?: OpenApiOperation;
  position:
    | 'after-description'
    | 'after-parameters'
    | 'after-response-body'
    | 'after-response-example'
    | 'before-response-body';
}) {
  const sections = arrayOfRecords(operation?.['x-docs-sections']).filter(
    (section): section is OpenApiResolvedDocsSection =>
      typeof section.markdown === 'string' && section.position === position,
  );

  if (sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map((section, index) => (
        <OpenApiDocsSectionBlock
          key={`${position}:${section.title ?? section.type ?? index}`}
          section={section}
        />
      ))}
    </>
  );
}

function OpenApiDocsSectionBlock({
  section,
}: {
  section: OpenApiResolvedDocsSection;
}) {
  if (section.type === 'callout') {
    return (
      <OpenApiCallout
        className="mt-6"
        title={section.title}
        type={toCalloutType(section.variant)}
      >
        <div className="prose-no-margin">
          {renderOpenApiMarkdown(
            normalizeOpenApiDescriptionMarkdown(section.markdown),
          )}
        </div>
      </OpenApiCallout>
    );
  }

  return (
    <section className="mt-6">
      {section.title ? (
        <h3 className="mb-3 font-semibold text-xl">{section.title}</h3>
      ) : null}
      <div className="prose-no-margin text-fd-muted-foreground">
        {renderOpenApiMarkdown(
          normalizeOpenApiDescriptionMarkdown(section.markdown),
        )}
      </div>
    </section>
  );
}

function OpenApiMetadata({ items }: { items: OpenApiMetadataItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map(({ label, value }) => (
        <span
          className="inline-flex min-w-0 items-start gap-1 rounded-md border border-fd-border bg-fd-secondary px-1.5 py-1 text-xs"
          key={`${label}:${value}`}
        >
          <span className="font-medium text-fd-foreground">{label}</span>
          <code className="min-w-0 truncate text-fd-muted-foreground">
            {value}
          </code>
        </span>
      ))}
    </div>
  );
}

function OpenApiAnchorLink({
  anchorId,
  children,
  className,
}: {
  anchorId: string;
  children?: ReactNode;
  className?: string;
}) {
  const href = `#${anchorId}`;

  if (children) {
    return (
      <a className="group inline-flex items-center gap-2" href={href}>
        <span>{children}</span>
        <span
          aria-hidden="true"
          className="text-fd-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          #
        </span>
      </a>
    );
  }

  return (
    <a
      aria-label={`Copy link to ${anchorId}`}
      className={cn(
        'text-fd-muted-foreground opacity-70 hover:text-fd-primary hover:opacity-100',
        className,
      )}
      href={href}
    >
      #
    </a>
  );
}

function useOpenApiHashScroll() {
  useEffect(() => {
    const handleHashChange = () => {
      syncDocsHashTargetFromLocation('auto');
    };

    const frame = window.requestAnimationFrame(handleHashChange);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
}

function useOpenApiSchemaHashExpansion(
  anchorIds: string[],
  parentIndex: number[],
  setExpandedIds: (updater: (current: Set<string>) => Set<string>) => void,
) {
  useEffect(() => {
    const openCurrentHashTarget = () => {
      const hashAnchorId = getCurrentOpenApiHashAnchorId();
      const targetIndex = anchorIds.indexOf(hashAnchorId);

      if (targetIndex === -1) {
        return;
      }

      const ancestorAnchorIds: string[] = [];

      for (
        let parent = parentIndex[targetIndex];
        parent !== -1;
        parent = parentIndex[parent]
      ) {
        ancestorAnchorIds.push(anchorIds[parent]);
      }

      if (ancestorAnchorIds.length > 0) {
        setExpandedIds((current) => {
          if (ancestorAnchorIds.every((id) => current.has(id))) {
            return current;
          }

          const next = new Set(current);
          for (const id of ancestorAnchorIds) {
            next.add(id);
          }
          return next;
        });
      }

      window.requestAnimationFrame(() => {
        syncDocsHashTargetFromLocation('auto');
      });
    };

    const frame = window.requestAnimationFrame(openCurrentHashTarget);
    window.addEventListener('hashchange', openCurrentHashTarget);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', openCurrentHashTarget);
    };
  }, [anchorIds, parentIndex, setExpandedIds]);
}

function getCurrentOpenApiHashAnchorId() {
  const hash = window.location.hash;

  if (!hash.startsWith('#')) {
    return '';
  }

  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

function getOpenApiSchemaAnchorPrefix(options: {
  readOnly?: boolean;
  writeOnly?: boolean;
}) {
  if (options.writeOnly) {
    return 'request-body';
  }

  if (options.readOnly) {
    return 'response-body';
  }

  return 'schema';
}

function getOpenApiParameterGroupAnchorPrefix(location: string) {
  return `${slugOpenApiAnchorSegment(location)}-parameters`;
}

function buildOpenApiAnchorId(prefix: string, value: string) {
  return `${prefix}-${slugOpenApiAnchorSegment(value)}`;
}

function buildUniqueOpenApiAnchorIds(prefix: string, values: string[]) {
  const baseIds = values.map((value) => buildOpenApiAnchorId(prefix, value));
  const duplicateBaseIds = new Set(
    baseIds.filter((baseId, index) => baseIds.indexOf(baseId) !== index),
  );
  const seen = new Map<string, number>();

  return values.map((value, index) => {
    const baseId = baseIds[index];

    if (!duplicateBaseIds.has(baseId)) {
      return baseId;
    }

    const occurrence = seen.get(baseId) ?? 0;
    seen.set(baseId, occurrence + 1);

    return `${baseId}-${hashOpenApiAnchorSegment(value)}${
      occurrence > 0 ? `-${occurrence + 1}` : ''
    }`;
  });
}

function hashOpenApiAnchorSegment(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

function slugOpenApiAnchorSegment(value: string) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[.[\]]+/g, '-')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function OpenApiSchemaRows({
  anchorPrefix,
  document,
  readOnly,
  renderMarkdown,
  root,
  writeOnly,
}: {
  anchorPrefix: string;
  document?: unknown;
  readOnly?: boolean;
  renderMarkdown: (markdown: string) => ReactNode;
  root: unknown;
  writeOnly?: boolean;
}) {
  const rows = useMemo(
    () =>
      buildOpenApiSchemaRows(root, {
        document,
        usage: writeOnly ? 'request' : readOnly ? 'response' : undefined,
      }),
    [root, document, writeOnly, readOnly],
  );
  const anchorIds = useMemo(
    () =>
      buildUniqueOpenApiAnchorIds(
        anchorPrefix,
        rows.map((row) => row.path),
      ),
    [anchorPrefix, rows],
  );
  const layout = useMemo(() => getOpenApiSchemaRowLayout(rows), [rows]);
  const collapsibleAnchorIds = useMemo(
    () => anchorIds.filter((_, index) => layout.hasChildren[index]),
    [anchorIds, layout],
  );
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(
    () => new Set(),
  );

  useOpenApiSchemaHashExpansion(
    anchorIds,
    layout.parentIndex,
    setExpandedRowIds,
  );

  const visibleFlags = useMemo(() => {
    const flags: boolean[] = [];

    rows.forEach((_row, index) => {
      const parent = layout.parentIndex[index];

      flags[index] =
        parent === -1
          ? true
          : flags[parent] && expandedRowIds.has(anchorIds[parent]);
    });

    return flags;
  }, [rows, layout, expandedRowIds, anchorIds]);

  const allRowsExpanded =
    collapsibleAnchorIds.length > 0 &&
    collapsibleAnchorIds.every((id) => expandedRowIds.has(id));

  function setAllRowsExpanded(expanded: boolean) {
    setExpandedRowIds(expanded ? new Set(collapsibleAnchorIds) : new Set());
  }

  function setRowExpanded(anchorId: string, expanded: boolean) {
    setExpandedRowIds((current) => {
      const next = new Set(current);

      if (expanded) {
        next.add(anchorId);
      } else {
        next.delete(anchorId);
      }

      return next;
    });
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="openapi-schema-tree not-prose my-4 overflow-hidden rounded-xl border border-fd-border bg-fd-card text-fd-card-foreground">
      {collapsibleAnchorIds.length > 0 ? (
        <div className="flex justify-end border-fd-border border-b px-4 py-2">
          <button
            aria-label={`${allRowsExpanded ? 'Collapse' : 'Expand'} all ${getOpenApiSchemaGroupLabel(anchorPrefix)}`}
            className="rounded-md border border-fd-border px-2.5 py-1 font-medium text-fd-muted-foreground text-xs transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            onClick={() => setAllRowsExpanded(!allRowsExpanded)}
            type="button"
          >
            {allRowsExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      ) : null}
      {anchorIds.map((anchorId, index) => {
        if (!visibleFlags[index]) {
          return null;
        }

        const row = rows[index];

        return (
          <OpenApiSchemaRowItem
            anchorId={anchorId}
            expandable={layout.hasChildren[index]}
            expanded={expandedRowIds.has(anchorId)}
            key={row.path}
            onExpandedChange={(expanded) => setRowExpanded(anchorId, expanded)}
            renderMarkdown={renderMarkdown}
            row={row}
          />
        );
      })}
    </div>
  );
}

function OpenApiSchemaRowItem({
  anchorId,
  expandable,
  expanded,
  onExpandedChange,
  renderMarkdown,
  row,
}: {
  anchorId: string;
  expandable: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  renderMarkdown: (markdown: string) => ReactNode;
  row: OpenApiSchemaRow;
}) {
  const chevronClass = cn(
    'select-none text-fd-muted-foreground text-xs transition-transform',
    expanded && 'rotate-90',
  );
  const nameCode = (
    <code
      className={cn(
        'openapi-schema-property-name font-bold text-fd-foreground',
        row.deprecated && 'line-through opacity-70',
      )}
    >
      {row.name}
    </code>
  );

  return (
    <div
      className="scroll-mt-24 border-fd-border border-t py-3 pr-4 text-sm first:border-t-0"
      id={anchorId}
      style={{ paddingInlineStart: `${1 + row.depth * 1.25}rem` }}
    >
      <div className="openapi-schema-property-heading flex min-w-0 flex-wrap items-center gap-2">
        <span
          aria-hidden={!expandable}
          className="openapi-schema-property-control-gutter relative flex h-5 w-3 shrink-0 items-center justify-center"
        >
          {expandable ? (
            <button
              aria-expanded={expanded}
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${row.name} properties`}
              className="-left-1.5 absolute flex h-6 w-6 items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
              onClick={() => onExpandedChange(!expanded)}
              type="button"
            >
              <span aria-hidden="true" className={chevronClass}>
                ▶
              </span>
            </button>
          ) : null}
        </span>
        <span className="openapi-schema-property-name-column min-w-0">
          {nameCode}
        </span>
        <OpenApiAnchorLink anchorId={anchorId} className="text-xs" />
        <OpenApiSchemaRequiredBadge required={row.required} />
        <span className="font-mono text-fd-muted-foreground text-xs">
          {row.type}
          {row.nullable ? ' | null' : ''}
        </span>
        {row.deprecated ? (
          <span className="rounded-md border border-yellow-500/25 bg-yellow-500/10 px-1.5 py-0.5 font-medium text-[11px] text-yellow-700 dark:text-yellow-300">
            Deprecated
          </span>
        ) : null}
      </div>
      {row.description ? (
        <div className="openapi-schema-description prose-no-margin mt-2 text-fd-muted-foreground">
          {renderMarkdown(normalizeOpenApiDescriptionMarkdown(row.description))}
        </div>
      ) : null}
      <OpenApiInlineCallouts callouts={row.docsCallouts} />
      <OpenApiSchemaMeta row={row} />
    </div>
  );
}

function getOpenApiSchemaGroupLabel(anchorPrefix: string) {
  if (anchorPrefix === 'request-body') {
    return 'Request Body schema fields';
  }

  if (anchorPrefix.startsWith('responses-')) {
    return 'Response schema fields';
  }

  if (anchorPrefix === 'response-body') {
    return 'Response Body schema fields';
  }

  return 'schema fields';
}

function OpenApiSchemaRequiredBadge({ required }: { required: boolean }) {
  return (
    <span
      className={cn(
        'rounded border px-1.5 py-0.5 font-medium text-[0.68rem]',
        required
          ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300'
          : 'border-fd-border bg-fd-muted/60 text-fd-muted-foreground',
      )}
    >
      {required ? 'required' : 'optional'}
    </span>
  );
}

function OpenApiSchemaMeta({ row }: { row: OpenApiSchemaRow }) {
  const rangeMetadata = getRangeMetadata({
    exclusiveMaximum: row.exclusiveMaximum,
    exclusiveMinimum: row.exclusiveMinimum,
    maximum: row.maximum,
    minimum: row.minimum,
  });
  const items = [
    row.defaultValue !== undefined
      ? ['Default', formatOpenApiSchemaValue(row.defaultValue)]
      : null,
    row.enumValues
      ? ['Allowed', row.enumValues.map(formatOpenApiSchemaValue).join(' | ')]
      : null,
    row.format ? ['Format', row.format] : null,
    rangeMetadata,
    rangeMetadata ? null : getConstraintTuple('Minimum', row.minimum),
    rangeMetadata ? null : getConstraintTuple('Maximum', row.maximum),
    row.pattern ? ['Pattern', row.pattern] : null,
    row.example !== undefined
      ? ['Example', formatOpenApiSchemaValue(row.example)]
      : null,
  ].filter((item): item is [string, string] => Boolean(item));

  if (items.length === 0) {
    return null;
  }

  return (
    <OpenApiMetadata
      items={items.map(([label, value]) => ({
        label,
        value,
      }))}
    />
  );
}

function formatOpenApiSchemaValue(value: unknown) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function getOpenApiSchemaMetadata(
  schema: unknown,
  owner: OpenApiRecord,
): OpenApiMetadataItem[] {
  const schemaRecord = getRecord(schema);
  const rangeMetadata = getRangeMetadata(schemaRecord);
  const items: Array<OpenApiMetadataItem | null> = [
    schemaRecord?.default !== undefined
      ? {
          label: 'Default',
          value: formatOpenApiSchemaValue(schemaRecord.default),
        }
      : null,
    Array.isArray(schemaRecord?.enum)
      ? {
          label: 'Allowed',
          value: schemaRecord.enum.map(formatOpenApiSchemaValue).join(' | '),
        }
      : null,
    getString(schemaRecord?.format)
      ? {
          label: 'Format',
          value: getString(schemaRecord?.format) ?? '',
        }
      : null,
    rangeMetadata
      ? {
          label: rangeMetadata[0],
          value: rangeMetadata[1],
        }
      : null,
    rangeMetadata
      ? null
      : getConstraintMetadata('Minimum', schemaRecord?.minimum),
    rangeMetadata
      ? null
      : getConstraintMetadata('Maximum', schemaRecord?.maximum),
    getConstraintMetadata('Min length', schemaRecord?.minLength),
    getConstraintMetadata('Max length', schemaRecord?.maxLength),
    getConstraintMetadata('Min items', schemaRecord?.minItems),
    getConstraintMetadata('Max items', schemaRecord?.maxItems),
    getString(schemaRecord?.pattern)
      ? {
          label: 'Pattern',
          value: getString(schemaRecord?.pattern) ?? '',
        }
      : null,
    owner.example !== undefined
      ? {
          label: 'Example',
          value: formatOpenApiSchemaValue(owner.example),
        }
      : schemaRecord?.example !== undefined
        ? {
            label: 'Example',
            value: formatOpenApiSchemaValue(schemaRecord.example),
          }
        : getFirstExample(owner.examples) !== undefined
          ? {
              label: 'Example',
              value: formatOpenApiSchemaValue(getFirstExample(owner.examples)),
            }
          : null,
  ];

  return items.filter((item): item is OpenApiMetadataItem => Boolean(item));
}

function getOpenApiDocsCallouts(value: OpenApiRecord) {
  return arrayOfRecords(value['x-docs-callouts']).filter(
    (callout): callout is OpenApiResolvedCalloutItem =>
      typeof callout.markdown === 'string',
  );
}

function getConstraintMetadata(label: string, value: unknown) {
  return typeof value === 'number'
    ? {
        label,
        value: String(value),
      }
    : null;
}

function getConstraintTuple(
  label: string,
  value: unknown,
): [string, string] | null {
  return typeof value === 'number' ? [label, String(value)] : null;
}

function getRangeMetadata(
  schema:
    | {
        exclusiveMaximum?: unknown;
        exclusiveMinimum?: unknown;
        maximum?: unknown;
        minimum?: unknown;
      }
    | null
    | undefined,
): [string, string] | null {
  const minimum = getNumberBound(schema?.minimum, schema?.exclusiveMinimum);
  const maximum = getNumberBound(schema?.maximum, schema?.exclusiveMaximum);

  if (!minimum || !maximum) {
    return null;
  }

  const lowerBracket = minimum.exclusive ? '(' : '[';
  const upperBracket = maximum.exclusive ? ')' : ']';

  return [
    'Range',
    `${lowerBracket}${minimum.value}, ${maximum.value}${upperBracket}`,
  ];
}

function getNumberBound(inclusive: unknown, exclusive: unknown) {
  if (typeof inclusive === 'number') {
    return { exclusive: false, value: inclusive };
  }

  if (typeof exclusive === 'number') {
    return { exclusive: true, value: exclusive };
  }

  return null;
}

function getFirstExample(examples: unknown) {
  const firstExample = Object.values(getRecord(examples) ?? {}).find(isRecord);

  if (!firstExample) {
    return undefined;
  }

  if ('value' in firstExample) {
    return firstExample.value;
  }

  if ('summary' in firstExample && typeof firstExample.summary === 'string') {
    return firstExample.summary;
  }

  return undefined;
}

function getSchemaTypeLabel(schema: unknown) {
  const schemaRecord = getRecord(schema);

  if (!schemaRecord) {
    return 'unknown';
  }

  const type = schemaRecord.type;

  if (typeof type === 'string') {
    return type;
  }

  if (Array.isArray(type)) {
    return type.filter((item) => typeof item === 'string').join(' | ');
  }

  if (Array.isArray(schemaRecord.enum)) {
    return 'enum';
  }

  if (isRecord(schemaRecord.items)) {
    return 'array';
  }

  if (isRecord(schemaRecord.properties)) {
    return 'object';
  }

  return 'unknown';
}

function normalizeOpenApiDescriptionMarkdown(markdown: string) {
  return markdown.replace(
    LEGACY_DOC_PATH_PATTERN,
    (_match, prefix: string, path: string, suffix: string) =>
      `${prefix}${LEGACY_DOC_ORIGIN}${path.replaceAll('&amp;', '&')}${suffix}`,
  );
}

let openApiMarkdownProcessor:
  | ReturnType<typeof createOpenApiMarkdownProcessor>
  | undefined;

function renderOpenApiMarkdown(markdown: string): ReactNode {
  openApiMarkdownProcessor ??= createOpenApiMarkdownProcessor();

  const content = openApiMarkdownProcessor.processSync({ value: markdown })
    .result as ReactNode;

  return <div className="openapi-markdown prose-no-margin">{content}</div>;
}

function createOpenApiMarkdownProcessor() {
  function rehypeReact(this: { compiler?: unknown }) {
    this.compiler = (
      tree: Parameters<typeof toJsxRuntime>[0],
      file: { path?: string },
    ) =>
      toJsxRuntime(tree, {
        development: false,
        filePath: file.path,
        ...JsxRuntime,
        components: defaultMdxComponents,
      });
  }

  return remark().use(remarkGfm).use(remarkRehype).use(rehypeReact);
}

function toCalloutType(type: string | undefined) {
  switch (type) {
    case 'caution':
    case 'important':
    case 'warn':
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'idea':
      return 'idea';
    case 'success':
      return 'success';
    default:
      return 'info';
  }
}

function isDisplayableParameter(
  parameter: unknown,
): parameter is OpenApiParameter {
  if (!isRecord(parameter)) {
    return false;
  }

  return (
    isRecord(parameter) &&
    typeof parameter.name === 'string' &&
    typeof parameter.in === 'string' &&
    ['cookie', 'header', 'path', 'query'].includes(parameter.in) &&
    !isAuthenticationHeaderParameter(parameter) &&
    !isReferenceObject(parameter)
  );
}

function isAuthenticationHeaderParameter(parameter: OpenApiRecord) {
  return (
    typeof parameter.name === 'string' &&
    parameter.in === 'header' &&
    parameter.name.toLowerCase() === 'authorization'
  );
}

function arrayOfRecords(value: unknown) {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function getRecord(value: unknown): OpenApiRecord | undefined {
  return isRecord(value) ? value : undefined;
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function isReferenceObject(
  value: unknown,
): value is OpenApiRecord & { $ref: string } {
  return isRecord(value) && typeof value.$ref === 'string';
}

function resolveLocalReference(document: unknown, value: unknown) {
  if (!isReferenceObject(value)) {
    return value;
  }

  const ref = getString(value.$ref);

  if (!ref?.startsWith('#/')) {
    return value;
  }

  return ref
    .slice(2)
    .split('/')
    .reduce(
      (current: unknown, segment: string) =>
        getRecord(current)?.[
          segment.replaceAll('~1', '/').replaceAll('~0', '~')
        ],
      document,
    );
}

function isRecord(value: unknown): value is OpenApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
