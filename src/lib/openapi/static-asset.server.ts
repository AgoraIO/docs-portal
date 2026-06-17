export async function fetchStaticOpenApiJson<T>(
  request: Request,
  assetPath: `/${string}`,
) {
  const response = await fetch(new URL(assetPath, request.url));

  if (!response.ok) {
    throw new Error(`Failed to load static OpenAPI asset: ${assetPath}`);
  }

  return (await response.json()) as T;
}

export async function fetchStaticOpenApiText(
  request: Request,
  assetPath: `/${string}`,
) {
  const response = await fetch(new URL(assetPath, request.url)).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  return response.text();
}
