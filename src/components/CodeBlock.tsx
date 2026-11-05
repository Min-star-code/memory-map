import { tokenizeC } from '../lib/highlight';

interface Props {
  code: string[];
  /** 1-based line to highlight, if any. */
  current?: number;
}

export function CodeBlock({ code, current }: Props) {
  return (
    <pre className="code" aria-label="C code">
      {code.map((line, i) => {
        const n = i + 1;
        const isCurrent = n === current;
        return (
          <div key={n} className={'code-line' + (isCurrent ? ' current' : '')} aria-current={isCurrent ? 'step' : undefined}>
            <span className="ln" aria-hidden="true">{n}</span>
            <span className="src">
              {tokenizeC(line).map((t, j) => (
                <span key={j} className={'tok-' + t.kind}>{t.text}</span>
              ))}
              {line === '' ? ' ' : null}
            </span>
          </div>
        );
      })}
    </pre>
  );
}
