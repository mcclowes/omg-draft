import type { Workspace } from './workspace';

const API = `---
name: Todo API
version: 1.0.0
baseUrl: https://api.example.com/v1
tags:
  - name: Todos
    description: Create and manage todo items
---

# Todo API

A simple REST API for managing todos, drafted in OMG
(OAS Markdown Grammar). Edit any file on the left —
the compiled OpenAPI 3.1 spec renders on the right.
`;

const LIST_TODOS = `---
method: GET
path: /todos
operationId: list-todos
tags: [Todos]
---

# List Todos

Returns a paginated list of todos. Optionally filter by completion status.

\`\`\`omg.query
{
  status?: "pending" | "completed" | "all",  // Filter by status (default: all)
  limit?: integer @min(1) @max(100),         // Max items to return (default: 20)
  offset?: integer @min(0)                   // Number of items to skip
}
\`\`\`

\`\`\`omg.response
{
  data: [{
    id: uuid,
    title: string,
    description: string?,
    completed: boolean,
    priority: "low" | "medium" | "high",
    due_date: date?,
    created_at: datetime
  }],
  pagination: {
    total: integer,
    limit: integer,
    offset: integer,
    has_more: boolean
  }
}
\`\`\`

{{> error }}
`;

const CREATE_TODO = `---
method: POST
path: /todos
operationId: create-todo
tags: [Todos]
---

# Create Todo

Creates a new todo item.

\`\`\`omg.body
{
  title: string @minLength(1) @maxLength(200),  // Todo title (required)
  description?: string @maxLength(2000),        // Detailed description
  priority?: "low" | "medium" | "high",         // Priority level (default: medium)
  due_date?: date                               // Optional due date
}
\`\`\`

\`\`\`omg.response.201
{
  id: uuid,
  title: string,
  description: string?,
  completed: boolean,
  priority: "low" | "medium" | "high",
  due_date: date?,
  created_at: datetime
}
\`\`\`

{{> error }}
`;

const GET_TODO = `---
method: GET
path: /todos/{todoId}
operationId: get-todo
tags: [Todos]
---

# Get Todo

Fetch a single todo by its id.

\`\`\`omg.path
{
  todoId: uuid  // The todo's unique id
}
\`\`\`

\`\`\`omg.response
{
  id: uuid,
  title: string,
  description: string?,
  completed: boolean,
  priority: "low" | "medium" | "high",
  due_date: date?,
  created_at: datetime
}
\`\`\`

{{> error }}
`;

const ERROR_PARTIAL = `\`\`\`omg.response.400
{
  error: "bad_request",
  message: string  // Description of what was invalid
}
\`\`\`

\`\`\`omg.response.404
{
  error: "not_found",
  message: string
}
\`\`\`
`;

export function exampleWorkspace(): Workspace {
  return {
    files: [
      { path: 'api.omg.md', content: API },
      { path: 'endpoints/list-todos.omg.md', content: LIST_TODOS },
      { path: 'endpoints/create-todo.omg.md', content: CREATE_TODO },
      { path: 'endpoints/get-todo.omg.md', content: GET_TODO },
      { path: 'partials/error.omg.md', content: ERROR_PARTIAL },
    ],
    activePath: 'endpoints/list-todos.omg.md',
  };
}
