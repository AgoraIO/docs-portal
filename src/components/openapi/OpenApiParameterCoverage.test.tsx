import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import type { OpenAPIPageProps } from 'fumadocs-openapi/ui';
import yaml from 'js-yaml';
import type { Root, RootContent } from 'mdast';
import { renderToStaticMarkup } from 'react-dom/server';
import { remark } from 'remark';
import { describe, expect, it } from 'vitest';
import { getOpenApiLaneLocales, getOpenApiLanes } from '@/lib/openapi/lanes';
import { FumadocsOpenApiContent } from './FumadocsOpenApiContent';

type RecordValue = Record<string, unknown>;
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
  'trace',
]);
const lanes = getOpenApiLanes().filter((lane) =>
  getOpenApiLaneLocales(lane).includes('zh-CN'),
);
const compact = (text: string) => text.replace(/\s+/g, '');

function resolve(document: RecordValue, raw: unknown): RecordValue {
  const value = raw as RecordValue;
  if (typeof value?.$ref !== 'string' || !value.$ref.startsWith('#/'))
    return value;
  const referenced = value.$ref
    .slice(2)
    .split('/')
    .reduce<unknown>(
      (node, key) =>
        (node as RecordValue)?.[key.replace(/~1/g, '/').replace(/~0/g, '~')],
      document,
    );
  return resolve(document, referenced);
}

function proseParts(node: Root | RootContent): string[] {
  if (node.type === 'text' || node.type === 'inlineCode') return [node.value];
  if (node.type === 'html') return [load(node.value).text()];
  if ('children' in node) return node.children.flatMap(proseParts);
  return [];
}

function proseLinks(node: Root | RootContent): string[] {
  if (node.type === 'link') return [node.url];
  if ('children' in node) return node.children.flatMap(proseLinks);
  return [];
}

describe('published Chinese REST parameter coverage', () => {
  it.each(lanes)(
    'renders every parameter name, required marker, and description in $id',
    (lane) => {
      const document = yaml.load(
        readFileSync(lane.sourcePath['zh-CN'], 'utf8'),
      ) as RecordValue;
      for (const [path, rawItem] of Object.entries(
        document.paths as RecordValue,
      )) {
        const item = rawItem as RecordValue;
        for (const [method, rawOperation] of Object.entries(item)) {
          if (!methods.has(method)) continue;
          const operation = rawOperation as RecordValue;
          if (!lane.operations[String(operation.operationId)]) continue;
          const parameters = [
            ...((item.parameters as unknown[]) ?? []),
            ...((operation.parameters as unknown[]) ?? []),
          ].map((parameter) => resolve(document, parameter));
          const $ = load(
            renderToStaticMarkup(
              <FumadocsOpenApiContent
                locale="zh-CN"
                pageProps={{
                  operations: [
                    { method, path } as NonNullable<
                      OpenAPIPageProps['operations']
                    >[number],
                  ],
                  payload: { bundled: document as Document },
                }}
              />,
            ),
          );
          for (const parameter of parameters) {
            const context = `${lane.id}/${operation.operationId}/${parameter.in}/${parameter.name}`;
            const fields = $('.openapi-schema-parameter-fields').filter(
              (_, group) =>
                $(group)
                  .find('> .openapi-schema-field-row')
                  .first()
                  .find('code')
                  .first()
                  .text() === parameter.name,
            );
            expect(fields.length, context).toBeGreaterThan(0);
            const text = compact(fields.text());
            if (parameter.required)
              expect(
                fields.find('.openapi-schema-status').text(),
                context,
              ).toContain('必填');
            if (typeof parameter.description === 'string') {
              for (const part of proseParts(
                remark().parse(parameter.description),
              )
                .map(compact)
                .filter(Boolean))
                expect(text, `${context}: ${part}`).toContain(part);
            }
          }
          const schemes = (document.components as RecordValue)
            ?.securitySchemes as RecordValue | undefined;
          const security = (operation.security ??
            document.security ??
            []) as RecordValue[];
          const hasAuthorizationHeader = parameters.some(
            (parameter) =>
              parameter.in === 'header' &&
              String(parameter.name).toLowerCase() === 'authorization',
          );
          for (const name of new Set(
            security.flatMap((requirement) => Object.keys(requirement)),
          )) {
            const scheme = resolve(document, schemes?.[name]);
            if (typeof scheme?.description !== 'string') continue;
            const tree = remark().parse(scheme.description);
            const text = compact($.root().text());
            // Explicit Authorization parameters carry equivalent instructions
            // instead of repeating the operation's security scheme prose.
            if (!hasAuthorizationHeader) {
              for (const part of proseParts(tree).map(compact).filter(Boolean))
                expect(
                  text,
                  `${lane.id}/${operation.operationId}/security/${name}: ${part}`,
                ).toContain(part);
            }
            for (const href of proseLinks(tree))
              expect(
                $('a')
                  .toArray()
                  .some(
                    (a) =>
                      decodeURI($(a).attr('href') ?? '').split('#')[0] ===
                        decodeURI(href).split('#')[0] &&
                      (!href.includes('#') ||
                        decodeURI($(a).attr('href') ?? '') === decodeURI(href)),
                  ),
                `${lane.id}/${operation.operationId}/security/${name}: ${href}`,
              ).toBe(true);
          }
        }
      }
    },
    30_000,
  );
});
