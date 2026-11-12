import { expect, test } from '@playwright/test';
import { answerCorrectly, chapter, expectStepRendered, expectedArrows, nodes } from './helpers';

// Runs in the "mobile" project (390 x 844, touch).

test('phone width: outline replaces the map, no sideways scrolling', async ({ page }) => {
  await page.goto(`#/${chapter.id}`);
  await expect(page.getByRole('group', { name: `${chapter.title} concept map` })).toBeHidden();
  const outline = page.getByRole('list', { name: `${chapter.title} topics` });
  await expect(outline.getByRole('button')).toHaveCount(nodes.length);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('phone width: open a topic, step to an arrow, answer a question', async ({ page }) => {
  // Use a topic whose example draws at least one pointer arrow.
  const node = nodes.find((n) => n.trace.steps.some((s) => expectedArrows(s).length > 0))!;
  const stepIndex = node.trace.steps.findIndex((s) => expectedArrows(s).length > 0);

  await page.goto(`#/${chapter.id}`);
  await page.getByRole('list', { name: `${chapter.title} topics` }).getByRole('button').filter({ hasText: node.title }).tap();
  const panel = page.getByRole('complementary', { name: node.title });
  await expect(panel).toBeVisible();

  // On phones the panel covers the whole screen.
  const box = await panel.boundingBox();
  expect(box?.width ?? 0).toBeCloseTo(390, 0);

  for (let k = 0; k < stepIndex; k++) await panel.getByRole('button', { name: 'Next →' }).tap();
  await expectStepRendered(panel, node.trace.steps[stepIndex], stepIndex, node.trace.steps.length);

  const panelOverflow = await panel.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(panelOverflow).toBeLessThanOrEqual(0);

  await answerCorrectly(panel, node.questions[0]);
  await panel.getByRole('button', { name: 'Close' }).tap();
  await expect(page.getByRole('list', { name: `${chapter.title} topics` }).getByRole('button').filter({ hasText: node.title })).toContainText(`1/${node.questions.length}`);
});
