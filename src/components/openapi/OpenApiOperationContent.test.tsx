import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import {
  OpenApiExamplesRail,
  OpenApiOperationContent,
} from './OpenApiOperationContent';

describe('OpenApiOperationContent', () => {
  it('renders method, path, source link, and expanded schema rows', () => {
    render(
      <AppProviders>
        <OpenApiOperationContent
          examples={{
            curl: 'curl -X POST "https://api.example.com/v1/items"',
            javascript:
              "const response = await fetch('https://api.example.com/v1/items')",
            responseBodyJson: {
              agent_id: 'agent-id',
            },
            responseStatus: '200',
          }}
          operation={{
            description: 'Create an agent.',
            method: 'POST',
            operationId: 'start-agent',
            parameters: [
              {
                description: 'Project ID.',
                in: 'path',
                name: 'appid',
                required: true,
                schema: { type: 'string' },
              },
              {
                description: 'Agora token.',
                in: 'header',
                name: 'Authorization',
                required: true,
                schema: { type: 'string' },
              },
            ],
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
              enumValues: ['https://example.com'],
              format: 'uri',
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
    expect(
      screen.getByRole('heading', { name: 'Authorization' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Path parameters')).toBeInTheDocument();
    expect(screen.getByText('Format uri')).toBeInTheDocument();
    expect(screen.getByText('Enum https://example.com')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /execute|send|try/i })).toBeNull();
  });

  it('renders examples in a separate rail', () => {
    render(
      <AppProviders>
        <OpenApiExamplesRail
          examples={{
            curl: 'curl -X POST "https://api.example.com/v1/items"',
            javascript:
              "const response = await fetch('https://api.example.com/v1/items')",
            responseBodyJson: {
              agent_id: 'agent-id',
            },
            responseStatus: '200',
          }}
        />
      </AppProviders>,
    );

    expect(screen.getByText('Code & Examples')).toBeInTheDocument();
    expect(screen.getByText(/curl -X POST/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Copy cURL example/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Response 200' })).toBeInTheDocument();
  });

  it('renders response schemas in operation content', () => {
    render(
      <AppProviders>
        <OpenApiOperationContent
          examples={{
            curl: 'curl -X GET "https://api.example.com/v1/items"',
            javascript:
              "const response = await fetch('https://api.example.com/v1/items')",
            responseBodyJson: {
              ok: true,
            },
            responseStatus: '200',
          }}
          operation={{
            method: 'GET',
            operationId: 'list-items',
            parameters: [],
            path: '/v1/items',
            responses: {
              '200': {
                description: 'OK',
              },
            },
            servers: [],
            summary: 'List items',
          }}
          publicSourceUrl="/openapi/example.yaml"
          requestSchemaRows={[]}
          responseSchemaRows={{
            '200': [
              {
                depth: 0,
                name: 'ok',
                path: 'ok',
                required: true,
                type: 'boolean',
              },
            ],
          }}
        />
      </AppProviders>,
    );

    expect(screen.getByText('ok')).toBeInTheDocument();
    expect(within(screen.getByText('Responses').closest('section')!).getByText('200')).toBeInTheDocument();
  });
});
