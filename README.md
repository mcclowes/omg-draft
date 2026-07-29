# omg draft

A drafting desk for [OMG](https://github.com/mcclowes/omg) (OAS Markdown Grammar). Write `.omg.md` files in the left pane; the compiled OpenAPI 3.1 spec renders live on the right, as browsable docs or raw YAML.

## How it works

The editor holds a small virtual workspace (`api.omg.md`, `endpoints/*.omg.md`, `partials/*.omg.md`) persisted to localStorage. On each edit (debounced) the workspace is posted to `/api/compile`, which materializes the files in a temp directory and runs the real omg toolchain — `loadApi` → `compileToOpenApi` → `serialize` from `omg-parser` and `omg-compiler` — so behavior matches the CLI exactly, partials included.

Compile errors surface in a banner with the parser's message while the preview keeps showing the last good compile.

## Running

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Tests

Compile pipeline and OAS view-model helpers are covered with Vitest:

```bash
npm test
```

## Stack

- Next.js (App Router) + TypeScript + SCSS modules
- CodeMirror 6 for the editor panes
- `omg-parser` / `omg-compiler` for compilation
- Vitest
