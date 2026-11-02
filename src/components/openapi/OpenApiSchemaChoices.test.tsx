import { readFileSync } from 'node:fs';
import { AnchorSection } from '@fumadocs/api-docs/auto-anchor/client';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import yaml from 'js-yaml';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getOpenApiLaneLocales, getOpenApiLanes } from '@/lib/openapi/lanes';
import { OpenApiSchema } from './OpenApiSchema';

const branches = [
  {
    title: '转码推流',
    type: 'object',
    properties: {
      converter: {
        type: 'object',
        properties: { transcodeOptions: { type: 'string' } },
      },
      fields: { type: 'string', description: '转码字段说明' },
    },
    required: ['fields'],
  },
  {
    title: '不转码推流',
    type: 'object',
    properties: {
      converter: {
        type: 'object',
        properties: { rtmpUrl: { type: 'string' } },
      },
      fields: { type: 'string', description: '不转码字段说明' },
    },
  },
];

function show(
  root: unknown,
  as: 'body' | 'property' = 'body',
  document: unknown = {},
) {
  return render(
    <AnchorSection segments={['request-body', 'application-json']}>
      <OpenApiSchema
        client={{ as, name: 'body' }}
        document={document}
        root={root}
        renderCodeblock={({ code }) => <pre>{code}</pre>}
        renderMarkdown={(markdown) => <p>{markdown}</p>}
      />
    </AnchorSection>,
  );
}

function choose(name: string) {
  fireEvent.mouseDown(screen.getByRole('tab', { name }), {
    button: 0,
    ctrlKey: false,
  });
}

