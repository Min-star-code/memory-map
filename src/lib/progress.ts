import type { Chapter, ConceptNode } from '../types';

/** Progress is the set of question ids answered correctly at least once. */
export type Solved = Record<string, true>;

export type NodeStatus = 'not-started' | 'in-progress' | 'mastered';

export function solvedCount(node: ConceptNode, solved: Solved): number {
  return node.questions.filter((q) => solved[q.id]).length;
}

/** 0 correct → not started; some → in progress; all → mastered. */
export function nodeStatus(node: ConceptNode, solved: Solved): NodeStatus {
  const n = solvedCount(node, solved);
  if (n === 0) return 'not-started';
  return n === node.questions.length ? 'mastered' : 'in-progress';
}

/** Progress is counted by questions answered correctly, not pages opened. */
export function chapterProgress(chapter: Chapter, solved: Solved): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const node of chapter.nodes) {
    done += solvedCount(node, solved);
    total += node.questions.length;
  }
  return { done, total };
}

export function overallProgress(chapters: Chapter[], solved: Solved): { done: number; total: number } {
  return chapters.reduce(
    (acc, ch) => {
      const p = chapterProgress(ch, solved);
      return { done: acc.done + p.done, total: acc.total + p.total };
    },
    { done: 0, total: 0 },
  );
}

export function percent({ done, total }: { done: number; total: number }): number {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

/**
 * Parse saved or imported progress. Anything that is not an object of
 * `id: true` pairs is dropped, so a corrupted file cannot break the page.
 * Ids that no longer exist in the content are dropped too.
 */
export function parseSolved(raw: string | null, knownIds: Set<string>): Solved {
  if (!raw) return {};
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return {};
  const out: Solved = {};
  for (const [id, v] of Object.entries(data as Record<string, unknown>)) {
    if (v === true && knownIds.has(id)) out[id] = true;
  }
  return out;
}

export const STORAGE_KEY = 'cs-visual-progress-v1';

export function loadSolved(knownIds: Set<string>): Solved {
  try {
    return parseSolved(localStorage.getItem(STORAGE_KEY), knownIds);
  } catch {
    // Storage can be blocked (private mode); the page still works without it.
    return {};
  }
}

export function saveSolved(solved: Solved): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solved));
  } catch {
    // Ignore: progress just won't persist this session.
  }
}
