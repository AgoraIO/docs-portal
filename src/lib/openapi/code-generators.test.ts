import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { CodeUsageGenerator } from 'fumadocs-openapi/requests/generators';
import { describe, expect, it } from 'vitest';
import { createDocsCodeGenerators } from './code-generators';

// The package doesn't publicly export its default adapters. Load the installed
// implementation in tests so upstream escaping cannot be hidden by a stub.
const packageRoot = dirname(
  createRequire(import.meta.url).resolve('fumadocs-openapi/package.json'),
);
const {
  defaultAdapters: mediaAdapters,
}: {
  defaultAdapters: Parameters<
    CodeUsageGenerator['generate']
  >[1]['mediaAdapters'];
} = await import(
  pathToFileURL(join(packageRoot, 'dist/requests/media/adapter.js')).href
);

function generatePost(
  language: string,
  body: unknown,
  bodyMediaType = 'application/json',
) {
  return (
    createDocsCodeGenerators().get(language)?.generate(
      {
        url: 'https://example.test/query',
        method: 'post',
        path: {},
        query: {},
        header: {},
        cookie: {},
        body,
        bodyMediaType,
      },
      { mediaAdapters, custom: undefined },
    ) ?? ''
  );
}

describe('generated API request examples', () => {
  it.each([
    'a\nb',
    'C:\\tmp',
    'say "hi"',
    '"""',
    '\\"""\n尾行',
    'HttpRequest.Builder requestBuilder = client.send(requestBuilder.build(),',
  ])('preserves Java JSON payload values: %j', (text) => {
    const body = { text };
    const code = generatePost('java', body);
    const literal = code.match(/BodyPublishers\.ofString\((.*)\);/)?.[1];
    expect(literal).toBeDefined();
    // For these escapes, JSON string decoding matches a Java string literal.
    const wireBody = JSON.parse(literal ?? '');
    expect(JSON.parse(wireBody)).toEqual(body);
    expect(code).toContain('HttpRequest request = HttpRequest.newBuilder()');
    expect(code).toContain('client.send(request, BodyHandlers.ofString())');
  });

  it('preserves raw Java XML text and embedded template statements', () => {
    const body =
      '<text>"""\\path\nHttpRequest.Builder requestBuilder =\nclient.send(requestBuilder.build(),</text>';
    const code = generatePost('java', body, 'application/xml');
    const literal = code.match(/BodyPublishers\.ofString\((.*)\);/)?.[1];
    expect(JSON.parse(literal ?? '')).toBe(body);
    expect(code).toContain('HttpRequest request = HttpRequest.newBuilder()');
    expect(code).toContain('client.send(request, BodyHandlers.ofString())');
  });

  it.each(['body, _ := ioutil.ReadAll(res.Body)', 'fmt.Println(string(body))'])(
    'preserves Go payload text matching template statements: %s',
    (text) => {
      const code = generatePost('go', { text });
      const wireBody = code.match(
        /body := strings.NewReader\(`([\s\S]*?)`\)/,
      )?.[1];
      expect(wireBody).toBeDefined();
      expect(JSON.parse(wireBody ?? '')).toEqual({ text });
      expect(code).toContain('\n  responseBody, _ := ioutil.ReadAll(res.Body)');
      expect(code).toContain('\n  fmt.Println(string(responseBody))');
      expect(code).not.toContain('\n  body, _ := ioutil.ReadAll(res.Body)');
    },
  );

  it.each(['get', 'post'] as const)(
    'uses one built HttpRequest for Java %s',
    (method) => {
      const code =
        createDocsCodeGenerators()
          .get('java')
          ?.generate(
            {
              url: 'https://example.test/query',
              method,
              path: {},
              query: {},
              header: {},
              cookie: {},
              ...(method === 'post'
                ? {
                    body: { name: 'test', async_stop: false },
                    bodyMediaType: 'application/json',
                  }
                : {}),
            },
            { mediaAdapters, custom: undefined },
          ) ?? '';
      expect(code).toContain('HttpRequest request = HttpRequest.newBuilder()');
      expect(code).toContain('client.send(request, BodyHandlers.ofString())');
      expect(code).not.toContain('requestBuilder.build()');
      expect(code).not.toContain('"""');
      if (method === 'post')
        expect(code).toContain('BodyPublishers.ofString("{');
    },
  );

  it.each(['get', 'post'] as const)(
    'uses a separate response body for Go %s',
    (method) => {
      const code =
        createDocsCodeGenerators()
          .get('go')
          ?.generate(
            {
              url: 'https://example.test/query',
              method,
              path: {},
              query: {},
              header: {},
              cookie: {},
              ...(method === 'post'
                ? {
                    body: { async_stop: false },
                    bodyMediaType: 'application/json',
                  }
                : {}),
            },
            { mediaAdapters, custom: undefined },
          ) ?? '';
      expect(code).toContain('responseBody, _ := ioutil.ReadAll(res.Body)');
      expect(code).toContain('fmt.Println(string(responseBody))');
      if (method === 'post')
        expect(code).toContain('body := strings.NewReader(');
    },
  );
});
