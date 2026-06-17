import { compile } from '@fumari/json-schema-ts';
import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm';
import type {
  ClientApiPageProps,
  CreateClientAPIPageOptions,
} from 'fumadocs-openapi/ui/create-client';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import type { ReactElement, ReactNode } from 'react';
import { Children, useMemo } from 'react';
import * as JsxRuntime from 'react/jsx-runtime';
import { jsx } from 'react/jsx-runtime';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import * as mediaAdapterModule from '../../../node_modules/fumadocs-openapi/dist/requests/media/adapter.js';
import * as apiPageModule from '../../../node_modules/fumadocs-openapi/dist/ui/api-page.js';
// @ts-expect-error internal dist import for bundle splitting
import * as boundaryExports from '../../../node_modules/fumadocs-openapi/dist/ui/client/boundary.lazy.js';
import * as codeblockModule from '../../../node_modules/fumadocs-openapi/dist/ui/components/codeblock.js';
import * as dereferenceModule from '../../../node_modules/fumadocs-openapi/dist/utils/document/dereference.js';
import * as schemaUtilsModule from '../../../node_modules/fumadocs-openapi/dist/utils/schema/index.js';

type GenerateContext = {
  readOnly: boolean;
  schema: {
    getRawRef: (schema: object) => string | undefined;
  };
  writeOnly: boolean;
};

const defaultAdapters = (
  mediaAdapterModule as { defaultAdapters: Record<string, unknown> }
).defaultAdapters;
const APIPage = (
  apiPageModule as {
    APIPage: (props: Record<string, unknown>) => ReactNode;
  }
).APIPage;
const ClientCodeBlock = (
  codeblockModule as unknown as {
    ClientCodeBlock: (props: { code: string; lang: string }) => ReactNode;
    ClientCodeBlockProvider: (props: {
      children: ReactNode;
      factory: unknown;
    }) => ReactNode;
  }
).ClientCodeBlock;
const ClientCodeBlockProvider = (
  codeblockModule as unknown as {
    ClientCodeBlockProvider: (props: {
      children: ReactNode;
      factory: unknown;
    }) => ReactNode;
  }
).ClientCodeBlockProvider;
const dereferenceDocument = (
  dereferenceModule as {
    dereferenceDocument: (bundled: unknown) => {
      bundled: unknown;
      dereferenced: unknown;
      getRawRef: (obj: object) => string | undefined;
    };
  }
).dereferenceDocument;
const parseSecurities = (
  schemaUtilsModule as {
    parseSecurities: (method: unknown, dereferenced: unknown) => unknown[];
  }
).parseSecurities;
const plainCodeBlockFactory = {
  getOrInit() {
    return Promise.resolve(createPlainCodeBlockHighlighter());
  },
};

