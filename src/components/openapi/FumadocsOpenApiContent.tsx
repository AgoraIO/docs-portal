import { TranslationProvider } from '@fuma-translate/react';
import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm';
import type { RenderContext } from 'fumadocs-openapi';
import type { InlineCodeUsageGenerator } from 'fumadocs-openapi/requests/generators';
import {
  type CreateOpenAPIPageOptions,
  createOpenAPIPage,
  type OpenAPIPageProps,
} from 'fumadocs-openapi/ui';
import {
  CodeBlock,
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  Pre,
} from 'fumadocs-ui/components/codeblock';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Check, Clipboard } from 'lucide-react';
import {
  type ComponentProps,
  createContext,
  isValidElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as JsxRuntime from 'react/jsx-runtime';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import { cn } from '@/lib/cn';
import { syncDocsHashTargetFromLocation } from '@/lib/docs-hash';
import {
  buildUniqueOpenApiAnchorIds,
  slugOpenApiAnchorSegment,
} from '@/lib/openapi/anchors';
import { highlightOpenApiCode } from '@/lib/openapi/code-highlight';
import {
  buildOpenApiResponseViews,
  type OpenApiResponseHeaderView,
} from '@/lib/openapi/response-view';
import { OpenApiCodePreview } from './OpenApiCodePreview';
import { OpenApiExamplesRail } from './OpenApiExamplesRail';
import { OpenApiResponseHeaderRow } from './OpenApiResponseHeaderRow';
import { OpenApiResponses } from './OpenApiResponses';
import { OpenApiSchema } from './OpenApiSchema';

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
const OpenApiLocaleContext = createContext<string | undefined>(undefined);
const OpenApiCodeSourceContext = createContext<string | undefined>(undefined);
const OPENAPI_MAJOR_SECTION_HEADING_CLASS = 'font-semibold text-2xl';
const OPENAPI_GENERATED_BODY_HEADING_CLASSES = [
  '[&_h2#request-body]:font-semibold',
  '[&_h2#request-body]:text-2xl',
  '[&_h2#response-body]:font-semibold',
  '[&_h2#response-body]:text-2xl',
] as const;
const ZH_CN_OPENAPI_LABELS: Record<string, string> = {
  Authorization: '鉴权',
  'Collapse all': '折叠全部',
  Collapse: '折叠',
  'Copied endpoint URL': '已复制接口 URL',
  'Cookie Parameters': 'Cookie 参数',
  'Expand all': '展开全部',
  Expand: '展开',
  'Copy link to': '复制链接到',
  'Copy endpoint URL': '复制接口 URL',
  Deprecated: '已废弃',
  optional: '可选',
  required: '必填',
  properties: '属性',
  'Header Parameters': '请求 Header',
  Note: '注意',
  'Path Parameters': '路径参数',
  'Query Parameters': '查询参数',
  'Request Body': '请求 Body',
  'Request Body schema fields': '请求 Body 字段',
  'Request examples': '请求示例',
  'Response Body': '响应 Body',
  'Response Body schema fields': '响应 Body 字段',
  'Response Headers': '响应 Header',
  'Response example': '响应示例',
  'Response schema': '响应 Schema',
  'Response schema fields': '响应字段',
  'schema fields': 'Schema 字段',
  'This endpoint requires authentication.': '该接口需要鉴权。',
};
const ZH_CN_OPENAPI_GENERATED_HEADING_LABELS: Record<string, string> = {
  'parameters-cookie': 'Cookie 参数',
  'parameters-header': '请求 Header',
  'parameters-path': '路径参数',
  'parameters-query': '查询参数',
  'request-body': '请求 Body',
  'response-body': '响应 Body',
};
const ZH_CN_FUMADOCS_SCHEMA_TRANSLATIONS = {
  'Allowed values(schema UI)': '可选值',
  'Cookie Parameters': 'Cookie 参数',
  'Collapse all(schema UI)': '折叠全部',
  'Copied link to(schema UI)': '已复制字段链接到',
  'Copy link to(schema UI)': '复制字段链接到',
  'Default(schema UI)': '默认值',
  'Deprecated(schema UI)': '已废弃',
  'Example(schema UI)': '示例',
  'Expand all(schema UI)': '展开全部',
  'Filter Properties(schema UI)': '筛选属性',
  'Format(schema UI)': '格式',
  'Header Parameters': '请求 Header',
  'Items(schema UI)': '元素',
  'Length(schema UI)': '长度',
  'Match(schema UI)': '匹配',
  'match(schema UI)': '个匹配项',
  'Multiple Of(schema UI)': '倍数',
  'No property matching(schema UI)': '没有匹配的属性',
  'Path Parameters': '路径参数',
  'Properties(schema UI)': '属性',
  'Query Parameters': '查询参数',
  'Range(schema UI)': '范围',
  'Request Body': '请求 Body',
  'Response Body': '响应 Body',
  'Required(schema UI)': '必填',
  'Optional(schema UI)': '可选',
  'Expand(schema UI)': '展开',
  'Collapse(schema UI)': '折叠',
  'properties(schema UI)': '属性',
  'matches(schema UI)': '个匹配项',
  'Value in(schema UI)': '可选值',
} as const;

const OpenAPIPage = createOpenAPIPage({
  content: {
    renderAPIExampleLayout: (slots) => (
      <OpenApiRightExamplesLayout
        slots={{
          ...slots,
          usageTabs: (
            <OpenApiCodeSampleUsageTabs defaultUsageTabs={slots.usageTabs} />
          ),
        }}
      />
    ),
    renderOperationLayout: (slots, { ctx, operation }) => (
      <OpenApiOperationLayoutWithSource
        method={
          {
            ...(operation as OpenApiOperation),
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
    render: (options, ctx) => {
      const schemaOptions = options as typeof options & {
        client: ComponentProps<RenderContext['SchemaUI']>['client'];
        legacyAnchorPrefix?: string;
        showExample?: boolean;
      };

      return (
        <OpenApiSchema
          client={schemaOptions.client}
          document={ctx.schema.bundled}
          legacyAnchorPrefix={schemaOptions.legacyAnchorPrefix}
          readOnly={schemaOptions.readOnly}
          renderCodeblock={({ code, lang }) =>
            renderOpenApiCodeBlock(lang, code)
          }
          renderExtraDescription={(schema) => {
            const record = getRecord(schema);
            return record ? (
              <OpenApiInlineCallouts
                callouts={getOpenApiDocsCallouts(record)}
              />
            ) : null;
          }}
          renderMarkdown={(markdown) =>
            renderOpenApiMarkdown(normalizeOpenApiDescriptionMarkdown(markdown))
          }
          root={schemaOptions.root}
          showExample={schemaOptions.showExample ?? true}
          writeOnly={schemaOptions.writeOnly}
        />
      );
    },
  },
});

type GenerateCodeSamplesOptions = Parameters<
  NonNullable<CreateOpenAPIPageOptions['generateCodeSamples']>
>[0];

function getGeneratedCodeSampleOverrides({
  operation,
}: GenerateCodeSamplesOptions) {
  return operation['x-codeSamples']?.length ? removeGeneratedCodeSamples : [];
}

export function FumadocsOpenApiContent({
  className,
  locale,
  pageProps,
}: {
  className?: string;
  locale?: string;
  pageProps: OpenAPIPageProps;
}) {
  const operation = getCurrentOperation(pageProps);
  const adaptedPageProps = useMemo(
    () => adaptOpenApiParameterSchemaExtensions(pageProps),
    [pageProps],
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useOpenApiHashScroll();
  useLocalizedOpenApiGeneratedChrome(containerRef, locale);

  return (
    <div
      className={cn(
        'not-prose openapi-operation',
        ...OPENAPI_GENERATED_BODY_HEADING_CLASSES,
        className,
      )}
      ref={containerRef}
    >
      <OpenApiLocaleContext.Provider value={locale}>
        <TranslationProvider translations={getOpenApiFumaTranslations(locale)}>
          <OpenApiSourceOperationContext.Provider value={operation}>
            <OpenApiDocsCallouts
              operation={operation}
              position="before-description"
            />
            <OpenAPIPage {...adaptedPageProps} />
          </OpenApiSourceOperationContext.Provider>
        </TranslationProvider>
      </OpenApiLocaleContext.Provider>
    </div>
  );
}

function adaptOpenApiParameterSchemaExtensions(
  pageProps: OpenAPIPageProps,
): OpenAPIPageProps {
  if (!('payload' in pageProps)) return pageProps;
  const document = pageProps.payload.bundled;
  const paths = getRecord(document.paths);
  const components = getRecord(document.components);
  const componentParameters = getRecord(components?.parameters);
  const nextPaths = paths
    ? Object.fromEntries(
        Object.entries(paths).map(([path, pathItem]) => [
          path,
          adaptOpenApiPathItemParameters(pathItem),
        ]),
      )
    : document.paths;
  const nextComponentParameters = componentParameters
    ? Object.fromEntries(
        Object.entries(componentParameters).map(([name, parameter]) => [
          name,
          adaptOpenApiParameterSchema(parameter),
        ]),
      )
    : undefined;

  return {
    ...pageProps,
    payload: {
      ...pageProps.payload,
      bundled: {
        ...document,
        components: components
          ? {
              ...components,
              parameters: nextComponentParameters ?? components.parameters,
            }
          : document.components,
        paths: nextPaths,
      },
    },
  } as OpenAPIPageProps;
}

function adaptOpenApiPathItemParameters(value: unknown) {
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (key === 'parameters' && Array.isArray(item)) {
        return [key, item.map(adaptOpenApiParameterSchema)];
      }
      if (!isRecord(item) || !('responses' in item)) return [key, item];
      return [
        key,
        {
          ...item,
          parameters: Array.isArray(item.parameters)
            ? item.parameters.map(adaptOpenApiParameterSchema)
            : item.parameters,
        },
      ];
    }),
  );
}

function adaptOpenApiParameterSchema(value: unknown) {
  if (!isRecord(value) || isReferenceObject(value)) return value;
  const schema = getRecord(value.schema);
  if (!schema) return value;
  const callouts = value['x-docs-callouts'];
  const example = value.example ?? getFirstExample(value.examples);
  const deprecated = value.deprecated === true;
  if (callouts === undefined && example === undefined && !deprecated) {
    return value;
  }

  return {
    ...value,
    schema: {
      ...schema,
      example: schema.example ?? example,
      deprecated: schema.deprecated ?? deprecated,
      'x-docs-callouts': schema['x-docs-callouts'] ?? callouts,
    },
  };
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
  const locale = useContext(OpenApiLocaleContext);

  return (
    <div className="openapi-operation-layout gap-6">
      <div className="min-w-0 flex-1">
        {slots.header}
        <OpenApiEndpointBar operation={method} />
        <OpenApiDocsSections operation={method} position="after-description" />
        <OpenApiDocsCallouts operation={method} position="after-description" />
        <OpenApiInlineAuthorizationSection operation={method} />
        {slots.parameters}
        <OpenApiDocsSections operation={method} position="after-parameters" />
        {slots.body}
        <OpenApiDocsSections
          operation={method}
          position="before-response-body"
        />
        {isZhCnLocale(locale) ? (
          <>
            {slots.responses}
            <OpenApiResponseHeaders operation={method} />
          </>
        ) : (
          <OpenApiEnglishResponses operation={method} />
        )}
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
      <OpenApiExamplesRail>
        <OpenApiAuthorizationSection operation={method} />
        <OpenApiOperationContext.Provider value={method}>
          {slots.apiExample}
        </OpenApiOperationContext.Provider>
      </OpenApiExamplesRail>
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

function getOpenApiLabel(label: string, locale?: string) {
  return isZhCnLocale(locale) ? (ZH_CN_OPENAPI_LABELS[label] ?? label) : label;
}

function getOpenApiFumaTranslations(locale?: string) {
  return isZhCnLocale(locale) ? ZH_CN_FUMADOCS_SCHEMA_TRANSLATIONS : {};
}

function useLocalizedOpenApiGeneratedChrome(
  containerRef: RefObject<HTMLDivElement | null>,
  locale?: string,
) {
  useEffect(() => {
    const container = containerRef.current;

    if (!container || !isZhCnLocale(locale)) {
      return;
    }

    const syncLabels = () => {
      for (const [id, label] of Object.entries(
        ZH_CN_OPENAPI_GENERATED_HEADING_LABELS,
      )) {
        const heading = container.querySelector<HTMLElement>(`h2#${id}`);
        const link = heading?.querySelector<HTMLElement>('a');

        if (link && link.textContent !== label) {
          link.textContent = label;
        }
      }
    };

    syncLabels();

    const observer = new MutationObserver(syncLabels);
    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [containerRef, locale]);
}

function isZhCnLocale(locale?: string) {
  return locale === 'zh-CN';
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
  const locale = useContext(OpenApiLocaleContext);
  const hasGroupedSamples = getOpenApiCodeSampleGroups(operation).length > 0;
  const hasExplicitSamples =
    hasGroupedSamples || getOpenApiCodeSamples(operation).length > 0;

  return (
    <div className="openapi-right-examples prose-no-margin space-y-3">
      <OpenApiRightSection
        className="openapi-request-examples"
        excludeFromMarkdownParity={hasExplicitSamples}
        title={getOpenApiLabel('Request examples', locale)}
      >
        {hasGroupedSamples ? null : slots.selector}
        <OpenApiCodePreview>{slots.usageTabs}</OpenApiCodePreview>
      </OpenApiRightSection>
      <OpenApiRightSection
        className="openapi-response-example"
        title={getOpenApiLabel('Response example', locale)}
      >
        {slots.responseTabs}
      </OpenApiRightSection>
    </div>
  );
}

function OpenApiRightSection({
  children,
  className,
  excludeFromMarkdownParity = false,
  title,
}: {
  children: ReactNode;
  className?: string;
  excludeFromMarkdownParity?: boolean;
  title: string;
}) {
  return (
    <section
      className={cn(
        'openapi-right-section border-fd-border border-t pt-3 first:border-t-0 first:pt-0',
        className,
      )}
      data-markdown-ignore={excludeFromMarkdownParity ? '' : undefined}
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
  const locale = useContext(OpenApiLocaleContext);
  const securityKeys = getOpenApiSecurityKeys(operation);

  if (isZhCnLocale(locale)) {
    return null;
  }

  if (securityKeys.length === 0) {
    return null;
  }

  return (
    <OpenApiRightSection
      className="openapi-authorization-section mb-3"
      title={getOpenApiLabel('Authorization', locale)}
    >
      <p className="mb-2 text-fd-muted-foreground text-xs">
        {getOpenApiLabel('This endpoint requires authentication.', locale)}
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

function OpenApiInlineAuthorizationSection({
  operation,
}: {
  operation?: OpenApiOperation;
}) {
  const locale = useContext(OpenApiLocaleContext);
  const schemes = getOpenApiSecuritySchemes(operation);

  if (
    !isZhCnLocale(locale) ||
    schemes.length === 0 ||
    hasOpenApiAuthorizationHeaderParameter(operation)
  ) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2
        className="mb-3 scroll-mt-24 font-semibold text-2xl"
        id="authorization"
      >
        {getOpenApiLabel('Authorization', locale)}
      </h2>
      <div className="space-y-4 rounded-xl border border-fd-border bg-fd-card p-4 text-fd-card-foreground">
        {schemes.map((scheme) => (
          <div key={scheme.key}>
            <h3 className="mb-2 font-semibold text-fd-foreground text-base">
              {scheme.key}
            </h3>
            {scheme.description ? (
              <div className="prose-no-margin text-fd-muted-foreground">
                {renderOpenApiMarkdown(
                  normalizeOpenApiDescriptionMarkdown(scheme.description),
                )}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function OpenApiEndpointBar({ operation }: { operation: OpenApiOperation }) {
  const endpoint = getOpenApiDisplayEndpoint(operation);
  const method = typeof operation.method === 'string' ? operation.method : '';
  const locale = useContext(OpenApiLocaleContext);
  const [endpointCopied, copyEndpoint] = useOpenApiCopyButton(() =>
    navigator.clipboard.writeText(endpoint),
  );

  if (!endpoint && !method) {
    return null;
  }

  return (
    <div className="not-prose flex flex-row items-center gap-2.5 rounded-xl border bg-fd-card p-3 text-fd-card-foreground">
      {method ? (
        <div>
          <span className="rounded-md bg-fd-primary px-2 py-1 font-semibold text-[0.6875rem] text-fd-primary-foreground uppercase">
            {method}
          </span>
        </div>
      ) : null}
      {endpoint ? (
        <>
          <div className="flex-1 overflow-auto">
            <code className="text-nowrap text-[0.8125rem] text-fd-muted-foreground">
              {endpoint}
            </code>
          </div>
          <button
            aria-label={getOpenApiLabel(
              endpointCopied ? 'Copied endpoint URL' : 'Copy endpoint URL',
              locale,
            )}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
            data-checked={endpointCopied || undefined}
            onClick={copyEndpoint}
            type="button"
          >
            {endpointCopied ? (
              <Check aria-hidden="true" className="size-4" />
            ) : (
              <Clipboard aria-hidden="true" className="size-4" />
            )}
          </button>
        </>
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

function getOpenApiSecuritySchemes(operation?: OpenApiOperation) {
  const schemes = getRecord(
    getRecord(operation?.__document?.components)?.securitySchemes,
  );

  if (!schemes) {
    return [];
  }

  return getOpenApiSecurityKeys(operation).flatMap((key) => {
    const scheme = getRecord(schemes[key]);

    if (!scheme) {
      return [];
    }

    return [
      {
        description: getString(scheme?.description),
        key,
      },
    ];
  });
}

function hasOpenApiAuthorizationHeaderParameter(operation?: OpenApiOperation) {
  return arrayOfRecords(operation?.parameters)
    .map((parameter) => resolveLocalReference(operation?.__document, parameter))
    .some(
      (parameter) =>
        isRecord(parameter) && isAuthenticationHeaderParameter(parameter),
    );
}

function getCurrentOperation(
  pageProps: OpenAPIPageProps,
): OpenApiOperation | undefined {
  if (!('payload' in pageProps)) {
    return undefined;
  }

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

function OpenApiResponseHeaders({
  operation,
}: {
  operation?: OpenApiOperation;
}) {
  const locale = useContext(OpenApiLocaleContext);
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
          deprecated: resolvedHeader.deprecated === true,
          description: getString(resolvedHeader.description),
          metadata: getOpenApiSchemaMetadata(
            resolvedHeader.schema,
            resolvedHeader,
          ),
          name,
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
    <OpenApiResponseHeaderList
      anchorPrefix="response-headers"
      fields={responseHeaders.map((header) => ({
        anchorSuffix: `${header.statusCode}-${header.name}`,
        callouts: header.callouts,
        deprecated: header.deprecated,
        description: header.description,
        metadata: [
          {
            label: 'Status',
            value: header.statusCode,
          },
          ...header.metadata,
        ],
        name: header.name,
        type: header.type,
      }))}
      title={getOpenApiLabel('Response Headers', locale)}
    />
  );
}

function OpenApiEnglishResponses({
  operation,
}: {
  operation?: OpenApiOperation;
}) {
  const responses = useMemo(
    () =>
      buildOpenApiResponseViews(operation?.responses, operation?.__document),
    [operation?.responses, operation?.__document],
  );
  return (
    <OpenApiResponses
      renderDescription={(markdown) =>
        renderOpenApiMarkdown(normalizeOpenApiDescriptionMarkdown(markdown))
      }
      renderHeaders={(headers, status) => (
        <OpenApiEnglishResponseHeaders headers={headers} status={status} />
      )}
      renderSchema={({ mediaType, schema, status }) => {
        return {
          hasFields: schema !== undefined,
          node: (
            <OpenApiSchema
              client={{
                as: 'body',
                name: `response-${slugOpenApiAnchorSegment(status)}-${slugOpenApiAnchorSegment(mediaType)}`,
              }}
              legacyAnchorPrefix={`responses-${slugOpenApiAnchorSegment(status)}`}
              renderCodeblock={({ code, lang }) =>
                renderOpenApiCodeBlock(lang, code)
              }
              renderExtraDescription={(source) => {
                const record = getRecord(source);
                return record ? (
                  <OpenApiInlineCallouts
                    callouts={getOpenApiDocsCallouts(record)}
                  />
                ) : null;
              }}
              renderMarkdown={(markdown) =>
                renderOpenApiMarkdown(
                  normalizeOpenApiDescriptionMarkdown(markdown),
                )
              }
              readOnly
              root={schema}
              showExample
            />
          ),
        };
      }}
      responses={responses}
      sectionId="response-body"
    />
  );
}

function OpenApiEnglishResponseHeaders({
  headers,
  status,
}: {
  headers: OpenApiResponseHeaderView[];
  status: string;
}) {
  const locale = useContext(OpenApiLocaleContext);
  const anchorPrefix = `response-headers-${slugOpenApiAnchorSegment(status)}`;
  const anchorIds = buildUniqueOpenApiAnchorIds(
    anchorPrefix,
    headers.map((header) => header.name),
  );

  if (headers.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 font-semibold text-base">Response Headers</h3>
      <div className="openapi-field-list overflow-hidden rounded-xl border border-fd-border bg-fd-card text-fd-card-foreground">
        {headers.map((header, index) => (
          <div
            className={index === 0 ? '' : 'border-fd-border border-t'}
            key={anchorIds[index]}
          >
            <OpenApiResponseHeaderRow
              anchorId={anchorIds[index]}
              copyLinkLabel={getOpenApiLabel('Copy link to', locale)}
              deprecated={header.deprecated}
              deprecatedLabel={getOpenApiLabel('Deprecated', locale)}
              details={
                <>
                  {header.description ? (
                    <div className="openapi-schema-description prose-no-margin text-fd-muted-foreground">
                      {renderOpenApiMarkdown(
                        normalizeOpenApiDescriptionMarkdown(header.description),
                      )}
                    </div>
                  ) : null}
                  <OpenApiInlineCallouts
                    callouts={getOpenApiDocsCallouts(header.source)}
                  />
                  <OpenApiMetadata
                    items={getOpenApiSchemaMetadata(
                      header.schema,
                      header.source,
                    )}
                  />
                </>
              }
              name={header.name}
              type={getSchemaTypeLabel(header.schema)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function OpenApiResponseHeaderList({
  anchorPrefix,
  fields,
  title,
}: {
  anchorPrefix: string;
  fields: {
    anchorSuffix?: string;
    callouts?: OpenApiDisplayCallout[];
    deprecated?: boolean;
    description?: string;
    metadata: OpenApiMetadataItem[];
    name: string;
    type: string;
  }[];
  title: string;
}) {
  const locale = useContext(OpenApiLocaleContext);
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
      <div className="openapi-field-list overflow-hidden rounded-xl border border-fd-border bg-fd-card text-fd-card-foreground">
        {anchorIds.map((anchorId, index) => {
          const field = fields[index];

          return (
            <OpenApiResponseHeaderRow
              anchorId={anchorId}
              copyLinkLabel={getOpenApiLabel('Copy link to', locale)}
              details={
                <>
                  {field.description ? (
                    <div className="openapi-schema-description prose-no-margin text-fd-muted-foreground">
                      {renderOpenApiMarkdown(
                        normalizeOpenApiDescriptionMarkdown(field.description),
                      )}
                    </div>
                  ) : null}
                  <OpenApiInlineCallouts callouts={field.callouts} />
                  <OpenApiMetadata items={field.metadata} />
                </>
              }
              deprecated={field.deprecated}
              deprecatedLabel={getOpenApiLabel('Deprecated', locale)}
              key={`${title}:${field.name}`}
              name={field.name}
              type={field.type}
            />
          );
        })}
      </div>
    </section>
  );
}

function OpenApiCodeSampleUsageTabs({
  defaultUsageTabs,
}: {
  defaultUsageTabs: ReactNode;
}) {
  const operation = useContext(OpenApiOperationContext);
  const groups = getOpenApiCodeSampleGroups(operation);
  const samples = getOpenApiCodeSamples(operation);

  if (groups.length > 0) {
    return (
      <OpenApiCodeSampleGroupSelector
        groups={groups}
        renderCodeBlock={renderOpenApiCodeBlock}
      />
    );
  }

  if (samples.length > 0) {
    return (
      <OpenApiCodeSampleTabs
        renderCodeBlock={renderOpenApiCodeBlock}
        samples={samples}
      />
    );
  }

  return defaultUsageTabs;
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
  renderCodeBlock: (lang: string, source: string) => ReactNode;
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
  renderCodeBlock: (lang: string, source: string) => ReactNode;
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
        <div
          className="inline-flex min-w-0 items-start gap-1 rounded-md border border-fd-border bg-fd-secondary px-1.5 py-1 text-xs"
          key={`${label}:${value}`}
        >
          <div className="font-medium text-fd-foreground">{label}</div>
          <div className="min-w-0 truncate text-fd-muted-foreground">
            <code>{value}</code>
          </div>
        </div>
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

function renderOpenApiCodeBlock(lang: string, source: string) {
  return (
    <OpenApiCodeSourceContext.Provider value={source}>
      {renderOpenApiMarkdown(`\`\`\`${lang}\n${source}\n\`\`\``)}
    </OpenApiCodeSourceContext.Provider>
  );
}

function OpenApiMarkdownCodeBlock({
  children,
  ...props
}: ComponentProps<'pre'>) {
  const source = useContext(OpenApiCodeSourceContext);
  const childClassName = isValidElement(children)
    ? (children.props as { className?: string }).className
    : undefined;
  const language =
    getCodeBlockLanguage(props.className) ??
    getCodeBlockLanguage(childClassName);

  return (
    <CodeBlock
      {...props}
      Actions={
        source === undefined
          ? undefined
          : ({ className }) => (
              <div className={cn('empty:hidden', className)}>
                <OpenApiCodeCopyButton source={source} />
              </div>
            )
      }
    >
      <Pre>
        {source === undefined || language === undefined
          ? children
          : highlightOpenApiCode({ language, source })}
      </Pre>
    </CodeBlock>
  );
}

function getCodeBlockLanguage(className: string | undefined) {
  const match = className?.match(/(?:^|\s)language-([^\s]+)/);

  return match?.[1];
}

function OpenApiCodeCopyButton({ source }: { source: string }) {
  const [checked, onClick] = useOpenApiCopyButton(() =>
    navigator.clipboard.writeText(source),
  );

  return (
    <button
      aria-label={checked ? 'Copied Text' : 'Copy Text'}
      className="inline-flex items-center justify-center rounded-md p-1 text-sm font-medium text-fd-muted-foreground transition-colors duration-100 hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-50 data-checked:text-fd-accent-foreground [&_svg]:size-4"
      data-checked={checked || undefined}
      onClick={onClick}
      type="button"
    >
      {checked ? <Check /> : <Clipboard />}
    </button>
  );
}

function useOpenApiCopyButton(onCopy: () => void | Promise<void>) {
  const [checked, setChecked] = useState(false);
  const callbackRef = useRef(onCopy);
  const timeoutRef = useRef<number | undefined>(undefined);
  const mountedRef = useRef(false);
  const requestRef = useRef(0);
  callbackRef.current = onCopy;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, []);

  const onClick = useCallback(() => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    void (async () => {
      try {
        await callbackRef.current();
      } catch {
        return;
      }
      if (!mountedRef.current || requestRef.current !== requestId) return;

      setChecked(true);
      timeoutRef.current = window.setTimeout(() => {
        if (!mountedRef.current || requestRef.current !== requestId) return;
        setChecked(false);
        timeoutRef.current = undefined;
      }, 1500);
    })();
  }, []);

  return [checked, onClick] as const;
}

function OpenApiMarkdownBlockquote({ children }: { children?: ReactNode }) {
  const locale = useContext(OpenApiLocaleContext);

  if (!isZhCnLocale(locale)) {
    return <blockquote>{children}</blockquote>;
  }

  return (
    <div className="openapi-markdown-blockquote">
      <OpenApiCallout title={getOpenApiLabel('Note', locale)} type="info">
        <div className="prose-no-margin">{children}</div>
      </OpenApiCallout>
    </div>
  );
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
        components: {
          ...defaultMdxComponents,
          blockquote: OpenApiMarkdownBlockquote,
          pre: OpenApiMarkdownCodeBlock,
        },
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
