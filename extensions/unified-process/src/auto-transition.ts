/**
 * Auto-Transition Helpers — pure functions extracted from the extension entrypoint.
 *
 * These helpers used to live as closures inside `index.ts`. They are pure (no
 * I/O, no pi runtime coupling) so they deserve first-class unit tests against
 * the auto-transition protocol documented in the extension README.
 *
 * Public surface:
 *   - extractUPSkillName(text)              — parses `/skill:up-X` prefix
 *   - buildUPSkillCommand(skillName)        — composes `/skill:up-X`
 *   - extractActivityFromUPCommand(command) — parses activity from `/skill:up-X`
 *   - isAutoChainSkill(skillName)           — orchestrator | UP activity predicate
 *   - formatRecommendedNextStatus(state)    — footer/status formatter
 *   - classifyRecommendation(state, next)   — recommendation type classifier
 *   - compactReason(reason, maxLength?)     — truncates rationale for widgets
 *   - restoreAutoTransitionMode(entries)    — restores ON/OFF flag from session entries
 *
 * Behavior under test is documented as RF-/RNF- markers in
 * `auto-transition.test.ts`.
 */

import {
  ACTIVITY_ORDER,
  clearRecommendedNextAction,
  getEffectiveNextCommand,
  getNextActivity,
  getRecommendedNextCommand,
  type UPActivity,
  type UPState,
} from './state.ts';

export const AUTO_MODE_ENTRY_TYPE = 'up-auto-mode';
export const AUTO_TOGGLE_SHORTCUTS = ['ctrl+shift+y', 'ctrl+shift+n', 'ctrl+shift+t'] as const;

export type RecommendationTone = 'success' | 'warning' | 'accent' | 'muted';

export interface RecommendationClassification {
  icon: string;
  label: string;
  tone: RecommendationTone;
}

/**
 * RF-AT-01 — Parses a `/skill:up-X` invocation out of arbitrary user input.
 * Returns the canonical skill name (lowercase, dashed) or null when the input
 * does not start with a UP skill command.
 */
export function extractUPSkillName(text: string): string | null {
  const match = text.trim().match(/^\/skill:up-([a-z-]+)\b/i);
  return match?.[1]?.toLowerCase() ?? null;
}

/**
 * RF-AT-02 — Composes a `/skill:up-X` command from a canonical skill name.
 * Validates the skill name and returns null when the name is not a valid
 * UP activity or orchestrator alias.
 */
export function buildUPSkillCommand(skillName: string): string | null {
  const normalized = skillName.trim().toLowerCase();
  if (!normalized) return null;
  if (isAutoChainSkill(normalized)) return `/skill:up-${normalized}`;
  return null;
}

/**
 * RF-AT-03 — Inverse of buildUPSkillCommand: pulls the activity identifier
 * out of a `/skill:up-X` command. Returns null for any other command shape.
 */
export function extractActivityFromUPCommand(command: string): string | null {
  const match = command.match(/^\/skill:up-([a-z-]+)$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

/**
 * RF-AT-04 — Decides whether a skill name is part of the auto-chain (the
 * orchestrator entry point and every canonical UP activity).
 */
export function isAutoChainSkill(skillName: string): boolean {
  if (!skillName) return false;
  return (
    skillName === 'orchestrator' ||
    (ACTIVITY_ORDER as readonly string[]).includes(skillName)
  );
}

/**
 * RF-AT-05 — Composes the footer/status string the TUI surfaces to the user.
 * Distinguishes between an explicit orchestrator recommendation (★), the
 * canonical next activity, and the terminal "DONE" state.
 */
export function formatRecommendedNextStatus(state: UPState | null): string {
  if (!state) return '➡️ no-process';

  const explicitNext = getRecommendedNextCommand(state);
  const effectiveNext = getEffectiveNextCommand(state);
  if (!effectiveNext) return '➡️ DONE';

  return explicitNext ? `➡️ ${explicitNext} ★` : `➡️ ${effectiveNext}`;
}

/**
 * RF-AT-06 — Classifies an explicit recommendation into one of the documented
 * categories: risk-aware, coordination, forward, upstream refinement, non-linear
 * jump, or generic explicit recommendation.
 */
export function classifyRecommendation(
  state: UPState,
  explicitNext: string
): RecommendationClassification {
  const reason = state.recommendedNextReason.toLowerCase();
  const riskSignals = /(risk|risco|critical|crítico|critico|danger|blocker|blocked|falha|failure|gap|inconsist|unsafe)/i;
  if (riskSignals.test(reason)) {
    return { icon: '⚠', label: 'UP risk-aware recommendation', tone: 'warning' };
  }

  if (explicitNext === '/skill:up-orchestrator') {
    return { icon: '⟳', label: 'UP coordination recommendation', tone: 'accent' };
  }

  if (explicitNext === '/up-next') {
    return { icon: '▶', label: 'UP forward recommendation', tone: 'success' };
  }

  const linearNext = getNextActivity(state);
  const linearIndex = linearNext ? ACTIVITY_ORDER.indexOf(linearNext) : -1;
  const explicitActivity = extractActivityFromUPCommand(explicitNext);
  const explicitIndex = explicitActivity
    ? ACTIVITY_ORDER.indexOf(explicitActivity as UPActivity)
    : -1;

  if (explicitNext === getEffectiveNextCommand(clearRecommendedNextAction(state))) {
    return { icon: '▶', label: 'UP forward recommendation', tone: 'success' };
  }

  if (explicitIndex >= 0 && linearIndex >= 0 && explicitIndex < linearIndex) {
    return { icon: '↩', label: 'UP upstream refinement', tone: 'warning' };
  }

  if (explicitIndex >= 0 && linearIndex >= 0 && explicitIndex > linearIndex) {
    return { icon: '⇢', label: 'UP non-linear jump', tone: 'accent' };
  }

  return { icon: '★', label: 'UP explicit recommendation', tone: 'accent' };
}

/**
 * RF-AT-07 — Compact representation of the recommendation rationale for the
 * widget. Collapses whitespace and adds an ellipsis when the text would exceed
 * `maxLength` (default 120 chars).
 */
export function compactReason(reason: string, maxLength = 120): string {
  const normalized = reason.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1))}…`;
}

/**
 * RF-AT-08 — Restores the auto-transition toggle from the session's custom
 * entries. Reads every `up-auto-mode` entry in order; the latest one wins.
 * Defaults to ON when no entry is recorded.
 */
export function restoreAutoTransitionMode(entries: ReadonlyArray<unknown>): boolean {
  let lastEnabled: boolean | null = null;

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const candidate = entry as { type?: unknown; customType?: unknown; data?: unknown };
    if (candidate.type !== 'custom' || candidate.customType !== AUTO_MODE_ENTRY_TYPE) {
      continue;
    }
    const data = candidate.data as { enabled?: unknown } | undefined;
    if (data && typeof data.enabled === 'boolean') {
      lastEnabled = data.enabled;
    }
  }

  return lastEnabled ?? true;
}

/**
 * RF-AT-09 — Renders the canonical shortcut hint list (uppercased + pipe-
 * separated) for notifications and the README protocol snippet.
 */
export function formatShortcutList(): string {
  return AUTO_TOGGLE_SHORTCUTS.map((shortcut) => shortcut.toUpperCase()).join(' | ');
}
