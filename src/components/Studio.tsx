'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { exampleWorkspace } from '@/lib/example';
import { loadWorkspace, saveWorkspace, type Workspace } from '@/lib/workspace';
import { EditorPane } from './EditorPane';
import { PreviewPane } from './PreviewPane';
import { useCompile } from './useCompile';
import styles from './Studio.module.scss';

export function Studio() {
  const [workspace, setWorkspace] = useState<Workspace>(exampleWorkspace);
  const [hydrated, setHydrated] = useState(false);
  const [split, setSplit] = useState(50);
  const workbenchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // localStorage is only readable after mount; SSR must render the example.
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = loadWorkspace();
    if (stored) setWorkspace(stored);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) saveWorkspace(workspace);
  }, [workspace, hydrated]);

  const compile = useCompile(workspace.files, hydrated);

  const updateFile = useCallback((path: string, content: string) => {
    setWorkspace((ws) => ({
      ...ws,
      files: ws.files.map((f) => (f.path === path ? { ...f, content } : f)),
    }));
  }, []);

  const selectFile = useCallback((path: string) => {
    setWorkspace((ws) => ({ ...ws, activePath: path }));
  }, []);

  const addFile = useCallback((path: string) => {
    setWorkspace((ws) => {
      if (ws.files.some((f) => f.path === path)) {
        return { ...ws, activePath: path };
      }
      const content = path.startsWith('partials/')
        ? ''
        : `---\nmethod: GET\npath: /\n---\n\n# New Endpoint\n`;
      return { ...ws, files: [...ws.files, { path, content }], activePath: path };
    });
  }, []);

  const deleteFile = useCallback((path: string) => {
    setWorkspace((ws) => {
      if (ws.files.length <= 1) return ws;
      const files = ws.files.filter((f) => f.path !== path);
      return {
        files,
        activePath: ws.activePath === path ? files[0].path : ws.activePath,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setWorkspace(exampleWorkspace());
  }, []);

  const onDividerDown = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    const workbench = workbenchRef.current;
    if (!workbench) return;

    const move = (e: PointerEvent) => {
      const rect = workbench.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.min(72, Math.max(28, pct)));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }, []);

  return (
    <div className={styles.studio}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.wordmark}>
            omg<em>draft</em>
          </span>
          <span className={styles.tagline}>OAS markdown grammar · drafting desk</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.status} data-phase={compile.phase}>
            <span className={styles.lamp} />
            {compile.phase === 'compiling' && 'compiling'}
            {compile.phase === 'ok' && 'spec compiled'}
            {compile.phase === 'error' && 'draft has errors'}
          </span>
          <button className={styles.resetButton} onClick={reset} title="Restore the example workspace">
            reset example
          </button>
        </div>
      </header>

      <div className={styles.workbench} ref={workbenchRef}>
        <section className={styles.editorSide} style={{ width: `${split}%` }}>
          <EditorPane
            files={workspace.files}
            activePath={workspace.activePath}
            onSelect={selectFile}
            onChange={updateFile}
            onAdd={addFile}
            onDelete={deleteFile}
          />
        </section>

        <div
          className={styles.divider}
          onPointerDown={onDividerDown}
          role="separator"
          aria-orientation="vertical"
        >
          <span />
        </div>

        <section className={styles.previewSide}>
          <PreviewPane compile={compile} />
        </section>
      </div>
    </div>
  );
}
