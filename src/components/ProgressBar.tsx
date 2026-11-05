import { percent } from '../lib/progress';

export function ProgressBar({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = percent({ done, total });
  return (
    <div className="progress">
      <div className="progress-text">
        <span>{label}</span>
        <span>{done} / {total} questions · {pct}%</span>
      </div>
      <div className="progress-track" role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: pct + '%' }} />
      </div>
    </div>
  );
}