describe('OpenAPI schema alternative selection', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/');
    vi.restoreAllMocks();
  });
  it.each(['oneOf', 'anyOf'])(
    'switches %s fields and required markers together',
    (kind) => {
      show({ [kind]: branches });
      expect(screen.getByRole('tab', { name: '转码推流' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByText('转码字段说明')).toBeVisible();
      expect(screen.getByText('不转码字段说明')).not.toBeVisible();
      expect(
        within(screen.getByRole('tabpanel')).getByText('Required'),
      ).toBeVisible();
      choose('不转码推流');
      expect(screen.getByText('转码字段说明')).not.toBeVisible();
      expect(screen.getByText('不转码字段说明')).toBeVisible();
      expect(
        within(screen.getByRole('tabpanel')).queryByText('Required'),
      ).toBeNull();
    },
  );

  it('switches parameter alternatives as well as body alternatives', () => {
    show({ oneOf: branches }, 'property');
    choose('不转码推流');
    expect(screen.getByText('不转码字段说明')).toBeVisible();
    expect(screen.getByText('转码字段说明')).not.toBeVisible();
  });

  it('keeps common fields visible while selecting only one alternative', () => {
    show({
      type: 'object',
      properties: { shared: { type: 'string' } },
      oneOf: branches,
    });
    choose('不转码推流');
    const visibleShared = screen
      .getAllByText('shared')
      .filter((field) => !field.closest('[hidden]'));
    expect(visibleShared).toHaveLength(1);
    expect(visibleShared[0]).toBeVisible();
    expect(screen.getByText('不转码字段说明')).toBeVisible();
    expect(screen.getByText('转码字段说明')).not.toBeVisible();
  });

  it('keeps allOf fields together without creating alternative tabs', () => {
    show({
      allOf: [
        { type: 'object', properties: { first: { type: 'string' } } },
        { type: 'object', properties: { second: { type: 'string' } } },
      ],
    });
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.getByText('first')).toBeVisible();
    expect(screen.getByText('second')).toBeVisible();
  });

  it('switches branch descriptions and gives repeated fields unique live anchors', () => {
    const { container } = show({
      oneOf: branches.map((branch, index) => ({
        ...branch,
        description: `Branch ${index} explanation`,
      })),
    });
    expect(screen.getByText('Branch 0 explanation')).toBeVisible();
    expect(screen.getByText('Branch 1 explanation')).not.toBeVisible();
    choose('不转码推流');
    expect(screen.getByText('Branch 1 explanation')).toBeVisible();
    expect(screen.getByText('Branch 0 explanation')).not.toBeVisible();
    const ids = Array.from(
      container.querySelectorAll('[id]'),
      (element) => element.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('preserves nested array selections when returning to their parent branch', () => {
    show({
      oneOf: [
        {
          title: 'Audio',
          type: 'object',
          properties: {
            tracks: {
              type: 'array',
              items: {
                oneOf: [
                  {
                    title: 'Microphone',
                    type: 'object',
                    properties: { mic: { type: 'string' } },
                  },
                  {
                    title: 'File',
                    type: 'object',
                    properties: { file: { type: 'string' } },
                  },
                ],
              },
            },
          },
        },
        {
          title: 'Video',
          type: 'object',
          properties: { camera: { type: 'string' } },
        },
      ],
    });
    fireEvent.click(screen.getByRole('button', { name: 'Expand all' }));
    choose('File');
    expect(screen.getByText('file', { exact: true })).toBeVisible();
    expect(screen.getByText('mic', { exact: true })).not.toBeVisible();
    choose('Video');
    expect(screen.getByText('file', { exact: true })).not.toBeVisible();
    expect(screen.getByText('camera', { exact: true })).toBeVisible();
    choose('Audio');
    expect(screen.getByRole('tab', { name: 'File' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('file', { exact: true })).toBeVisible();
  });

  it('keeps primitive and empty-object alternatives reachable', () => {
    show({
      oneOf: [
        { title: 'Text', type: 'string', enum: ['text-value'] },
        {
          title: 'Empty',
          type: 'object',
          description: 'Empty option description',
        },
      ],
    });
    expect(screen.getByText('text-value')).toBeVisible();
    choose('Empty');
    expect(screen.getByText('text-value')).not.toBeVisible();
    fireEvent.click(
      screen.getByRole('button', { name: 'Expand Empty properties' }),
    );
    expect(screen.getByText('Empty option description')).toBeVisible();
  });

  it('supports OpenAPI 3.1 type alternatives', () => {
    show({ type: ['string', 'null'] });
    choose('null');
    expect(screen.getByRole('tab', { name: 'null' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tabpanel', { name: 'null' })).toBeVisible();
  });

  it('keeps request and response branch selections independent', () => {
    const { container } = render(
      ['request', 'response'].map((name) => (
        <AnchorSection segments={[name]} key={name}>
          <OpenApiSchema
            client={{ as: 'body', name }}
            root={{ oneOf: branches }}
            renderMarkdown={(markdown) => <p>{markdown}</p>}
            renderCodeblock={({ code }) => <pre>{code}</pre>}
          />
        </AnchorSection>
      )),
    );
    const request = within(
      container.querySelector(
        '[data-openapi-schema-client="request"]',
      ) as HTMLElement,
    );
    const response = within(
      container.querySelector(
        '[data-openapi-schema-client="response"]',
      ) as HTMLElement,
    );
    fireEvent.mouseDown(request.getByRole('tab', { name: '不转码推流' }), {
      button: 0,
      ctrlKey: false,
    });
    expect(request.getByText('不转码字段说明')).toBeVisible();
    expect(response.getByText('转码字段说明')).toBeVisible();
    expect(response.getByRole('tab', { name: '转码推流' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('reveals an inactive branch when native browser find matches its field path', () => {
    show({ oneOf: branches });
    const field = screen.getByText('rtmpUrl', { exact: true });
    expect(field).not.toBeVisible();
    const searchPath = field
      .closest('[data-openapi-schema-node]')
      ?.querySelector('[data-openapi-schema-search-path]');
    expect(searchPath).not.toBeNull();
    fireEvent(
      searchPath as HTMLElement,
      new Event('beforematch', { bubbles: true }),
    );
    expect(screen.getByRole('tab', { name: '不转码推流' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('rtmpUrl', { exact: true })).toBeVisible();
  });

  it('opens the correct alternative and collapsed ancestors from a copied field link', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue({
      writeText,
    } as unknown as Clipboard);
    const view = show({ oneOf: branches });
    choose('不转码推流');
    fireEvent.click(
      screen.getByRole('button', { name: 'Expand converter properties' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Copy link to rtmpUrl' }),
    );
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const link = writeText.mock.calls[0][0];
    view.unmount();
    window.history.replaceState(null, '', link);
    show({ oneOf: branches });
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: '不转码推流' })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
    expect(screen.getByText('rtmpUrl', { exact: true })).toBeVisible();
  });

  it('reveals a nested alternative through inactive parent panels without resetting it', () => {
    show({
      oneOf: [
        {
          title: 'Parent A',
          type: 'object',
          properties: { first: { type: 'string' } },
        },
        {
          title: 'Parent B',
          oneOf: ['C', 'D'].map((name) => ({
            title: `Child ${name}`,
            type: 'object',
            properties: {
              config: {
                type: 'object',
                properties: { [`target${name}`]: { type: 'string' } },
              },
            },
          })),
        },
      ],
    });
    const field = screen.getByText('targetD', { exact: true });
    const searchPath = field
      .closest('[data-openapi-schema-node]')
      ?.querySelector('[data-openapi-schema-search-path]');
    fireEvent(
      searchPath as HTMLElement,
      new Event('beforematch', { bubbles: true }),
    );
    expect(screen.getByRole('tab', { name: 'Parent B' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Child D' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('targetD', { exact: true })).toBeVisible();
  });
});

type RecordValue = Record<string, unknown>;
function asRecord(value: unknown): RecordValue {
  return value && typeof value === 'object' ? (value as RecordValue) : {};
}
function publishedAlternatives() {
  const cases: { name: string; root: RecordValue; document: RecordValue }[] =
    [];
  for (const lane of getOpenApiLanes())
    for (const locale of getOpenApiLaneLocales(lane)) {
      const document = yaml.load(
        readFileSync(lane.sourcePath[locale], 'utf8'),
      ) as RecordValue;
      function visit(
        value: unknown,
        path: string,
        ancestors = new Set<unknown>(),
      ) {
        if (!value || typeof value !== 'object' || ancestors.has(value)) return;
        const next = new Set(ancestors).add(value),
          record = value as RecordValue;
        if (
          ['oneOf', 'anyOf'].some(
            (kind) => Array.isArray(record[kind]) && record[kind].length > 1,
          )
        )
          cases.push({
            name: `${locale}/${lane.id}${path}`,
            root: record,
            document,
          });
        if (typeof record.$ref === 'string' && record.$ref.startsWith('#/')) {
          const target = record.$ref
            .slice(2)
            .split('/')
            .reduce(
              (node: unknown, part: string) =>
                asRecord(node)[part.replace(/~1/g, '/').replace(/~0/g, '~')],
              document as unknown,
            );
          visit(target, path, next);
        }
        for (const [key, child] of Object.entries(record))
          if (key !== '$ref') visit(child, `${path}/${key}`, next);
      }
      for (const [path, item] of Object.entries(
        document.paths as RecordValue,
      )) {
        for (const method of [
          'get',
          'post',
          'put',
          'delete',
          'patch',
          'options',
          'head',
          'trace',
        ]) {
          const operation = asRecord(asRecord(item)[method]);
          if (
            typeof operation.operationId !== 'string' ||
            !lane.operations[operation.operationId]
          )
            continue;
          const pathParameters = asRecord(item).parameters;
          visit(
            {
              ...operation,
              parameters: [
                ...(Array.isArray(pathParameters) ? pathParameters : []),
                ...(Array.isArray(operation.parameters)
                  ? operation.parameters
                  : []),
              ],
            },
            `/${method}${path}`,
          );
        }
      }
    }
  return cases;
}

describe('published REST alternative schemas', () => {
  it.each(publishedAlternatives())(
    'keeps each alternative selectable: $name',
    ({ root, document }) => {
      const { container } = show(root, 'body', document);
      const choice = container.querySelector('.openapi-schema-choice');
      expect(choice).not.toBeNull();
      const tabs =
        choice?.querySelectorAll(':scope > [role="tablist"] [role="tab"]') ??
        [];
      expect(tabs.length).toBeGreaterThan(1);
      for (const tab of tabs) {
        fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
        expect(tab).toHaveAttribute('aria-selected', 'true');
        const panels =
          choice?.querySelectorAll(':scope > [role="tabpanel"]') ?? [];
        expect(
          Array.from(panels).filter((panel) => !panel.hasAttribute('hidden')),
        ).toHaveLength(1);
      }
    },
  );
});
