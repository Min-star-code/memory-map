import { expect, test } from '@playwright/test';
import { chapter, expectStepRendered, nodes, openTopic } from './helpers';

test('home page links into the Pointers chapter and its concept map', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('See what your C code does to memory.');
  await page.getByRole('link', { name: `Start with ${chapter.title}` }).click();
  await expect(page).toHaveURL(new RegExp(`#/${chapter.id}$`));

  const map = page.getByRole('group', { name: `${chapter.title} concept map` });
  for (const node of nodes) {
    await expect(map.getByRole('button', { name: `${node.title}, not started, 0 of ${node.questions.length} questions` })).toBeVisible();
  }
  await map.getByRole('button', { name: new RegExp(`^${nodes[0].title},`) }).click();
  await expect(page).toHaveURL(new RegExp(`#/${chapter.id}/${nodes[0].id}$`));
  await expect(page.getByRole('complementary', { name: nodes[0].title })).toBeVisible();
});

// One test per topic: step through the whole example with the Next button and
// compare every step on screen with the hand-written snapshot.
for (const node of nodes) {
  test(`steps through the "${node.id}" example line by line`, async ({ page }) => {
    const panel = await openTopic(page, node);
    const steps = node.trace.steps;
    const next = panel.getByRole('button', { name: 'Next →' });
    const back = panel.getByRole('button', { name: '← Back' });

    await expect(back).toBeDisabled();
    for (let i = 0; i < steps.length; i++) {
      await expectStepRendered(panel, steps[i], i, steps.length);
      const output = panel.locator('.output code');
      if (steps[i].output !== undefined) await expect(output).toHaveText(steps[i].output!);
      else await expect(output).toHaveCount(0);
      if (i < steps.length - 1) await next.click();
    }
    await expect(next).toBeDisabled();

    await panel.getByRole('button', { name: 'Restart' }).click();
    await expectStepRendered(panel, steps[0], 0, steps.length);
  });
}

test('arrow keys step the example and Escape closes the topic', async ({ page }) => {
  const node = nodes.find((n) => n.trace.steps.length >= 3)!;
  const panel = await openTopic(page, node);
  const steps = node.trace.steps;
  const trace = panel.getByLabel('Step-by-step example. Use the left and right arrow keys to step.');

  await trace.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expectStepRendered(panel, steps[2], 2, steps.length);
  await page.keyboard.press('ArrowLeft');
  await expectStepRendered(panel, steps[1], 1, steps.length);

  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`#/${chapter.id}$`));
});

test('a freed heap block shows a dangling arrow', async ({ page }) => {
  // Find a step in the content where a pointer still points into a freed block.
  const hit = nodes
    .flatMap((node) => node.trace.steps.map((step, i) => ({ node, step, i })))
    .find(({ step }) => step.heap.some((b) => b.freed) && step.stack.some((f) => f.vars.some((v) => v.cells.some((c) => c.pointsTo))));
  expect(hit, 'content has a dangling-pointer step').toBeTruthy();
  const { node, i } = hit!;
  const panel = await openTopic(page, node);
  for (let k = 0; k < i; k++) await panel.getByRole('button', { name: 'Next →' }).click();
  await expect(panel.getByTestId('arrows').locator('path.arrow.bad')).toHaveCount(1);
  await expect(panel.locator('.heap-block.freed')).toContainText('freed');
});
