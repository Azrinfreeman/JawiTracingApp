import { validateLetter } from '../content/validateContent.js';

export function DraftModelReview({ letters, onLetter }) {
  const drafts = letters.filter(letter => letter.geometry.strokes.length && letter.geometry.status !== 'approved' && validateLetter(letter).valid);
  if (!drafts.length) return null;
  return <section className="teacher-panel draft-model-review" aria-labelledby="draft-model-title">
    <h2 id="draft-model-title">Model baharu untuk semakan</h2>
    <p>{drafts.length} model draf tersedia. Semak bentuk, arah, urutan dan titik dengan “Tunjuk cara”, kemudian cuba jejak. Model ini belum dibuka dalam pelajaran murid.</p>
    <div className="draft-model-grid">{drafts.map(letter => <button key={letter.id} className="draft-model-card" aria-label={`Semak ${letter.labelMs}`} onClick={() => onLetter(letter)}>
      <svg viewBox={letter.viewBox.join(' ')} aria-hidden="true" focusable="false">
        {letter.geometry.strokes.map(stroke => <path key={stroke.id} d={stroke.path} fill="none" stroke="currentColor" strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round"/>)}
        {letter.geometry.dotTargets.map(dot => <circle key={dot.id} cx={dot.x} cy={dot.y} r={dot.visibleRadius} fill="currentColor"/>)}
      </svg>
      <strong>{letter.labelMs} <span className="jawi" dir="rtl" lang="ms-Arab">{letter.glyph}</span></strong>
      <span>Draf · versi {letter.contentVersion}</span>
      <span className="draft-model-action">Semak & jejak →</span>
    </button>)}</div>
  </section>;
}
