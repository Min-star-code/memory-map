import { expect, type Locator, type Page } from '@playwright/test';
import { chapters } from '../src/content/index.ts';
import type { Cell, ConceptNode, Question, Step } from '../src/types.ts';

// Expected values come from the same content data the site renders, so the
// tests do not hard-code lesson text and stay correct when content changes.
export const chapter = chapters[0];
export const nodes: ConceptNode[] = chapter.nodes;
export const totalQuestions = nodes.reduce((n, node) => n + node.questions.length, 0);
export const STORAGE_KEY = 'cs-visual-progress-v1';

export interface ExpectedArrow { from: string; to: string; dangling: boolean }

/** Every pointer cell whose target is on screen in this step should get one arrow. */
export function expectedArrows(step: Step): ExpectedArrow[] {
  const cells: Cell[] = [
    ...step.stack.flatMap((f) => f.vars.flatMap((v) => v.cells)),
    ...step.heap.flatMap((b) => b.cells),
  ];
  const freed = new Set(step.heap.filter((b) => b.freed).flatMap((b) => b.cells.map((c) => c.addr)));
  const onScreen = new Set(cells.map((c) => c.addr));
  return cells
    .filter((c) => c.pointsTo && onScreen.has(c.pointsTo))
    .map((c) => ({ from: c.addr, to: c.pointsTo!, dangling: freed.has(c.pointsTo!) }));
}

/** Opens one topic's panel directly through its hash route. */
export async function openTopic(page: Page, node: ConceptNode): Promise<Locator> {
  await page.goto(`#/${chapter.id}/${node.id}`);
  const panel = page.getByRole('complementary', { name: node.title });
  await expect(panel).toBeVisible();
  return panel;
}

/** Fills in the correct answer for a question and presses Check. */
export async function answerCorrectly(panel: Locator, q: Question): Promise<void> {
  const card = panel.getByTestId(`question-${q.id}`);
  if (q.kind === 'choice') {
    await card.getByRole('radio').nth(q.answer).check();
  } else {
    await card.getByRole('textbox', { name: 'Printed output' }).fill(q.answer);
  }
  await card.getByRole('button', { name: 'Check' }).click();
  await expect(card.getByRole('status')).toContainText('Correct.');
}

/**
 * Checks that the memory diagram matches one hand-written step: the current
 * code line, every cell value, and one arrow per pointer that starts on the
 * pointer's box and ends at its target's box.
 */
export async function expectStepRendered(panel: Locator, step: Step, index: number, count: number): Promise<void> {
  await expect(panel.getByText(`Step ${index + 1} of ${count}.`)).toBeVisible();
  const current = panel.locator('.trace [aria-current="step"]');
  await expect(current).toHaveCount(1);
  await expect(current.locator('.ln')).toHaveText(String(step.line));

  const memory = panel.getByTestId('memory');
  await expect(memory.getByRole('region', { name: 'Stack' }).locator('.frame')).toHaveCount(step.stack.length);
  await expect(memory.locator('.heap-block')).toHaveCount(step.heap.length);
  for (const cell of [...step.stack.flatMap((f) => f.vars.flatMap((v) => v.cells)), ...step.heap.flatMap((b) => b.cells)]) {
    await expect(memory.locator(`[data-addr="${cell.addr}"]`)).toHaveText(cell.value);
  }

  const expected = expectedArrows(step);
  const arrows = memory.getByTestId('arrows').locator('path.arrow');
  await expect(arrows).toHaveCount(expected.length);
  await expect(memory.getByTestId('arrows').locator('path.arrow.bad')).toHaveCount(expected.filter((a) => a.dangling).length);
  if (expected.length === 0) return;

  // Compare arrow endpoints with the boxes they should connect.
  const geometry = await memory.evaluate((wrap) => {
    const box = wrap.getBoundingClientRect();
    const rect = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { left: r.left - box.left, right: r.right - box.left, top: r.top - box.top, bottom: r.bottom - box.top };
    };
    // `cells` is the value box; `boxes` adds the address label under it.
    const cells: Record<string, ReturnType<typeof rect>> = {};
    const boxes: Record<string, ReturnType<typeof rect>> = {};
    wrap.querySelectorAll<HTMLElement>('[data-addr]').forEach((el) => {
      cells[el.dataset.addr!] = rect(el);
      boxes[el.dataset.addr!] = rect(el.parentElement!);
    });
    const paths = [...wrap.querySelectorAll('svg.arrows path.arrow')].map((p) => {
      const nums = (p.getAttribute('d') ?? '').match(/-?\d+(\.\d+)?/g)!.map(Number);
      return { start: { x: nums[0], y: nums[1] }, end: { x: nums[nums.length - 2], y: nums[nums.length - 1] }, bad: p.classList.contains('bad') };
    });
    return { cells, boxes, paths };
  });
  type Point = { x: number; y: number };
  const dist = (p: Point, r: (typeof geometry.cells)[string]) =>
    Math.hypot(Math.max(r.left - p.x, 0, p.x - r.right), Math.max(r.top - p.y, 0, p.y - r.bottom));
  /** The cell box closest to a point, so an arrow cannot pass by landing on a neighbouring cell. */
  const closest = (p: Point, rects: typeof geometry.cells) =>
    Object.entries(rects).reduce((best, [addr, r]) => (dist(p, r) < best.d ? { addr, d: dist(p, r) } : best), { addr: '', d: Infinity });

  const drawn = geometry.paths.map((p) => ({ from: closest(p.start, geometry.cells), to: closest(p.end, geometry.boxes), bad: p.bad }));
  for (const a of expected) {
    // Start sits on the pointer's edge; the end stops a few pixels short for
    // the arrowhead, or just under the target's address label.
    const match = drawn.find((d) => d.from.addr === a.from && d.from.d <= 1 && d.to.addr === a.to && d.to.d <= 6 && d.bad === a.dangling);
    expect(match, `arrow ${a.from} -> ${a.to} (drawn: ${JSON.stringify(drawn)})`).toBeTruthy();
  }
}
