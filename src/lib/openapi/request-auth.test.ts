import { describe, expect, it } from 'vitest';
import { withOpenApiRequestAuth } from './request-auth';

const request = () => ({
  url: 'https://api.example.test/path?existing=1',
  method: 'get' as const,
  path: {},
  header: {},
  cookie: {},
  query: {},
});
const document = {
  security: [{ basic: [] }],
  components: {
    securitySchemes: {
      basic: { type: 'http', scheme: 'basic' },
      bearer: { type: 'http', scheme: 'bearer' },
      key: { type: 'apiKey', in: 'header', name: 'X-Key' },
      query: { type: 'apiKey', in: 'query', name: 'access_token' },
      cookie: { type: 'apiKey', in: 'cookie', name: 'session' },
      oauth: { type: 'oauth2' },
      reference: { $ref: '#/components/securitySchemes/bearer' },
    },
  },
};

describe('request example security', () => {
  it('inherits document security and leaves the input untouched', () => {
    const data = request();
    expect(withOpenApiRequestAuth(data, {}, document).header).toEqual({
      Authorization: { value: 'Basic <credentials>' },
    });
    expect(data.header).toEqual({});
  });
  it.each([
    { security: [] },
    { security: [{}] },
    { security: [{}, { basic: [] }] },
  ])('does not authenticate an anonymous operation: %j', ({ security }) => {
    expect(
      withOpenApiRequestAuth(request(), { security }, document).header,
    ).toEqual({});
  });
  it.each(['bearer', 'oauth', 'reference'])(
    'honors operation override %s',
    (key) => {
      expect(
        withOpenApiRequestAuth(
          request(),
          { security: [{ [key]: [] }] },
          document,
        ).header,
      ).toEqual({ Authorization: { value: 'Bearer <token>' } });
    },
  );
  it('uses one OR alternative and all AND requirements', () => {
    const result = withOpenApiRequestAuth(
      request(),
      { security: [{ key: [], query: [], cookie: [] }, { basic: [] }] },
      document,
    );
    expect(result.header).toEqual({ 'X-Key': { value: '<key>' } });
    expect(result.cookie).toEqual({ session: { value: '<cookie>' } });
    expect(new URL(result.url).searchParams.get('access_token')).toBe(
      '<query>',
    );
    expect(new URL(result.url).searchParams.get('existing')).toBe('1');
  });
  it('preserves existing credentials with case-insensitive header names', () => {
    const data = {
      ...request(),
      header: { authorization: { value: 'Basic existing' } },
    };
    expect(withOpenApiRequestAuth(data, {}, document).header).toEqual(
      data.header,
    );
  });
  it('does not add auth without a declaration', () => {
    expect(withOpenApiRequestAuth(request(), {}, {}).header).toEqual({});
  });
});
