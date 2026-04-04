/**
 * Unified Process (UP) Extension — State Management
 * Restores state from pi session entries and from project-local artifacts/state files.
 */

import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';
import { deriveSystemNameFromVision } from './system-name.ts';

export type UPPhase = 'inception' | 'elaboration' | 'construction' | 'transition';

export type UPActivity =
  | 'vision'
  | 'requirements'
  | 'use-cases'
  | 'sequence-diagrams'
  | 'conceptual-model'
  | 'contracts'
  | 'tech-stack'
  | 'tdd'
  | 'design-patterns'
  | 'object-design'
  | 'interface-design'
  | 'design-system'
  | 'data-mapping'
  | 'implementation'
  | 'deploy'
  | 'documentation';

export type UPArtifactActivity = UPActivity | 'orchestrator' | 'unknown';

export interface UPArtifact {
  path: string;
  phase: UPPhase;
  activity: UPArtifactActivity;
  title: string;
  generated: number;
}

export interface UPState {
  systemName: string;
  vision: string;
  currentPhase: UPPhase;
  currentIteration: number;
  completedActivities: UPActivity[];
  artifacts: UPArtifact[];
  recommendedNextCommand: string | null;
  recommendedNextReason: string;
  lastUpdated: number;
}

interface ArtifactDefinition {
  matches: (artifactPath: string) => boolean;
  phase: UPPhase;
  activity: UPArtifactActivity;
  title: string | ((artifactPath: string) => string);
  completedActivity?: UPActivity;
}

/** Canonical order of UP activities */
export const ACTIVITY_ORDER: UPActivity[] = [
  'vision',
  'requirements',
  'use-cases',
  'sequence-diagrams',
  'conceptual-model',
  'contracts',
  'tech-stack',
  'tdd',
  'design-patterns',
  'object-design',
  'interface-design',
  'design-system',
  'data-mapping',
  'implementation',
  'deploy',
  'documentation',
];

export const PROJECT_STATE_RELATIVE_PATH = '.pi/unified-process/state.json';

export function normalizeRecommendedNextCommand(command: unknown): string | null {
  if (typeof command !== 'string') return null;

  const trimmed = command.trim();
  if (!trimmed) return null;

  if (/^\/up-next$/i.test(trimmed)) return '/up-next';
  if (/^\/skill:up-orchestrator$/i.test(trimmed)) return '/skill:up-orchestrator';

  const activityMatch = trimmed.match(/^\/skill:up-([a-z-]+)$/i);
  if (!activityMatch?.[1]) return null;

  const activity = activityMatch[1].toLowerCase() as UPActivity;
  if (!ACTIVITY_ORDER.includes(activity)) return null;

  return `/skill:up-${activity}`;
}

export function getRecommendedNextCommand(state: UPState): string | null {
  return normalizeRecommendedNextCommand(state.recommendedNextCommand);
}

export function clearRecommendedNextAction(state: UPState): UPState {
  return normalizeState({
    ...state,
    recommendedNextCommand: null,
    recommendedNextReason: '',
  });
}

export function getEffectiveNextCommand(state: UPState): string | null {
  const explicitNext = getRecommendedNextCommand(state);
  if (explicitNext) return explicitNext;

  const nextActivity = getNextActivity(state);
  return nextActivity ? `/skill:up-${nextActivity}` : null;
}

