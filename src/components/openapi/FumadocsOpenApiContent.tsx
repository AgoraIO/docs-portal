import { TranslationProvider } from '@fuma-translate/react';
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  Accordions,
  AccordionTrigger,
} from '@fumadocs/api-docs/components/accordion';
import type { ParsedSchema } from '@fumadocs/api-docs/schema';
import { sample } from '@fumadocs/api-docs/schema/sample';
import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm';
import { type OpenAPIComponents, useOpenAPI } from 'fumadocs-openapi';
import {
  createCodeUsageGeneratorRegistry,
  type InlineCodeUsageGenerator,
} from 'fumadocs-openapi/requests/generators';
import { javascript } from 'fumadocs-openapi/requests/generators/javascript';
import { python } from 'fumadocs-openapi/requests/generators/python';
import {
  type CreateOpenAPIPageOptions,
  createOpenAPIPage,
  type OpenAPIPageProps,
} from 'fumadocs-openapi/ui';
import {
  type CodeBlockProps,
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
} from 'fumadocs-ui/components/codeblock';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Check, Clipboard } from 'lucide-react';
import {
  type ComponentProps,
  cloneElement,
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
import rehypeRaw from 'rehype-raw';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import { Callout as OpenApiCallout } from '@/components/Callout';
import { DocsCodeBlock } from '@/components/DocsCodeBlock';
import { DocsLinkIcon } from '@/components/DocsLinkIcon';
import { useMeasuredDocsBody } from '@/components/docs-shell/DocsContentMeasurement';
import { createDocsTableComponent } from '@/components/mdx';
import { HighlightedCode } from '@/components/mdx/HighlightedCode';
import { Badge } from '@/components/ui/badge';
import {
  TabsContent as ChoiceContent,
  TabsList as ChoiceList,
  Tabs as ChoiceTabs,
  TabsTrigger as ChoiceTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/cn';
import { syncDocsHashTargetFromLocation } from '@/lib/docs-hash';
import { normalizeDocsHref } from '@/lib/docs-link-normalize';
import {
  buildOpenApiResponseSchemaAnchorId,
  buildUniqueOpenApiAnchorIds,
  slugOpenApiAnchorSegment,
} from '@/lib/openapi/anchors';
import { getOpenApiMethodBadgeClassName } from '@/lib/openapi/method-badge';
import {
  getOpenApiQuoteCallout,
  remarkOpenApiCallouts,
} from '@/lib/openapi/remark-callouts';
import {
  buildRequestExampleContext,
  completeRequestExample,
  documentationCurl,
} from '@/lib/openapi/request-examples';
import {
  buildOpenApiResponseViews,
  getOpenApiResponseStatusLabel,
  type OpenApiResponseHeaderView,
} from '@/lib/openapi/response-view';
import { resolveLocalOpenApiReference } from '@/lib/openapi/schema-tree';
import { OpenApiCodePreview } from './OpenApiCodePreview';
import { OpenApiExamplesRail } from './OpenApiExamplesRail';
import { OpenApiOperationPanels } from './OpenApiOperationPanels';
import { OpenApiResponseHeaderRow } from './OpenApiResponseHeaderRow';
import { OpenApiResponses } from './OpenApiResponses';
import { OpenApiSchema } from './OpenApiSchema';
import {
  OPENAPI_SECTION_HEADING_CLASS,
  renderOpenApiHeading,
} from './OpenApiSectionHeading';

const LEGACY_DOC_ORIGIN = 'https://doc.shengwang.cn';
const LEGACY_DOC_PATH_PATTERN =
  /(]\()(\/(?:api-center|basics|codebox|doc|faq)(?:[^)]*))(\))/g;
