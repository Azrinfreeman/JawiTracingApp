import { useMemo } from 'react';
import { prepareReferences } from '../tracing/prepareReference.js';
import { fitTraceViewport } from '../game/screenLayout.js';
import '../styles/letter-model.css';

export const usesModelGlyph = letter => ['kaf', 'ga'].includes(letter.id);

/** A complete, uniformly fitted illustration from the same model as tracing. */
function ModelIllustration({ letter, className }) {
  const references = useMemo(() => typeof document === 'undefined' ? {} : prepareReferences(letter), [letter]);
  const fit = fitTraceViewport(letter, references, 1, 1);
  return <svg className={`letter-model-glyph ${className}`} viewBox={`${fit.x} ${fit.y} ${fit.width} ${fit.height}`}
    role="img" aria-label={`Huruf ${letter.labelMs}`} focusable="false" data-letter-id={letter.id} data-content-version={letter.contentVersion}>
    {letter.geometry.strokes.map(stroke => <path key={stroke.id} d={stroke.path} fill="none" stroke="currentColor"
      strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round"/>)}
    {letter.geometry.dotTargets.map(dot => <circle key={dot.id} cx={dot.x} cy={dot.y} r={dot.visibleRadius} fill="currentColor"/>)}
  </svg>;
}

export function LetterModelGlyph({ letter, className = '', model = false }) {
  return model || usesModelGlyph(letter) ? <ModelIllustration letter={letter} className={className}/>
    : <span className={`jawi ${className}`} lang="ms-Arab" dir="rtl">{letter.glyph}</span>;
}
