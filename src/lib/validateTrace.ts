import type { Cell, Step, Trace } from '../types';

function cellsOf(step: Step): Cell[] {
  const stack = step.stack.flatMap((f) => f.vars.flatMap((v) => v.cells));
  const heap = step.heap.flatMap((b) => b.cells);
  return [...stack, ...heap];
}

/**
 * Check that a hand-written trace is consistent. Returns a list of problems
 * (empty if the trace is fine). The tests run this over every trace, so a
 * typo in an address or line number fails the build instead of drawing a
 * broken arrow.
 */
export function validateTrace(trace: Trace): string[] {
  const problems: string[] = [];
  if (trace.steps.length === 0) problems.push('trace has no steps');
  trace.steps.forEach((step, i) => {
    const where = `step ${i + 1}`;
    if (step.line < 1 || step.line > trace.code.length) {
      problems.push(`${where}: line ${step.line} is outside the code (1–${trace.code.length})`);
    } else if (trace.code[step.line - 1].trim() === '') {
      problems.push(`${where}: line ${step.line} is blank`);
    }
    const cells = cellsOf(step);
    const addrs = new Set<string>();
    for (const c of cells) {
      if (addrs.has(c.addr)) problems.push(`${where}: address ${c.addr} is used twice`);
      addrs.add(c.addr);
    }
    for (const c of cells) {
      if (c.pointsTo === undefined) continue;
      if (c.value !== c.pointsTo) {
        problems.push(`${where}: cell ${c.addr} shows ${c.value} but points to ${c.pointsTo}`);
      }
      if (!addrs.has(c.pointsTo)) {
        problems.push(`${where}: cell ${c.addr} points to ${c.pointsTo}, which is not on screen`);
      }
    }
    if (step.stack.length === 0) problems.push(`${where}: no stack frame`);
  });
  return problems;
}