const ARTIFACT_DEFINITIONS: ArtifactDefinition[] = [
  {
    matches: (artifactPath) => artifactPath === '00-process-plan.md',
    phase: 'inception',
    activity: 'orchestrator',
    title: 'Unified Process Master Plan',
  },
  {
    matches: (artifactPath) => artifactPath === '01-vision.md',
    phase: 'inception',
    activity: 'vision',
    title: 'System Vision Document',
    completedActivity: 'vision',
  },
  {
    matches: (artifactPath) =>
      artifactPath === '02-requirements.md' || artifactPath === '02-use-case-list.md',
    phase: 'inception',
    activity: 'requirements',
    title: (artifactPath) =>
      artifactPath === '02-use-case-list.md' ? 'Use Case Catalog' : 'System Requirements',
    completedActivity: 'requirements',
  },
  {
    matches: (artifactPath) => artifactPath.startsWith('03-use-cases/'),
    phase: 'elaboration',
    activity: 'use-cases',
    title: (artifactPath) => `Expanded Use Case — ${humanizeArtifactName(artifactPath)}`,
    completedActivity: 'use-cases',
  },
  {
    matches: (artifactPath) =>
      artifactPath.startsWith('04-dss/') || artifactPath === '04-system-operations.md',
    phase: 'elaboration',
    activity: 'sequence-diagrams',
    title: (artifactPath) =>
      artifactPath === '04-system-operations.md'
        ? 'System Operations List'
        : `System Sequence Diagram — ${humanizeArtifactName(artifactPath)}`,
    completedActivity: 'sequence-diagrams',
  },
  {
    matches: (artifactPath) => artifactPath === '05-conceptual-model.md',
    phase: 'elaboration',
    activity: 'conceptual-model',
    title: 'Conceptual Model',
    completedActivity: 'conceptual-model',
  },
  {
    matches: (artifactPath) =>
      artifactPath.startsWith('06-contracts/') || artifactPath === '06-contracts-summary.md',
    phase: 'elaboration',
    activity: 'contracts',
    title: (artifactPath) =>
      artifactPath === '06-contracts-summary.md'
        ? 'Contracts Summary'
        : `System Operation Contract — ${humanizeArtifactName(artifactPath)}`,
    completedActivity: 'contracts',
  },
  {
    matches: (artifactPath) =>
      artifactPath === '11-tech-stack.md' || artifactPath === '11-tech-research.md',
    phase: 'construction',
    activity: 'tech-stack',
    title: (artifactPath) =>
      artifactPath === '11-tech-research.md' ? 'Technology Research Report' : 'Technology Stack Decision',
    completedActivity: 'tech-stack',
  },
  {
    matches: (artifactPath) =>
      artifactPath === '10-tdd-plan.md' || artifactPath.startsWith('10-tests/'),
    phase: 'construction',
    activity: 'tdd',
    title: (artifactPath) =>
      artifactPath === '10-tdd-plan.md'
        ? 'TDD Plan'
        : `TDD Artifact — ${humanizeArtifactName(artifactPath)}`,
    completedActivity: 'tdd',
  },
  {
    matches: (artifactPath) => artifactPath === '12-design-patterns.md',
    phase: 'construction',
    activity: 'design-patterns',
    title: 'Design Patterns Catalog',
    completedActivity: 'design-patterns',
  },
  {
    matches: (artifactPath) =>
      artifactPath === '07-dcp.md' || artifactPath.startsWith('07-design-sequences/'),
    phase: 'construction',
    activity: 'object-design',
    title: (artifactPath) =>
      artifactPath === '07-dcp.md'
        ? 'Design Class Diagram'
        : `Design Sequence — ${humanizeArtifactName(artifactPath)}`,
    completedActivity: 'object-design',
  },
  {
    matches: (artifactPath) => artifactPath === '08-interface-design.md',
    phase: 'construction',
    activity: 'interface-design',
    title: 'Interface Design',
    completedActivity: 'interface-design',
  },
  {
    matches: (artifactPath) =>
      artifactPath === '13-design-system.md' || artifactPath.startsWith('13-ui-code/'),
    phase: 'construction',
    activity: 'design-system',
    title: (artifactPath) =>
      artifactPath === '13-design-system.md'
        ? 'Design System Specification'
        : `UI Code Artifact — ${humanizeArtifactName(artifactPath)}`,
    completedActivity: 'design-system',
  },
  {
    matches: (artifactPath) => artifactPath === '09-data-model.md',
    phase: 'construction',
    activity: 'data-mapping',
    title: 'Data Model (ORM Mapping)',
    completedActivity: 'data-mapping',
  },
  {
    matches: (artifactPath) => artifactPath.startsWith('14-implementation/'),
    phase: 'construction',
    activity: 'implementation',
    title: (artifactPath) => `Implementation Artifact — ${humanizeArtifactName(artifactPath)}`,
    completedActivity: 'implementation',
  },
  {
    matches: (artifactPath) => artifactPath.startsWith('15-deploy/'),
    phase: 'transition',
    activity: 'deploy',
    title: (artifactPath) => `Deployment Artifact — ${humanizeArtifactName(artifactPath)}`,
    completedActivity: 'deploy',
  },
  {
    matches: (artifactPath) => artifactPath.startsWith('16-documentation/'),
    phase: 'transition',
    activity: 'documentation',
    title: (artifactPath) => `Documentation Artifact — ${humanizeArtifactName(artifactPath)}`,
    completedActivity: 'documentation',
  },
];

/** Creates the initial UP state from a system name and vision statement */
export function createInitialState(systemName: string, vision: string): UPState {
  return normalizeState({
    systemName,
    vision,
    currentPhase: 'inception',
    currentIteration: 1,
    completedActivities: [],
    artifacts: [],
    recommendedNextCommand: null,
    recommendedNextReason: '',
    lastUpdated: Date.now(),
  });
}

