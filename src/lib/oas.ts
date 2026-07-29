// Minimal client-safe OpenAPI 3.1 types covering what the omg compiler emits.

export interface OasSchema {
  $ref?: string;
  type?: string | string[];
  format?: string;
  title?: string;
  description?: string;
  properties?: Record<string, OasSchema>;
  required?: string[];
  items?: OasSchema;
  enum?: unknown[];
  const?: unknown;
  oneOf?: OasSchema[];
  anyOf?: OasSchema[];
  allOf?: OasSchema[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  pattern?: string;
  default?: unknown;
  example?: unknown;
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  additionalProperties?: boolean | OasSchema;
  [key: string]: unknown;
}

export interface OasParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: OasSchema;
}

export interface OasMediaType {
  schema?: OasSchema;
  example?: unknown;
  examples?: Record<string, { value?: unknown; summary?: string }>;
}

export interface OasRequestBody {
  description?: string;
  required?: boolean;
  content?: Record<string, OasMediaType>;
}

export interface OasResponse {
  description?: string;
  content?: Record<string, OasMediaType>;
  headers?: Record<string, unknown>;
}

export interface OasOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  parameters?: OasParameter[];
  requestBody?: OasRequestBody;
  responses?: Record<string, OasResponse>;
  security?: Record<string, string[]>[];
}

export type OasPathItem = Partial<
  Record<'get' | 'put' | 'post' | 'delete' | 'patch' | 'head' | 'options' | 'trace', OasOperation>
>;

export interface OasDoc {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    contact?: { name?: string; email?: string; url?: string };
    license?: { name?: string; url?: string };
  };
  servers?: { url: string; description?: string }[];
  paths?: Record<string, OasPathItem>;
  components?: {
    schemas?: Record<string, OasSchema>;
    securitySchemes?: Record<string, unknown>;
  };
  tags?: { name: string; description?: string }[];
}

export const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];
