import { createCodeUsageGeneratorRegistry } from 'fumadocs-openapi/requests/generators';
import { registerDefault } from 'fumadocs-openapi/requests/generators/all';
import { go } from 'fumadocs-openapi/requests/generators/go';
import { java } from 'fumadocs-openapi/requests/generators/java';

export function createDocsCodeGenerators() {
  const registry = registerDefault(createCodeUsageGeneratorRegistry());
  // fumadocs-openapi 11.2.2 builds a request before assigning it to a Builder,
  // and its JSON adapter emits Java text blocks without the required newline.
  registry.add('java', {
    ...java,
    generate(data, context) {
      return java
        .generate(data, context)
        .replace(
          'HttpRequest.Builder requestBuilder =',
          'HttpRequest request =',
        )
        .replace('client.send(requestBuilder.build(),', 'client.send(request,')
        .replace(/"""([\s\S]*?)"""/g, (_, body: string) =>
          JSON.stringify(body),
        );
    },
  });
  // A POST request body is an io.Reader; keep response bytes in another name.
  registry.add('go', {
    ...go,
    generate(data, context) {
      return go
        .generate(data, context)
        .replace(
          'body, _ := ioutil.ReadAll(res.Body)',
          'responseBody, _ := ioutil.ReadAll(res.Body)',
        )
        .replace(
          'fmt.Println(string(body))',
          'fmt.Println(string(responseBody))',
        );
    },
  });
  return registry;
}
