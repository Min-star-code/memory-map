import { describe, expect, it } from 'vitest';
import type { Chapter, ConceptNode, Question } from '../types';
import { chapterProgress, nodeStatus, overallProgress, parseSolved, percent } from '../lib/progress';
import { isCorrect } from '../lib/quiz';
import { tokenizeC } from '../lib/highlight';

const q = (id: string): Question => ({ id, kind: 'choice', prompt: '', choices: ['a', 'b'], answer: 1, explanation: '' });
const node = (id: string, qs: string[]): ConceptNode => ({
  id, title: id, short: id, explain: [], pos: { x: 0, y: 0 }, after: [],
  trace: { code: ['x'], steps: [] }, questions: qs.map(q),
});
const chapter: Chapter = { id: 'c', number: 1, title: 'C', summary: '', nodes: [node('n1', ['a', 'b']), node('n2', ['c'])] };

describe('progress', () => {
  it('node status goes not-started → in-progress → mastered', () => {
    expect(nodeStatus(chapter.nodes[0], {})).toBe('not-started');
    expect(nodeStatus(chapter.nodes[0], { a: true })).toBe('in-progress');
    expect(nodeStatus(chapter.nodes[0], { a: true, b: true })).toBe('mastered');
  });

  it('counts questions, not nodes', () => {
    expect(chapterProgress(chapter, { a: true, c: true })).toEqual({ done: 2, total: 3 });
    expect(overallProgress([chapter, chapter], { a: true })).toEqual({ done: 2, total: 6 });
    expect(percent({ done: 2, total: 3 })).toBe(67);
    expect(percent({ done: 0, total: 0 })).toBe(0);
  });

  it('parseSolved drops bad data instead of crashing', () => {
    const known = new Set(['a', 'b']);
    expect(parseSolved(null, known)).toEqual({});
    expect(parseSolved('not json', known)).toEqual({});
    expect(parseSolved('[1,2]', known)).toEqual({});
    expect(parseSolved('{"a": true, "b": "yes", "zzz": true}', known)).toEqual({ a: true });
  });
});

describe('quiz', () => {
  it('checks choice answers by index', () => {
    expect(isCorrect(q('x'), 1)).toBe(true);
    expect(isCorrect(q('x'), 0)).toBe(false);
  });

  it('checks output answers ignoring extra whitespace', () => {
    const out: Question = { id: 'o', kind: 'output', prompt: '', answer: '4 3', explanation: '' };
    expect(isCorrect(out, '  4   3\n')).toBe(true);
    expect(isCorrect(out, '43')).toBe(false);
  });
});

describe('highlighter', () => {
  it('tags types, numbers, strings and function calls', () => {
    const kinds = tokenizeC('int x = f(3, "hi");').filter((t) => t.kind !== 'plain').map((t) => `${t.kind}:${t.text}`);
    expect(kinds).toEqual(['type:int', 'fn:f', 'num:3', 'str:"hi"']);
  });

  it('keeps every character of the line', () => {
    const line = '  printf("%d %d\\n", a, b);';
    expect(tokenizeC(line).map((t) => t.text).join('')).toBe(line);
  });
});
