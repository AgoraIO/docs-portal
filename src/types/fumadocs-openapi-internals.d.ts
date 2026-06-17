declare module '../../../node_modules/fumadocs-openapi/dist/utils/schema/index.js' {
  export function parseSecurities(
    method: unknown,
    dereferenced: unknown,
  ): unknown[];
}

declare module '../../../node_modules/fumadocs-openapi/dist/requests/media/adapter.js' {
  export const defaultAdapters: Record<string, unknown>;
}

declare module '../../../node_modules/fumadocs-openapi/dist/ui/components/codeblock.js' {
  import type { ReactNode } from 'react';

  export function ClientCodeBlock(props: {
    code: string;
    lang: string;
  }): ReactNode;

  export function ClientCodeBlockProvider(props: {
    children: ReactNode;
    factory: unknown;
  }): ReactNode;
}

declare module '../../../node_modules/fumadocs-openapi/dist/utils/document/dereference.js' {
  export function dereferenceDocument(bundled: unknown): {
    bundled: unknown;
    dereferenced: unknown;
    getRawRef(obj: unknown): string | undefined;
  };
}

declare module '../../../node_modules/fumadocs-openapi/dist/ui/api-page.js' {
  import type { ReactNode } from 'react';

  export function APIPage(props: Record<string, unknown>): ReactNode;
}

declare module '../../../node_modules/fumadocs-openapi/dist/ui/client/boundary.lazy.js' {
  import type { ComponentType } from 'react';

  export const ApiProvider: ComponentType<Record<string, unknown>>;
  export const PlaygroundAuthProvider: ComponentType<Record<string, unknown>>;
  export const PlaygroundClient: ComponentType<Record<string, unknown>>;
  export const SchemaUI: ComponentType<Record<string, unknown>>;
  export const ServerProvider: ComponentType<Record<string, unknown>>;
  export const UsageTab: ComponentType<Record<string, unknown>>;
  export const UsageTabsSelector: ComponentType<Record<string, unknown>>;
}
