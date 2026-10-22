import type { CodeUsageGenerator } from 'fumadocs-openapi/requests/generators';
import { describe, expect, it } from 'vitest';
import { createDocsCodeGenerators } from './code-generators';

const mediaAdapters: Parameters<
  CodeUsageGenerator['generate']
>[1]['mediaAdapters'] = {
  'application/json': {
    encode: (data) => JSON.stringify(data.body),
    generateExample(data, context) {
      const body = JSON.stringify(data.body, null, 2);
      if (context.lang === 'java' && 'addImport' in context) {
        context.addImport('java.net.http.HttpRequest.BodyPublishers');
        return `var body = BodyPublishers.ofString("""${body}""");`;
      }
      if (context.lang === 'go' && 'addImport' in context) {
        context.addImport('strings');
        return `body := strings.NewReader(\`${body}\`)`;
      }
    },
  },
};

describe('generated API request examples', () => {
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
