import type { Chapter, PlannedChapter } from '../types';
import { pointers } from './pointers';

/** Chapters that are built. The MVP has one. */
export const chapters: Chapter[] = [pointers];

/** The full plan from PROJECT_OUTLINE.md, shown on the home page. */
export const plannedChapters: PlannedChapter[] = [
  { number: 1, title: 'From Racket to C' },
  { number: 2, title: 'C basics: types, expressions, control flow' },
  { number: 3, title: 'Functions, scope and the call stack' },
  { number: 4, title: 'The memory model: stack, heap, static' },
  { number: 5, title: 'Pointers' },
  { number: 6, title: 'Arrays and strings' },
  { number: 7, title: 'Dynamic memory' },
  { number: 8, title: 'Structs and linked lists' },
  { number: 9, title: 'Abstract data types' },
  { number: 10, title: 'Efficiency and Big-O' },
];
