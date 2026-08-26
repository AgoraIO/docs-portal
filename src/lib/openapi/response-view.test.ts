import { describe, expect, it } from 'vitest';
import {
  buildOpenApiResponseViews,
  getDefaultOpenApiMediaType,
  getDefaultOpenApiResponseStatus,
} from './response-view';

describe('openapi response view', () => {
  it('returns no views for non-record responses', () => {
    expect(buildOpenApiResponseViews(null, {})).toEqual([]);
    expect(buildOpenApiResponseViews([], {})).toEqual([]);
  });

  it('resolves response and header references while preserving siblings and source', () => {
    const document = {
      components: {
        responses: {
          Created: {
            description: 'Created',
            headers: {
              Location: { $ref: '#/components/headers/Location' },
            },
          },
        },
        headers: {
          Location: {
            description: 'Resource URL',
            deprecated: true,
            schema: { type: 'string' },
          },
        },
      },
    };
    const views = buildOpenApiResponseViews(
      {
        '201': {
          $ref: '#/components/responses/Created',
          description: 'Override',
        },
      },
      document,
    );

    expect(views).toEqual([
      {
        description: 'Override',
        hasContent: false,
        headers: [
          {
            description: 'Resource URL',
            deprecated: true,
            name: 'Location',
            schema: { type: 'string' },
            source: {
              description: 'Resource URL',
              deprecated: true,
              schema: { type: 'string' },
            },
          },
        ],
        mediaTypes: [],
        source: {
          description: 'Override',
          headers: { Location: { $ref: '#/components/headers/Location' } },
        },
        statusCode: '201',
      },
    ]);
  });

  it('keeps Object.entries response order', () => {
    const responses = { default: {}, '201': {}, '200': {} };
    expect(
      buildOpenApiResponseViews(responses, {}).map((view) => view.statusCode),
    ).toEqual(Object.keys(responses));
  });

  it('preserves media order and chooses application/json by default', () => {
    const view = buildOpenApiResponseViews(
      {
        '200': {
          content: {
            'text/plain': { schema: { type: 'string' } },
            'application/json': { schema: { type: 'object' } },
          },
        },
      },
      {},
    )[0];

    expect(view.mediaTypes.map((media) => media.mediaType)).toEqual([
      'text/plain',
      'application/json',
    ]);
    expect(getDefaultOpenApiMediaType(view)).toBe('application/json');
  });

  it('selects the first concrete 2xx status or 2XX, otherwise first', () => {
    expect(
      getDefaultOpenApiResponseStatus(
        buildOpenApiResponseViews({ default: {}, '201': {} }, {}),
      ),
    ).toBe('201');
    expect(
      getDefaultOpenApiResponseStatus(
        buildOpenApiResponseViews({ default: {}, '2XX': {} }, {}),
      ),
    ).toBe('2XX');
    expect(
      getDefaultOpenApiResponseStatus(
        buildOpenApiResponseViews({ default: {}, '20': {}, '2000': {} }, {}),
      ),
    ).toBe('20');
    expect(getDefaultOpenApiResponseStatus([])).toBe('');
  });

  it('distinguishes missing, empty, and schema-less content while preserving false', () => {
    const views = buildOpenApiResponseViews(
      {
        '204': {},
        '205': { content: {} },
        '206': { content: { 'application/json': {} } },
        '207': {
          content: { 'application/json': { schema: false, example: { x: 1 } } },
        },
      },
      {},
    );

    expect(views[0]).toMatchObject({ hasContent: false, mediaTypes: [] });
    expect(views[1]).toMatchObject({ hasContent: true, mediaTypes: [] });
    expect(views[2]).toMatchObject({
      hasContent: true,
      mediaTypes: [{ mediaType: 'application/json', source: {} }],
    });
    expect(views[3]).toMatchObject({
      mediaTypes: [
        {
          mediaType: 'application/json',
          schema: false,
          source: { schema: false, example: { x: 1 } },
        },
      ],
    });
  });

  it('does not throw for invalid response, headers, media, and preserves unknown media keys', () => {
    expect(() =>
      buildOpenApiResponseViews(
        {
          '200': {
            headers: { bad: null, good: { description: 'ok' } },
            content: { 'x-custom': 'invalid', 'text/plain': { schema: false } },
          },
          '201': null,
          '202': 'invalid',
        },
        {},
      ),
    ).not.toThrow();

    const views = buildOpenApiResponseViews(
      {
        '200': {
          headers: { bad: null, good: { description: 'ok' } },
          content: { 'x-custom': 'invalid', 'text/plain': { schema: false } },
        },
        '201': null,
      },
      {},
    );
    expect(views[0].headers).toEqual([
      { description: 'ok', name: 'good', source: { description: 'ok' } },
    ]);
    expect(views[0].mediaTypes).toEqual([
      { mediaType: 'x-custom', source: {} },
      { mediaType: 'text/plain', schema: false, source: { schema: false } },
    ]);
    expect(views[1]).toEqual({
      description: undefined,
      hasContent: false,
      headers: [],
      mediaTypes: [],
      source: {},
      statusCode: '201',
    });
  });
});
