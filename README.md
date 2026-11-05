# Memory Map

Step through short C programs and watch the stack, the heap and every pointer
arrow change line by line, then check yourself with a few questions per topic.
Built for students moving from Racket to C, where pointers and memory are the
usual sticking point.

**Status:** early prototype (v0.1, November 2026). One chapter, *Pointers*,
with 5 topics, 5 step-by-step examples and 15 questions. The other nine chapters
in the plan are listed on the home page as "coming later". This version tests the
core idea; the next version will be redesigned closer to the original plan, with
work planned for winter break 2026. See [NEXT_VERSION.md](NEXT_VERSION.md).

## Features
- **Step-by-step memory diagrams.** Code on the left with the current line
  highlighted; stack frames and heap blocks on the right. Pointer arrows are SVG
  paths drawn between the measured positions of the pointer and its target, and
  they are redrawn when the layout changes size. Freed heap blocks stay on screen
  with a dashed red arrow to show a dangling pointer.
- **Concept map** for the chapter. Each topic is grey (not started), yellow (some
  questions right) or green (all right), with an icon as well as a colour. On
  phones the map becomes an outline list built from the same data.
- **Questions** (multiple choice and "what does this print?") with feedback.
  Progress counts correct answers, not pages opened, and is saved in
  `localStorage`, with export / import as a JSON file.
- Keyboard support (← / → to step, Esc to close a topic), light and dark mode,
  reduced-motion support.

## How it works
- The site does not run C. Each example is a `Trace`: the code plus a list of
  memory snapshots (`src/types.ts`). This keeps the diagrams exact and avoids
  writing a C interpreter; for running arbitrary code the site links to Python Tutor.
- Hand-written snapshots can contain typos, so `validateTrace`
  (`src/lib/validateTrace.ts`) checks every step: the line number is inside the
  code and not blank, addresses are unique, and every pointer's value matches an
  address that is on screen. A test runs it over all content.
- Hash routing (`#/pointers/heap`) so the site works on GitHub Pages without a server.

## Tests
`npm test` runs 24 Vitest tests:
- content checks over every trace and question,
- unit tests for progress, answer checking, saved-data parsing and the C highlighter,
- UI tests with React Testing Library: stepping with buttons and arrow keys,
  answering all questions in a topic turns it green and saves progress, corrupted
  saved data is ignored, Esc closes the panel.

## Run locally
```bash
npm install
npm run dev      # development server
npm test         # tests
npm run build    # production build in dist/
```

## Stack
React 19, TypeScript, Vite, Vitest, React Testing Library. No UI or chart
libraries: the concept map, memory diagram, arrows and syntax colouring are
written for this project.

## How it was built
Planned in `PROJECT_OUTLINE.md` (audience, page structure, progress rules,
content rules). Implemented with AI coding agents (Claude Code) working from
the rules in `AGENTS.md`; every change was reviewed, run in the browser at
desktop and phone widths, and checked with the test suite.

## Content
All examples and questions are original and are not taken from any course's
slides, notes, assignments or exams. This is an independent student project and
is not affiliated with any university.
