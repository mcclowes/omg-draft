import { HTTP_METHODS, type HttpMethod, type OasDoc, type OasOperation, type OasSchema } from './oas';

export interface OperationEntry {
  path: string;
  method: HttpMethod;
  operation: OasOperation;
}

export interface TagGroup {
  tag: string;
  description?: string;
  operations: OperationEntry[];
}

const UNTAGGED = 'Other';

// Declared tag order first, then discovery order; untagged operations last.
export function groupByTag(doc: OasDoc): TagGroup[] {
  const groups = new Map<string, TagGroup>();
  for (const tag of doc.tags ?? []) {
    groups.set(tag.name, { tag: tag.name, description: tag.description, operations: [] });
  }

  for (const [path, pathItem] of Object.entries(doc.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!operation) continue;
      const tag = operation.tags?.[0] ?? UNTAGGED;
      if (!groups.has(tag)) {
        groups.set(tag, { tag, operations: [] });
      }
      groups.get(tag)!.operations.push({ path, method, operation });
    }
  }

  const result = [...groups.values()].filter((g) => g.operations.length > 0);
  return [...result.filter((g) => g.tag !== UNTAGGED), ...result.filter((g) => g.tag === UNTAGGED)];
}

export interface ResolvedSchema {
  schema: OasSchema;
  refName?: string;
}

export function resolveSchema(doc: OasDoc, schema: OasSchema): ResolvedSchema {
  let current = schema;
  let refName: string | undefined;
  const seen = new Set<string>();

  while (current.$ref) {
    const ref = current.$ref;
    if (seen.has(ref)) break;
    seen.add(ref);
    const name = ref.split('/').pop() ?? '';
    const target = doc.components?.schemas?.[name];
    if (!target) break;
    refName = name;
    current = target;
  }

  return { schema: current, refName };
}

export function schemaLabel(schema: OasSchema): string {
  if (schema.$ref) {
    return schema.$ref.split('/').pop() ?? 'ref';
  }
  if (schema.enum) {
    return schema.enum.map((v) => JSON.stringify(v)).join(' | ');
  }
  if (schema.const !== undefined) {
    return JSON.stringify(schema.const);
  }
  if (schema.oneOf) {
    return schema.oneOf.map(schemaLabel).join(' | ');
  }
  if (schema.anyOf) {
    return schema.anyOf.map(schemaLabel).join(' | ');
  }
  if (schema.allOf) {
    return schema.allOf.map(schemaLabel).join(' & ');
  }
  if (Array.isArray(schema.type)) {
    return schema.type.join(' | ');
  }
  if (schema.type === 'array') {
    return schema.items ? `${schemaLabel(schema.items)}[]` : 'array';
  }
  if (!schema.type) {
    return 'any';
  }
  return schema.format ? `${schema.type} · ${schema.format}` : schema.type;
}

// Human-readable constraint annotations, e.g. "min 1 · max 100".
export function schemaConstraints(schema: OasSchema): string[] {
  const constraints: string[] = [];
  if (schema.minimum !== undefined) constraints.push(`min ${schema.minimum}`);
  if (schema.maximum !== undefined) constraints.push(`max ${schema.maximum}`);
  if (schema.minLength !== undefined) constraints.push(`minLength ${schema.minLength}`);
  if (schema.maxLength !== undefined) constraints.push(`maxLength ${schema.maxLength}`);
  if (schema.minItems !== undefined) constraints.push(`minItems ${schema.minItems}`);
  if (schema.maxItems !== undefined) constraints.push(`maxItems ${schema.maxItems}`);
  if (schema.pattern) constraints.push(`pattern ${schema.pattern}`);
  if (schema.default !== undefined) constraints.push(`default ${JSON.stringify(schema.default)}`);
  return constraints;
}
