---
name: omg
# IMPORTANT: Keep description on ONE line for Claude Code compatibility
# prettier-ignore
description: Use when writing or editing .omg.md files - the human-first DSL for API specification that compiles to OpenAPI 3.1
---

# OMG (OpenAPI Markdown Grammar)

## Quick Start

```markdown
---
method: GET
path: /accounts/{accountId}
operationId: get-account
tags: [Accounts]
---
# Get Account
Returns details of a specific account.
```omg.path
{ accountId: uuid }
```
```omg.response
{ id: uuid, name: string, balance: decimal }
```
```

## Core Concepts

- **`.omg.md` files** - Markdown with YAML frontmatter, one endpoint per file
- **Code blocks**: `omg.path`, `omg.query`, `omg.body`, `omg.response`, `omg.response.{code}`, `omg.returns`, `omg.type`
- **Types**: `string`, `integer`, `decimal`, `boolean`, `date`, `datetime`, `uuid`, `any`
- **Syntax**: `field?: type` (optional), `type[]` (array), `"a"|"b"` (enum), `@min(0)` (constraints)
- **Partials**: `@path/to/partial`, `{{> path/to/partial }}`, or a Markdown link to a `.omg.md` file (`[label](../partials/x.omg.md)`, resolved relative to the document and clickable in GitHub) for reuse

## CLI

```bash
npx omg-md-cli build api.omg.md -o output.yaml
npx omg-md-cli parse endpoint.omg.md
```

## In this repo (omg-draft)

- Compilation goes through `src/lib/compile.ts` — temp-dir materialisation + `loadApi`/`compileToOpenApi` from the published `omg-parser`/`omg-compiler` packages
- The seeded example workspace (`.omg.md` sources) lives in `src/lib/example.ts`

## Notes

- Compiles to OpenAPI 3.1, ~6x reduction in lines
