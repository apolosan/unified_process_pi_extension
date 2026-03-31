/**
 * Unified Process (UP) Extension — State Management
 * Manages the UP process state persisted via pi.appendEntry()
 */

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
  | 'implementation'
  | 'deploy'
  | 'documentation';

export interface UPArtifact {
  path: string;
  phase: UPPhase;
  activity: UPActivity;
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
  lastUpdated: number;
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
  'implementation',
  'deploy',
  'documentation',
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
    lastUpdated: Date.now(),
  });
}

/**
 * Restores the most recent UP state from the pi session entries.
 * Looks for entries with customType === 'up-state'.
 */
export function restoreStateFromEntries(entries: any[]): UPState | null {
  const upEntries = entries.filter(
    (e) => e.type === 'custom' && e.customType === 'up-state'
  );
  if (!upEntries.length) return null;
  return normalizeState(upEntries[upEntries.length - 1].data as Partial<UPState>);
}

/**
 * Returns the next uncompleted activity in the canonical UP order.
 * Returns null if all activities have been completed.
 */
export function getNextActivity(state: UPState): UPActivity | null {
  return ACTIVITY_ORDER.find((a) => !state.completedActivities.includes(a)) ?? null;
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
    activities.filter((item): item is UPActivity =>
      typeof item === 'string' && ACTIVITY_ORDER.includes(item as UPActivity)
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
    artifacts: Array.isArray(input.artifacts) ? input.artifacts : [],
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
    lastUpdated: Date.now(),
  });
}