/**
 * Restores the most recent UP state from the pi session entries.
 * Looks for entries with customType === 'up-state'.
 */
export function restoreStateFromEntries(entries: any[]): UPState | null {
  const upEntries = entries.filter(
    (entry) => entry.type === 'custom' && entry.customType === 'up-state'
  );
  if (!upEntries.length) return null;
  return normalizeState(upEntries[upEntries.length - 1].data as Partial<UPState>);
}

export function getProjectStatePath(cwd: string): string {
  return join(cwd, PROJECT_STATE_RELATIVE_PATH);
}

export async function saveStateToProject(cwd: string, state: UPState): Promise<void> {
  const path = getProjectStatePath(cwd);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(normalizeState(state), null, 2)}\n`, 'utf8');
}

export async function loadStateFromProject(cwd: string): Promise<UPState | null> {
  try {
    const raw = await readFile(getProjectStatePath(cwd), 'utf8');
    return normalizeState(JSON.parse(raw) as Partial<UPState>);
  } catch {
    return null;
  }
}

export function inferArtifactMetadata(
  artifactPath: string
): {
  phase: UPPhase;
  activity: UPArtifactActivity;
  title: string;
  completedActivity?: UPActivity;
} | null {
  const normalizedPath = artifactPath.replace(/\\/g, '/');
  const definition = ARTIFACT_DEFINITIONS.find((candidate) =>
    candidate.matches(normalizedPath)
  );

  if (!definition) return null;

  return {
    phase: definition.phase,
    activity: definition.activity,
    title:
      typeof definition.title === 'function'
        ? definition.title(normalizedPath)
        : definition.title,
    completedActivity: definition.completedActivity,
  };
}

export async function inferStateFromProject(cwd: string): Promise<UPState | null> {
  const docsRoot = join(cwd, 'docs', 'up');

  let discoveredFiles: string[];
  try {
    discoveredFiles = await listFilesRecursive(docsRoot);
  } catch {
    return null;
  }

  const artifacts: UPArtifact[] = [];
  const completed = new Set<UPActivity>();

  for (const fullPath of discoveredFiles) {
    const relativePath = relative(docsRoot, fullPath).replace(/\\/g, '/');
    if (!relativePath || relativePath.startsWith('.') || relativePath === '.gitkeep') continue;

    const metadata = inferArtifactMetadata(relativePath);
    if (!metadata) continue;

    const info = await stat(fullPath);
    artifacts.push({
      path: relativePath,
      phase: metadata.phase,
      activity: metadata.activity,
      title: metadata.title,
      generated: info.mtimeMs,
    });

    if (metadata.completedActivity) {
      completed.add(metadata.completedActivity);
    }
  }

  if (!artifacts.length) return null;

  const planText = await safeReadFile(join(docsRoot, '00-process-plan.md'));
  const visionText = await safeReadFile(join(docsRoot, '01-vision.md'));
  const visionSummary = extractVisionSummary(planText) ?? extractVisionSummary(visionText) ?? '';
  const currentIteration = extractCurrentIteration(planText) ?? 1;
  const recommendedNextCommand = extractRecommendedNextCommand(planText);
  const recommendedNextReason = extractRecommendedNextReason(planText) ?? '';
  const lastUpdated = Math.max(...artifacts.map((artifact) => artifact.generated));
  const systemName = deriveRecoveredSystemName(visionSummary || visionText || planText || 'Recovered UP Project');

  return normalizeState({
    systemName,
    vision: visionSummary || visionText || '',
    currentIteration,
    completedActivities: [...completed],
    artifacts: artifacts.sort((a, b) => a.generated - b.generated),
    recommendedNextCommand,
    recommendedNextReason,
    lastUpdated,
  });
}

export async function restoreStateForProject(
  cwd: string,
  entries: any[] = []
): Promise<UPState | null> {
  const sessionState = restoreStateFromEntries(entries);
  const persistedState = await loadStateFromProject(cwd);
  const inferredState = await inferStateFromProject(cwd);

  const states = [sessionState, persistedState, inferredState].filter(
    (state): state is UPState => Boolean(state)
  );

  if (!states.length) return null;

  const base = states.reduce((best, candidate) =>
    compareStateCompleteness(candidate, best) > 0 ? candidate : best
  );

  const mergedArtifacts = mergeArtifacts(...states.map((state) => state.artifacts));

  return normalizeState({
    ...base,
    systemName:
      states.find((state) => state.systemName && state.systemName !== 'Unnamed System')?.systemName ??
      base.systemName,
    vision: states.find((state) => state.vision.trim())?.vision ?? base.vision,
    currentIteration: Math.max(...states.map((state) => state.currentIteration || 1)),
    completedActivities: normalizeActivities(states.flatMap((state) => state.completedActivities)),
    artifacts: mergedArtifacts,
    recommendedNextCommand:
      states.find((state) => getRecommendedNextCommand(state))?.recommendedNextCommand ??
      base.recommendedNextCommand,
    recommendedNextReason:
      states.find((state) => state.recommendedNextReason.trim())?.recommendedNextReason ??
      base.recommendedNextReason,
    lastUpdated: Math.max(...states.map((state) => state.lastUpdated || 0)),
  });
}

/**
 * Returns the next uncompleted activity in the canonical UP order.
 * Returns null if all activities have been completed.
 */
export function getNextActivity(state: UPState): UPActivity | null {
  return ACTIVITY_ORDER.find((activity) => !state.completedActivities.includes(activity)) ?? null;
}

/** Returns a short status summary for display in the footer/status bar. */
export function getStatusSummary(state: UPState): string {
  const next = getNextActivity(state);
  const done = state.completedActivities.length;
  const total = ACTIVITY_ORDER.length;
  return `UP[${state.currentPhase}/it${state.currentIteration}] ${done}/${total} ${next ?? 'DONE'}`;
}

/** Infers the current UP phase based on completed activities. */
export function computePhase(completedActivities: UPActivity[]): UPPhase {
  if (
    completedActivities.includes('deploy') ||
    completedActivities.includes('documentation')
  ) {
    return 'transition';
  }

  if (
    completedActivities.includes('tech-stack') ||
    completedActivities.includes('tdd') ||
    completedActivities.includes('design-patterns') ||
    completedActivities.includes('object-design') ||
    completedActivities.includes('interface-design') ||
    completedActivities.includes('design-system') ||
    completedActivities.includes('data-mapping') ||
    completedActivities.includes('implementation')
  ) {
    return 'construction';
  }

  if (
    completedActivities.includes('use-cases') ||
    completedActivities.includes('sequence-diagrams') ||
    completedActivities.includes('conceptual-model') ||
    completedActivities.includes('contracts')
  ) {
    return 'elaboration';
  }

  return 'inception';
}

export function normalizeActivities(activities: unknown): UPActivity[] {
  if (!Array.isArray(activities)) return [];
  const activitySet = new Set(
    activities.filter(
      (item): item is UPActivity => typeof item === 'string' && ACTIVITY_ORDER.includes(item as UPActivity)
    )
  );
  return ACTIVITY_ORDER.filter((activity) => activitySet.has(activity));
}

export function normalizeState(input: Partial<UPState>): UPState {
  const completedActivities = normalizeActivities(input.completedActivities ?? []);
  return {
    systemName: input.systemName ?? 'Unnamed System',
    vision: input.vision ?? '',
    currentPhase: computePhase(completedActivities),
    currentIteration: Math.max(1, Number(input.currentIteration ?? 1)),
    completedActivities,
    artifacts: normalizeArtifacts(input.artifacts),
    recommendedNextCommand: normalizeRecommendedNextCommand(input.recommendedNextCommand),
    recommendedNextReason:
      typeof input.recommendedNextReason === 'string' ? input.recommendedNextReason.trim() : '',
    lastUpdated: Number(input.lastUpdated ?? Date.now()),
  };
}

export function applyStateUpdates(
  state: UPState,
  updates: Partial<UPState> & { completedActivities?: unknown }
): UPState {
  const mergedActivities = normalizeActivities([
    ...state.completedActivities,
    ...(Array.isArray(updates.completedActivities) ? updates.completedActivities : []),
  ]);

  return normalizeState({
    ...state,
    ...updates,
    completedActivities: mergedActivities,
    artifacts: Array.isArray(updates.artifacts) ? updates.artifacts : state.artifacts,
    currentIteration: updates.currentIteration ?? state.currentIteration,
    recommendedNextCommand:
      updates.recommendedNextCommand === undefined
        ? state.recommendedNextCommand
        : updates.recommendedNextCommand,
    recommendedNextReason:
      updates.recommendedNextReason === undefined
        ? state.recommendedNextReason
        : updates.recommendedNextReason,
    lastUpdated: Date.now(),
  });
}

function normalizeArtifacts(artifacts: unknown): UPArtifact[] {
  if (!Array.isArray(artifacts)) return [];

  const normalizedArtifacts: UPArtifact[] = [];
  const seenPaths = new Set<string>();

  for (const artifact of artifacts) {
    if (!artifact || typeof artifact !== 'object') continue;

    const candidate = artifact as Partial<UPArtifact>;
    if (typeof candidate.path !== 'string' || !candidate.path.trim()) continue;

    const normalizedPath = candidate.path.replace(/\\/g, '/');
    if (seenPaths.has(normalizedPath)) continue;

    const inferred = inferArtifactMetadata(normalizedPath);
    normalizedArtifacts.push({
      path: normalizedPath,
      phase:
        candidate.phase === 'inception' ||
        candidate.phase === 'elaboration' ||
        candidate.phase === 'construction' ||
        candidate.phase === 'transition'
          ? candidate.phase
          : inferred?.phase ?? 'inception',
      activity:
        typeof candidate.activity === 'string'
          ? (candidate.activity as UPArtifactActivity)
          : inferred?.activity ?? 'unknown',
      title:
        typeof candidate.title === 'string' && candidate.title.trim()
          ? candidate.title
          : inferred?.title ?? humanizeArtifactName(normalizedPath),
      generated: Number(candidate.generated ?? Date.now()),
    });
    seenPaths.add(normalizedPath);
  }

  return normalizedArtifacts.sort((left, right) => left.generated - right.generated);
}

function mergeArtifacts(...artifactCollections: UPArtifact[][]): UPArtifact[] {
  const artifactMap = new Map<string, UPArtifact>();

  for (const artifact of artifactCollections.flat()) {
    const existing = artifactMap.get(artifact.path);
    if (!existing || artifact.generated >= existing.generated) {
      artifactMap.set(artifact.path, artifact);
    }
  }

  return normalizeArtifacts([...artifactMap.values()]);
}

function compareStateCompleteness(left: UPState, right: UPState): number {
  return (
    left.completedActivities.length - right.completedActivities.length ||
    left.artifacts.length - right.artifacts.length ||
    left.lastUpdated - right.lastUpdated
  );
}

function humanizeArtifactName(artifactPath: string): string {
  return titleCase(
    basename(artifactPath)
      .replace(/\.[^.]+$/, '')
      .replace(/^[A-Z]+-\d+-/i, '')
      .replace(/^\d+-/, '')
      .replace(/[-_]+/g, ' ')
  );
}

function titleCase(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

function deriveRecoveredSystemName(source: string): string {
  const cleaned = source
    .replace(/[#>*`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return deriveSystemNameFromVision(cleaned || 'Recovered UP Project');
}

