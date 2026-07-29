'use client';

import { useEffect, useRef, useState } from 'react';
import type { OasDoc } from '@/lib/oas';
import type { WorkspaceFile } from '@/lib/workspace';

export interface CompileState {
  phase: 'compiling' | 'ok' | 'error';
  /** Last successful compile — kept during errors so the preview stays useful. */
  spec: OasDoc | null;
  yaml: string | null;
  error: string | null;
}

const DEBOUNCE_MS = 350;

export function useCompile(files: WorkspaceFile[], enabled: boolean): CompileState {
  const [state, setState] = useState<CompileState>({
    phase: 'compiling',
    spec: null,
    yaml: null,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) return;

    setState((prev) => ({ ...prev, phase: 'compiling' }));
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch('/api/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files }),
          signal: controller.signal,
        });
        const result = await response.json();
        if (controller.signal.aborted) return;

        if (result.ok) {
          setState({ phase: 'ok', spec: result.spec, yaml: result.yaml, error: null });
        } else {
          setState((prev) => ({ ...prev, phase: 'error', error: result.error }));
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setState((prev) => ({ ...prev, phase: 'error', error: (error as Error).message }));
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [files, enabled]);

  return state;
}
