import { readFileSync } from 'node:fs';
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react';
import type { OpenAPIPageProps } from 'fumadocs-openapi/ui';
import yaml from 'js-yaml';
import { expect, it } from 'vitest';
import { getOpenApiLaneLocales, getOpenApiLanes } from '@/lib/openapi/lanes';
import { FumadocsOpenApiContent } from './FumadocsOpenApiContent';

type Document = Extract<
  OpenAPIPageProps,
  { payload: unknown }
>['payload']['bundled'];
const methods = new Set([
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
]);

// Exercise the actual published renderer and every offered code language, rather
// than assuming that a correct security declaration reaches the code generators.
for (const lane of getOpenApiLanes().filter((lane) =>
  getOpenApiLaneLocales(lane).includes('zh-CN'),
)) {
  const document = yaml.load(
    readFileSync(lane.sourcePath['zh-CN'], 'utf8'),
  ) as Document;
  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (
        !methods.has(method) ||
        !operation ||
        typeof operation !== 'object' ||
        !('operationId' in operation)
      )
        continue;
      const security =
        (operation as { security?: Record<string, string[]>[] }).security ??
        document.security ??
        [];
      if (
        !security.length ||
        security.some((item) => Object.keys(item).length === 0)
      )
        continue;
      const requirement = security[0];
      const schemes = Object.keys(requirement).map(
        (key) => document.components?.securitySchemes?.[key],
      );
      const expectedHeaders = schemes.flatMap((scheme) => {
        if (!scheme || '$ref' in scheme) return [];
        if (
          scheme.type === 'http' ||
          scheme.type === 'oauth2' ||
          scheme.type === 'openIdConnect'
        )
          return ['Authorization'];
        return scheme.type === 'apiKey' &&
          scheme.in === 'header' &&
          typeof scheme.name === 'string'
          ? [scheme.name]
          : [];
      });
      it(`${lane.id}/${operation.operationId}: all public clients include declared authentication`, async () => {
        try {
          const { container } = render(
            <FumadocsOpenApiContent
              locale="zh-CN"
              pageProps={{
                operations: [{ method: method as 'get', path }],
                payload: { bundled: document },
              }}
            />,
          );
          const examples = container.querySelector(
            '.openapi-request-examples',
          ) as HTMLElement;
          expect(examples).not.toBeNull();
          const tabs = within(examples).getAllByRole('tab');
          expect(tabs.length).toBeGreaterThan(0);
          for (const tab of tabs) {
            fireEvent.mouseDown(tab);
            await waitFor(() =>
              expect(tab).toHaveAttribute('aria-selected', 'true'),
            );
            const panel = within(examples).getByRole('tabpanel');
            for (const name of expectedHeaders) {
              await waitFor(() => expect(panel).toHaveTextContent(name));
              expect(
                (panel.textContent?.match(new RegExp(name, 'gi')) ?? []).length,
              ).toBe(1);
            }
          }
        } finally {
          cleanup();
        }
      });
    }
  }
}
