'use client';

import { useCallback, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import type { WorkspaceFile } from '@/lib/workspace';
import { editorExtensions } from './editor-theme';
import styles from './EditorPane.module.scss';

interface EditorPaneProps {
  files: WorkspaceFile[];
  activePath: string;
  onSelect: (path: string) => void;
  onChange: (path: string, content: string) => void;
  onAdd: (path: string) => void;
  onDelete: (path: string) => void;
}

const extensions = [markdown(), ...editorExtensions];

export function EditorPane({ files, activePath, onSelect, onChange, onAdd, onDelete }: EditorPaneProps) {
  const [adding, setAdding] = useState(false);
  const [newPath, setNewPath] = useState('endpoints/');

  const active = files.find((f) => f.path === activePath) ?? files[0];

  const commitAdd = useCallback(() => {
    const trimmed = newPath.trim();
    if (trimmed && trimmed.endsWith('.omg.md')) {
      onAdd(trimmed);
      setAdding(false);
      setNewPath('endpoints/');
    } else if (trimmed) {
      onAdd(`${trimmed}.omg.md`);
      setAdding(false);
      setNewPath('endpoints/');
    }
  }, [newPath, onAdd]);

  const handleChange = useCallback(
    (value: string) => onChange(active.path, value),
    [active.path, onChange]
  );

  return (
    <div className={styles.pane}>
      <div className={styles.tabs}>
        {files.map((file) => (
          <div
            key={file.path}
            className={styles.tab}
            data-active={file.path === active.path}
            onClick={() => onSelect(file.path)}
          >
            <span className={styles.tabName}>{file.path}</span>
            {files.length > 1 && (
              <button
                className={styles.tabClose}
                title={`Delete ${file.path}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file.path);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}

        {adding ? (
          <input
            className={styles.addInput}
            autoFocus
            value={newPath}
            placeholder="endpoints/new.omg.md"
            onChange={(e) => setNewPath(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitAdd();
              if (e.key === 'Escape') setAdding(false);
            }}
            onBlur={() => setAdding(false)}
          />
        ) : (
          <button className={styles.addButton} title="New file" onClick={() => setAdding(true)}>
            +
          </button>
        )}
      </div>

      <div className={styles.editor}>
        <CodeMirror
          key={active.path}
          value={active.content}
          onChange={handleChange}
          extensions={extensions}
          theme="none"
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            searchKeymap: true,
          }}
        />
      </div>
    </div>
  );
}
