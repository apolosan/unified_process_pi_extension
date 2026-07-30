import { relative, resolve } from 'node:path';

const MAX_STATE_UPDATE_BYTES = 10 * 1024;
const ALLOWED_STATE_UPDATE_KEYS = new Set([
  'systemName',
  'vision',
  'currentIteration',
  'completedActivities',
  'artifacts',
  'recommendedNextCommand',
  'recommendedNextReason',
]);

export function resolveArtifactPath(
  cwd: string,
  requestedPath: string
): { absolutePath: string; artifactPath: string } {
  if (typeof requestedPath !== 'string' || !requestedPath.trim()) {
    throw new Error('Artifact path must be a non-empty relative path inside docs/up/.');
  }

  // Reject null-byte injection (C/PHP-style path truncation bypass). A
  // literal NUL in the path is never a legitimate filename character on
  // supported platforms; some downstream consumers (JSON parsers, fs APIs)
  // may truncate or mis-handle it.
  if (requestedPath.includes('\0')) {
    throw new Error('Artifact path must not contain null bytes.');
  }

  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(requestedPath);
  } catch {
    throw new Error('Artifact path must be a valid relative path inside docs/up/.');
  }

  // Re-decode check on the decoded form (catches double-encoded null bytes).
  if (decodedPath.includes('\0')) {
    throw new Error('Artifact path must not contain null bytes.');
  }

  const normalizedRequest = decodedPath.replace(/\\/g, '/');
  if (normalizedRequest.startsWith('/') || /^[a-zA-Z]:\//.test(normalizedRequest)) {
    throw new Error('Artifact path must be relative and remain inside docs/up/.');
  }

  const root = resolve(cwd, 'docs', 'up');
  const absolutePath = resolve(root, normalizedRequest);
  const relativeToRoot = relative(root, absolutePath).replace(/\\/g, '/');

  if (!relativeToRoot || relativeToRoot.startsWith('../') || relativeToRoot === '..') {
    throw new Error('Artifact path must remain inside docs/up/.');
  }

  return { absolutePath, artifactPath: relativeToRoot };
}

export function parseStateUpdates(rawUpdates: string): Record<string, unknown> {
  if (Buffer.byteLength(rawUpdates, 'utf8') > MAX_STATE_UPDATE_BYTES) {
    throw new Error('UP state update payload is too large; maximum size is 10 KB.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawUpdates);
  } catch {
    throw new Error('UP state update must be valid JSON.');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('UP state update must be a JSON object.');
  }

  const updates = parsed as Record<string, unknown>;
  const unknownKeys = Object.keys(updates).filter((key) => !ALLOWED_STATE_UPDATE_KEYS.has(key));
  if (unknownKeys.length) {
    throw new Error(`UP state update contains unsupported field(s): ${unknownKeys.join(', ')}.`);
  }

  return updates;
}
