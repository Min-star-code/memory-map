import { useState } from 'react';
import type { Question } from '../types';
import { isCorrect } from '../lib/quiz';
import { CodeBlock } from './CodeBlock';
import { Inline } from './Inline';

interface Props {
  q: Question;
  index: number;
  solved: boolean;
  onCorrect: (id: string) => void;
}

export function QuestionCard({ q, index, solved, onCorrect }: Props) {
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState<'right' | 'wrong' | null>(null);

  const check = () => {
    const ok = isCorrect(q, q.kind === 'choice' ? (choice ?? -1) : text);
    setResult(ok ? 'right' : 'wrong');
    if (ok) onCorrect(q.id);
  };
  const ready = q.kind === 'choice' ? choice !== null : text.trim() !== '';

  return (
    <div className={'question' + (solved ? ' solved' : '')}>
      <div className="q-head">
        <span className="q-num">Q{index + 1}</span>
        {solved ? <span className="badge ok">✓ Solved</span> : null}
      </div>
      <p className="q-prompt"><Inline text={q.prompt} /></p>
      {q.code ? <CodeBlock code={q.code} /> : null}
      <form onSubmit={(e) => { e.preventDefault(); if (ready) check(); }}>
        {q.kind === 'choice' ? (
          <fieldset className="choices">
            <legend className="sr-only">Choices</legend>
            {q.choices.map((c, k) => (
              <label key={k} className={'choice' + (choice === k ? ' picked' : '')}>
                <input type="radio" name={q.id} checked={choice === k} onChange={() => { setChoice(k); setResult(null); }} />
                <Inline text={c} />
              </label>
            ))}
          </fieldset>
        ) : (
          <label className="output-input">
            <span>Printed output</span>
            <input type="text" value={text} spellCheck={false} onChange={(e) => { setText(e.target.value); setResult(null); }} placeholder="e.g. 4 3" />
          </label>
        )}
        <button type="submit" className="btn primary" disabled={!ready}>Check</button>
      </form>
      {result ? (
        <div className={'feedback ' + result} role="status">
          <strong>{result === 'right' ? '✓ Correct.' : '✗ Not quite.'}</strong>{' '}
          {result === 'right' ? <Inline text={q.explanation} /> : 'Try stepping through the example again, then have another go.'}
        </div>
      ) : null}
    </div>
  );
}
