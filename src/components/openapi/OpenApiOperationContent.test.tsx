import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { OpenApiOperationContent } from './OpenApiOperationContent';

describe('OpenApiOperationContent', () => {
  it('renders method, path, source link, and schema tree fields', () => {
    render(
      <AppProviders>
        <OpenApiOperationContent
          operation={{
            description: '创建一个对话式智能体实例。',
            method: 'POST',
            operationId: 'start-agent',
            parameters: [],
            path: '/v2/projects/{appid}/join',
            requestBody: {
              content: {},
              contentTypes: ['application/json'],
            },
            responses: {},
            servers: [
              {
                url: 'https://api.agora.io/cn/api/conversational-ai-agent',
              },
            ],
            summary: '创建对话式智能体',
          }}
          publicSourceUrl="/openapi/conversational-ai/convoai.yaml"
          requestSchemaTree={[
            {
              children: [],
              name: 'name',
              path: 'name',
              required: true,
              type: 'string',
            },
          ]}
          responseSchemaTrees={{}}
        />
      </AppProviders>,
    );

    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('/v2/projects/{appid}/join')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /OpenAPI source/i }),
    ).toHaveAttribute('href', '/openapi/conversational-ai/convoai.yaml');
    expect(screen.getByText('name')).toBeInTheDocument();
  });
});
