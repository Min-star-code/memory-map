import { useLayoutEffect, useRef, useState } from 'react';
import type { Cell, Step } from '../types';

interface Arrow { d: string; dangling: boolean; key: string }

function CellBox({ cell, freed }: { cell: Cell; freed?: boolean }) {
  return (
    <div className="cell-wrap">
      <div
        className={'cell' + (cell.pointsTo ? ' is-ptr' : '') + (cell.value === '?' ? ' is-unset' : '')}
        data-addr={cell.addr}
        data-points={cell.pointsTo}
        data-freed={freed ? 'true' : undefined}
      >
        {cell.value}
      </div>
      <div className="addr">{cell.addr}</div>
    </div>
  );
}

/**
 * Draws the stack and heap for one step, then measures where each pointer
 * cell and its target ended up on screen and draws an SVG arrow between them.
 */
export function MemoryView({ step }: { step: Step }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const draw = () => {
      const box = wrap.getBoundingClientRect();
      const next: Arrow[] = [];
      wrap.querySelectorAll<HTMLElement>('[data-points]').forEach((src) => {
        const target = wrap.querySelector<HTMLElement>(`[data-addr="${src.dataset.points}"]`);
        if (!target) return;
        const a = src.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        const x1 = a.right - box.left;
        const y1 = a.top + a.height / 2 - box.top;
        let d: string;
        if (b.left >= a.right - 1) {
          // Target is to the right (e.g. the heap): curve across.
          const x2 = b.left - box.left - 4;
          const y2 = b.top + b.height / 2 - box.top;
          const mid = (x1 + x2) / 2;
          d = `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
        } else if (b.bottom <= a.top && src.closest('.frame') === target.closest('.frame')) {
          // Target is higher up in the same frame (e.g. an array element):
          // go up from the pointer and land under the target's address label,
          // so the arrow ends at the address the pointer holds.
          const label = target.parentElement?.querySelector('.addr')?.getBoundingClientRect();
          const sx = a.left + a.width / 2 - box.left;
          const sy = a.top - box.top;
          const x2 = b.left + b.width / 2 - box.left;
          const y2 = (label ? label.bottom : b.bottom) - box.top + 2;
          const mid = (sy + y2) / 2;
          d = `M ${sx} ${sy} C ${sx} ${mid}, ${x2} ${mid}, ${x2} ${y2}`;
        } else {
          // Same column, different row: bulge out to the right.
          const x2 = b.right - box.left + 4;
          const y2 = b.top + b.height / 2 - box.top;
          const out = Math.max(x1, x2) + 36;
          d = `M ${x1} ${y1} C ${out} ${y1}, ${out} ${y2}, ${x2} ${y2}`;
        }
        next.push({ d, dangling: target.dataset.freed === 'true', key: `${src.dataset.addr}->${src.dataset.points}` });
      });
      setArrows(next);
    };
    draw();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(draw) : null;
    ro?.observe(wrap);
    return () => ro?.disconnect();
  }, [step]);

  // Show the newest frame on top, like a real stack.
  const frames = [...step.stack].reverse();

  return (
    <div className="memory" ref={wrapRef}>
      <section className="mem-col" aria-label="Stack">
        <h4 className="mem-title">Stack</h4>
        {frames.map((f, i) => (
          <div key={f.fn + i} className={'frame' + (i === 0 ? ' top' : '')}>
            <div className="frame-name">{f.fn}</div>
            {f.vars.map((v) => (
              <div key={v.name} className="var-row">
                <div className="var-label">
                  <span className="var-name">{v.name}</span>
                  <span className="var-type">{v.type}</span>
                </div>
                <div className="cells">
                  {v.cells.map((c) => <CellBox key={c.addr} cell={c} />)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>
      <section className="mem-col heap-col" aria-label="Heap">
        <h4 className="mem-title">Heap</h4>
        {step.heap.length === 0 ? <p className="empty">empty</p> : null}
        {step.heap.map((b) => (
          <div key={b.cells[0].addr} className={'heap-block' + (b.freed ? ' freed' : '')}>
            <div className="var-type">{b.type}{b.freed ? ' · freed' : ''}</div>
            <div className="cells">
              {b.cells.map((c) => <CellBox key={c.addr} cell={c} freed={b.freed} />)}
            </div>
          </div>
        ))}
      </section>
      <svg className="arrows" aria-hidden="true">
        <defs>
          <marker id="head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="arrow-head" />
          </marker>
          <marker id="head-bad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="arrow-head bad" />
          </marker>
        </defs>
        {arrows.map((a) => (
          <path key={a.key} d={a.d} className={'arrow' + (a.dangling ? ' bad' : '')} markerEnd={a.dangling ? 'url(#head-bad)' : 'url(#head)'} />
        ))}
      </svg>
    </div>
  );
}
