import { useMemo } from 'react';
import { prepareReferences } from '../tracing/prepareReference.js';
import { fitTraceViewport } from '../game/screenLayout.js';
import '../styles/letter-model.css';
import {outlineAppearance,outlinePath,outlineIllustrationParts} from '../tracing/outlineAppearance.js';
import wauVaSmallerHeads from '../content/wauVaSmallerHeads.json';
import mimReferenceShape from '../content/mimReferenceShape.json';
import yaSmallerHead from '../content/yaSmallerHead.json';

export const usesModelGlyph = letter => ['kaf', 'ga'].includes(letter.id)
  || (letter.id==='ya' && letter.contentVersion===yaSmallerHead.revision)
  || (letter.id==='mim' && letter.contentVersion===mimReferenceShape.revision)
  || Boolean(wauVaSmallerHeads[letter.id] && wauVaSmallerHeads[letter.id].revision===letter.contentVersion);

/** A complete, uniformly fitted illustration from the same model as tracing. */
function ModelIllustration({ letter, className, modelViewBox }) {
  const references = useMemo(() => typeof document === 'undefined' ? {} : prepareReferences(letter), [letter]);
  const fit = fitTraceViewport(letter, references, 1, 1);
  return <svg className={`letter-model-glyph ${className}`} viewBox={modelViewBox || `${fit.x} ${fit.y} ${fit.width} ${fit.height}`}
    role="img" aria-label={`Huruf ${letter.labelMs}`} focusable="false" data-letter-id={letter.id} data-content-version={letter.contentVersion}>
    {outlineAppearance(letter) ? outlineIllustrationParts(letter).map(part=><path key={part.id} d={outlinePath(part)} fill="currentColor" fillRule="evenodd"/>) : <>{letter.geometry.strokes.map(stroke => <path key={stroke.id} d={stroke.path} fill="none" stroke="currentColor"
      strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round"/>)}
    {letter.geometry.dotTargets.map(dot => <circle key={dot.id} cx={dot.x} cy={dot.y} r={dot.visibleRadius} fill="currentColor"/>)}</>}
  </svg>;
}

export function LetterModelGlyph({ letter, className = '', model = false, modelViewBox }) {
  return model || usesModelGlyph(letter) ? <ModelIllustration letter={letter} className={className} modelViewBox={modelViewBox}/>
    : <span className={`jawi ${className}`} lang="ms-Arab" dir="rtl">{letter.glyph}</span>;
}