// Keep fallback clients aligned with the legacy reference instead of inheriting
// the upstream language list, which can grow across Fumadocs upgrades.
const codeUsages = createCodeUsageGeneratorRegistry();
codeUsages.add('curl', documentationCurl);
codeUsages.add('python', { ...python, label: 'Python/Requests' });
codeUsages.add('js', { ...javascript, label: 'Node.js/Fetch' });
const removeGeneratedCodeSamples = Array.from(
  codeUsages.map().keys(),
  (id) => ({
    id,
    lang: id,
    source: false,
  }),
) satisfies InlineCodeUsageGenerator[];
const OpenApiOperationContext = createContext<OpenApiOperation | undefined>(
  undefined,
);
const OpenApiSourceOperationContext = createContext<
  OpenApiOperation | undefined
>(undefined);
const OpenApiLocaleContext = createContext<string | undefined>(undefined);
const OpenApiContentPathContext = createContext<string | undefined>(undefined);
const OpenApiCodeSourceContext = createContext<string | undefined>(undefined);
const OpenApiRequestCodeContext = createContext(false);
const ZH_CN_OPENAPI_LABELS: Record<string, string> = {
  Authorization: '鉴权',
  'Collapse all': '全部收起',
  Collapse: '折叠',
  'Copied endpoint URL': '已复制接口 URL',
  'Copied Text': '已复制文本',
  'Cookie Parameters': 'Cookie 参数',
  'Expand all': '全部展开',
  Expand: '展开',
  'Copy link to': '复制链接到',
  'Copy endpoint URL': '复制接口 URL',
  'Copy Text': '复制文本',
  Deprecated: '已废弃',
  'Empty response body': '响应 Body 为空',
  optional: '可选',
  required: '必填',
  properties: '属性',
  'Header Parameters': '请求 Header',
  Note: '说明',
  Info: '提示',
  Tip: '建议',
  Success: '成功',
  Important: '重要',
  Warning: '警告',
  Caution: '注意',
  Danger: '危险',
  Error: '错误',
  'Path Parameters': '路径参数',
  'Query Parameters': '查询参数',
  'Request Body': '请求 Body',
  'Request Body schema fields': '请求 Body 字段',
  'Request example scenario': '请求示例场景',
  'Request examples': '请求示例',
  'Response Body': '响应 Body',
  Responses: '响应',
  'Response Body schema fields': '响应 Body 字段',
  'Response Headers': '响应 Header',
  'Response example': '响应示例',
  'Response schema': '响应 Schema',
  'Response schema fields': '响应字段',
  'Schema has no fields': 'Schema 中没有字段',
  'Schema not provided': '未提供 Schema',
  'schema fields': 'Schema 字段',
  'This endpoint requires authentication.': '该接口需要鉴权。',
};
const ZH_CN_OPENAPI_GENERATED_HEADING_LABELS: Record<string, string> = {
  'parameters-cookie': 'Cookie 参数',
  'parameters-header': '请求 Header',
  'parameters-path': '路径参数',
  'parameters-query': '查询参数',
  'request-body': '请求 Body',
  'response-body': '响应',
};
const ZH_CN_FUMADOCS_SCHEMA_TRANSLATIONS = {
  'Code language(operation page)': '代码语言',
  'Example request(operation page)': '请求示例场景',
  'Response status(operation page)': '响应状态',
  'Copy Anchor Link(heading anchor)(aria-label)': '复制锚点链接',
  'Copied Anchor Link(heading anchor)(aria-label)': '已复制锚点链接',
  'Allowed values(schema UI)': '可选值',
  'Cookie Parameters': 'Cookie 参数',
  'Collapse all(schema UI)': '全部收起',
  'Copied link to(schema UI)': '已复制字段链接到',
  'Copy link to(schema UI)': '复制字段链接到',
  'Default(schema UI)': '默认值',
  'Deprecated(schema UI)': '已废弃',
  'Example(schema UI)': '示例',
  'Expand all(schema UI)': '全部展开',
  'Fields(schema UI)': '字段',
  'JSON example(schema UI)': 'JSON 示例',
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

const openApiPageComponents: OpenAPIComponents = {
  CodeBlock: ({ code, lang, codeblock }) =>
    renderOpenApiCodeBlock(lang, code, codeblock),
  Heading: OpenApiGeneratedHeading,
  Markdown: OpenApiGeneratedMarkdown,
  SchemaUI: OpenApiGeneratedSchemaUI,
};

function OpenApiGeneratedHeading({
  depth,
  ...props
}: ComponentProps<OpenAPIComponents['Heading']>) {
  const locale = useContext(OpenApiLocaleContext);
  const label = isZhCnLocale(locale)
    ? ZH_CN_OPENAPI_GENERATED_HEADING_LABELS[props.id]
    : undefined;
  return renderOpenApiHeading(
    { ...props, children: label ?? props.children },
    depth,
  );
}

function OpenApiGeneratedMarkdown({
  md,
}: ComponentProps<OpenAPIComponents['Markdown']>) {
  return renderOpenApiMarkdown(md);
}

function OpenApiGeneratedSchemaUI(
  options: ComponentProps<OpenAPIComponents['SchemaUI']>,
) {
  const { doc } = useOpenAPI();
  const schemaOptions = options as typeof options & {
    client: ComponentProps<OpenAPIComponents['SchemaUI']>['client'];
    legacyAnchorPrefix?: string;
    showExample?: boolean;
  };

  return (
    <OpenApiSchema
      client={schemaOptions.client}
      document={doc.bundled}
      legacyAnchorPrefix={schemaOptions.legacyAnchorPrefix}
      readOnly={schemaOptions.readOnly}
      renderCodeblock={({ code, lang }) => renderOpenApiCodeBlock(lang, code)}
      renderExtraDescription={(schema) => {
        const record = getRecord(schema);
        const callouts = record ? getOpenApiDocsCallouts(record) : [];
        return callouts.length > 0 ? (
          <OpenApiInlineCallouts callouts={callouts} />
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
}

function createDocsOpenApiPage(requestCodeUsages: typeof codeUsages) {
  return createOpenAPIPage({
    codeUsages: requestCodeUsages,
    components: openApiPageComponents,
    content: {
      renderResponseTabs: (options) => <OpenApiResponseExamples {...options} />,
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
      renderOperationLayout: (
        slots,
        { method: operationMethod, operation },
      ) => (
        <OpenApiOperationLayoutWithSource
          method={
            {
              ...(operation as OpenApiOperation),
              method: operationMethod,
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
  });
}

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
  contentPath,
  locale,
  pageProps,
}: {
  className?: string;
  contentPath?: string;
  locale?: string;
  pageProps: OpenAPIPageProps;
}) {
  const operation = getCurrentOperation(pageProps);
  const adaptedPageProps = useMemo(
    () => adaptOpenApiParameterSchemaExtensions(pageProps),
    [pageProps],
  );
  const OpenAPIPage = useMemo(() => {
    const sourceOperation = getCurrentOperation(pageProps);
    const registry = createCodeUsageGeneratorRegistry(codeUsages);
    const document = sourceOperation?.__document;
    if (sourceOperation && document) {
      const pathItem =
        getRecord(getRecord(document.paths)?.[sourceOperation.__path ?? '']) ??
        {};
      const context = buildRequestExampleContext(
        document,
        pathItem,
        sourceOperation,
        pageProps.operations?.[0]?.method ?? 'get',
        isZhCnLocale(locale),
      );
      for (const [id, generator] of codeUsages.map()) {
        registry.add(id, {
          ...generator,
          generate: (data, options) =>
            generator.generate(completeRequestExample(data, context), options),
        });
      }
    }
    return createDocsOpenApiPage(registry);
  }, [pageProps, locale]);
  const containerRef = useRef<HTMLDivElement>(null);

  useMeasuredDocsBody(containerRef);
  useOpenApiHashScroll();
  useLocalizedOpenApiGeneratedChrome(containerRef, locale);

  return (
    <div
      className={cn('not-prose openapi-operation', className)}
      ref={containerRef}
    >
      <OpenApiContentPathContext.Provider value={contentPath}>
        <OpenApiLocaleContext.Provider value={locale}>
          <TranslationProvider
            translations={getOpenApiFumaTranslations(locale)}
          >
            <OpenApiSourceOperationContext.Provider value={operation}>
              <OpenApiDocsCallouts
                operation={operation}
                position="before-description"
              />
              <OpenAPIPage {...adaptedPageProps} />
            </OpenApiSourceOperationContext.Provider>
          </TranslationProvider>
        </OpenApiLocaleContext.Provider>
      </OpenApiContentPathContext.Provider>
    </div>
  );
}

function adaptOpenApiParameterSchemaExtensions(
  pageProps: OpenAPIPageProps,
): OpenAPIPageProps {
  if (!('payload' in pageProps)) return pageProps;
  const document = pageProps.payload.bundled;
  if (!document) return pageProps;
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
  // Older sources omit the schema on otherwise documented parameters.
  // Keep an unconstrained schema so the renderer retains the name and prose.
  const schema =
    getRecord(value.schema) ?? (value.schema == null ? {} : undefined);
  if (!schema) return value;
  const callouts = value['x-docs-callouts'];
  const example = value.example ?? getFirstExample(value.examples);
  const deprecated = value.deprecated === true;
  if (
    value.schema != null &&
    callouts === undefined &&
    example === undefined &&
    !deprecated
  ) {
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
  const { doc } = useOpenAPI();

  return (
    <OpenApiOperationLayout
      method={mergeOpenApiOperationExtensions(
        {
          ...method,
          __documentSecurity: doc.dereferenced.security,
          __document: doc.dereferenced as OpenApiRecord,
        },
        sourceOperation,
      )}
      slots={slots}
    />
  );
}

function renderOpenApiOperationHeader(header: ReactNode) {
  // Fumadocs uses a warning callout for a deprecated endpoint without a title.
  if (
    isValidElement<ComponentProps<typeof OpenApiCallout>>(header) &&
    (header.props.type === 'warn' || header.props.type === 'warning')
  ) {
    return <OpenApiCallout {...header.props} />;
  }
  return header;
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
    <OpenApiOperationPanels
      locale={locale}
      overview={
        <>
          {renderOpenApiOperationHeader(slots.header)}
          <OpenApiEndpointBar operation={method} />
          <OpenApiDocsSections
            operation={method}
            position="after-description"
          />
          <OpenApiDocsCallouts
            operation={method}
            position="after-description"
          />
        </>
      }
      documentation={
        <>
          <OpenApiInlineAuthorizationSection operation={method} />
          {slots.parameters}
          <OpenApiDocsSections operation={method} position="after-parameters" />
          {slots.body}
          <OpenApiDocsSections
            operation={method}
            position="before-response-body"
          />
          <OpenApiResponseBody operation={method} />
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
        </>
      }
      examples={
        <OpenApiExamplesRail>
          <OpenApiAuthorizationSection operation={method} />
          <OpenApiOperationContext.Provider value={method}>
            {slots.apiExample}
          </OpenApiOperationContext.Provider>
        </OpenApiExamplesRail>
      }
    />
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
  return isZhCnLocale(locale)
    ? {
        ...ZH_CN_FUMADOCS_SCHEMA_TRANSLATIONS,
        'Copy Text(code block)(aria-label)': '复制文本',
        'Copied Text(code block)(aria-label)': '已复制文本',
      }
    : {};
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
        <OpenApiRequestCodeContext.Provider value>
          <OpenApiCodePreview>{slots.usageTabs}</OpenApiCodePreview>
        </OpenApiRequestCodeContext.Provider>
      </OpenApiRightSection>
      <OpenApiRightSection
        className="openapi-response-example border-t-0"
        title={getOpenApiLabel('Response example', locale)}
      >
        {slots.responseTabs}
      </OpenApiRightSection>
    </div>
  );
}

type OpenApiResponseExamplesProps = Parameters<
  NonNullable<
    NonNullable<CreateOpenAPIPageOptions['content']>['renderResponseTabs']
  >
>[0];

type OpenApiResponseExample = NonNullable<
  OpenApiResponseExamplesProps['tabs'][number]['examples']
>[number];

function getOpenApiResponseSchemaExamples(
  tab: OpenApiResponseExamplesProps['tabs'][number],
  resolve: ReturnType<typeof useOpenAPI>['doc']['resolve'],
  locale?: string,
): OpenApiResponseExample[] | undefined {
  const media = getRecord(
    resolve(tab.mediaType ? tab.response.content?.[tab.mediaType] : undefined),
  );
  if (
    media?.['x-docs-schema-examples'] === true &&
    (tab.examples?.length ?? 0) > 1
  ) {
    return tab.examples;
  }
  // Authored examples take precedence over generated samples, including empty example maps.
  if (!media || 'examples' in media || 'example' in media) return undefined;
  const schema = getRecord(resolve(media.schema));
  if (!schema) return undefined;
  const kind = Array.isArray(schema.oneOf) ? 'oneOf' : 'anyOf';
  const branches = schema[kind];
  if (!Array.isArray(branches) || branches.length < 2) return undefined;
  return branches.map((branch, index) => {
    const resolved = getRecord(resolve(branch));
    return {
      label:
        typeof resolved?.title === 'string'
          ? resolved.title
          : `${isZhCnLocale(locale) ? '示例' : 'Example'} ${index + 1}`,
      description:
        typeof resolved?.description === 'string'
          ? resolved.description
          : undefined,
      // Keep common parent fields while selecting just this alternative. Nested refs
      // retain Fumadocs' lazy proxy so its sampler can resolve them safely.
      sample: sample({ ...schema, [kind]: [branch] } as ParsedSchema),
    };
  });
}

function OpenApiResponseExamples({ tabs }: OpenApiResponseExamplesProps) {
  const { doc } = useOpenAPI();
  const resolve = doc.resolve;
  const locale = useContext(OpenApiLocaleContext);
  const operation = useContext(OpenApiOperationContext);
  // Use all declared statuses, including responses without examples or content.
  const statusCodes = Object.keys(operation?.responses ?? {});
  // Keep the values used by Fumadocs' ordinary Tabs so shared status selection
  // survives switching to the same code-tab frame as request examples.
  const tabValue = (code: string) => code.toLowerCase().replace(/\s/, '-');
  const empty = (
    <p
      className="m-0 px-4 py-5 text-fd-muted-foreground text-sm"
      data-openapi-response-example-empty=""
    >
      {isZhCnLocale(locale)
        ? '未提供响应示例。'
        : 'No response example provided.'}
    </p>
  );
  function renderExample(
    example: NonNullable<
      OpenApiResponseExamplesProps['tabs'][number]['examples']
    >[number],
  ) {
    const code = JSON.stringify(example.sample, null, 2);
    return (
      <>
        {example.description
          ? renderOpenApiMarkdown(example.description)
          : null}
        {code === undefined ? empty : renderOpenApiCodeBlock('json', code)}
      </>
    );
  }
  return (
    <CodeBlockTabs
      className="openapi-response-code-tabs my-0"
      defaultValue={tabs[0] ? tabValue(tabs[0].code) : undefined}
      groupId="fumadocs_openapi_responses"
    >
      <CodeBlockTabsList>
        {tabs.map(({ code }) => (
          <CodeBlockTabsTrigger key={code} value={tabValue(code)}>
            {getOpenApiResponseStatusLabel(code, statusCodes, locale)}
          </CodeBlockTabsTrigger>
        ))}
      </CodeBlockTabsList>
      {tabs.map((tab) => {
        const { code, examples = [] } = tab;
        const alternatives = getOpenApiResponseSchemaExamples(
          tab,
          resolve,
          locale,
        );
        return (
          <CodeBlockTab key={code} value={tabValue(code)}>
            {alternatives ? (
              <ChoiceTabs
                className="openapi-response-schema-examples min-w-0"
                defaultValue="0"
              >
                <ChoiceList
                  aria-label={
                    isZhCnLocale(locale)
                      ? '响应示例场景'
                      : 'Response example scenario'
                  }
                  className="mx-3 mt-3 min-h-11 max-w-[calc(100%-1.5rem)] flex-wrap justify-start group-data-[orientation=horizontal]/tabs:h-auto"
                >
                  {alternatives.map((example, index) => (
                    <ChoiceTrigger
                      className="min-h-11 h-auto whitespace-normal"
                      key={String(index)}
                      value={String(index)}
                    >
                      {example.label}
                    </ChoiceTrigger>
                  ))}
                </ChoiceList>
                {alternatives.map((example, index) => (
                  <ChoiceContent key={String(index)} value={String(index)}>
                    {renderExample(example)}
                  </ChoiceContent>
                ))}
              </ChoiceTabs>
            ) : examples.length === 0 ? (
              isZhCnLocale(locale) &&
              !tab.response.content &&
              tab.response.description ? (
                <div
                  className="px-4 py-3.5"
                  data-openapi-response-description=""
                >
                  {renderOpenApiMarkdown(tab.response.description)}
                </div>
              ) : (
                empty
              )
            ) : examples.length === 1 ? (
              renderExample(examples[0])
            ) : (
              <Accordions className="pt-2" defaultValue="0" type="single">
                {examples.map((example, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Fumadocs supplies an immutable ordered example list without IDs.
                  <AccordionItem key={index} value={String(index)}>
                    <AccordionHeader>
                      <AccordionTrigger>{example.label}</AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent className="prose-no-margin">
                      {renderExample(example)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordions>
            )}
          </CodeBlockTab>
        );
      })}
    </CodeBlockTabs>
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
      <h2 className={OPENAPI_SECTION_HEADING_CLASS} id="authorization">
        {getOpenApiLabel('Authorization', locale)}
      </h2>
      <div className="openapi-authorization-methods space-y-5">
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
  const method =
    typeof operation.method === 'string'
      ? operation.method.trim().toUpperCase()
      : '';
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
        <Badge
          className={cn(
            'openapi-method-badge shrink-0 normal-case tracking-normal',
            getOpenApiMethodBadgeClassName(method),
          )}
          data-method={method}
          data-openapi-method={method}
        >
          {method}
        </Badge>
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
    .map((parameter) =>
      resolveLocalOpenApiReference(operation?.__document, parameter),
    )
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
    ? getRecord(pageProps.payload.bundled?.paths)?.[operation.path]
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

function OpenApiResponseBody({ operation }: { operation?: OpenApiOperation }) {
  const locale = useContext(OpenApiLocaleContext);
  const responses = useMemo(
    () =>
      buildOpenApiResponseViews(operation?.responses, operation?.__document),
    [operation?.responses, operation?.__document],
  );
  return (
    <OpenApiResponses
      locale={locale}
      labels={{
        mediaTypeForResponse: (status) =>
          isZhCnLocale(locale)
            ? `${status} 响应的媒体类型`
            : `Media type for ${status} response`,
        responseBody: getOpenApiLabel('Response Body', locale),
        responses: getOpenApiLabel('Responses', locale),
        schemaHasNoFields: getOpenApiLabel('Schema has no fields', locale),
        schemaNotProvided: getOpenApiLabel('Schema not provided', locale),
      }}
      renderDescription={(markdown) =>
        renderOpenApiMarkdown(normalizeOpenApiDescriptionMarkdown(markdown))
      }
      renderHeaders={(headers, status) => (
        <OpenApiStatusResponseHeaders headers={headers} status={status} />
      )}
      renderSchema={({ mediaType, schema, status }) => {
        const response = responses.find(
          (candidate) => candidate.statusCode === status,
        );
        return {
          hasFields: true,
          node: (
            <OpenApiSchema
              client={{
                as: 'body',
                name: buildOpenApiResponseSchemaAnchorId(
                  status,
                  mediaType,
                  response?.mediaTypes.map((item) => item.mediaType) ?? [
                    mediaType,
                  ],
                ),
              }}
              emptyFallback={
                <p>{getOpenApiLabel('Schema has no fields', locale)}</p>
              }
              legacyAnchorPrefix={`responses-${slugOpenApiAnchorSegment(status)}`}
              renderCodeblock={({ code, lang }) =>
                renderOpenApiCodeBlock(lang, code)
              }
              renderExtraDescription={(source) => {
                const record = getRecord(source);
                const callouts = record ? getOpenApiDocsCallouts(record) : [];
                return callouts.length > 0 ? (
                  <OpenApiInlineCallouts callouts={callouts} />
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

function OpenApiStatusResponseHeaders({
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
      <h3 className="mb-3 font-semibold text-base">
        {getOpenApiLabel('Response Headers', locale)}
      </h3>
      <div className="openapi-field-list divide-y divide-fd-border">
        {headers.map((header, index) => (
          <div key={anchorIds[index]}>
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

  if (!isValidElement<{ className?: string }>(defaultUsageTabs)) {
    return defaultUsageTabs;
  }

  return cloneElement(defaultUsageTabs, {
    className: cn(
      'openapi-request-code-tabs my-0',
      defaultUsageTabs.props.className,
    ),
  });
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
  const locale = useContext(OpenApiLocaleContext);
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
        {getOpenApiLabel('Request example scenario', locale)}
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
  const identity =
    getString(sample.id) ?? sample.label ?? sample.lang ?? 'sample';
  return `${identity}-${index}`;
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
  const locale = useContext(OpenApiLocaleContext);
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
      {callouts.map((callout) => {
        // Untyped legacy Chinese operation notices keep their caution styling.
        // Explicit source type/title metadata takes precedence.
        const legacyNotice =
          isZhCnLocale(locale) && !callout.type && !callout.title;
        return (
          <OpenApiCallout
            key={`${position}:${getOpenApiCalloutKey(callout)}`}
            title={
              legacyNotice ? getOpenApiLabel('Caution', locale) : callout.title
            }
            type={toCalloutType(legacyNotice ? 'caution' : callout.type)}
          >
            <div className="prose-no-margin">
              {renderOpenApiMarkdown(
                normalizeOpenApiDescriptionMarkdown(callout.markdown),
              )}
            </div>
          </OpenApiCallout>
        );
      })}
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

function renderOpenApiCodeBlock(
  lang: string,
  source: string,
  codeblock?: CodeBlockProps,
) {
  return (
    <OpenApiCodeSourceContext.Provider value={source}>
      <OpenApiMarkdownCodeBlock codeblock={codeblock}>
        <code className={`language-${lang}`}>{source}</code>
      </OpenApiMarkdownCodeBlock>
    </OpenApiCodeSourceContext.Provider>
  );
}

function OpenApiMarkdownCodeBlock({
  children,
  codeblock,
  ...props
}: ComponentProps<'pre'> & {
  codeblock?: CodeBlockProps;
}) {
  const contextSource = useContext(OpenApiCodeSourceContext);
  const isRequestCode = useContext(OpenApiRequestCodeContext);
  const locale = useContext(OpenApiLocaleContext);
  const childProps = isValidElement(children)
    ? (children.props as { className?: string; children?: ReactNode })
    : undefined;
  const language =
    getCodeBlockLanguage(props.className) ??
    getCodeBlockLanguage(childProps?.className) ??
    'text';
  const source =
    contextSource ??
    (typeof childProps?.children === 'string'
      ? childProps.children
      : undefined);

  // Generated usage tabs need explicit in-tab geometry during SSR and hydration.
  return (
    <DocsCodeBlock
      {...props}
      data-code-language={language}
      {...codeblock}
      locale={locale}
      copyButton={<OpenApiCodeCopyButton />}
      className={cn(
        props.className,
        codeblock?.className,
        'shadow-none',
        isRequestCode && 'my-0 -mx-px -mb-px rounded-none last:rounded-b-xl',
      )}
    >
      {source === undefined ? (
        children
      ) : (
        <HighlightedCode source={source} language={language} />
      )}
    </DocsCodeBlock>
  );
}

function getCodeBlockLanguage(className: string | undefined) {
  const match = className?.match(/(?:^|\s)language-([^\s]+)/);

  return match?.[1];
}

/** Keep clipboard rejection handling while using the default code-block frame. */
function OpenApiCodeCopyButton() {
  const locale = useContext(OpenApiLocaleContext);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [checked, onClick] = useOpenApiCopyButton(async () => {
    const pre = buttonRef.current?.closest('figure')?.querySelector('pre');
    if (!pre) throw new Error('Code block is unavailable');
    const clone = pre.cloneNode(true) as HTMLPreElement;
    for (const decoration of clone.querySelectorAll('.nd-copy-ignore'))
      decoration.replaceWith('\n');
    await navigator.clipboard.writeText(clone.textContent ?? '');
  });

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={getOpenApiLabel(
        checked ? 'Copied Text' : 'Copy Text',
        locale,
      )}
      className="inline-flex items-center justify-center rounded-md p-1 text-sm font-medium text-fd-muted-foreground transition-colors duration-100 hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-50 data-checked:text-fd-accent-foreground [&_svg]:size-4"
      data-checked={checked || undefined}
      onClick={onClick}
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
    setChecked(false);
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

function OpenApiMarkdownBlockquote({
  children,
  'data-callout': marker,
}: {
  children?: ReactNode;
  'data-callout'?: string;
}) {
  const locale = useContext(OpenApiLocaleContext);
  const callout = getOpenApiQuoteCallout(marker);

  if (!callout && !isZhCnLocale(locale)) {
    return <blockquote>{children}</blockquote>;
  }

  return (
    <div className="openapi-markdown-blockquote">
      <OpenApiCallout
        title={getOpenApiLabel(callout?.title ?? 'Note', locale)}
        type={callout?.type ?? 'info'}
      >
        <div className="prose-no-margin">{children}</div>
      </OpenApiCallout>
    </div>
  );
}

function OpenApiMarkdownTable(props: ComponentProps<'table'>) {
  const locale = useContext(OpenApiLocaleContext);
  const Table = useMemo(() => createDocsTableComponent(locale), [locale]);

  return <Table {...props} />;
}

function OpenApiMarkdownAnchor({
  href,
  children,
  ...props
}: ComponentProps<'a'>) {
  const contentPath = useContext(OpenApiContentPathContext);
  const normalized =
    typeof href === 'string' ? normalizeDocsHref(href, { contentPath }) : null;

  const normalizedHref = normalized?.href ?? href;
  return (
    <a {...props} href={normalizedHref}>
      {children}
      <DocsLinkIcon href={normalizedHref} target={props.target} />
    </a>
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
          a: OpenApiMarkdownAnchor,
          blockquote: OpenApiMarkdownBlockquote,
          pre: OpenApiMarkdownCodeBlock,
          table: OpenApiMarkdownTable,
        },
      });
  }

  return remark()
    .use(remarkGfm)
    .use(remarkOpenApiCallouts)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeReact);
}

function toCalloutType(type: string | undefined) {
  switch (type) {
    case 'caution':
    case 'important':
    case 'warn':
    case 'warning':
      return 'warning';
    case 'danger':
    case 'error':
      return 'error';
    case 'idea':
      return 'idea';
    case 'ok':
    case 'tip':
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

function isRecord(value: unknown): value is OpenApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
