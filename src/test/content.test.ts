import { describe, expect, it } from 'vitest';
import { chapters } from '../content';
import { validateTrace } from '../lib/validateTrace';

// Content checks: every hand-written trace and question must be consistent.
describe('chapter content', () => {
  const nodes = chapters.flatMap((c) => c.nodes);

  it.each(nodes.map((n) => [n.id, n] as const))('trace for %s is consistent', (_id, node) => {
    expect(validateTrace(node.trace)).toEqual([]);
  });

  it('every node has 3–5 questions with valid answers', () => {
    for (const n of nodes) {
      expect(n.questions.length).toBeGreaterThanOrEqual(3);
      expect(n.questions.length).toBeLessThanOrEqual(5);
      for (const q of n.questions) {
        if (q.kind === 'choice') {
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThan(q.choices.length);
        } else {
          expect(q.answer.trim()).not.toBe('');
        }
      }
    }
  });

  it('question and node ids are unique', () => {
    const qIds = nodes.flatMap((n) => n.questions.map((q) => q.id));
    expect(new Set(qIds).size).toBe(qIds.length);
    expect(new Set(nodes.map((n) => n.id)).size).toBe(nodes.length);
  });

  it('map edges only reference nodes in the same chapter', () => {
    for (const c of chapters) {
      const ids = new Set(c.nodes.map((n) => n.id));
      for (const n of c.nodes) for (const a of n.after) expect(ids.has(a)).toBe(true);
    }
  });
});

describe('validateTrace', () => {
  const base = {
    code: ['int main(void) {', '  int x = 1;', '}'],
    steps: [{ line: 2, note: '', heap: [], stack: [{ fn: 'main', vars: [{ name: 'x', type: 'int', cells: [{ addr: '0x1', value: '1' }] }] }] }],
  };

  it('accepts a correct trace', () => {
    expect(validateTrace(base)).toEqual([]);
  });

  it('catches a line number outside the code', () => {
    const t = { ...base, steps: [{ ...base.steps[0], line: 9 }] };
    expect(validateTrace(t)[0]).toMatch(/outside the code/);
  });

  it('catches an arrow to an address that is not on screen', () => {
    const t = {
      ...base,
      steps: [{ ...base.steps[0], stack: [{ fn: 'main', vars: [{ name: 'p', type: 'int *', cells: [{ addr: '0x1', value: '0x9', pointsTo: '0x9' }] }] }] }],
    };
    expect(validateTrace(t).join()).toMatch(/not on screen/);
  });

  it('catches a duplicated address and a value that disagrees with the arrow', () => {
    const t = {
      ...base,
      steps: [{ ...base.steps[0], stack: [{ fn: 'main', vars: [
        { name: 'x', type: 'int', cells: [{ addr: '0x1', value: '1' }] },
        { name: 'p', type: 'int *', cells: [{ addr: '0x1', value: '0x2', pointsTo: '0x1' }] },
      ] }] }],
    };
    const problems = validateTrace(t).join(' | ');
    expect(problems).toMatch(/used twice/);
    expect(problems).toMatch(/shows 0x2 but points to 0x1/);
  });
});
