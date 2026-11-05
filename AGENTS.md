# AGENTS.md — rules for coding agents (Claude Code, Codex) working on Memory Map

Read this before changing anything. The product plan is `../PROJECT_OUTLINE.md`.

## What this project is
A React + TypeScript (Vite) site that teaches C pointers and memory by replaying
hand-written memory snapshots step by step. It does **not** run or interpret C.

## Content rules (most important)
- All explanations, examples and questions must be original. Never copy course
  slides, notes, assignments, exam questions or answers.
- Every C example must be valid C and its trace must match what the code really does.
  If you are unsure what a line does, stop and ask instead of guessing.
- Addresses are made up and short (e.g. `0x100`). A pointer cell's `value` must equal its `pointsTo`.
- Each topic has 3–5 questions. Every wrong choice must be wrong for a clear reason.

## Code rules
- Data lives in `src/content/*.ts` and follows the types in `src/types.ts`. Components never hard-code lesson content.
- Pure logic (progress, answer checking, trace validation, highlighting) lives in `src/lib/` and must stay free of React so it is easy to test.
- Styles use the CSS variables at the top of `src/index.css`. Do not add raw colours elsewhere; keep light and dark mode working.
- Keep it accessible: real buttons, labels on inputs, status not shown by colour alone, arrow-key stepping.
- No new runtime dependencies without asking.

## Before you say a task is done
1. `npm test` — all tests pass. `src/test/content.test.ts` runs `validateTrace` over every trace, so content mistakes fail here.
2. `npm run lint` and `npm run build` pass with no errors.
3. Open the page you changed at desktop width and at 390 px width and check the arrows and layout.
4. Report what you changed and anything you could not verify.
