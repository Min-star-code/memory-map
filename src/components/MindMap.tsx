import type { Chapter } from '../types';
import { nodeStatus, solvedCount, type NodeStatus, type Solved } from '../lib/progress';

const ICON: Record<NodeStatus, string> = { 'not-started': '○', 'in-progress': '◐', mastered: '●' };
const LABEL: Record<NodeStatus, string> = { 'not-started': 'not started', 'in-progress': 'in progress', mastered: 'mastered' };

interface Props {
  chapter: Chapter;
  solved: Solved;
  selected: string | null;
  onSelect: (id: string) => void;
}

/**
 * Concept map for one chapter. Edges are SVG lines in a 0–100 box that
 * stretches with the container; nodes are real buttons placed on top, so
 * they stay keyboard- and screen-reader-friendly. On narrow screens the map
 * is replaced by an outline list built from the same data.
 */
export function MindMap({ chapter, solved, selected, onSelect }: Props) {
  const byId = new Map(chapter.nodes.map((n) => [n.id, n]));
  return (
    <>
      <div className="mindmap" role="group" aria-label={`${chapter.title} concept map`}>
        <svg className="edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {chapter.nodes.flatMap((n) =>
            n.after.map((from) => {
              const a = byId.get(from)!;
              // The map reads top to bottom, so edges curve vertically.
              const mid = (a.pos.y + n.pos.y) / 2;
              return (
                <path
                  key={from + n.id}
                  d={`M ${a.pos.x} ${a.pos.y} C ${a.pos.x} ${mid}, ${n.pos.x} ${mid}, ${n.pos.x} ${n.pos.y}`}
                  className={'edge ' + nodeStatus(n, solved)}
                  vectorEffect="non-scaling-stroke"
                />
              );
            }),
          )}
        </svg>
        {chapter.nodes.map((n) => {
          const st = nodeStatus(n, solved);
          return (
            <button
              key={n.id}
              type="button"
              className={`map-node ${st}` + (selected === n.id ? ' selected' : '')}
              style={{ left: n.pos.x + '%', top: n.pos.y + '%' }}
              onClick={() => onSelect(n.id)}
              aria-label={`${n.title}, ${LABEL[st]}, ${solvedCount(n, solved)} of ${n.questions.length} questions`}
            >
              <span className="map-icon" aria-hidden="true">{ICON[st]}</span>
              <span>{n.short}</span>
              <span className="map-count" aria-hidden="true">{solvedCount(n, solved)}/{n.questions.length}</span>
            </button>
          );
        })}
      </div>
      <ol className="outline" aria-label={`${chapter.title} topics`}>
        {chapter.nodes.map((n) => {
          const st = nodeStatus(n, solved);
          return (
            <li key={n.id}>
              <button type="button" className={`outline-item ${st}`} onClick={() => onSelect(n.id)}>
                <span className="map-icon" aria-hidden="true">{ICON[st]}</span>
                <span className="outline-title">{n.title}</span>
                <span className="map-count">{solvedCount(n, solved)}/{n.questions.length}<span className="sr-only"> questions, {LABEL[st]}</span></span>
              </button>
            </li>
          );
        })}
      </ol>
      <ul className="legend" aria-label="Legend">
        {(Object.keys(ICON) as NodeStatus[]).map((s) => (
          <li key={s} className={s}><span aria-hidden="true">{ICON[s]}</span> {LABEL[s]}</li>
        ))}
      </ul>
    </>
  );
}
