import { describe, it, expect } from 'vitest';
import { compileWorkspace } from './compile';

const API_ROOT = `---
name: Todo API
version: 1.2.0
baseUrl: https://api.example.com/v1
---

# Todo API

A simple REST API for managing todos.
`;

const LIST_TODOS = `---
method: GET
path: /todos
operationId: list-todos
tags: [Todos]
---

# List Todos

Returns all todos.

\`\`\`omg.query
{
  limit?: integer @min(1) @max(100)
}
\`\`\`

\`\`\`omg.response
{
  data: [{ id: uuid, title: string, completed: boolean }]
}
\`\`\`
`;

describe('compileWorkspace', () => {
  it('compiles a lone api root to an OpenAPI 3.1 document', () => {
    const result = compileWorkspace([{ path: 'api.omg.md', content: API_ROOT }]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.spec.openapi).toBe('3.1.0');
    expect(result.spec.info.title).toBe('Todo API');
    expect(result.spec.info.version).toBe('1.2.0');
    expect(result.yaml).toContain('openapi: "3.1.0"');
  });

  it('compiles endpoint files into paths and operations', () => {
    const result = compileWorkspace([
      { path: 'api.omg.md', content: API_ROOT },
      { path: 'endpoints/list-todos.omg.md', content: LIST_TODOS },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const op = result.spec.paths?.['/todos']?.get;
    expect(op?.operationId).toBe('list-todos');
    expect(op?.responses?.['200']).toBeDefined();
  });

  it('resolves {{> partial }} references from the partials directory', () => {
    const withPartial = LIST_TODOS + '\n{{> error }}\n';
    const errorPartial = `\`\`\`omg.response.404
{
  error: "not_found",
  message: string
}
\`\`\`
`;
    const result = compileWorkspace([
      { path: 'api.omg.md', content: API_ROOT },
      { path: 'endpoints/list-todos.omg.md', content: withPartial },
      { path: 'partials/error.omg.md', content: errorPartial },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.spec.paths?.['/todos']?.get?.responses?.['404']).toBeDefined();
  });

  it('returns the parser error message for invalid syntax', () => {
    const broken = LIST_TODOS.replace('limit?: integer', 'limit?: {{{{');
    const result = compileWorkspace([
      { path: 'api.omg.md', content: API_ROOT },
      { path: 'endpoints/list-todos.omg.md', content: broken },
    ]);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/omg\.query|parse/i);
  });

  it('rejects file paths that escape the workspace', () => {
    const result = compileWorkspace([
      { path: '../outside.omg.md', content: API_ROOT },
    ]);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/path/i);
  });
});
