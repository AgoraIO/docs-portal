import { get } from 'node:http';

export async function checkMeilisearchHealth(
  host = process.env.MEILI_HOST ?? 'http://127.0.0.1:7700',
): Promise<void> {
  const endpoint = new URL('/health', host);
  const message = `Meilisearch is not ready at ${endpoint.origin}/health`;
  try {
    await new Promise<void>((resolve, reject) => {
      const request = get(endpoint, { timeout: 2000 }, (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk: string) => {
          body += chunk;
        });
        response.on('end', () => {
          try {
            if (
              response.statusCode === 200 &&
              JSON.parse(body).status === 'available'
            )
              resolve();
            else reject(new Error(message));
          } catch {
            reject(new Error(message));
          }
        });
        response.on('error', reject);
      });
      request.on('timeout', () => request.destroy(new Error(message)));
      request.on('error', reject);
    });
  } catch {
    throw new Error(message);
  }
}
