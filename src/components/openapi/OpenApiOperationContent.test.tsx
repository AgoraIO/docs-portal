import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { OpenApiOperationContent } from './OpenApiOperationContent';

describe('OpenApiOperationContent', () => {
  it('renders method, path, source link, and expanded schema rows', () => {
    render(
      <AppProviders>
        <OpenApiOperationContent
          examples={{
            curl: 'curl -X POST "https://api.example.com/v1/items"',
            javascript: "await fetch('https://api.example.com/v1/items')",
          }}
          operation={{
            description: 'Create an agent.',
            method: 'POST',
            operationId: 'start-agent',
            parameters: [],
            path: '/v2/projects/{appid}/join',
            requestBody: {
              content: {},
              contentTypes: ['application/json'],
              required: true,
            },
            responses: {},
            servers: [
              {
                url: 'https://api.agora.io/cn/api/conversational-ai-agent',
              },
            ],
            summary: 'Start a conversational AI agent',
          }}
          publicSourceUrl="/openapi/conversational-ai/convoai.yaml"
          requestSchemaRows={[
            {
              depth: 2,
              name: 'url',
              path: 'properties.llm.url',
              required: false,
              type: 'string',
            },
          ]}
          responseSchemaRows={{}}
        />
      </AppProviders>,
    );

    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('/v2/projects/{appid}/join')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /OpenAPI source/i }),
    ).toHaveAttribute('href', '/openapi/conversational-ai/convoai.yaml');
    expect(screen.getByText('properties.llm.url')).toBeInTheDocument();
  });
});
