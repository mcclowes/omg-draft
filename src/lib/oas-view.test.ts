import { describe, it, expect } from 'vitest';
import { groupByTag, resolveSchema, schemaLabel } from './oas-view';
import type { OasDoc } from './oas';

const doc: OasDoc = {
  openapi: '3.1.0',
  info: { title: 'Test', version: '1.0.0' },
  tags: [{ name: 'Todos', description: 'Todo things' }],
  paths: {
    '/todos': {
      get: { operationId: 'list-todos', tags: ['Todos'] },
      post: { operationId: 'create-todo', tags: ['Todos'] },
    },
    '/health': {
      get: { operationId: 'health' },
    },
  },
  components: {
    schemas: {
      Todo: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
    },
  },
};

describe('groupByTag', () => {
  it('groups operations under declared tags, untagged last', () => {
    const groups = groupByTag(doc);

    expect(groups.map((g) => g.tag)).toEqual(['Todos', 'Other']);
    expect(groups[0].description).toBe('Todo things');
    expect(groups[0].operations.map((o) => o.operation.operationId)).toEqual([
      'list-todos',
      'create-todo',
    ]);
    expect(groups[1].operations[0].path).toBe('/health');
  });
});

describe('resolveSchema', () => {
  it('follows $ref into components.schemas', () => {
    const resolved = resolveSchema(doc, { $ref: '#/components/schemas/Todo' });
    expect(resolved.schema.type).toBe('object');
    expect(resolved.refName).toBe('Todo');
  });

  it('returns inline schemas untouched', () => {
    const resolved = resolveSchema(doc, { type: 'string' });
    expect(resolved.schema.type).toBe('string');
    expect(resolved.refName).toBeUndefined();
  });
});

describe('schemaLabel', () => {
  it('labels primitives with format', () => {
    expect(schemaLabel({ type: 'string', format: 'uuid' })).toBe('string · uuid');
    expect(schemaLabel({ type: 'integer' })).toBe('integer');
  });

  it('labels enums with their values', () => {
    expect(schemaLabel({ type: 'string', enum: ['low', 'high'] })).toBe('"low" | "high"');
  });

  it('labels arrays by their item type', () => {
    expect(schemaLabel({ type: 'array', items: { type: 'string' } })).toBe('string[]');
    expect(schemaLabel({ type: 'array', items: { type: 'object' } })).toBe('object[]');
  });

  it('labels refs by name', () => {
    expect(schemaLabel({ $ref: '#/components/schemas/Todo' })).toBe('Todo');
  });

  it('labels nullable union types', () => {
    expect(schemaLabel({ type: ['string', 'null'] })).toBe('string | null');
  });
});
