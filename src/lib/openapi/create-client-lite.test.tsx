import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { createClientAPIPageLite } from './create-client-lite';

describe('createClientAPIPageLite', () => {
  it('renders OpenAPI operations with inline schema content', async () => {
    const ClientAPIPage = createClientAPIPageLite({
      playground: {
        enabled: false,
      },
    });

    render(
      <Suspense fallback={null}>
        <ClientAPIPage
          operations={[
            {
              method: 'post',
              path: '/v2/projects/{appid}/join',
            },
          ]}
          payload={{
            bundled: {
              info: {
                title: 'Conversational AI Agent API Overview',
              },
              openapi: '3.2.0',
              paths: {
                '/v2/projects/{appid}/join': {
                  post: {
                    operationId: 'start-agent',
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            properties: {
                              name: {
                                description: 'Unique agent name.',
                                type: 'string',
                              },
                            },
                            required: ['name'],
                            type: 'object',
                          },
                        },
                      },
                    },
                    responses: {
                      '200': {
                        description: 'OK',
                      },
                    },
                  },
                },
              },
            },
          }}
        />
      </Suspense>,
    );

    expect(
      await screen.findByText('/v2/projects/{appid}/join'),
    ).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('Unique agent name.')).toBeInTheDocument();
  });
});
