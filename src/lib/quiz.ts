import type { Question } from '../types';

/** Collapse runs of whitespace and trim, so "4  3\n" matches "4 3". */
export function normalizeOutput(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

/**
 * Check one answer. For choice questions the answer is the chosen index;
 * for output questions it is the text the student typed.
 */
export function isCorrect(q: Question, answer: number | string): boolean {
  if (q.kind === 'choice') return answer === q.answer;
  return typeof answer === 'string' && normalizeOutput(answer) === normalizeOutput(q.answer);
}
