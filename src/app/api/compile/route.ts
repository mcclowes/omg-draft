import { NextRequest, NextResponse } from 'next/server';
import { compileWorkspace, type WorkspaceFile } from '@/lib/compile';

const MAX_FILES = 200;
const MAX_TOTAL_BYTES = 2 * 1024 * 1024;

function parseFiles(body: unknown): WorkspaceFile[] | null {
  if (typeof body !== 'object' || body === null) return null;
  const files = (body as { files?: unknown }).files;
  if (!Array.isArray(files) || files.length === 0 || files.length > MAX_FILES) {
    return null;
  }

  let totalBytes = 0;
  const parsed: WorkspaceFile[] = [];
  for (const file of files) {
    if (typeof file !== 'object' || file === null) return null;
    const { path, content } = file as { path?: unknown; content?: unknown };
    if (typeof path !== 'string' || typeof content !== 'string') return null;
    totalBytes += content.length;
    if (totalBytes > MAX_TOTAL_BYTES) return null;
    parsed.push({ path, content });
  }
  return parsed;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const files = parseFiles(body);
  if (!files) {
    return NextResponse.json(
      { ok: false, error: 'Expected { files: [{ path, content }] }' },
      { status: 400 }
    );
  }

  return NextResponse.json(compileWorkspace(files));
}
