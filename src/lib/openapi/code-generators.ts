import {
  type CodeUsageGenerator,
  createCodeUsageGeneratorRegistry,
} from 'fumadocs-openapi/requests/generators';
import { registerDefault } from 'fumadocs-openapi/requests/generators/all';
import { go } from 'fumadocs-openapi/requests/generators/go';
import { java } from 'fumadocs-openapi/requests/generators/java';

type GeneratorArguments = Parameters<CodeUsageGenerator['generate']>;

// Keep adapter-generated user data out of template rewrites. Go indents the
// body snippet, while Java inserts it at the top level; preserve either layout.
function patchRequestTemplate(
  generator: CodeUsageGenerator,
  data: GeneratorArguments[0],
  context: GeneratorArguments[1],
  patchTemplate: (code: string) => string,
  patchBody: (code: string) => string = (code) => code,
) {
  let bodyCode = '';
  const mediaAdapters = Object.fromEntries(
    Object.entries(context.mediaAdapters).map(([type, adapter]) => [
      type,
      {
        ...adapter,
        generateExample(...args: Parameters<typeof adapter.generateExample>) {
          const body = adapter.generateExample(...args);
          if (!body) return body;
          bodyCode = patchBody(body);
          return '// __docs_openapi_request_body__';
        },
      },
    ]),
  );
  const template = generator.generate(data, { ...context, mediaAdapters });
  return patchTemplate(template).replace(
    /^([ \t]*)\/\/ __docs_openapi_request_body__$/m,
    (_, indent: string) =>
      bodyCode
        .split('\n')
        .map((line) => (line ? indent + line : line))
        .join('\n'),
  );
}

function fixJavaBody(code: string) {
  return code.replace(
    /^var body = BodyPublishers\.ofString\("""([\s\S]*?)"""\);$/,
    (_, body: string) => {
      // Invert 11.2.2's tripleDoubleQuote escaping before encoding a Java
      // string literal; otherwise JSON escapes become literal request data.
      const text = body.replace(/\\([\\"])/g, '$1');
      return `var body = BodyPublishers.ofString(${JSON.stringify(text)});`;
    },
  );
}

export function createDocsCodeGenerators() {
  const registry = registerDefault(createCodeUsageGeneratorRegistry());
  // fumadocs-openapi 11.2.2 builds a request before assigning it to a Builder,
  // and its JSON adapter emits Java text blocks without the required newline.
  registry.add('java', {
    ...java,
    generate(data, context) {
      return patchRequestTemplate(
        java,
        data,
        context,
        (code) =>
          code
            .replace(
              'HttpRequest.Builder requestBuilder =',
              'HttpRequest request =',
            )
            .replace(
              'client.send(requestBuilder.build(),',
              'client.send(request,',
            ),
        fixJavaBody,
      );
    },
  });
  // A POST request body is an io.Reader; keep response bytes in another name.
  registry.add('go', {
    ...go,
    generate(data, context) {
      return patchRequestTemplate(go, data, context, (code) =>
        code
          .replace(
            'body, _ := ioutil.ReadAll(res.Body)',
            'responseBody, _ := ioutil.ReadAll(res.Body)',
          )
          .replace(
            'fmt.Println(string(body))',
            'fmt.Println(string(responseBody))',
          ),
      );
    },
  });
  return registry;
}
