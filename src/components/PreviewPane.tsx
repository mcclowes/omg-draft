'use client';

import { useCallback, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { EditorView } from '@codemirror/view';
import { yamlViewExtensions } from './editor-theme';
import { DocsView } from './DocsView';
import type { CompileState } from './useCompile';
import styles from './PreviewPane.module.scss';

const yamlExtensions = [yaml(), EditorView.editable.of(false), ...yamlViewExtensions];

export function PreviewPane({ compile }: { compile: CompileState }) {
  const [view, setView] = useState<'docs' | 'yaml'>('docs');
  const [copied, setCopied] = useState(false);

  const copyYaml = useCallback(async () => {
    if (!compile.yaml) return;
    await navigator.clipboard.writeText(compile.yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }, [compile.yaml]);

  const downloadYaml = useCallback(() => {
    if (!compile.yaml) return;
    const blob = new Blob([compile.yaml], { type: 'application/yaml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'openapi.yaml';
    anchor.click();
    URL.revokeObjectURL(url);
  }, [compile.yaml]);

  const stale = compile.phase === 'error' && compile.spec !== null;

  return (
    <div className={styles.sheet}>
      <div className={styles.toolbar}>
        <div className={styles.toggle} role="tablist">
          <button role="tab" aria-selected={view === 'docs'} data-active={view === 'docs'} onClick={() => setView('docs')}>
            docs
          </button>
          <button role="tab" aria-selected={view === 'yaml'} data-active={view === 'yaml'} onClick={() => setView('yaml')}>
            openapi.yaml
          </button>
        </div>
        <div className={styles.actions}>
          {stale && <span className={styles.staleStamp}>showing last good compile</span>}
          <button onClick={copyYaml} disabled={!compile.yaml}>
            {copied ? 'copied ✓' : 'copy yaml'}
          </button>
          <button onClick={downloadYaml} disabled={!compile.yaml}>
            download
          </button>
        </div>
      </div>

      {compile.phase === 'error' && (
        <div className={styles.errorBanner}>
          <span className={styles.errorLabel}>compile error</span>
          <pre>{compile.error}</pre>
        </div>
      )}

      <div className={styles.content} data-stale={stale}>
        {compile.spec === null && compile.phase !== 'error' && (
          <div className={styles.empty}>drafting…</div>
        )}
        {compile.spec === null && compile.phase === 'error' && (
          <div className={styles.empty}>fix the draft to see the rendered spec</div>
        )}
        {compile.spec !== null && view === 'docs' && <DocsView doc={compile.spec} />}
        {compile.spec !== null && view === 'yaml' && compile.yaml !== null && (
          <CodeMirror
            value={compile.yaml}
            extensions={yamlExtensions}
            theme="none"
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: false,
            }}
          />
        )}
      </div>
    </div>
  );
}
