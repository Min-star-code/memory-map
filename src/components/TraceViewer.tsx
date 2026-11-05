import { useState } from 'react';
import type { Trace } from '../types';
import { CodeBlock } from './CodeBlock';
import { MemoryView } from './MemoryView';

/** Step through a trace with buttons or the left/right arrow keys. */
export function TraceViewer({ trace }: { trace: Trace }) {
  const [i, setI] = useState(0);
  const last = trace.steps.length - 1;
  const step = trace.steps[i];
  const go = (n: number) => setI(Math.max(0, Math.min(last, n)));

  return (
    <div
      className="trace"
      tabIndex={0}
      aria-label="Step-by-step example. Use the left and right arrow keys to step."
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
      }}
    >
      <div className="trace-grid">
        <CodeBlock code={trace.code} current={step.line} />
        <MemoryView step={step} />
      </div>
      <p className="note" aria-live="polite"><strong>Step {i + 1} of {trace.steps.length}.</strong> {step.note}</p>
      {step.output !== undefined ? (
        <div className="output"><span className="output-label">Output</span><code>{step.output}</code></div>
      ) : null}
      <div className="stepper">
        <button type="button" className="btn ghost" onClick={() => go(0)} disabled={i === 0}>Restart</button>
        <button type="button" className="btn" onClick={() => go(i - 1)} disabled={i === 0}>← Back</button>
        <div className="dots" aria-hidden="true">
          {trace.steps.map((_, k) => <span key={k} className={'dot' + (k === i ? ' on' : k < i ? ' past' : '')} />)}
        </div>
        <button type="button" className="btn primary" onClick={() => go(i + 1)} disabled={i === last}>Next →</button>
      </div>
    </div>
  );
}
