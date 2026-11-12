import { expect, test } from '@playwright/test';
import { STORAGE_KEY, answerCorrectly, chapter, nodes, openTopic, totalQuestions } from './helpers';

test('a wrong answer gets feedback and does not count as progress', async ({ page }) => {
  const node = nodes[0];
  const q = node.questions.find((x) => x.kind === 'choice')!;
  if (q.kind !== 'choice') throw new Error('unreachable');
  const panel = await openTopic(page, node);
  const card = panel.getByTestId(`question-${q.id}`);

  const check = card.getByRole('button', { name: 'Check' });
  await expect(check).toBeDisabled();
  const wrong = q.choices.findIndex((_, k) => k !== q.answer);
  await card.getByRole('radio').nth(wrong).check();
  await check.click();
  await expect(card.getByRole('status')).toContainText('Not quite.');
  await expect(card.getByText('✓ Solved')).toHaveCount(0);
  await expect(page.getByText(`0 / ${totalQuestions} questions · 0%`)).toBeVisible();
});

test('answering every question in a topic marks it mastered on the map', async ({ page }) => {
  const node = nodes[1];
  const panel = await openTopic(page, node);
  for (const q of node.questions) await answerCorrectly(panel, q);

  await expect(panel.getByText('✓ Solved')).toHaveCount(node.questions.length);
  const n = node.questions.length;
  await expect(page.getByText(`${n} / ${totalQuestions} questions`)).toBeVisible();

  await panel.getByRole('button', { name: 'Close' }).click();
  await expect(
    page.getByRole('group', { name: `${chapter.title} concept map` })
      .getByRole('button', { name: `${node.title}, mastered, ${n} of ${n} questions` }),
  ).toBeVisible();
});

test('progress is saved in localStorage and survives a reload', async ({ page }) => {
  const node = nodes[2];
  const panel = await openTopic(page, node);
  const [first, second] = node.questions;
  await answerCorrectly(panel, first);
  await answerCorrectly(panel, second);

  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), STORAGE_KEY);
  expect(saved).toEqual({ [first.id]: true, [second.id]: true });

  await page.reload();
  const reloaded = page.getByRole('complementary', { name: node.title });
  await expect(reloaded.getByTestId(`question-${first.id}`).getByText('✓ Solved')).toBeVisible();
  await expect(reloaded.getByTestId(`question-${second.id}`).getByText('✓ Solved')).toBeVisible();
  await expect(page.getByText(`2 / ${totalQuestions} questions`)).toBeVisible();

  await page.goto('./');
  await expect(page.getByRole('progressbar', { name: 'Your progress' })).toHaveAttribute('aria-valuenow', String(Math.round((2 / totalQuestions) * 100)));
});

test('the whole chapter can be completed to 100%', async ({ page }) => {
  for (const node of nodes) {
    const panel = await openTopic(page, node);
    for (const q of node.questions) await answerCorrectly(panel, q);
  }
  await page.goto('./');
  await expect(page.getByText(`${totalQuestions} / ${totalQuestions} questions · 100%`)).toBeVisible();
  await expect(page.getByRole('link', { name: new RegExp(`${nodes.length} topics · ${totalQuestions}/${totalQuestions} solved`) })).toBeVisible();
});

test('corrupted saved progress is ignored instead of breaking the page', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '{not json'), STORAGE_KEY);
  await page.goto('./');
  await expect(page.getByText(`0 / ${totalQuestions} questions · 0%`)).toBeVisible();
});
