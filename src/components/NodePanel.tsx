import { useEffect, useRef } from 'react';
import type { ConceptNode } from '../types';
import type { Solved } from '../lib/progress';
import { Inline } from './Inline';
import { TraceViewer } from './TraceViewer';
import { QuestionCard } from './QuestionCard';

interface Props {
  node: ConceptNode;
  solved: Solved;
  onCorrect: (id: string) => void;
  onClose: () => void;
}

export function NodePanel({ node, solved, onCorrect, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [node.id, onClose]);

  return (
    <aside className="panel" aria-label={node.title}>
      <div className="panel-head">
        <h2>{node.title}</h2>
        <button ref={closeRef} type="button" className="btn ghost icon" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="panel-body">
        {node.explain.map((p, i) => <p key={i} className="explain"><Inline text={p} /></p>)}
        <h3>Watch it run</h3>
        {/* key resets the stepper to step 1 when another node opens */}
        <TraceViewer key={node.id} trace={node.trace} />
        <p className="hint">
          Addresses are made up and kept short for the diagram. Want to run your own code?{' '}
          <a href="https://pythontutor.com/c.html" target="_blank" rel="noreferrer">Open Python Tutor (C)</a>.
        </p>
        <h3>Check yourself</h3>
        {node.questions.map((q, i) => (
          <QuestionCard key={q.id} q={q} index={i} solved={!!solved[q.id]} onCorrect={onCorrect} />
        ))}
      </div>
    </aside>
  );
}