function extractVisionSummary(content: string): string | null {
  const match = content.match(/\*\*Vision Summary:\*\*\s*(.+)/i);
  if (match?.[1]?.trim()) return match[1].trim();

  const paragraph = content
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#') && !line.startsWith('|') && !line.startsWith('---'));

  return paragraph || null;
}

function extractCurrentIteration(content: string): number | null {
  const match = content.match(/current iteration[^\d]*(\d+)/i);
  if (!match) return null;

  const iteration = Number(match[1]);
  return Number.isFinite(iteration) && iteration > 0 ? iteration : null;
}

function extractRecommendedNextCommand(content: string): string | null {
  const match = content.match(/recommended next command:\*\*\s*([^\n]+)/i);
  if (match?.[1]?.trim()) return normalizeRecommendedNextCommand(match[1].trim());

  const fallback = content.match(/recommended next command:\s*([^\n]+)/i);
  if (fallback?.[1]?.trim()) return normalizeRecommendedNextCommand(fallback[1].trim());

  return null;
}

function extractRecommendedNextReason(content: string): string | null {
  const match = content.match(/recommendation rationale:\*\*\s*([^\n]+)/i);
  if (match?.[1]?.trim()) return match[1].trim();

  const fallback = content.match(/recommendation rationale:\s*([^\n]+)/i);
  if (fallback?.[1]?.trim()) return fallback[1].trim();

  return null;
}

async function safeReadFile(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return '';
  }
}

async function listFilesRecursive(root: string): Promise<string[]> {
  const dirents = await readdir(root, { withFileTypes: true });
  const files: string[] = [];

  for (const dirent of dirents) {
    const fullPath = join(root, dirent.name);
    if (dirent.isDirectory()) {
      files.push(...(await listFilesRecursive(fullPath)));
      continue;
    }

    if (dirent.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}
