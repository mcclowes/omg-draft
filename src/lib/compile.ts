import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { loadApi } from 'omg-parser';
import { compileToOpenApi, serialize, type OpenApiSpec } from 'omg-compiler';
import type { WorkspaceFile } from './workspace';

export type { WorkspaceFile };

export type CompileResult =
  | { ok: true; spec: OpenApiSpec; yaml: string }
  | { ok: false; error: string };

// Compiles by materialising the workspace in a temp dir and running the real
// omg toolchain (loadApi resolves partials against the filesystem).
export function compileWorkspace(files: WorkspaceFile[]): CompileResult {
  if (files.length === 0) {
    return { ok: false, error: 'Workspace is empty' };
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omg-draft-'));
  try {
    for (const file of files) {
      const target = path.resolve(tempDir, file.path);
      if (!target.startsWith(tempDir + path.sep)) {
        return { ok: false, error: `Invalid file path: ${file.path}` };
      }
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, file.content);
    }

    const root = files.find((f) => f.path === 'api.omg.md') ?? files[0];
    const api = loadApi(path.join(tempDir, root.path), { noCache: true });
    const spec = compileToOpenApi(api);
    return { ok: true, spec, yaml: serialize(spec, 'yaml') };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