export function createClientAPIPageLite({
  shikiOptions = {
    themes: {
      dark: 'github-dark',
      light: 'github-light',
    },
  },
  generateTypeScriptDefinitions = ((schema: object, ctx: GenerateContext) => {
    if (typeof schema !== 'object') {
      return;
    }

    try {
      return compile(schema, {
        getSchemaId: ctx.schema.getRawRef,
        name: 'Response',
        readOnly: ctx.readOnly,
        writeOnly: ctx.writeOnly,
      });
    } catch (error) {
      console.warn('Failed to generate typescript schema:', error);
    }
  }) as NonNullable<
    CreateClientAPIPageOptions['generateTypeScriptDefinitions']
  >,
  ...options
}: CreateClientAPIPageOptions = {}) {
  let processor: {
    processSync: (file: { value: string }) => { result: unknown };
  } | null = null;

  const mdxComponents = {
    ...defaultMdxComponents,
    img: undefined,
    pre: MarkdownPre,
  };

  function createMarkdownProcessor() {
    function rehypeReact(this: { compiler?: unknown }) {
      this.compiler = (
        tree: Parameters<typeof toJsxRuntime>[0],
        file: { path?: string },
      ) =>
        toJsxRuntime(tree, {
          components: mdxComponents,
          development: false,
          filePath: file.path,
          ...JsxRuntime,
        });
    }

    return remark()
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeReact) as typeof processor;
  }

  function renderPlaygroundDefault({
    ctx,
    method,
    path,
  }: {
    ctx: {
      clientBoundary: typeof boundaryExports;
      proxyUrl?: string;
      schema: { bundled: unknown; dereferenced: unknown };
    };
    method: { deprecated?: boolean; method: string };
    path: string;
  }) {
    return jsx(ctx.clientBoundary.PlaygroundClient, {
      deprecated: method.deprecated,
      doc: ctx.schema.bundled,
      method: method.method,
      path,
      proxyUrl: ctx.proxyUrl,
      readOnly: false,
      route: path,
      securities: parseSecurities(method, ctx.schema.dereferenced),
      writeOnly: true,
    });
  }

  return function ClientAPIPage({ payload, ...props }: ClientApiPageProps) {
    const processed = useMemo(
      () => dereferenceDocument(payload.bundled),
      [payload.bundled],
    );

    const ctx = useMemo(
      () => ({
        ...options,
        clientBoundary: boundaryExports,
        generateTypeScriptDefinitions,
        mediaAdapters: {
          ...defaultAdapters,
          ...options.mediaAdapters,
        },
        playground: {
          ...options.playground,
          render: options.playground?.render ?? renderPlaygroundDefault,
        },
        proxyUrl: payload.proxyUrl,
        renderCodeBlock(lang: string, code: string) {
          if (options.renderCodeBlock) {
            return options.renderCodeBlock({
              code,
              lang,
            });
          }

          return jsx(ClientCodeBlock, {
            code,
            lang,
          });
        },
        renderMarkdown(text: string) {
          if (options.renderMarkdown) {
            return options.renderMarkdown(text);
          }

          const currentProcessor =
            processor ?? (createMarkdownProcessor() as NonNullable<typeof processor>);
          processor = currentProcessor;
          return currentProcessor.processSync({ value: text }).result;
        },
        schema: processed,
        shikiOptions,
      }),
      [payload.proxyUrl, processed],
    );

    return jsx(ClientCodeBlockProvider, {
      children: jsx(APIPage, {
        ...props,
        ctx,
      }),
      factory: plainCodeBlockFactory,
    });
  };
}

function MarkdownPre(props: { children: ReactElement }) {
  const codeProps = Children.only(props.children).props as {
    children?: string;
    className?: string;
  };
  const content = codeProps.children;

  if (typeof content !== 'string') {
    return null;
  }

  return jsx(ClientCodeBlock, {
    code: content.trimEnd(),
    lang:
      codeProps.className
        ?.split(' ')
        .find((value) => value.startsWith('language-'))
        ?.slice(9) ?? 'text',
  });
}

function createPlainCodeBlockHighlighter() {
  return {
    async codeToHast(code: string, options: { lang?: string }) {
      const lines = code.split('\n');

      return {
        type: 'element',
        tagName: 'pre',
        properties: {
          'data-language': options.lang ?? 'text',
        },
        children: [
          {
            type: 'element',
            tagName: 'code',
            properties: {},
            children: lines.map((line, index) => ({
              type: 'element',
              tagName: 'span',
              properties: {
                className: ['line'],
              },
              children: [
                {
                  type: 'text',
                  value:
                    index === lines.length - 1 ? line : `${line}\n`,
                },
              ],
            })),
          },
        ],
      };
    },
    getBundledLanguages() {
      return {};
    },
    getBundledThemes() {
      return {};
    },
    getLoadedLanguages() {
      return [];
    },
    getTheme() {
      return {
        name: 'plain',
      };
    },
    async loadLanguage() {},
    async loadTheme() {},
  };
}
