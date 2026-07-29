// Client-safe workspace model and persistence.

export interface WorkspaceFile {
  path: string;
  content: string;
}

export interface Workspace {
  files: WorkspaceFile[];
  activePath: string;
}

const STORAGE_KEY = 'omg-draft-workspace-v1';

export function loadWorkspace(): Workspace | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Workspace;
    if (!Array.isArray(parsed.files) || parsed.files.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWorkspace(workspace: Workspace): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  } catch {
    // Storage full or unavailable — the draft just won't persist.
  }
}
