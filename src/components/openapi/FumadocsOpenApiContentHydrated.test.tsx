import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./FumadocsOpenApiContent', () => ({
  FumadocsOpenApiContent: ({
    payloadMeta,
  }: {
    payloadMeta: { operations?: { path: string }[] };
  }) => (
    <div data-testid="fumadocs-openapi-content">
      {payloadMeta.operations?.[0]?.path}
    </div>
  ),
}));

describe('FumadocsOpenApiContentHydrated', () => {
  it('renders the OpenAPI content with the provided page props', async () => {
    const { FumadocsOpenApiContentHydrated } = await import(
      './FumadocsOpenApiContentHydrated'
    );

    render(
      <FumadocsOpenApiContentHydrated
        payloadAssetPath="/generated/openapi/page-payloads/en/convoai/start-agent.json"
        payloadMeta={{
          document: 'convoai-en',
          operations: [{ method: 'post', path: '/v2/projects/{appid}/join' }],
          showDescription: true,
        }}
      />,
    );

    expect(
      await screen.findByTestId('fumadocs-openapi-content'),
    ).toHaveTextContent('/v2/projects/{appid}/join');
  });
});
