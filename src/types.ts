// Data model for the site. Every trace is a list of hand-written snapshots:
// the site does not run C code, it replays memory states that I wrote out.

/** One memory cell: a variable, an array element, or a heap block's value. */
export interface Cell {
  /** Made-up address used to draw arrows, e.g. "0x1004". Unique within a step. */
  addr: string;
  /** What the cell shows, e.g. "5", "?" (uninitialized) or "NULL". */
  value: string;
  /** If this cell holds a pointer, the address it points to. */
  pointsTo?: string;
}

/** A named variable in a stack frame. Arrays carry one cell per element. */
export interface Var {
  name: string;
  type: string;
  cells: Cell[];
}

export interface Frame {
  /** Function name, e.g. "main" or "swap". */
  fn: string;
  vars: Var[];
}

export interface HeapBlock {
  cells: Cell[];
  type: string;
  /** Freed blocks stay on screen, crossed out, to show dangling pointers. */
  freed?: boolean;
}

export interface Step {
  /** 1-based line in the trace's code that is about to run / just ran. */
  line: number;
  /** One or two sentences explaining what changed in this step. */
  note: string;
  stack: Frame[];
  heap: HeapBlock[];
  /** Everything printed so far. */
  output?: string;
}

export interface Trace {
  code: string[];
  steps: Step[];
}

export type Question =
  | {
      id: string;
      kind: 'choice';
      prompt: string;
      code?: string[];
      choices: string[];
      answer: number;
      explanation: string;
    }
  | {
      id: string;
      kind: 'output';
      prompt: string;
      code?: string[];
      /** Expected printed output, compared after trimming whitespace. */
      answer: string;
      explanation: string;
    };

export interface ConceptNode {
  id: string;
  title: string;
  /** Short label for the mind map. */
  short: string;
  /** Explanation paragraphs, written in my own words. */
  explain: string[];
  trace: Trace;
  questions: Question[];
  /** Position on the mind map, in a 0–100 coordinate box. */
  pos: { x: number; y: number };
  /** Ids of nodes this one builds on (drawn as edges). */
  after: string[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  summary: string;
  nodes: ConceptNode[];
}

/** A chapter that is planned but not built yet (shown as "coming later"). */
export interface PlannedChapter {
  number: number;
  title: string;
}
