import { useCallback, useEffect, useMemo, useState } from 'react';
import { chapters, plannedChapters } from './content';
import { chapterProgress, loadSolved, overallProgress, parseSolved, saveSolved, type Solved } from './lib/progress';
import { MindMap } from './components/MindMap';
import { NodePanel } from './components/NodePanel';
import { ProgressBar } from './components/ProgressBar';

// Hash routes: #/  ·  #/about  ·  #/<chapter>  ·  #/<chapter>/<node>
function readRoute(): string[] {
  return window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
}

const knownIds = new Set(chapters.flatMap((c) => c.nodes.flatMap((n) => n.questions.map((q) => q.id))));

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [solved, setSolved] = useState<Solved>(() => loadSolved(knownIds));

  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => saveSolved(solved), [solved]);

  const markCorrect = useCallback((id: string) => setSolved((s) => (s[id] ? s : { ...s, [id]: true })), []);

  const [first, second] = route;
  const chapter = chapters.find((c) => c.id === first);

  return (
    <div className="app">
      <header className="topbar">
        <a href="#/" className="brand"><span className="brand-mark" aria-hidden="true">*p</span> Memory Map</a>
        <nav><a href="#/about">About</a></nav>
      </header>
      <main>
        {first === 'about' ? <About /> : chapter ? (
          <ChapterPage chapterId={chapter.id} nodeId={second ?? null} solved={solved} onCorrect={markCorrect} />
        ) : (
          <Home solved={solved} setSolved={setSolved} />
        )}
      </main>
      <footer className="footer">
        Independent student project. Not affiliated with any university. All examples and questions are original.
      </footer>
    </div>
  );
}

function Home({ solved, setSolved }: { solved: Solved; setSolved: (s: Solved) => void }) {
  const overall = overallProgress(chapters, solved);
  const [msg, setMsg] = useState('');

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify(solved, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'memory-map-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importProgress = async (file: File) => {
    const next = parseSolved(await file.text(), knownIds);
    setSolved(next);
    setMsg(`Imported ${Object.keys(next).length} solved questions.`);
  };

  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow">For students moving from Racket to C</p>
        <h1>See what your C code does to memory.</h1>
        <p className="lede">
          Step through short programs and watch the stack, the heap and every pointer arrow change line by line.
          Then check yourself with a few questions on each idea.
        </p>
        <a className="btn primary big" href={`#/${chapters[0].id}`}>Start with {chapters[0].title} →</a>
      </section>
      <ProgressBar label="Your progress" {...overall} />
      <section className="chapters" aria-label="Chapters">
        {plannedChapters.map((p) => {
          const built = chapters.find((c) => c.number === p.number);
          if (!built) {
            return (
              <div key={p.number} className="chapter-card planned" aria-disabled="true">
                <span className="ch-num">{String(p.number).padStart(2, '0')}</span>
                <span className="ch-title">{p.title}</span>
                <span className="ch-meta">Coming later</span>
              </div>
            );
          }
          const pr = chapterProgress(built, solved);
          return (
            <a key={p.number} className="chapter-card" href={`#/${built.id}`}>
              <span className="ch-num">{String(p.number).padStart(2, '0')}</span>
              <span className="ch-title">{built.title}</span>
              <span className="ch-meta">{built.nodes.length} topics · {pr.done}/{pr.total} solved</span>
              <span className="mini-track"><span className="mini-fill" style={{ width: `${pr.total ? (pr.done / pr.total) * 100 : 0}%` }} /></span>
            </a>
          );
        })}
      </section>
      <section className="io">
        <p>Progress is saved in this browser only.</p>
        <button type="button" className="btn ghost" onClick={exportProgress}>Export progress</button>
        <label className="btn ghost">
          Import progress
          <input type="file" accept="application/json" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importProgress(f); }} />
        </label>
        {msg ? <span role="status">{msg}</span> : null}
      </section>
    </div>
  );
}

function ChapterPage({ chapterId, nodeId, solved, onCorrect }: { chapterId: string; nodeId: string | null; solved: Solved; onCorrect: (id: string) => void }) {
  const chapter = chapters.find((c) => c.id === chapterId)!;
  const node = useMemo(() => chapter.nodes.find((n) => n.id === nodeId) ?? null, [chapter, nodeId]);
  const close = useCallback(() => { window.location.hash = `#/${chapter.id}`; }, [chapter.id]);
  const pr = chapterProgress(chapter, solved);

  return (
    <div className={'chapter' + (node ? ' has-panel' : '')}>
      <div className="chapter-main">
        <a href="#/" className="back">← All chapters</a>
        <p className="eyebrow">Chapter {chapter.number}</p>
        <h1>{chapter.title}</h1>
        <p className="lede">{chapter.summary}</p>
        <ProgressBar label="Chapter progress" {...pr} />
        <p className="hint">Pick a topic on the map. A topic turns green once you answer all its questions correctly.</p>
        <MindMap chapter={chapter} solved={solved} selected={node?.id ?? null} onSelect={(id) => { window.location.hash = `#/${chapter.id}/${id}`; }} />
      </div>
      {node ? <NodePanel node={node} solved={solved} onCorrect={onCorrect} onClose={close} /> : null}
    </div>
  );
}

function About() {
  return (
    <div className="about">
      <h1>About</h1>
      <p>
        Memory Map is a student project for learners going from Racket to C, the stage where pointers and memory start to matter.
        The site does not run C. Each example is a list of memory snapshots written by hand, and automated tests check every
        snapshot (line numbers, addresses, and that every arrow points at a box on screen).
      </p>
      <p>
        All explanations, examples and questions are original. No course slides, notes, assignments or exam questions are used.
        To run your own code, use <a href="https://pythontutor.com/c.html" target="_blank" rel="noreferrer">Python Tutor</a>.
      </p>
      <p>This first version has one chapter (Pointers). The other nine chapters are planned.</p>
    </div>
  );
}
