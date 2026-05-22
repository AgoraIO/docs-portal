import type { OpenApiJsonValue } from './json';

export type OpenApiHttpMethod =
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE';

export type OpenApiParameterLocation = 'cookie' | 'header' | 'path' | 'query';

export type OpenApiParameter = {
  description?: string;
  example?: OpenApiJsonValue;
  examples?: Record<string, { value?: OpenApiJsonValue }>;
  in: OpenApiParameterLocation;
  name: string;
  required: boolean;
  schema?: OpenApiJsonValue;
};

export type NormalizedOpenApiMedia = {
  example?: OpenApiJsonValue;
  examples?: Record<string, { value?: OpenApiJsonValue }>;
  schema?: OpenApiJsonValue;
};

export type OpenApiResponse = {
  content?: Record<string, NormalizedOpenApiMedia>;
  description?: string;
};

export type NormalizedOpenApiOperation = {
  description?: string;
  method: OpenApiHttpMethod;
  operationId: string;
  parameters: OpenApiParameter[];
  path: string;
  requestBody?: {
    content: Record<string, NormalizedOpenApiMedia>;
    contentTypes: string[];
    description?: string;
    required: boolean;
  };
  responses: Record<string, OpenApiResponse>;
  security?: OpenApiJsonValue;
  servers: { description?: string; url: string }[];
  summary?: string;
};

export type OpenApiSchemaRow = {
  defaultValue?: OpenApiJsonValue;
  deprecated?: boolean;
  depth: number;
  description?: string;
  enumValues?: OpenApiJsonValue[];
  example?: OpenApiJsonValue;
  format?: string;
  maximum?: number;
  minimum?: number;
  name: string;
  nullable?: boolean;
  path: string;
  readOnly?: boolean;
  required: boolean;
  type: string;
  writeOnly?: boolean;
};

export type OpenApiExamples = {
  curl: string;
  javascript: string;
  requestBodyJson?: OpenApiJsonValue;
  responseBodyJson?: OpenApiJsonValue;
  responseStatus?: string;
};

export type OpenApiOperationPayload = {
  examples: OpenApiExamples;
  operation: NormalizedOpenApiOperation;
  publicSourceUrl: string;
  requestSchemaRows: OpenApiSchemaRow[];
  responseSchemaRows: Record<string, OpenApiSchemaRow[]>;
};
